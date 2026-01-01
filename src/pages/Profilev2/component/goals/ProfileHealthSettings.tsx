import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Foodallergies from '@/pages/Goals/components/Foodallergies';
import Modifytarget from '@/pages/Goals/components/Modifytarget';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetGoalsQuery } from '@/redux/Features/Goals/GoalsApi';
import { useEffect, useState } from 'react';
import WeightLog from '@/pages/Goals/components/WeightLog';

const ProfileHealthSettings = () => {
    const { t } = useLanguage();
    const [warning, setWarning] = useState<boolean>(false);
    const [warningMessage, setWarningMessage] = useState<string>('');

    const { data: goalData } = useGetGoalsQuery({ status: 'In Progress' });

    useEffect(() => {
        if (!goalData?.data?.length) return;
        if (goalData) {
            const {
                currentWeight,
                targetWeight,
                tdee,
                startDate,
                endDate,
                height,
                targetNutrition: { calories: targetCalories },
            } = goalData.data[0];
            // for weight gain or loss goal
            if (targetWeight !== currentWeight) {
                const caloriesDifference = tdee - targetCalories;
                if (Math.abs(caloriesDifference) > tdee * 0.33) {
                    setWarning(true);
                    setWarningMessage(
                        `${targetWeight > currentWeight ? 'gaining' : 'losing'} ${Math.abs(targetWeight - currentWeight)} kg in ${Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks requires a significant calorie ${targetWeight > currentWeight ? 'surplus' : 'deficit'
                        }. This may not be safe for your health. Consider adjusting your goal.`,
                    );
                }
            } else {
                // for weight maintenance goal
                const bmi = currentWeight / (height / 100) ** 2;
                if (bmi < 18.5) {
                    setWarning(true);
                    setWarningMessage(
                        'Your BMI indicates underweight. Try to adjust your goal as gaining weight may be beneficial for your health.',
                    );
                } else if (bmi > 24.9) {
                    setWarning(true);
                    setWarningMessage(
                        'Your BMI indicates overweight. Try to adjust your goal as losing weight may be beneficial for your health.',
                    );
                }
            }
        }
    }, [goalData]);

    return (
        <div className="flex flex-col gap-6">
            {/* warning should go here if existns */}
            {warning && (
                <Card className="p-4 border-yellow-200 bg-yellow-50">
                    <div className="flex flex-col gap-4 text-center items-center">
                        <h2 className="text-sm md:text-base font-medium text-yellow-800">
                            {warningMessage}
                        </h2>
                        <div className="flex gap-3">
                            <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                                {t.GoalsDashboard.AdjustGoal}
                            </Button>

                            <Button
                                size="sm"
                                onClick={() => setWarning(false)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                                {t.GoalsDashboard.ContinueWithWarning}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-0 border-none shadow-none md:border md:shadow-sm md:p-4">
                        <h3 className="font-semibold text-lg mb-4 px-1">Weight History</h3>
                        <WeightLog
                            startWeight={goalData?.data[0]?.currentWeight}
                            logs={goalData?.data[0]?.weightLog}
                            height={goalData?.data[0]?.height}
                            goalId={goalData?.data[0]?._id}
                        />
                    </Card>

                    <div className="flex flex-col gap-6">
                        <Modifytarget goal={goalData?.data[0]} />
                        <Foodallergies />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHealthSettings;
