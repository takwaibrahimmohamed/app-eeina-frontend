/**
 * StartTrialCardForm Component
 *
 * A React component that handles the free trial signup flow with Tap Payments.
 *
 * FLOW:
 * 1. Load Tap Card SDK dynamically
 * 2. Render secure card input form
 * 3. Tokenize card on submit (never send raw card data)
 * 4. Send token to backend to start trial
 *
 * SECURITY:
 * - Uses Tap SDK for card tokenization (PCI compliant)
 * - Only the token (tok_xxx) is sent to backend
 * - Raw card data never leaves the Tap SDK
 * - Public key only - secret key is on backend
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  TapCard,
  Currencies,
  Direction,
  Edges,
  Locale,
  Theme,
  tokenize,
} from '@tap-payments/card-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useStartTrialMutation } from '@/redux/Features/Subscriptions/subscriptionApi';
import { useAppSelector } from '@/hooks/hook';

// Public key - safe to expose in frontend
const TAP_PUBLIC_KEY = import.meta.env.VITE_TAP_PUBLIC_KEY;

export interface PaymentFormProps {
  /** Package/plan ID to subscribe to */
  packageId: string;
  /** Package name for display */
  packageName?: string;
  /** Price per month (for display only, actual price from backend) */
  monthlyPrice?: number;
  /** Price per year (for display only) */
  yearlyPrice?: number;
  /** Billing billingPeriod */
  billingPeriod?: 'monthly' | 'yearly';
  /** Number of trial days */
  trialDays?: number;
  /** Currency for display */
  currency?: string;
  /** Callback on successful trial start */
  onSuccess?: (data: any) => void;
  /** Callback on error */
  onError?: (error: any) => void;
  /** Callback on cancel */
  onCancel?: () => void;
}

/**
 * StartTrialCardForm - Secure card collection for free trial signup
 *
 * This component:
 * 1. Loads the Tap Payment SDK
 * 2. Renders a secure card input form
 * 3. Handles card tokenization
 * 4. Sends the token (not card data) to the backend
 *
 * @example
 * ```tsx
 * <PaymentForm
 *   packageId="pkg_123"
 *   packageName="Premium"
 *   monthlyPrice={29.99}
 *   trialDays={7}
 *   onSuccess={(data) => navigate('/dashboard')}
 * />
 * ```
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  packageId,
  packageName = 'Premium',
  monthlyPrice = 0,
  yearlyPrice,
  billingPeriod = 'monthly',
  trialDays = 7,
  currency = 'SAR',
  onSuccess,
  onError,
  onCancel,
}) => {
  // State
  const [tapReady, setTapReady] = useState(false);
  const [isCardValid, setIsCardValid] = useState(false);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log('can Submit:', tapReady, isCardValid, isTokenizing, !tokenId);

  // Ref to prevent duplicate API calls
  const processedTokenRef = useRef<string | null>(null);

  // Get user info for Tap customer
  const user = useAppSelector((s) => s.auth.user);

  // API mutation
  const [startTrial, { isLoading: isStartingTrial }] = useStartTrialMutation();

  // Customer info for Tap SDK
  const customerFirst = user?.firstName || user?.fullName?.split(' ')?.[0] || 'Customer';
  const customerLast = user?.lastName || user?.fullName?.split(' ')?.slice(1).join(' ') || '';
  const email = user?.email || '';

  // Determine currency for Tap SDK
  const tapCurrency = (Currencies as any)[currency.toUpperCase()] ?? Currencies.SAR;

  // Calculate display amount (for display only - backend determines actual charge)
  const displayAmount =
    billingPeriod === 'yearly' ? yearlyPrice || monthlyPrice * 12 : monthlyPrice;

  // Memoize TapCard props to prevent unnecessary re-renders/re-initializations
  const tapTransaction = useMemo(
    () => ({
      amount: Math.max(displayAmount, 1),
      currency: tapCurrency,
    }),
    [displayAmount, tapCurrency],
  );

  const tapFields = useMemo(
    () => ({
      cardHolder: true,
    }),
    [],
  );

  const tapCustomer = useMemo(() => {
    const contact: any = {};
    if (email) contact.email = email;

    return {
      name: [
        {
          lang: Locale.EN,
          first: customerFirst,
          last: customerLast || '-',
        },
      ],
      nameOnCard: `${customerFirst} ${customerLast || ''}`.trim(),
      editable: true,
      contact: Object.keys(contact).length > 0 ? contact : undefined,
    };
  }, [customerFirst, customerLast, email]);

  console.log('Tap Config:', { tapTransaction, tapCustomer });

  const tapAddons = useMemo(
    () => ({
      displayPaymentBrands: true,
      loader: true,
      saveCard: true,
    }),
    [],
  );

  const tapInterface = useMemo(
    () => ({
      locale: Locale.EN,
      theme: Theme.LIGHT,
      edges: Edges.CURVED,
      direction: Direction.LTR,
    }),
    [],
  );

  // Acceptance configuration - supported cards and payment methods
  const tapAcceptance = useMemo(
    () => ({
      supportedBrands: ['VISA', 'MASTERCARD', 'AMERICAN_EXPRESS', 'MADA'],
      supportedCards: ['DEBIT', 'CREDIT'],
    }),
    [],
  );

  // Configuration check
  const configError = !TAP_PUBLIC_KEY ? 'Tap public key is missing. Contact support.' : null;

  // Can submit check
  const canSubmit =
    tapReady && isCardValid && !isTokenizing && !isStartingTrial && !tokenId && !configError;

  console.log('IS CARD VALID:', isCardValid, 'CAN SUBMIT:', canSubmit);

  /**
   * Handle form submission - triggers card tokenization
   */
  const handleSubmit = useCallback(() => {
    console.log('StartTrialCardForm handleSubmit', canSubmit);
    if (!canSubmit) return;

    setError(null);
    setIsTokenizing(true);
    processedTokenRef.current = null;
    setTokenId(null);

    try {
      // Tokenize triggers the SDK to create a token
      // The token is returned via onSuccess callback
      tokenize();
    } catch (e) {
      setIsTokenizing(false);
      console.error('Tap tokenize failed:', e);
      setError('Could not start card processing. Please try again.');
      toast.error('Could not process card. Please try again.');
    }
  }, [canSubmit]);

  /**
   * Process token - send to backend to start trial
   */
  useEffect(() => {
    const processToken = async () => {
      if (!tokenId || processedTokenRef.current === tokenId) return;

      processedTokenRef.current = tokenId;

      try {
        const result = await startTrial({
          tokenId,
          packageId,
          billingPeriod,
        }).unwrap();

        toast.success('Free trial started successfully!');
        onSuccess?.(result.data);
      } catch (err: any) {
        console.error('Start trial failed:', err);
        const errorMessage = err?.data?.message || 'Failed to start trial. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
        onError?.(err);

        // Reset for retry
        setTokenId(null);
        processedTokenRef.current = null;
      }
    };

    processToken();
  }, [tokenId, packageId, billingPeriod, startTrial, onSuccess, onError]);

  // Loading state
  const isProcessing = isTokenizing || isStartingTrial || !!tokenId;

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Start Free Trial</CardTitle>
        </div>
        <CardDescription>
          Try {packageName} free for {trialDays} days. Cancel anytime.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Security Badge */}
        <div className="bg-blue-50 p-4 rounded-md flex items-center gap-3 text-blue-700 border border-blue-100">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Your card is secure</p>
            <p className="text-blue-600 text-xs">
              We verify your card but won't charge until trial ends.
            </p>
          </div>
        </div>

        {/* Trial Info */}
        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Plan</span>
            <span className="font-medium">
              {packageName} ({billingPeriod})
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Free trial</span>
            <span className="font-medium text-green-600">{trialDays} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Then</span>
            <span className="font-medium">
              {currency} {displayAmount.toFixed(2)}/{billingPeriod === 'yearly' ? 'year' : 'month'}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {(error || configError) && (
          <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-700 border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">{error || configError}</div>
          </div>
        )}

        {/* Tap Card Form */}
        {!configError && (
          <div className="space-y-4">
            <TapCard
              publicKey={TAP_PUBLIC_KEY}
              transaction={tapTransaction}
              fields={tapFields}
              customer={tapCustomer}
              addons={tapAddons}
              interface={tapInterface}
              acceptance={tapAcceptance}
              onReady={() => {
                setTapReady(true);
                setError(null);
              }}
              onValidInput={(v: any) => {
                console.log('Tap onValidInput:', v);
                if (typeof v === 'boolean') {
                  setIsCardValid(v);
                  return;
                }
                // Check for isAllInputsValid or fallback to truthy if object
                const isValid = v?.isAllInputsValid ?? true;
                setIsCardValid(Boolean(isValid));
              }}
              onInvalidInput={(error: any) => {
                console.log('Tap onInvalidInput fired', error);
                // Only set invalid if there is an actual error object/true
                // If error is false, it means the invalid state is cleared
                if (error) {
                  setIsCardValid(false);
                }
              }}
              onError={(data: any) => {
                setIsTokenizing(false);
                console.error('Tap card SDK error:', data);
                setError('Card form error. Please check your card details.');
              }}
              onSuccess={(data: any) => {
                setIsTokenizing(false);
                // Extract token ID from response
                const extractedTokenId =
                  data?.id ||
                  data?.token?.id ||
                  data?.tokenId ||
                  data?.data?.id ||
                  data?.data?.token?.id;

                if (typeof extractedTokenId === 'string' && extractedTokenId.startsWith('tok_')) {
                  setTokenId(extractedTokenId);
                } else {
                  setError('Failed to get card token. Please try again.');
                  toast.error('Failed to process card. Please try again.');
                }
              }}
            />

            {/* Submit Button */}
            <Button
              type="button"
              className="w-full"
              size="lg"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? 'Processing...' : `Start ${trialDays}-Day Free Trial`}
            </Button>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isTokenizing ? 'Securing your card...' : 'Setting up your trial...'}</span>
              </div>
            )}

            {/* Cancel Link */}
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            )}

            {/* Terms */}
            <p className="text-xs text-center text-gray-500">
              By starting your trial, you agree to our{' '}
              <a href="/terms" className="underline hover:text-gray-700">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-gray-700">
                Privacy Policy
              </a>
              . You can cancel anytime before the trial ends.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
