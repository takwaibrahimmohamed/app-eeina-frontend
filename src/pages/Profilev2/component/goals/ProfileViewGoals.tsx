import { Card } from '@/components/ui/card';
import CommitmentChart from '@/pages/Goals/components/CommitmentChart';
import Piechart from '@/pages/Goals/components/Piechart';
import TodaysActivity from '@/pages/Goals/components/TodaysActivity';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    useGetGeneratedmealPlansQuery,
    useGetGoalsQuery,
    useUpdateMealProgressMutation,
} from '@/redux/Features/Goals/GoalsApi';
import Loader from '@/components/ui/Loader';
import { useEffect, useState } from 'react';
import { startOfDay } from '@/lib/formatDate';
import { isSameDay } from 'date-fns';
import Streak from '@/pages/Goals/components/Streak';
import Progress from '@/pages/Goals/components/Progress';
import { Link } from 'react-router-dom';
import ProfileWeightCard from './ProfileWeightCard';
import { Button } from '@/components/ui/button';

const ProfileViewGoals = () => {
    const { t } = useLanguage();
    const [mealActivity, setMealActivity] = useState({
        breakfast: false,
        lunch: false,
        dinner: false,
        snack: false,
    });

    const { data: goalData, isLoading: isGoalsLoading } = useGetGoalsQuery({ status: 'In Progress' });
    const [updateMealProgress] = useUpdateMealProgressMutation();

    const { data, isLoading: isMealPlanLoading } = useGetGeneratedmealPlansQuery(
        {
            goalId: goalData?.data[0]?._id,
            date: new Date().toISOString().split('T')[0],
        },
        { skip: !goalData?.data[0]?._id },
    );

    useEffect(() => {
        if (goalData?.data[0]) {
            const todayMealLog = goalData.data[0].mealLog?.find((log: any) => {
                const logDate = startOfDay(log.date);
                const todayDate = startOfDay(new Date());
                return isSameDay(logDate, todayDate);
            });

            if (todayMealLog) {
                setMealActivity({
                    ...todayMealLog.meals,
                });
            }
        }
    }, [goalData]);

    const handleUpdateMealProgress = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
        const newActivity = {
            ...mealActivity,
            [mealType]: !mealActivity[mealType],
        };
        setMealActivity(newActivity);

        await updateMealProgress({
            goalId: goalData?.data[0]?._id!,
            mealsCompleted: newActivity,
        }).unwrap();
    };

    if (isGoalsLoading || isMealPlanLoading) return <Loader className="bg-white" />;

    const nutrition = goalData?.data[0]?.targetNutrition;

    return (
        <div className="flex flex-col gap-6">
            {/* Nutrition Overview Section */}
            {nutrition && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 flex flex-col gap-2 items-center justify-center text-center hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-xl">🔥</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{t.goalSetup?.label_calories || 'Calories'}</p>
                            <h3 className="text-lg font-bold text-gray-900">{nutrition.calories} <span className="text-xs font-normal text-gray-400">{t.goalSetup?.kcal || 'kcal'}</span></h3>
                        </div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2 items-center justify-center text-center hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xl">🥩</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{t.goalSetup?.label_protein || 'Protein'}</p>
                            <h3 className="text-lg font-bold text-gray-900">{nutrition.protein} <span className="text-xs font-normal text-gray-400">{t.goalSetup?.gram || 'g'}</span></h3>
                        </div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2 items-center justify-center text-center hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-xl">🥖</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{t.goalSetup?.label_carbs || 'Carbs'}</p>
                            <h3 className="text-lg font-bold text-gray-900">{nutrition.carbs} <span className="text-xs font-normal text-gray-400">{t.goalSetup?.gram || 'g'}</span></h3>
                        </div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2 items-center justify-center text-center hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-xl">🥑</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{t.goalSetup?.label_fat || 'Fat'}</p>
                            <h3 className="text-lg font-bold text-gray-900">{nutrition.fat} <span className="text-xs font-normal text-gray-400">{t.goalSetup?.gram || 'g'}</span></h3>
                        </div>
                    </Card>
                </div>
            )}

            {/* Top Section: Streak and Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Streak
                    currentStreak={goalData?.data[0].streak}
                    maxStreak={goalData?.data[0].longestStreak}
                    className="h-full"
                />
                <Progress
                    progressPentage={goalData?.data[0].progressPercentage}
                    startDate={goalData?.data[0].startDate}
                    endDate={goalData?.data[0].endDate}
                    className="h-full"
                />
            </div>

            {/* Activity and Weight Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left Column: Today's Activity */}
                <div className="h-full">
                    <TodaysActivity
                        mealActivity={mealActivity}
                        onToggleMeal={handleUpdateMealProgress}
                        mealPlan={data?.data?.meals}
                    />
                </div>

                {/* Right Column: Weight Journey & Meal Planner */}
                <div className="flex flex-col gap-5 h-full">
                    <ProfileWeightCard
                        currentWeight={
                            goalData?.data[0].weightLog?.[goalData?.data[0].weightLog?.length - 1]?.weight ||
                            goalData?.data[0].currentWeight
                        }
                        startingWeight={goalData?.data[0].currentWeight}
                        targetWeight={goalData?.data[0].targetWeight}
                        weightLog={goalData?.data[0].weightLog || []}
                        goalId={goalData?.data[0]?._id}
                        className="flex-1 min-h-[300px]"
                    />

                    <Card className="p-4 flex flex-row justify-between items-center gap-4">
                        <div className="flex flex-col">
                            <h2 className="font-semibold text-gray-900">Meal Planner</h2>
                            <p className="text-xs text-gray-500">Plan your meals ahead</p>
                        </div>
                        <Link to="/planner">
                            <Button className="bg-[#6AB240] hover:bg-[#5da035]">
                                {t.GoalsDashboard.Plantoday}
                            </Button>
                        </Link>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card className="p-4">
                    <CommitmentChart mealLog={goalData?.data[0].mealLog} />
                </Card>
                <Card className="p-0 overflow-hidden">
                    <Piechart dailyNutrition={goalData?.data[0].targetNutrition} />
                </Card>
            </div>
        </div>
    );
};

export default ProfileViewGoals;
