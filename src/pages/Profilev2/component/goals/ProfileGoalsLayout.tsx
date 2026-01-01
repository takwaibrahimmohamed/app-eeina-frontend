import { Link, Outlet, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils'; // Assuming you have a utils file for classnames, or just use template literals

const ProfileGoalsLayout = () => {
    const { language } = useLanguage();
    const location = useLocation();

    const tabs = [
        {
            label: language === 'ar' ? 'عرض الأهداف' : 'View Goals',
            path: '/Profile/goals',
            exact: true,
        },
        {
            label: language === 'ar' ? 'سجل الوجبات' : 'Meal History',
            path: '/Profile/goals/meal-history',
        },
        {
            label: language === 'ar' ? 'إعدادات الصحة' : 'Health Settings',
            path: '/Profile/goals/health-settings',
        },
    ];



    return (
        <div className="flex flex-col gap-6">
            {/* Tabs Header */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => {
                        // Refined Active Logic
                        let isTabActive = false;
                        if (tab.path === '/Profile/goals') {
                            // Active only if it's exactly /Profile/goals or /Profile/goals/ (and not a sub-route like /meal-history)
                            // But wait, /Profile/goals is the base.
                            // Actually, simpler logic:
                            // If path is '/Profile/goals', active if pathname is exactly that.
                            isTabActive = location.pathname === tab.path || location.pathname === `${tab.path}/`;
                        } else {
                            isTabActive = location.pathname.startsWith(tab.path);
                        }

                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={cn(
                                    isTabActive
                                        ? 'border-[#6AB240] text-[#6AB240]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
                                )}
                                aria-current={isTabActive ? 'page' : undefined}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                <Outlet />
            </div>
        </div>
    );
};

export default ProfileGoalsLayout;
