import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package } from '@/types/Package';

interface PlanFeaturesCardProps {
  packages: Package[];
  onStartTrial: (pkg: Package) => void;
  activePackageId: string | undefined;
  billingPeriod: 'monthly' | 'yearly';
}

const PlanFeaturesCard = ({
  packages,
  onStartTrial,
  activePackageId,
  billingPeriod,
}: PlanFeaturesCardProps) => {
  const { language, t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 mt-2 lg:mt-5 gap-5">
      {packages.map((pkg) => {
        const isFreePkg = pkg.slug === 'free';
        const isCurrentPlan = pkg._id === activePackageId || (isFreePkg && !activePackageId);
        const showButton = !isFreePkg || isCurrentPlan;

        const price = billingPeriod === 'monthly' ? pkg.baseMonthlyPrice : pkg.baseAnnualPrice;
        const specialPrice =
          billingPeriod === 'monthly' ? pkg.specialMonthlyPrice : pkg.specialAnnualPrice;

        return (
          <Card
            key={pkg._id}
            className="card-shadow p-5 border border-#D6D6D6  flex flex-col justify-between"
          >
            <div className="flex flex-col gap-5">
              <h2 className="font-semibold text-[#6AB240] text-[24px]">{pkg.name[language]}</h2>
              {specialPrice && specialPrice < price && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 line-through text-lg block">SAR {price}</span>
                  <span className="text-[#6AB240] font-bold text-xl block">SAR {specialPrice}</span>
                </div>
              )}
              {pkg.features.map((featureObj, idx) => (
                <p key={idx} className="text-[#606060] text-[20px] font-normal">
                  {featureObj[language]}
                </p>
              ))}
            </div>
            {showButton && (
              <Button
                onClick={() => onStartTrial(pkg)}
                disabled={isCurrentPlan}
                className={`py-6 border-[1.5] shadow text-[14px] lg:text-base font-medium mt-4 gap-2
              ${
                pkg.bestDeal
                  ? 'border-[#FFFFFF00] bg-[#6AB240] rounded-[6px] text-white hover:bg-[#6AB240]'
                  : 'border-[#EFEFEF] bg-[#F5F5F5] rounded-xl text-[#383838] hover:bg-[#F5F5F5]'
              }`}
              >
                {isCurrentPlan ? t.Package.CurrentPlan : t.Package.UpgradePlan}
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default PlanFeaturesCard;
