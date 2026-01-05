import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderByIdQuery } from '@/redux/Features/Package/PackageApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const OrderSummary = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: orderResponse, isLoading, error } = useGetOrderByIdQuery(orderId);

  const order = orderResponse?.data;
  const packageDetails = order?.packageId;

  const handlePayNow = () => {
    navigate(`/payment/${orderId}`);
  };

  if (order?.status === 'paid') {
    navigate(`/payment/success/${orderId}`);
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    console.error('Error fetching order:', error);
    // Check if error status is 404 or something else
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 gap-4">
        <p className="text-red-500 text-lg">Failed to load order details.</p>
        <Button variant="outline" onClick={() => navigate('/packages')}>
          Go Back to Packages
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">Order Summary</CardTitle>
          </div>
          <p className="text-gray-500 text-sm pl-10">Review your order details before payment.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Package Details */}
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-primary">
                  {packageDetails?.name?.en || 'Premium Package'}
                </h3>
                <p className="text-sm text-gray-500 capitalize">{order.billingPeriod} Subscription</p>
              </div>
              {/* You might want to display features here or keep it simple */}
            </div>
          </div>

          <Separator />

          {/* Order Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${order.pricingSnapshot?.basePrice?.toFixed(2)}</span>
            </div>
            {order.pricingSnapshot?.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-${order.pricingSnapshot?.discountAmount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">VAT ({order.pricingSnapshot?.vatRate}%)</span>
              <span className="font-medium">${order.pricingSnapshot?.vatAmount?.toFixed(2)}</span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>${order.pricingSnapshot?.total?.toFixed(2)}</span>
            </div>
            <p className="text-xs text-right text-gray-400">Currency: {order.currency}</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button size="lg" className="w-full font-semibold text-lg" onClick={handlePayNow}>
            Pay Now ${order.pricingSnapshot?.total?.toFixed(2)}
          </Button>
          <div className="flex justify-center items-center gap-2 text-xs text-gray-500 mt-2">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span>Secure SSL Encrypted Payment</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderSummary;
