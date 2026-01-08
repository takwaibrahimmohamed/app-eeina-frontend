import { Outlet, useLocation } from 'react-router-dom';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { useAppDispatch, useAppSelector } from '@/hooks/hook';
import { closePremiumModal } from '@/redux/Features/Global/globalSlice';
import { PremiumAddModal } from '@/components/Shared/PremiumAddModal';
import { useEffect } from 'react';

/**
 * Root layout that wraps all routes with analytics tracking
 * This component initializes analytics and tracks page views automatically
 */
export const AnalyticsLayout = () => {
  const dispatch = useAppDispatch();
  const isPremiumModalOpen = useAppSelector((state) => state.global.isPremiumModalOpen);
  const { user } = useAppSelector((state) => state.auth);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(closePremiumModal());
    }
  };

  // Ensure modal doesn't show for already premium users (safety check)
  const shouldShowModal = isPremiumModalOpen && user?.accountType !== 'premium';

  return (
    <AnalyticsProvider enabled={true}>
      <Outlet />
      <PremiumAddModal open={shouldShowModal} onOpenChange={handleOpenChange} />
    </AnalyticsProvider>
  );
};

export default AnalyticsLayout;
