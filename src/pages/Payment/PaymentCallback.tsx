import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetOrderByIdQuery } from '@/redux/Features/Package/PackageApi';

const PaymentCallback = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: orderResponse, isFetching } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
    pollingbillingPeriod: 2500,
  });

  const order = orderResponse?.data;

  console.log('PaymentCallback orderId:', orderId);

  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    // Provider-agnostic: if the gateway explicitly sends a status, respect it.
    if (status === 'paid' || status === 'success') {
      navigate(`/payment/success/${orderId}`);
      return;
    }

    if (status === 'failed') {
      const params = new URLSearchParams();
      if (message) params.append('message', message);
      navigate(`/payment/failed/${orderId}?${params.toString()}`);
      return;
    }

    // Tap typically redirects back with provider-specific params; rely on server webhook/order status.
    if (order?.status === 'paid') {
      navigate(`/payment/success/${orderId}`);
      return;
    }

    // If we have an order and it's not paid, give the user a clear path.
    if (order && !isFetching) {
      toast.error('Payment not completed. Please try again.');
      navigate(`/payment/${orderId}`);
    }
  }, [orderId, searchParams, navigate, order?.status, order, isFetching]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-500">Processing payment status...</p>
      </div>
    </div>
  );
};

export default PaymentCallback;
