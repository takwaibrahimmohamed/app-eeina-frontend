export type ViewMode = 'week' | 'day' | 'month';
type LanguageMap = { en: string; ar: string };

// response from backend
export interface PlannerItem {
  _id: string;
  title?: LanguageMap;
  name?: LanguageMap;
  image?: { url: string };
  slug: LanguageMap;
  thumbnail?: { url: string };
  nutrition: {
    calories: { amount: number };
    protein: { amount: number };
    carbs: { amount: number };
    fat: { amount: number };
    fiber?: { amount: number };
    sugar?: { amount: number };
    sodium?: { amount: number };
    potassium?: { amount: number };
    cholesterol?: { amount: number };
  };
  time: number;
  ingredients?: any[];
}

// single meal inside meal plan array
export interface Meal {
  _id: string;
  mealType: string;
  recipe?: PlannerItem;
  processedFood?: PlannerItem;
  ingredient?: PlannerItem;
  serving: {
    quantity: number;
    unit: 'g' | 'pcs' | 'serving';
  };
}

export interface MealPlan {
  date: string;
  mealPlan: Meal[];
}

// mealType response from backend
export interface MealType {
  slug: string;
  name: LanguageMap;
}

// formatted meal plan for frontend display
export interface MealItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  potassium?: number;
  cholesterol?: number;
  time?: number;
  itemType: 'recipe' | 'processedFood' | 'ingredient';
  mealType?: string;
  serving: { quantity: number; unit: 'g' | 'pcs' | 'serving' };
}

export interface FormattedMealPlan {
  date: string;
  meals: {
    [mealType: string]: MealItem[];
  };
}
