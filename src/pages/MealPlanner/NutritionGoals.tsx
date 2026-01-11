import { useState } from 'react';
import { BarChart3, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/button';

const nutritionGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 67,
};

interface NutritionGoalsProps {
  selectedDayNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    potassium?: number;
    cholesterol?: number;
  };
  weeklySummary: {
    avgDailyCalories: number;
    avgDailyProtein: number;
    avgDailyCarbs: number;
    avgDailyFat: number;
    daysOnTrack: number;
  };
}

export const NutritionGoals = ({ selectedDayNutrition, weeklySummary }: NutritionGoalsProps) => {
  const { t } = useLanguage();
  const { avgDailyCalories, avgDailyProtein, avgDailyCarbs, avgDailyFat, daysOnTrack } =
    weeklySummary;
  const [showDetails, setShowDetails] = useState(false);


  return (
    <div className="lg:col-span-4">
      <div className="sticky top-24 space-y-6">
        {/* Daily Nutrition - Recipe Page Style */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-primaryColor" />
              <h3 className="text-lg font-bold text-gray-900">{t.meal_planner.daily_nutrition}</h3>
            </div>

            {/* Main Nutrition Bar - Recipe Page Style */}
            <div className="bg-primaryColor text-white rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">{selectedDayNutrition.calories}</div>
                  <div className="text-sm opacity-90">{t.meal_planner.nutrition_calories}</div>
                  <div className="text-xs opacity-75">
                    {t.meal_planner.of_target.replace(
                      '{target}',
                      nutritionGoals.calories.toString(),
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{selectedDayNutrition.protein}g</div>
                  <div className="text-sm opacity-90">{t.meal_planner.nutrition_protein}</div>
                  <div className="text-xs opacity-75">
                    {t.meal_planner.of_target.replace('{target}', `${nutritionGoals.protein}g`)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 text-center mt-4">
                <div>
                  <div className="text-2xl font-bold">{selectedDayNutrition.carbs}g</div>
                  <div className="text-sm opacity-90">{t.meal_planner.nutrition_carbs}</div>
                  <div className="text-xs opacity-75">
                    {t.meal_planner.of_target.replace('{target}', `${nutritionGoals.carbs}g`)}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{selectedDayNutrition.fat}g</div>
                  <div className="text-sm opacity-90">{t.meal_planner.nutrition_fat}</div>
                  <div className="text-xs opacity-75">
                    {t.meal_planner.of_target.replace('{target}', `${nutritionGoals.fat}g`)}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Progress Bars */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {t.meal_planner.daily_progress}
                  </span>
                  <span className="text-sm text-gray-600">
                    {t.meal_planner.percent_complete.replace(
                      '{percent}',
                      Math.round(
                        (selectedDayNutrition.calories / nutritionGoals.calories) * 100,
                      ).toString(),
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-primaryColor transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (selectedDayNutrition.calories / nutritionGoals.calories) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-sm mt-6">
                <div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-red-600 font-bold text-lg">
                      {selectedDayNutrition.protein}g
                    </div>
                    <div className="text-red-500 text-xs font-medium">
                      {t.meal_planner.nutrition_protein}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="text-yellow-600 font-bold text-lg">
                      {selectedDayNutrition.carbs}g
                    </div>
                    <div className="text-yellow-500 text-xs font-medium">
                      {t.meal_planner.nutrition_carbs}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-blue-600 font-bold text-lg">
                      {selectedDayNutrition.fat}g
                    </div>
                    <div className="text-blue-500 text-xs font-medium">
                      {t.meal_planner.nutrition_fat}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* More Details Toggle */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <>
                    <span>Hide Details</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Show Micronutrients</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>

              {showDetails && (
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm animate-in slide-in-from-top-2">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Fiber</span>
                    <span className="font-semibold text-gray-900">{selectedDayNutrition.fiber || 0}g</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Sugar</span>
                    <span className="font-semibold text-gray-900">{selectedDayNutrition.sugar || 0}g</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Sodium</span>
                    <span className="font-semibold text-gray-900">{selectedDayNutrition.sodium || 0}mg</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Cholesterol</span>
                    <span className="font-semibold text-gray-900">{selectedDayNutrition.cholesterol || 0}mg</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg col-span-2">
                    <span className="text-gray-600">Potassium</span>
                    <span className="font-semibold text-gray-900">{selectedDayNutrition.potassium || 0}mg</span>
                  </div>
                </div>
              )}
            </div>


          </CardContent>
        </Card>

        {/* Weekly Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-primaryColor" />
              <h3 className="text-lg font-bold text-gray-900">{t.meal_planner.weekly_summary}</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t.meal_planner.days_on_track}</span>
                <span className="font-semibold text-primaryColor">
                  {daysOnTrack} / 7 (2000-2500 kcal)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t.meal_planner.avg_daily_calories}</span>
                <span className="font-semibold text-sm sm:text-base">{avgDailyCalories}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t.meal_planner.avg_daily_protein}</span>
                <span className="font-semibold text-sm sm:text-base">{avgDailyProtein}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t.meal_planner.avg_daily_carbs}</span>
                <span className="font-semibold text-sm sm:text-base">{avgDailyCarbs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t.meal_planner.avg_daily_fat}</span>
                <span className="font-semibold text-sm sm:text-base">{avgDailyFat}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
