import Lighting from '@/components/icons/Lighting';
import Sparkle from '@/components/icons/Sparkle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package } from '@/types/Package';

interface PlanCardProps {
  packages: Package[];
  billingPeriod: 'monthly' | 'yearly';
  onStartTrial: (pkg: Package) => void;
  activePackageId: string | undefined;
}

const PlanCard = ({ packages, billingPeriod, onStartTrial, activePackageId }: PlanCardProps) => {
  const { t, language } = useLanguage();
  console.log('packages', packages);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      {packages.map((pkg) => {
        const isBestDeal = pkg.bestDeal;
        const price = billingPeriod === 'monthly' ? pkg.baseMonthlyPrice : pkg.baseAnnualPrice;
        // Calculate special price (discounted) based on selected billing period
        const specialPrice =
          billingPeriod === 'monthly' ? pkg.specialMonthlyPrice : pkg.specialAnnualPrice;
        const currency = 'SAR'; // Hardcoded or from API if available (API didn't show currency)

        const isFreePkg = pkg.slug === 'free';
        const isCurrentPlan = pkg._id === activePackageId || (isFreePkg && !activePackageId);
        const showButton = !isFreePkg || isCurrentPlan;
        const comingsoon = pkg.slug == 'pro';
        console.log('comingsoon', comingsoon);
        const CardContent = (
          <Card
            className={`p-5 justify-between rounded-[22px] flex flex-col gap-3 border border-[#D6D6D6] h-[336px] ${
              isBestDeal ? 'bg-[#F6FEFF]' : 'bg-white'
            }`}
          >
            <div className={`flex ${isBestDeal ? 'gap-3' : 'justify-between'} items-center`}>
              <div className="flex gap-3 items-center flex-wrap">
                <Lighting />
                <span className="text-[20px] font-medium">{pkg.name[language]}</span>
                {!isFreePkg && (
                  <span className="bg-[#E0F2FE] text-[#0284C7] text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full font-bold tracking-wide">
                    {t.Package.freeTrialBadge}
                  </span>
                )}
              </div>
              {/* Show discount badge if yearly and special price exists, or just hardcoded for now? 
                   The API has specialAnnualPrice. If it is lower, we can show discount. 
                   For now, omitting specific discount badge logic unless 'premium' */}
              {billingPeriod === 'yearly' && pkg.baseAnnualPrice < pkg.baseMonthlyPrice * 12 && (
                <Badge className="bg-[#D5F5E3] rounded-[6px] text-[#2ECC71] text-[13px] font-normal">
                  Save{' '}
                  {(100 - (pkg.baseAnnualPrice / (pkg.baseMonthlyPrice * 12)) * 100).toFixed(0)}%
                </Badge>
              )}
            </div>

            {/* Price Display Section: Handles both standard and discounted pricing */}
            <div className="flex flex-col">
              {/* Check if a special price exists and is lower than the regular price */}
              {specialPrice && specialPrice < price ? (
                /* Discounted Price Layout */
                <div className="flex flex-col">
                  {/* Original Price shown with strikethrough */}
                  <span className="text-gray-400 line-through text-lg font-medium ml-1">
                    {currency} {price}
                  </span>
                  {/* Discounted Price Highlighted */}
                  <h2 className="font-bold">
                    <span className="text-[19px] text-[#2ECC71]">{currency} </span>
                    <span className="text-[33px] text-[#2ECC71]">{specialPrice} / </span>
                    <span className="text-[18px] font-normal text-[#878787]">
                      {billingPeriod === 'monthly' ? t.Package.month : t.Package.annual}
                    </span>
                  </h2>
                </div>
              ) : (
                /* Standard Price Layout */
                <h2 className="font-bold">
                  <span className="text-[19px]">{currency} </span>
                  <span className="text-[33px]">{price} / </span>
                  <span className="text-[18px] font-normal text-[#878787]">
                    {billingPeriod === 'monthly' ? t.Package.month : t.Package.annual}
                  </span>
                </h2>
              )}
            </div>

            <p className="text-base font-normal text-[#606060] border-b pb-5 border-b-[#F5F5F5] empty:hidden">
              {/* Description missing in API, maybe use first feature or empty? */}
            </p>

            {showButton && (
              <Button
                onClick={() => onStartTrial(pkg)}
                disabled={isCurrentPlan}
                className={`py-6 text-[14px] lg:text-base font-medium rounded-xl flex items-center justify-center gap-2
                ${
                  isBestDeal
                    ? 'border-[1.5px] border-[#FFFFFF00] bg-[#6AB240] text-white hover:bg-[#6AB240] shadow-lg shadow-[#6AB240]/20'
                    : 'border-[1.5px] border-[#EFEFEF] bg-[#F5F5F5] text-[#383838] hover:bg-[#FFFFFF] hover:border-black'
                }`}
              >
                {isCurrentPlan
                  ? t.Package.CurrentPlan
                  : !isFreePkg
                  ? t.Package.startFreeTrial
                  : t.Package.UpgradePlan}
              </Button>
            )}
          </Card>
        );

        if (isBestDeal) {
          return (
            <div
              key={pkg._id}
              className="p-1 bg-[#6AB240] rounded-3xl flex flex-col gap-0 justify-between"
            >
              <p className="flex justify-center gap-2 items-center py-5">
                <Sparkle />
                <span className="text-white font-[20px]">{t.Package.BestDeals}</span>
              </p>
              {CardContent}
            </div>
          );
        }

        return (
          <div key={pkg._id} className="h-full">
            {CardContent}
          </div>
        );
      })}
      <Card className="relative p-5 justify-between rounded-[22px] flex flex-col gap-3 border border-[#D6D6D6] h-full">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Lighting />
            <span className="text-[20px] font-medium">{'Prolife'}</span>
          </div>
          <Badge className="bg-[#D5F5E3] rounded-[6px] text-[#2ECC71] text-[13px] font-normal">
            20% Off
          </Badge>
        </div>
        <h2 className="font-bold">
          <span className="text-[19px]">SAR </span>
          <span className="text-[33px]">39 / </span>
          <span className="text-[18px] font-normal text-[#878787]">{'annual'}</span>
        </h2>
        <p className="text-base font-normal text-[#606060]">{'Prolifedusc'}</p>
        <Button
          className="py-6 border border-[#EFEFEF] bg-[#F5F5F5] rounded-xl text-[#383838] text-[14px] lg:text-base font-medium hover:bg-[#F5F5F5]"
          disabled
        >
          Upgrade Plan
        </Button>

        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center rounded-[22px]">
          <span className="text-xl lg:text-2xl font-bold text-[#383838]">Coming Soon</span>
        </div>
      </Card>
    </div>
  );
};
export default PlanCard;
