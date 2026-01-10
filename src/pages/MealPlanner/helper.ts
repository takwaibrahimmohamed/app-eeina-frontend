import { MealItem, MealPlan, MealType } from '../../types/mealPlanner.types';

/**
 * Format date to ISO string for consistent date comparison
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateKey = (date: Date) => {
  return date.toLocaleDateString('en-CA'); // yyyy-mm-dd
};

/**
 * Generate array of 7 dates representing a week starting from Sunday
 * @param date - Reference date to calculate the week from
 * @returns Array of Date objects representing the week
 */
export const getWeekDates = (date: Date) => {
  const week = [];
  const startDate = new Date(date);
  const day = startDate.getDay(); // Get day of week (0 = Sunday)
  const diff = startDate.getDate() - day; // Calculate difference to get to Sunday
  startDate.setDate(diff);

  // Generate 7 consecutive days starting from Sunday
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    week.push(currentDate);
  }
  return week;
};

/**
 * Determines the type of meal item based on its properties
 * @param meal - Meal object that may contain recipe, processedFood, or ingredient properties
 * @returns The type of meal item as a string ("recipe", "processedFood", "ingredient")
 */
function getItemType(meal: any) {
  if (meal.recipe) return 'recipe';
  if (meal.processedFood) return 'processedFood';
  if (meal.ingredient) return 'ingredient';
}

/**
 * Retrieves the localized name of a meal type based on the provided slug and language.
 * If the meal type is not found, returns the original slug.
 *
 * @param mealTypeSlug - The slug identifier of the meal type.
 * @param mealTypes - An array of available meal types.
 * @param language - The language code for localization (e.g., 'en', 'fr').
 * @returns The localized name of the meal type or the slug if not found.
 */
export function getLocalizedMealType(
  mealTypeSlug: string,
  mealTypes: MealType[],
  language: string,
): string {
  const mealType = mealTypes.find((mt) => mt.slug === mealTypeSlug);
  return mealType ? mealType.name[language as keyof typeof mealType.name] : mealTypeSlug;
}

/**
 * Calculates the total nutrition value for a given serving based on the nutrition per serving.
 *
 * @param nutritonPerServing - The nutrition value per serving (default is 0). Assumed to be per 100g if unit is 'g'.
 * @param serving - An object containing the quantity and unit of the serving.
 * @returns The calculated nutrition value. Returns 0 if the unit is not recognized.
 */
function calculateNutritonForServing(
  nutritonPerServing: number,
  serving: { quantity: number; unit: string },
): number {
  if (serving.unit === 'g') {
    return (nutritonPerServing * serving.quantity) / 100;
  }
  if (serving.unit === 'pcs' || serving.unit === 'serving') {
    return nutritonPerServing * serving.quantity;
  }
  return 0; // ensure return for all paths
}

/**
 * Formats meal plan data into a structured object organized by date and meal type
 * @param mealPlanData - Array of meal plans from API
 * @param mealTypeData - Object mapping dates to available meal types
 * @param visibleDates - Array of dates to process and include in result
 * @param language - Language code for localization (defaults to "en")
 * @returns Nested object structure: { dateStr: { mealType: [meals...] } }
 */
export function formatMealPlans(
  mealPlanData: MealPlan[],
  mealTypeData: Record<string, MealType[]>,
  visibleDates: Date[],
  language: 'en' | 'ar' = 'en',
): Record<string, Record<string, { meals: any[]; label: string }>> {
  const result: Record<string, Record<string, { meals: any[]; label: string }>> = {};

  visibleDates.forEach((date) => {
    const dateStr = formatDateKey(date);
    result[dateStr] = {};

    const dayMealPlan = mealPlanData?.find((plan) => plan.date.split('T')[0] === dateStr);
    const dayMealTypes = mealTypeData?.[dateStr] || [];

    const mealTypeSlugs = dayMealTypes.map((mt) => mt.slug);
    const mealPlanTypes = dayMealPlan ? dayMealPlan.mealPlan.map((mp) => mp.mealType) : [];
    const allMealTypes = [...new Set([...mealTypeSlugs, ...mealPlanTypes])];

    const MEAL_ORDER = [
      'breakfast',
      'mid-morning-snack',
      'lunch',
      'afternoon-snack',
      'dinner',
      'evening-snack',
    ];

    allMealTypes.sort((a, b) => {
      const indexA = MEAL_ORDER.indexOf(a);
      const indexB = MEAL_ORDER.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return a.localeCompare(b);
    });

    allMealTypes.forEach((mealType) => {
      const localizedLabel = getLocalizedMealType(mealType, dayMealTypes, language);
      result[dateStr][mealType] = {
        label: localizedLabel,
        meals: [],
      };

      if (dayMealPlan) {
        const matchingMeals = dayMealPlan.mealPlan.filter((mp) => mp.mealType === mealType);

        matchingMeals.forEach((meal) => {
          const plannerItem = meal.processedFood || meal.ingredient || meal.recipe;

          if (!plannerItem) return;

          result[dateStr][mealType].meals.push({
            id: meal._id,
            name: plannerItem?.title?.[language] || plannerItem?.name?.[language],
            image: plannerItem?.thumbnail?.url || plannerItem?.image?.url,
            slug: plannerItem?.slug?.[language],
            calories: Math.round(
              calculateNutritonForServing(plannerItem.nutrition.calories.amount ?? 0, meal.serving),
            ),
            protein: Math.round(
              calculateNutritonForServing(plannerItem.nutrition.protein.amount ?? 0, meal.serving),
            ),
            carbs: Math.round(
              calculateNutritonForServing(plannerItem.nutrition.carbs.amount ?? 0, meal.serving),
            ),
            fat: Math.round(
              calculateNutritonForServing(plannerItem.nutrition.fat.amount ?? 0, meal.serving),
            ),
            time: plannerItem.time,
            itemType: getItemType(meal),
            mealType: mealType, // Keep slug for operations
            serving: meal.serving,
            ingredients: plannerItem.ingredients || [],
            itemId: plannerItem._id, // Actual Recipe/Food ID
          });
        });
      }
    });
  });

  return result;
}

/**
 * Retrieves the meals planned for a specific date
 * @param meals - Nested object of meals organized by date and meal type
 * @param date - Date object to retrieve meals for
 * @returns Object mapping meal types to arrays of meals for the specified date
 */
export function getMealForDate(
  meals: Record<string, Record<string, { meals: any[]; label: string }>>,
  date: Date,
) {
  const dateKey = formatDateKey(date);
  return meals[dateKey];
}

/**
 * Formats an unformatted meal items into an array of structured MealItem object.
 * Extracts and rounds nutritional values, handles localization for name and image,
 * and assigns the specified item type.
 *
 * @param unformattedItem - The raw items object containing meal data (e.g., with _id, title/name, thumbnail/image, nutrition, time).
 * @param language - The language code for localization (defaults to "en").
 * @param itemType - The type of the meal item, which must be one of "recipe", "processedFood", or "ingredient".
 * @returns A formatted array of MealItem objects with id, name, image, nutritional values, time, and itemType.
 */
export function formatMealItems(
  unformattedItems: any[],
  language = 'en',
  itemType: 'recipe' | 'processedFood' | 'ingredient',
): any[] {
  console.log('unformattedItems', unformattedItems);
  return unformattedItems.map((unformattedItem) => ({
    id: unformattedItem._id,
    name: unformattedItem.title?.[language] || unformattedItem.name?.[language], // Handle different name fields
    image: unformattedItem.thumbnail?.url || unformattedItem.image?.url, // Handle different image fields
    slug: unformattedItem.slug,
    // Round nutritional values for display
    calories: Math.round(unformattedItem?.nutrition?.calories?.amount),
    protein: Math.round(unformattedItem?.nutrition?.protein?.amount),
    carbs: Math.round(unformattedItem?.nutrition?.carbs?.amount),
    fat: Math.round(unformattedItem?.nutrition?.fat?.amount),
    time: unformattedItem?.time,
    itemType: itemType, // Assign the specified item type
    serving: unformattedItem?.servings,
  }));
}

/**
 * Finds the original meal plan that matches the given date from an array of meal plans.
 *
 * @param mealPlans - An array of meal plan objects, which can be empty or contain any structure.
 * @param date - The Date object to search for in the meal plans.
 * @returns The meal plan object that matches the date, or undefined if no match is found.
 */
export const findOriginalMealPlanByDate = (mealPlans: [] | any[], date: String) => {
  return mealPlans.find((plan) => plan.date.split('T')[0] === date);
};

/** Formats the payload for updating a meal plan by ensuring all IDs are strings and removing nested objects.
 *
 * @param originalMealPlan - The original meal plan object to format, which may contain nested objects.
 * @returns A new meal plan object with all IDs as strings and without nested objects, suitable for API submission.
 */
export const formatPayloadForMealPlan = (originalMealPlan: any) => {
  console.log('originalMealPlan', originalMealPlan);
  const base =
    originalMealPlan && typeof originalMealPlan.toObject === 'function'
      ? originalMealPlan.toObject({ depopulate: true })
      : JSON.parse(JSON.stringify(originalMealPlan || {}));

  console.log('base', base);

  const formattedMealPlan = (base.mealPlan || [])
    .map((i: any) => {
      const item: any = {
        // include _id only if present (stringified)
        ...(i._id ? { _id: String(i._id) } : {}),
        mealType: i?.mealType ?? null,
        serving: i.serving,
      };

      if (!i.recipe && !i.processedFood && !i.ingredient) return null; // skip invalid entries

      if (i?.recipe?._id) item.recipe = String(i.recipe._id);
      if (i?.processedFood?._id) item.processedFood = String(i.processedFood._id);
      if (i?.ingredient?._id) item.ingredient = String(i.ingredient._id);

      return item;
    })
    .filter(Boolean); // remove nulls

  // return new plain object (no mutation)
  return { ...base, mealPlan: formattedMealPlan };
};

/**
 * Calculates the total nutrition values for a selected day by aggregating calories, protein, carbs, and fat
 * from all meals across different meal types.
 *
 * @param meals - An object where keys represent meal types (e.g., breakfast, lunch) and values contain an array of MealItem objects.
 * @returns An object containing the summed nutrition values: calories, protein, carbs, and fat.
 */
export const getSelectedDayNutrition = (meals: Record<string, { meals: MealItem[] }>) => {
  return Object.values(meals || {})
    .flatMap((mealType) => mealType.meals)
    .reduce(
      (acc, meal) => {
        acc.calories += meal.calories || 0;
        acc.protein += meal.protein || 0;
        acc.carbs += meal.carbs || 0;
        acc.fat += meal.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
};

/**
 * Calculates the weekly summary of nutrition data from meal plans.
 *
 * This function computes the average daily calories, protein, carbs, and fat
 * across a week, as well as the number of days where calorie intake is between
 * 2000 and 2500 (considered "on track").
 *
 * @param mealPlans - A record where keys are day identifiers, and values are
 * records of meal plan entries, each containing an array of MealItem objects
 * and a label string.
 *
 * @returns An object containing:
 * - avgDailyCalories: The average daily calories, rounded to the nearest integer.
 * - avgDailyProtein: The average daily protein, rounded to the nearest integer.
 * - avgDailyCarbs: The average daily carbs, rounded to the nearest integer.
 * - avgDailyFat: The average daily fat, rounded to the nearest integer.
 * - daysOnTrack: The number of days with calorie intake between 2000 and 2500.
 */
export const getWeeklySummary = (
  mealPlans: Record<string, Record<string, { meals: MealItem[]; label: string }>>,
) => {
  // calcuate averate daily calories, protein, carbs, fat for the week
  const totalNutrition = Object.values(mealPlans).reduce(
    (acc, dayMeals) => {
      const dayNutrition = getSelectedDayNutrition(dayMeals);
      acc.calories += dayNutrition.calories;
      acc.protein += dayNutrition.protein;
      acc.carbs += dayNutrition.carbs;
      acc.fat += dayNutrition.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  // calcuate days on track (2000-2500 calories)
  const daysOnTrack = Object.values(mealPlans).filter((dayMeals) => {
    const dayNutrition = getSelectedDayNutrition(dayMeals);
    return dayNutrition.calories >= 2000 && dayNutrition.calories <= 2500;
  }).length;

  return {
    avgDailyCalories: Math.round(totalNutrition.calories / 7),
    avgDailyProtein: Math.round(totalNutrition.protein / 7),
    avgDailyCarbs: Math.round(totalNutrition.carbs / 7),
    avgDailyFat: Math.round(totalNutrition.fat / 7),
    daysOnTrack,
  };
};

export function getMealItemLink(item: MealItem) {
  if (item.itemType === 'recipe') return `/recipe/${item.slug}`;
  if (item.itemType === 'processedFood') return `/processed-food/${item.slug}`;
  if (item.itemType === 'ingredient') return `/ingredient/${item.slug}`;
  return '#';
}
