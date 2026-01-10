import { useState } from 'react';
import { useGetActivePackagesQuery } from '@/redux/Features/Package/PackageApi';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/ui/Loader';
import PackagePlan from './components/PackagePlan';
import SecurePayments from './components/SecurePyament';
import PackageFAQ from './components/PackageFAQ';
import {
  useGetSubscriptionsQuery,
  useStartTrialMutation,
} from '@/redux/Features/Subscriptions/subscriptionApi';
import { useAppSelector } from '@/hooks/hook';
import { toast } from 'sonner';

const Packages = () => {
  const [billingPeriod, setbillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { data: packagesData, isLoading, error } = useGetActivePackagesQuery({});
  const user = useAppSelector((s) => s.auth.user);

  // Fetch subscription for current user
  const { data: subscriptionsData } = useGetSubscriptionsQuery({});
  const [startTrial, { isLoading: isTrialStarting }] = useStartTrialMutation();
  const navigate = useNavigate();

  const packages = packagesData?.data || [];

  // Get active subscription
  // The API returns the subscription object directly in data
  const activeSubscription = subscriptionsData?.data;

  /**
   * Handle "Start Free Trial" or "Buy Now" click
   * For free trial flow: Navigate directly to /start-trial with package info
   * No order creation needed - that's handled after payment
   */
  const handleStartTrial = async (pkg: any) => {
    // Require authentication
    if (!user) {
      toast.info('Please login to start your free trial');
      navigate(`/login?redirect=/start-trial?package=${pkg._id}&billingPeriod=${billingPeriod}`);
      return;
    }
    // Navigate to trial page with package and billingPeriod
    await startTrial({ packageId: pkg._id, billingPeriod }).unwrap();
    toast.success('Free trial started! Enjoy our premium features.');
    navigate('/profile');
  };

  console.log('User Subscription:', activeSubscription);

  if (isLoading) return <Loader />;
  if (error) return <div className="text-center py-20">Error loading packages</div>;

  return (
    <div className="container max-w-6xl xl2:max-w-7xl mx-auto px-6 py-8 mb-12 md:mb-16 lg:mb-0">
      <PackagePlan
        activePackageId={activeSubscription?.packageId?._id}
        packages={packages}
        billingPeriod={billingPeriod}
        setbillingPeriod={setbillingPeriod}
        onStartTrial={handleStartTrial}
        isTrialStarting={isTrialStarting}
      />
      <SecurePayments />
      <PackageFAQ />
    </div>
  );
};

export default Packages;
