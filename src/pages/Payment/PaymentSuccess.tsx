import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderByIdQuery } from '@/redux/Features/Package/PackageApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: orderResponse, isLoading } = useGetOrderByIdQuery(orderId);

  const order = orderResponse?.data;
  const packageDetails = order?.packageId;

  useEffect(() => {
    if (order?.status === 'paid') {
      // Trigger confetti animation
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const billingPeriod: any = setbillingPeriod(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearbillingPeriod(billingPeriod);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearbillingPeriod(billingPeriod);
    }
  }, [order?.status]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 gap-4">
        <p className="text-red-500 text-lg">Order not found.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <Card className="w-full max-w-lg shadow-xl border-green-100">
        <CardHeader className="flex flex-col items-center text-center pb-2">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
          <p className="text-gray-500 mt-2">
            Thank you for your purchase. Your subscription is now active.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {packageDetails?.name?.en || 'Premium Subscription'}
            </h3>
            <p className="text-sm text-gray-500 capitalize mb-4">{order.billingPeriod} Plan</p>

            <div className="flex justify-between text-sm text-gray-600 border-t pt-4">
              <span>Amount Paid</span>
              <span className="font-bold text-gray-900">
                ${order.pricingSnapshot?.total?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Order ID</span>
              <span className="font-mono">{order._id?.slice(-8).toUpperCase()}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button size="lg" className="w-full font-semibold" onClick={() => navigate('/')}>
            Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
