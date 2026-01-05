/**
 * Analytics Tracker Utility
 *
 * Client-side event tracking with:
 * - LocalStorage batching (flush every 5 min OR 100 events)
 * - navigator.sendBeacon on page unload
 * - Session management with 30-min timeout
 * - Page time tracking via visibilitychange
 */

// Types
export interface AnalyticsEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  url: string;
  referrer: string;
  pageTitle: string;
}

export interface AnalyticsSession {
  sessionId: string;
  startedAt: number;
  lastActivityAt: number;
}

// Constants
const STORAGE_KEYS = {
  EVENTS: 'analytics_events',
  SESSION: 'analytics_session',
  PAGE_ENTER_TIME: 'analytics_page_enter',
} as const;

const CONFIG = {
  BATCH_SIZE: 100,
  FLUSH_interval_MS: 5 * 60 * 1000, // 5 minutes
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  API_URL: import.meta.env.VITE_API_URL || '/api/v1',
} as const;

// Utility functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  if (/Mobile|Android|iPhone|iPod/.test(ua)) {
    deviceType = 'mobile';
  } else if (/Tablet|iPad/.test(ua)) {
    deviceType = 'tablet';
  }

  return {
    deviceType,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    userAgent: ua,
  };
}

// Storage helpers
function getStoredEvents(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredEvents(events: AnalyticsEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.warn('Failed to store analytics events:', e);
  }
}

function clearStoredEvents(): void {
  localStorage.removeItem(STORAGE_KEYS.EVENTS);
}

function getStoredSession(): AnalyticsSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setStoredSession(session: AnalyticsSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (e) {
    console.warn('Failed to store analytics session:', e);
  }
}

// Session management
function getOrCreateSession(): string {
  const now = Date.now();
  let session = getStoredSession();

  // Check if session exists and hasn't timed out
  if (session) {
    const timeSinceLastActivity = now - session.lastActivityAt;

    if (timeSinceLastActivity > CONFIG.SESSION_TIMEOUT_MS) {
      // Session timed out, create new one
      session = null;
    }
  }

  if (!session) {
    session = {
      sessionId: generateId(),
      startedAt: now,
      lastActivityAt: now,
    };

    // Notify backend of new session
    createSessionOnBackend(session.sessionId);
  } else {
    // Update last activity
    session.lastActivityAt = now;
  }

  setStoredSession(session);
  return session.sessionId;
}

async function createSessionOnBackend(sessionId: string): Promise<void> {
  try {
    const device = getDeviceInfo();

    await fetch(`${CONFIG.API_URL}/analytics/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        sessionId,
        referrer: document.referrer,
        landingPage: window.location.pathname,
        device,
      }),
    });
  } catch (e) {
    console.warn('Failed to create session on backend:', e);
  }
}

// Flush events to backend
async function flushEvents(): Promise<void> {
  const events = getStoredEvents();

  if (events.length === 0) return;

  const sessionId = getOrCreateSession();
  const device = getDeviceInfo();

  try {
    const response = await fetch(`${CONFIG.API_URL}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        sessionId,
        events,
        device,
      }),
    });

    if (response.ok) {
      clearStoredEvents();
    } else {
      console.warn('Failed to flush analytics events:', response.status);
    }
  } catch (e) {
    console.warn('Failed to flush analytics events:', e);
  }
}

// Beacon flush (for page unload)
function flushEventsBeacon(): void {
  const events = getStoredEvents();

  if (events.length === 0) return;

  const session = getStoredSession();
  const sessionId = session?.sessionId || generateId();
  const device = getDeviceInfo();

  const payload = JSON.stringify({
    sessionId,
    events,
    device,
  });

  // Use sendBeacon for reliable delivery on page unload
  const success = navigator.sendBeacon(
    `${CONFIG.API_URL}/analytics/beacon`,
    new Blob([payload], { type: 'application/json' }),
  );

  if (success) {
    clearStoredEvents();
  }
}

// Main tracker class
class AnalyticsTracker {
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private pageEnterTime: number = 0;
  private isInitialized: boolean = false;

  init(): void {
    if (this.isInitialized) return;

    this.isInitialized = true;
    this.pageEnterTime = Date.now();
    localStorage.setItem(STORAGE_KEYS.PAGE_ENTER_TIME, this.pageEnterTime.toString());

    // Start flush timer
    this.flushTimer = setInterval(() => {
      flushEvents();
    }, CONFIG.FLUSH_interval_MS);

    // Track page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Flush on page unload
    window.addEventListener('pagehide', this.handlePageUnload);
    window.addEventListener('beforeunload', this.handlePageUnload);

    // Track initial page view
    this.trackPageView();
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('pagehide', this.handlePageUnload);
    window.removeEventListener('beforeunload', this.handlePageUnload);

    this.isInitialized = false;
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      // Track time spent on page when tab becomes hidden
      this.trackPageTime();
      flushEventsBeacon();
    } else if (document.visibilityState === 'visible') {
      // Reset page enter time when tab becomes visible again
      this.pageEnterTime = Date.now();
    }
  };

  private handlePageUnload = (): void => {
    this.trackPageTime();
    flushEventsBeacon();
  };

  private trackPageTime(): void {
    const timeSpent = Date.now() - this.pageEnterTime;

    if (timeSpent > 1000) {
      // Only track if > 1 second
      this.track('page_time', {
        duration: Math.round(timeSpent / 1000), // seconds
        path: window.location.pathname,
      });
    }
  }

  /**
   * Track a custom event
   */
  track(type: string, payload: Record<string, unknown> = {}): void {
    const event: AnalyticsEvent = {
      type,
      payload,
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer,
      pageTitle: document.title,
    };

    // Update session activity
    getOrCreateSession();

    // Add to local storage
    const events = getStoredEvents();
    events.push(event);
    setStoredEvents(events);

    // Check if we should flush
    if (events.length >= CONFIG.BATCH_SIZE) {
      flushEvents();
    }
  }

  /**
   * Track page view
   */
  trackPageView(additionalPayload: Record<string, unknown> = {}): void {
    this.pageEnterTime = Date.now();

    this.track('page_view', {
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      ...additionalPayload,
    });
  }

  /**
   * Track recipe interactions
   */
  trackRecipeView(recipeId: string, recipeSlug?: string, recipeName?: string): void {
    this.track('recipe_view', { recipeId, recipeSlug, recipeName });
  }

  trackRecipeLike(recipeId: string, liked: boolean): void {
    this.track(liked ? 'recipe_like' : 'recipe_unlike', { recipeId });
  }

  trackRecipeSave(recipeId: string, saved: boolean): void {
    this.track(saved ? 'recipe_save' : 'recipe_unsave', { recipeId });
  }

  trackRecipeShare(recipeId: string, method: string): void {
    this.track('recipe_share', { recipeId, method });
  }

  trackRecipePrint(recipeId: string): void {
    this.track('recipe_print', { recipeId });
  }

  trackRecipeCreate(): void {
    this.track('recipe_create', {});
  }

  trackRecipeEdit(recipeId: string): void {
    this.track('recipe_edit', { recipeId });
  }

  trackRecipeDelete(recipeId: string): void {
    this.track('recipe_delete', { recipeId });
  }

  /**
   * Track search and filter actions
   */
  trackSearch(query: string, resultsCount?: number, filters?: Record<string, unknown>): void {
    this.track('search', { query, resultsCount, filters });
  }

  trackFilterApply(filters: Record<string, unknown>): void {
    this.track('filter_apply', { filters });
  }

  trackFilterClear(): void {
    this.track('filter_clear', {});
  }

  /**
   * Track category interactions
   */
  trackCategoryView(categoryId: string, categoryName?: string): void {
    this.track('category_view', { categoryId, categoryName });
  }

  /**
   * Track authentication events
   */
  trackLogin(method: string = 'email'): void {
    this.track('login', { method });
  }

  trackLogout(): void {
    this.track('logout', {});
  }

  trackSignup(method: string = 'email'): void {
    this.track('signup', { method });
  }

  /**
   * Track user profile actions
   */
  trackProfileView(userId?: string): void {
    this.track('profile_view', { userId });
  }

  trackProfileEdit(): void {
    this.track('profile_edit', {});
  }

  trackFollow(userId: string, followed: boolean): void {
    this.track(followed ? 'user_follow' : 'user_unfollow', { userId });
  }

  /**
   * Track meal planner actions
   */
  trackMealPlanCreate(): void {
    this.track('meal_plan_create', {});
  }

  trackMealPlanEdit(planId: string): void {
    this.track('meal_plan_edit', { planId });
  }

  trackMealPlanDelete(planId: string): void {
    this.track('meal_plan_delete', { planId });
  }

  trackMealAdd(recipeId: string, mealType: string, date: string): void {
    this.track('meal_add', { recipeId, mealType, date });
  }

  /**
   * Track shopping list actions
   */
  trackShoppingListCreate(): void {
    this.track('shopping_list_create', {});
  }

  trackShoppingListItemAdd(itemId?: string): void {
    this.track('shopping_list_item_add', { itemId });
  }

  trackShoppingListItemCheck(itemId: string, checked: boolean): void {
    this.track(checked ? 'shopping_list_item_check' : 'shopping_list_item_uncheck', { itemId });
  }

  /**
   * Track goal actions
   */
  trackGoalCreate(goalType: string): void {
    this.track('goal_create', { goalType });
  }

  trackGoalComplete(goalId: string): void {
    this.track('goal_complete', { goalId });
  }

  trackGoalProgress(goalId: string, progress: number): void {
    this.track('goal_progress', { goalId, progress });
  }

  /**
   * Track import actions
   */
  trackRecipeImportStart(source?: string): void {
    this.track('recipe_import_start', { source });
  }

  trackRecipeImportSuccess(recipeId: string): void {
    this.track('recipe_import_success', { recipeId });
  }

  trackRecipeImportFail(error?: string): void {
    this.track('recipe_import_fail', { error });
  }

  /**
   * Track rating actions
   */
  trackRecipeRate(recipeId: string, rating: number): void {
    this.track('recipe_rate', { recipeId, rating });
  }

  /**
   * Track UI interactions
   */
  trackButtonClick(buttonId: string, context?: Record<string, unknown>): void {
    this.track('button_click', { buttonId, ...context });
  }

  trackModalOpen(modalId: string): void {
    this.track('modal_open', { modalId });
  }

  trackModalClose(modalId: string): void {
    this.track('modal_close', { modalId });
  }

  trackTabChange(tabId: string): void {
    this.track('tab_change', { tabId });
  }

  /**
   * Track errors
   */
  trackError(error: string, context?: Record<string, unknown>): void {
    this.track('error', { error, ...context });
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(depth: number): void {
    this.track('scroll_depth', { depth });
  }

  /**
   * Force flush all pending events
   */
  async flush(): Promise<void> {
    await flushEvents();
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return getOrCreateSession();
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();

// Export for direct use
export default analytics;
