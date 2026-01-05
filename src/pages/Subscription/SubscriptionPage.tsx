import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionOverview } from './components/SubscriptionOverview';
import { SubscriptionActions } from './components/SubscriptionActions';
import { PaymentMethods } from './components/PaymentMethods';
import { BillingHistory } from './components/BillingHistory';
import { Plan, Invoice } from './types';
import { toast } from 'sonner';
import { useAppSelector } from '@/hooks/hook';
import {
  useGetSubscriptionsQuery,
  useCancelSubscriptionMutation,
} from '@/redux/Features/Subscriptions/subscriptionApi';
import {
  useGetPaymentMethodsQuery,
  useDeletePaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
} from '@/redux/Features/PaymentMethods/PaymentMethodsApi';
import { Loader2 } from 'lucide-react';

// Mock invoices for now (can be replaced with real API later)
const MOCK_INVOICES: Invoice[] = [];

export const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  // Fetch subscription for current user
  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription,
  } = useGetSubscriptionsQuery({});

  // Fetch payment methods
  const { data: paymentMethodsData, isLoading: isLoadingPaymentMethods } =
    useGetPaymentMethodsQuery();

  // Mutations
  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();
  const [deletePaymentMethod] = useDeletePaymentMethodMutation();
  const [setDefaultPaymentMethod] = useSetDefaultPaymentMethodMutation();

  // Get active/trial subscription
  // The API returns the subscription object directly in data
  const activeSubscription = subscriptionData?.data;

  // Map subscription to component format
  const subscription = activeSubscription
    ? {
        id: activeSubscription._id,
        planId: activeSubscription.packageId?._id || '',
        status: activeSubscription.status as any,
        currentPeriodStart: activeSubscription.startsAt,
        currentPeriodEnd: activeSubscription.endsAt,
        cancelAtPeriodEnd: !!activeSubscription.cancelledAt,
        trialEnd: activeSubscription.status === 'trial' ? activeSubscription.endsAt : undefined,
        nextPaymentDate: activeSubscription.nextBillAt || activeSubscription.endsAt,
      }
    : null;

  // Map plan from subscription
  const plan: Plan | null = activeSubscription?.packageId
    ? {
        id: activeSubscription.packageId._id,
        name: activeSubscription.packageId.name || activeSubscription.packageId.slug || 'Plan',
        price: 0, // Would need to fetch from package details
        currency: 'USD',
        billingPeriod: activeSubscription.billingPeriod === 'monthly' ? 'month' : 'year',
        features: [],
      }
    : null;

  // Map payment methods to component format
  const paymentMethods = (paymentMethodsData?.data?.paymentMethods || []).map((pm) => ({
    id: pm._id,
    type: 'card' as const,
    brand: pm.cardType,
    last4: pm.last4,
    expiryMonth: pm.expMonth,
    expiryYear: pm.expYear,
    isDefault: pm.isDefault,
  }));

  const handleUpgrade = async () => {
    navigate('/packages');
  };

  const handleDowngrade = async () => {
    toast.info('Please contact support to downgrade your plan.');
  };

  const handleSwitchCycle = async () => {
    toast.info('Please contact support to switch billing cycle.');
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await cancelSubscription({ immediately: false }).unwrap();
        toast.success('Subscription scheduled for cancellation at period end.');
        refetchSubscription();
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to cancel subscription');
      }
    }
  };

  const handleReactivate = async () => {
    toast.info('Please contact support to reactivate your subscription.');
  };

  const handleRetryPayment = () => {
    toast.info('Please update your payment method and try again.');
  };

  const handleAddPaymentMethod = () => {
    navigate('/start-trial');
  };

  const handleRemovePaymentMethod = async (id: string) => {
    if (paymentMethods.length <= 1) {
      toast.error('You must have at least one payment method.');
      return;
    }
    try {
      await deletePaymentMethod(id).unwrap();
      toast.success('Payment method removed.');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to remove payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id).unwrap();
      toast.success('Default payment method updated.');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update default payment method');
    }
  };

  if (isLoadingSubscription || isLoadingPaymentMethods) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto py-12 px-4 max-w-6xl">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Active Subscription</h1>
            <p className="text-gray-500 mb-8">You don't have an active subscription yet.</p>
            <button
              onClick={() => navigate('/packages')}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
            <p className="text-gray-500 mt-1">Manage your plan, payment methods, and invoices.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-green-700">System Operational</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            {plan && <SubscriptionOverview subscription={subscription} plan={plan} />}
            <SubscriptionActions
              subscription={subscription}
              onUpgrade={handleUpgrade}
              onDowngrade={handleDowngrade}
              onSwitchCycle={handleSwitchCycle}
              onCancel={handleCancel}
              onReactivate={handleReactivate}
              onRetryPayment={handleRetryPayment}
            />
            <BillingHistory invoices={MOCK_INVOICES} />
          </div>

          <div className="xl:col-span-1">
            <PaymentMethods
              paymentMethods={paymentMethods}
              onAddMethod={handleAddPaymentMethod}
              onRemoveMethod={handleRemovePaymentMethod}
              onSetDefault={handleSetDefaultPaymentMethod}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
