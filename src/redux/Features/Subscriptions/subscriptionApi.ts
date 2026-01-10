/**
 * Subscription API - Redux RTK Query endpoints for subscription management
 *
 * This module provides API hooks for:
 * - Getting user subscriptions
 * - Starting free trials
 * - Cancelling subscriptions
 */

import { baseApi } from '@/redux/API/baseApi';

/**
 * Response types
 */
interface SubscriptionPackage {
  _id: string;
  name?: string;
  slug: string;
}

interface SubscriptionData {
  _id: string;
  userId: string;
  packageId: SubscriptionPackage;
  billingPeriod: 'monthly' | 'yearly';
  status: 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired';
  startsAt: string;
  endsAt: string;
  nextBillAt?: string;
  autoRenew: boolean;
  isTrialUsed: boolean;
  cancelledAt?: string;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface GetSubscriptionsParams {
  userId?: string;
  status?: 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired';
  billingPeriod?: 'monthly' | 'yearly';
  page?: number;
  limit?: number;
}

// The API seems to return a single subscription object in data, not a list
// based on the user's provided JSON response
type GetSubscriptionResponse = SubscriptionData;

interface StartTrialParams {
  packageId: string;
  billingPeriod?: 'monthly' | 'yearly';
}

interface StartTrialResponse {
  success: boolean;
  subscription: SubscriptionData;
  card: {
    id: string;
    brand: string;
    last_four: string;
    exp_month: number;
    exp_year: number;
  };
}

interface CancelSubscriptionParams {
  immediately?: boolean;
}

interface CancelSubscriptionResponse {
  success: boolean;
  subscription: SubscriptionData;
}

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get subscriptions with optional filters
     * Use userId param to get subscription for a specific user
     */
    getSubscriptions: builder.query<{ data: GetSubscriptionResponse; message: string }, {}>({
      query: () => {
        return {
          url: `/subscriptions/me`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['Subscription'],
    }),

    /**
     * Start a free trial with card verification
     *
     * @param tokenId - Card token from Tap SDK (tok_xxx)
     * @param packageId - Package/plan to subscribe to
     * @param billingPeriod - Billing period (monthly/yearly)
     */
    startTrial: builder.mutation<{ data: StartTrialResponse; message: string }, StartTrialParams>({
      query: (body) => ({
        url: '/subscriptions/trial',
        method: 'POST',
        body,
        credentials: 'include',
      }),
      invalidatesTags: ['Subscription', 'User', 'PaymentMethods'],
    }),

    /**
     * Cancel the current subscription
     *
     * @param immediately - If true, cancel now. If false, cancel at period end.
     */
    cancelSubscription: builder.mutation<
      { data: CancelSubscriptionResponse; message: string },
      CancelSubscriptionParams
    >({
      query: (body) => ({
        url: '/subscriptions/cancel',
        method: 'POST',
        body,
        credentials: 'include',
      }),
      invalidatesTags: ['Subscription', 'User'],
    }),
  }),
});

/**
 * Export hooks for use in components
 *
 * @example
 * ```tsx
 * // Get subscriptions for current user
 * const { data } = useGetSubscriptionsQuery({ userId: user.id });
 *
 * // Start a trial
 * const [startTrial] = useStartTrialMutation();
 * await startTrial({ tokenId: 'tok_xxx', packageId: 'pkg_123' });
 *
 * // Cancel subscription
 * const [cancel] = useCancelSubscriptionMutation();
 * await cancel({ immediately: false });
 * ```
 */
export const { useGetSubscriptionsQuery, useStartTrialMutation, useCancelSubscriptionMutation } =
  subscriptionApi;
