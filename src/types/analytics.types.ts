/**
 * Analytics Types
 * Shared types for the analytics system
 */

// Event types that can be tracked
export type AnalyticsEventType =
  // Page events
  | 'page_view'
  | 'page_time'
  | 'scroll_depth'

  // Recipe events
  | 'recipe_view'
  | 'recipe_like'
  | 'recipe_unlike'
  | 'recipe_save'
  | 'recipe_unsave'
  | 'recipe_share'
  | 'recipe_print'
  | 'recipe_create'
  | 'recipe_edit'
  | 'recipe_delete'
  | 'recipe_rate'
  | 'recipe_import_start'
  | 'recipe_import_success'
  | 'recipe_import_fail'

  // Search events
  | 'search'
  | 'filter_apply'
  | 'filter_clear'

  // Category events
  | 'category_view'

  // Auth events
  | 'login'
  | 'logout'
  | 'signup'

  // Profile events
  | 'profile_view'
  | 'profile_edit'
  | 'user_follow'
  | 'user_unfollow'

  // Meal planner events
  | 'meal_plan_create'
  | 'meal_plan_edit'
  | 'meal_plan_delete'
  | 'meal_add'

  // Shopping list events
  | 'shopping_list_create'
  | 'shopping_list_item_add'
  | 'shopping_list_item_check'
  | 'shopping_list_item_uncheck'

  // Goal events
  | 'goal_create'
  | 'goal_complete'
  | 'goal_progress'

  // UI events
  | 'button_click'
  | 'modal_open'
  | 'modal_close'
  | 'tab_change'
  | 'error';

// Event structure
export interface AnalyticsEvent {
  type: AnalyticsEventType | string;
  payload: Record<string, unknown>;
  timestamp: number;
  url: string;
  referrer: string;
  pageTitle: string;
}

// Session structure
export interface AnalyticsSession {
  sessionId: string;
  startedAt: number;
  lastActivityAt: number;
}

// Device info
export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenWidth: number;
  screenHeight: number;
  language: string;
  userAgent: string;
}

// API request types
export interface TrackEventsRequest {
  sessionId: string;
  events: AnalyticsEvent[];
  device: DeviceInfo;
}

export interface CreateSessionRequest {
  sessionId: string;
  referrer?: string;
  landingPage?: string;
  device: DeviceInfo;
}

// Admin dashboard types
export interface DashboardOverview {
  today: {
    pageViews: number;
    sessions: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  trends: {
    pageViews: number; // percentage change
    sessions: number;
    uniqueVisitors: number;
  };
  last7Days: DailyMetric[];
}

export interface DailyMetric {
  date: string;
  pageViews: number;
  sessions: number;
  uniqueVisitors: number;
}

export interface RecipeAnalytics {
  recipeId: string;
  views: number;
  likes: number;
  saves: number;
  shares: number;
}

export interface SearchAnalytics {
  term: string;
  count: number;
}

export interface CategoryAnalytics {
  categoryId: string;
  views: number;
}

export interface DailyStat {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  eventTypeCounts: Record<string, number>;
  topRecipes: RecipeAnalytics[];
  topSearches: SearchAnalytics[];
  topCategories: CategoryAnalytics[];
  deviceBreakdown: Record<string, number>;
}

// Storage keys
export const ANALYTICS_STORAGE_KEYS = {
  EVENTS: 'analytics_events',
  SESSION: 'analytics_session',
  PAGE_ENTER_TIME: 'analytics_page_enter',
} as const;

// Config
export const ANALYTICS_CONFIG = {
  BATCH_SIZE: 100,
  FLUSH_billingPeriod_MS: 5 * 60 * 1000, // 5 minutes
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
} as const;
