/**
 * Payment Methods API - Redux RTK Query endpoints for managing saved payment methods
 *
 * This module provides API hooks for:
 * - Getting saved payment methods
 * - Deleting payment methods
 * - Setting default payment method
 */

import { baseApi } from '../../API/baseApi';

/**
 * Response types
 */
export interface PaymentMethod {
  _id: string;
  userId: string;
  status: 'active' | 'inactive';
  token: string;
  cardType: 'visa' | 'mastercard' | 'mada' | 'other';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
}

interface DeletePaymentMethodResponse {
  deleted: boolean;
}

interface SetDefaultResponse {
  paymentMethod: PaymentMethod;
}

/**
 * Payment Methods API endpoints
 */
export const PaymentMethodsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all payment methods for the current user
     */
    getPaymentMethods: builder.query<{ data: PaymentMethodsResponse; message: string }, void>({
      query: () => ({
        url: '/payment-methods',
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['PaymentMethods'],
    }),

    /**
     * Delete a payment method
     *
     * @param id - Payment method ID to delete
     */
    deletePaymentMethod: builder.mutation<
      { data: DeletePaymentMethodResponse; message: string },
      string
    >({
      query: (id) => ({
        url: `/payment-methods/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['PaymentMethods'],
    }),

    /**
     * Set a payment method as default
     *
     * @param id - Payment method ID to set as default
     */
    setDefaultPaymentMethod: builder.mutation<
      { data: SetDefaultResponse; message: string },
      string
    >({
      query: (id) => ({
        url: `/payment-methods/${id}/default`,
        method: 'PATCH',
        credentials: 'include',
      }),
      invalidatesTags: ['PaymentMethods'],
    }),
  }),
});

/**
 * Export hooks for use in components
 *
 * @example
 * ```tsx
 * // Get payment methods
 * const { data } = useGetPaymentMethodsQuery();
 *
 * // Delete a payment method
 * const [deleteMethod] = useDeletePaymentMethodMutation();
 * await deleteMethod('payment_method_id');
 *
 * // Set default payment method
 * const [setDefault] = useSetDefaultPaymentMethodMutation();
 * await setDefault('payment_method_id');
 * ```
 */
export const {
  useGetPaymentMethodsQuery,
  useDeletePaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
} = PaymentMethodsApi;
