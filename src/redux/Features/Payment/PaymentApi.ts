/**
 * Payment API - Redux RTK Query endpoints for Tap payment operations
 *
 * This module provides API hooks for:
 * - Creating/retrieving Tap customer
 * - 3DS callback handling
 *
 * NOTE: Subscription endpoints moved to subscriptionApi.ts
 * NOTE: Payment methods endpoints moved to PaymentMethodsApi.ts
 *
 * SECURITY:
 * - Only sends card tokens (tok_xxx) to backend
 * - Never handles raw card data
 * - All sensitive operations happen on backend with secret key
 */

import { baseApi } from '../../API/baseApi';

/**
 * Payment API endpoints
 */
export const PaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Create or retrieve Tap customer ID
     *
     * Used to initialize Tap SDK with a valid customer ID
     */
    createCustomer: builder.mutation<{ data: { tapCustomerId: string }; message: string }, void>({
      query: () => ({
        url: '/payments/customer',
        method: 'POST',
        credentials: 'include',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

/**
 * Export hooks for use in components
 *
 * @example
 * ```tsx
 * // Create/get Tap customer
 * const [createCustomer] = useCreateCustomerMutation();
 * const { tapCustomerId } = await createCustomer().unwrap();
 * ```
 */
export const { useCreateCustomerMutation } = PaymentApi;
