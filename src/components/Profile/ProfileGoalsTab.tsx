import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '../ui/card';
import { useGetGoalsQuery } from '@/redux/Features/Goals/GoalsApi';
import { BarChart3, Goal, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { getLocalizedPath } from '@/lib/getLocalizedPath';
import { daysBetween } from '@/lib/formatDate';

export const ProfileGoalsTab = () => {
    const { t, language } = useLanguage();
    const { data: goalsData } = useGetGoalsQuery({});

    if (!goalsData?.data?.docs || goalsData.data.docs.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Goal className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'ar' ? 'لم تحدد أي أهداف بعد' : 'No goals set yet'}
                </h3>
                <Link to={getLocalizedPath('/goals-dashboard', language)}>
                    <Button className="bg-primaryColor hover:bg-[#1c9a40] mt-4">
                        {language === 'ar' ? 'تحديد هدف جديد' : 'Set New Goal'}
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="shadow-sm border-0">
                <CardContent className="p-0">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-green-600" />
                            </div>
                            {language === 'ar' ? 'أهدافي النشطة' : 'My Active Goals'}
                        </h3>
                        <Link to={getLocalizedPath('/goals-dashboard', language)}>
                            <Button size="sm" variant="ghost" className="text-primaryColor hover:text-green-700">
                                {t.common.view_all}
                            </Button>
                        </Link>
                    </div>

                    <div className="p-5 space-y-4">
                        {goalsData.data.docs.map((goal: any, index: number) => (
                            <div
                                key={goal._id || index}
                                className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 p-4 hover:shadow-md hover:border-primaryColor/30 transition-all duration-300"
                            >
                                {/* Progress background overlay */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-primaryColor/5 to-transparent transition-all duration-500"
                                    style={{
                                        width: `${Math.min(parseInt(goal?.progressPercentage) || 0, 100)}%`,
                                    }}
                                />

                                <div className="relative">
                                    {/* Goal Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 bg-gradient-to-br from-primaryColor to-[#1c9a40] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <Goal className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-base text-gray-900 truncate mb-1">
                                                    {goal?.tilte || goal?.title || 'Untitled Goal'}
                                                </h4>
                                                <p className="text-xs text-gray-500 line-clamp-1">
                                                    {goal?.description || 'No description'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-3">
                                            <div className="text-xl font-bold text-primaryColor">
                                                {parseInt(goal?.progressPercentage) || 0}%
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                                {language === 'ar' ? 'مكتمل' : 'Complete'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-3">
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="h-2.5 rounded-full bg-gradient-to-r from-primaryColor to-[#1c9a40] transition-all duration-700 ease-out relative overflow-hidden"
                                                style={{
                                                    width: `${Math.min(parseInt(goal?.progressPercentage) || 0, 100)}%`,
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Goal Metadata */}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        {goal?.endDate && (
                                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="font-medium">
                                                    {daysBetween(new Date(), goal.endDate)}{' '}
                                                    {language === 'ar' ? 'يوم متبقي' : 'days left'}
                                                </span>
                                            </span>
                                        )}
                                        {goal?.currentValue !== undefined && goal?.targetValue && (
                                            <span className="font-medium">
                                                {goal.currentValue} / {goal.targetValue}
                                                {goal?.unit && ` ${goal.unit}`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
