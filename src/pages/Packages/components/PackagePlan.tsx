import { useLanguage } from '@/contexts/LanguageContext';
import ArrowSquareUpRight from '@/components/icons/ArrowSquareUpRight';
import PlanCard from './PlanCard';
import PlanFeaturesCard from './PlanFeaturesCard';
import { Package } from '@/types/Package';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PackagePlanProps {
  packages: Package[];
  billingPeriod: 'monthly' | 'yearly';
  setbillingPeriod: (billingPeriod: 'monthly' | 'yearly') => void;
  onStartTrial: (pkg: Package) => void;
  activePackageId: string | undefined;
}

const PackagePlan = ({
  packages,
  billingPeriod,
  setbillingPeriod,
  onStartTrial,
  activePackageId,
}: PackagePlanProps) => {
  const { t } = useLanguage();

  return (
    <div className="lg:pt-16 flex flex-col justify-center items-center gap-3">
      <div className="border rounded-xl shadow shadow-[#F2F2F4] border-[#F2F2F4] flex justify-between items-center gap-2 py-3 px-3 sm:px-5">
        <span className="shrink-0 ">
          <ArrowSquareUpRight />
        </span>
        <span className="flex-1 text-[14px] sm:text-base font-medium text-[#6AB240]">
          {t.Package.upgradeanytime}
        </span>
      </div>
      <h1 className="text-center text-[#242424] text-[20px] xl:text-[36px] xl2:text-[44px]! font-semibold">
        {t.Package.upgradeanytimetitle}
      </h1>
      <p className="text-center text-[#878787] text-[16px] xl:text-[20px] xl2:text-[24px]! font-normal">
        {t.Package.upgradeanytimedusc}
      </p>

      {/* billingPeriod Toggle */}
      <div className="flex items-center gap-4 bg-gray-100 p-1 rounded-full mt-6">
        <Button
          variant="ghost"
          onClick={() => setbillingPeriod('monthly')}
          className={cn(
            'rounded-full px-6 py-2 h-10 transition-all',
            billingPeriod === 'monthly'
              ? 'bg-white shadow-sm text-black'
              : 'text-gray-500 hover:text-black',
          )}
        >
          {t.Package.month}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setbillingPeriod('yearly')}
          className={cn(
            'rounded-full px-6 py-2 h-10 transition-all',
            billingPeriod === 'yearly'
              ? 'bg-white shadow-sm text-black'
              : 'text-gray-500 hover:text-black',
          )}
        >
          {t.Package.annual}
        </Button>
      </div>

      <div className="flex flex-col gap-5 lg:gap-10 my-10 mt-16 w-full">
        <PlanCard
          packages={packages}
          billingPeriod={billingPeriod}
          onStartTrial={onStartTrial}
          activePackageId={activePackageId}
        />

        <PlanFeaturesCard
          packages={packages}
          billingPeriod={billingPeriod}
          onStartTrial={onStartTrial}
          activePackageId={activePackageId}
        />
      </div>
    </div>
  );
};

export default PackagePlan;
