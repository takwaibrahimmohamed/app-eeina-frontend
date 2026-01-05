/**
 * StartTrialPage - Free Trial Signup Page
 *
 * This page displays the trial signup form with package selection
 * and the Tap card form for collecting payment method.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StartTrialCardForm } from '@/components/Payment/StartTrialCardForm';
import { useGetActivePackagesQuery } from '@/redux/Features/Package/PackageApi';
import { useGetSubscriptionsQuery } from '@/redux/Features/Subscriptions/subscriptionApi';
import { useAppSelector } from '@/hooks/hook';
import { Loader2, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const StartTrialPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAppSelector((s) => s.auth.user);
  const { language } = useLanguage();

  // Get package from URL or default
  const initialPackageId = searchParams.get('package');
  const initialbillingPeriod =
    (searchParams.get('billingPeriod') as 'monthly' | 'yearly') || 'monthly';

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(initialPackageId);
  const [selectedbillingPeriod, setSelectedbillingPeriod] = useState<'monthly' | 'yearly'>(
    initialbillingPeriod,
  );

  // Fetch available packages
  const { data: packagesResponse, isLoading: loadingPackages } =
    useGetActivePackagesQuery(undefined);
  const packages = packagesResponse?.data || [];

  // Check if user already has an active subscription
  const { data: subscriptionData, isLoading: loadingSubscription } = useGetSubscriptionsQuery({});

  const subscription = subscriptionData?.data;
  const activeSubscription =
    subscription?.status === 'active' || subscription?.status === 'trial'
      ? subscription
      : undefined;

  // Set default package if not specified
  useEffect(() => {
    if (!selectedPackageId && packages.length > 0) {
      // Find premium package or use first one
      const premiumPkg = packages.find((p: any) => p.slug === 'premium');
      setSelectedPackageId(premiumPkg?._id || packages[0]._id);
    }
  }, [packages, selectedPackageId]);

  // Get selected package details
  const selectedPackage = packages.find((p: any) => p._id === selectedPackageId);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/start-trial');
    }
  }, [user, navigate]);

  // Handle successful trial start
  const handleSuccess = (data: any) => {
    navigate('/', {
      state: {
        trialStarted: true,
        trialEndsAt: data?.subscription?.trialEndsAt,
      },
    });
  };

  if (loadingPackages || loadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Show message if user already has active subscription
  if (activeSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Subscribed</h1>
            <p className="text-gray-600 mb-6">
              You already have an active {activeSubscription.status === 'trial' ? 'trial ' : ''}
              subscription to {activeSubscription.packageId?.name || 'Premium'}.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/subscription')} className="w-full">
                Manage Subscription
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Start Your Free Trial</h1>
          <p className="mt-2 text-gray-600">
            Try premium features free for 7 days. No charge until trial ends.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Package Selection */}
          <div className="space-y-6">
            {/* billingPeriod Toggle */}
            <div className="bg-white rounded-lg p-1 inline-flex shadow-sm">
              <button
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  selectedbillingPeriod === 'monthly'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900',
                )}
                onClick={() => setSelectedbillingPeriod('monthly')}
              >
                Monthly
              </button>
              <button
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  selectedbillingPeriod === 'yearly'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900',
                )}
                onClick={() => setSelectedbillingPeriod('yearly')}
              >
                Yearly
                <span className="ml-1 text-xs text-green-600 font-normal">Save 20%</span>
              </button>
            </div>

            {/* Package Cards */}
            <div className="space-y-4">
              {packages
                .filter((pkg: any) => pkg.slug !== 'free')
                .map((pkg: any) => {
                  const monthlyPrice = pkg.specialMonthlyPrice || pkg.baseMonthlyPrice;
                  const yearlyPrice =
                    pkg.specialAnnualPrice || pkg.baseAnnualPrice || monthlyPrice * 12 * 0.8;
                  const displayPrice =
                    selectedbillingPeriod === 'yearly' ? yearlyPrice : monthlyPrice;
                  const isSelected = pkg._id === selectedPackageId;

                  return (
                    <button
                      key={pkg._id}
                      className={cn(
                        'w-full text-left p-4 rounded-lg border-2 transition-all',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300',
                      )}
                      onClick={() => setSelectedPackageId(pkg._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {typeof pkg.name === 'object' ? pkg.name[language] : pkg.name}
                            </h3>
                            {pkg.isPopular && (
                              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm mt-1">
                            {typeof pkg.description === 'object'
                              ? pkg.description[language]
                              : pkg.description || 'Full access to all features'}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                            isSelected ? 'border-primary bg-primary' : 'border-gray-300',
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-2xl font-bold">SAR {displayPrice.toFixed(0)}</span>
                        <span className="text-gray-500">
                          /{selectedbillingPeriod === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {/* Features */}
                      {pkg.features && (
                        <ul className="mt-4 space-y-2">
                          {pkg.features.slice(0, 4).map((feature: any, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {typeof feature === 'object' ? feature[language] : feature}
                            </li>
                          ))}
                        </ul>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Right: Card Form */}
          <div>
            {selectedPackage && (
              <StartTrialCardForm
                packageId={selectedPackage._id}
                packageName={
                  typeof selectedPackage.name === 'object'
                    ? selectedPackage.name[language]
                    : selectedPackage.name
                }
                monthlyPrice={
                  selectedPackage.specialMonthlyPrice || selectedPackage.baseMonthlyPrice
                }
                yearlyPrice={selectedPackage.specialAnnualPrice || selectedPackage.baseAnnualPrice}
                billingPeriod={selectedbillingPeriod}
                trialDays={7}
                currency="SAR"
                onSuccess={handleSuccess}
                onCancel={() => navigate(-1)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartTrialPage;
