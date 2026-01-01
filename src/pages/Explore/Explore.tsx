/* eslint-disable no-unused-vars */
import { JSX, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/button';
import { Search, Grid3X3, List, BookOpen, Filter, X } from 'lucide-react';
import { useGetPublicRecipeQuery } from '../../redux/Features/Recipe/RecipeApi';
import { RecipiSkeleton } from '../../components/ui/skeletons/RecipiSkeleton';
import { useAppSelector } from '../../hooks/hook';
import { useLikes } from '../../hooks/useLikes';
import { useDebounce } from 'use-debounce';
import { GridView } from '../../components/Recipe/GridView';
import { ListView } from '../../components/Recipe/ListView';
import { useNormalizedRecipes } from '../../hooks/normalizeRecipes';
import { FeaturedCategories } from '../../components/Explore';
import { useGetCategoriesQuery } from '../../redux/Features/Category/CategoryAPI';
import { Pagination } from '../../components/ui/Pagination';

import { Sheet, SheetContent, SheetTrigger } from '../../components/ui/sheet';
import { FilterSection } from './components/FilterSection';
import { Category, CategoryType } from './types';
import { useGetAllIngredientQuery } from '@/redux/Features/Ingrediant/IngrediantApi';

export const Explore = (): JSX.Element => {
  const { t, isRTL, language } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<string[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<string[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [minTime, setMinTime] = useState<number | null>(null);
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const { data: ingredientData, isLoading: isIngredientLoading } = useGetAllIngredientQuery({
    limit: 20,
    isFeatured: true,
  });

  const [page, setPage] = useState(1);
  const limit = 12;

  // Fetch categories and cuisines
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });

  const getCategoryByType = (type: CategoryType, categoriesData: Category[] | undefined) => {
    if (!categoriesData) return [];
    return categoriesData.filter((cat) => cat.type === type);
  };

  const dishes = getCategoryByType('dish', categoriesData?.data?.docs);
  const cuisines = getCategoryByType('cuisine', categoriesData?.data?.docs);
  const mealTypes = getCategoryByType('meal_type', categoriesData?.data?.docs);
  const diets = getCategoryByType('diet', categoriesData?.data?.docs);
  const ingredients = ingredientData?.data?.docs || [];

  const featuredCategories = categoriesData?.data?.docs.filter((cat: any) => cat.isFeatured);

  const categoryFilter = [
    ...selectedCategory,
    ...selectedCuisine,
    ...selectedMealType,
    ...selectedDiet,
    // ...selectedIngredient,
  ].join(', ');

  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Fetch recipes with filters
  const { data: recipesData, isLoading } = useGetPublicRecipeQuery({
    page,
    limit,
    difficulty: selectedDifficulty === 'All' ? undefined : selectedDifficulty,
    category: categoryFilter || undefined,
    q: debouncedSearchQuery || undefined,
    minTime: minTime != null ? minTime : undefined,
    maxTime: maxTime != null ? maxTime : undefined,
    ingredients: selectedIngredient.length > 0 ? selectedIngredient.join(',') : undefined,
  });

  const recipes = recipesData?.data?.docs || [];
  const totalPages = recipesData?.data?.pagination?.totalPages || 1;
  const totalCount = recipesData?.data?.pagination?.totalCount || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when filters change
  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setPage(1);
  };
console.log("selectedCategory",selectedCategory)
  const clearFilters = () => {
    setSelectedCategory([]);
    setSelectedCuisine([]);
    setSelectedMealType([]);
    setSelectedDiet([]);
    setSelectedIngredient([]);
    setSelectedDifficulty('All');
    setSearchQuery('');
    setPage(1);
  };

  const currentUser = useAppSelector((state) => state.auth?.user);
  const normalizedRecipes = useNormalizedRecipes(recipes);
  const userId = currentUser?._id;
  const { likes, handleToggleLike } = useLikes(normalizedRecipes, userId);

  const difficulties = [
    { key: 'beginner', label: t.recipe.beginner },
    { key: 'intermediate', label: t.recipe.intermediate },
    { key: 'advanced', label: t.recipe.advanced },
  ];

  // Helper to find label by slug
  const getLabel = (slug: string, collection: any[]) => {
    const item = collection.find((c) => c.slug[language] === slug);
    return item ? item.name[language] : slug;
  };

  const activeFilters = [
    ...selectedIngredient.map((slug) => ({
      id: `ingredient-${slug}`,
      label: language === 'ar' ? 'المكونات' : 'Ingredients',
      value: slug,
      displayValue: getLabel(slug, ingredients),
      onRemove: () => setSelectedIngredient(selectedIngredient.filter((s) => s !== slug)),
      isActive: true,
    })),
    ...selectedCategory.map((slug) => ({
      id: `category-${slug}`,
      label: t.explore.category,
      value: slug,
      displayValue: getLabel(slug, dishes),
      onRemove: () => setSelectedCategory(selectedCategory.filter((s) => s !== slug)),
      isActive: true,
    })),
    ...selectedCuisine.map((slug) => ({
      id: `cuisine-${slug}`,
      label: t.explore.cuisine,
      value: slug,
      displayValue: getLabel(slug, cuisines),
      onRemove: () => setSelectedCuisine(selectedCuisine.filter((s) => s !== slug)),
      isActive: true,
    })),
    ...selectedMealType.map((slug) => ({
      id: `mealType-${slug}`,
      label: language === 'ar' ? 'نوع الوجبة' : 'Meal Type',
      value: slug,
      displayValue: getLabel(slug, mealTypes),
      onRemove: () => setSelectedMealType(selectedMealType.filter((s) => s !== slug)),
      isActive: true,
    })),
    ...selectedDiet.map((slug) => ({
      id: `diet-${slug}`,
      label: language === 'ar' ? 'نظام غذائي' : 'Diet',
      value: slug,
      displayValue: getLabel(slug, diets),
      onRemove: () => setSelectedDiet(selectedDiet.filter((s) => s !== slug)),
      isActive: true,
    })),
    {
      id: 'difficulty',
      label: t.explore.difficulty,
      value: selectedDifficulty,
      displayValue: difficulties.find((d) => d.key === selectedDifficulty)?.label,
      onRemove: () => setSelectedDifficulty('All'),
      isActive: selectedDifficulty !== 'All',
    },
    {
      id: 'search',
      label: language === 'ar' ? 'بحث' : 'Search',
      value: searchQuery,
      displayValue: searchQuery,
      onRemove: () => setSearchQuery(''),
      isActive: searchQuery !== '',
    },
    {
      id: 'timeRange',
      label: language === 'ar' ? 'الوقت' : 'Time',
      value: `${minTime}-${maxTime}`,
      displayValue: language === 'ar' ? `حتى ${maxTime} دقيقة` : `Up to ${maxTime} min`,
      onRemove: () => {
        setMinTime(null);
        setMaxTime(null);
      },
      isActive: maxTime !== null,
    },
  ].filter((f) => f.isActive);

  const FilterContent = () => (
    <div className="flex flex-col gap-5">
      <FilterSection
        title={language === 'ar' ? 'المكونات' : 'Ingredients'}
        items={ingredients}
        selected={selectedIngredient}
        onChange={(val) => handleFilterChange(setSelectedIngredient, val)}
        showImage={true}
      />

      <FilterSection
        title={language === 'ar' ? 'نوع الوجبة' : 'Meal Type'}
        items={mealTypes}
        selected={selectedMealType}
        onChange={(val) => handleFilterChange(setSelectedMealType, val)}
        showImage={false}
      />

      <FilterSection
        title={language === 'ar' ? 'نظام غذائي' : 'Diet'}
        items={diets}
        selected={selectedDiet}
        onChange={(val) => handleFilterChange(setSelectedDiet, val)}
        showImage={false}
      />
      <FilterSection
        title={t.explore.cuisine}
        items={cuisines}
        selected={selectedCuisine}
        onChange={(val) => handleFilterChange(setSelectedCuisine, val)}
        showImage={false}
      />

      <FilterSection
        title={t.explore.category}
        items={dishes}
        selected={selectedCategory}
        onChange={(val) => handleFilterChange(setSelectedCategory, val)}
        showImage={false}
      />

      <div className="flex flex-col gap-3">
        <h3 className="font-normal text-[18px]">{t.explore.difficulty}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {difficulties.map(({ key, label }) => {
            const active = selectedDifficulty === key;
            return (
              <div
                key={key}
                className="border border-[#E4E6EA] rounded-full w-fit px-4 py-1 flex items-center gap-3 cursor-pointer"
              >
                <span
                  className={`text-[15px] font-normal ${active ? 'text-primaryColor font-medium' : 'text-gray-600'}`}
                  onClick={() => handleFilterChange(setSelectedDifficulty, active ? 'All' : key)}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-normal text-[18px]">
          {language === 'ar' ? 'وقت الطهي (بالدقائق)' : 'Cook time (minutes)'}
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          {[15, 30, 60].map((time) => {
            const active = maxTime === time;
            return (
              <div
                key={time}
                className="border border-[#E4E6EA] rounded-full w-fit px-4 py-1 flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  if (active) {
                    setMaxTime(null);
                  } else {
                    setMaxTime(time);
                    setMinTime(null);
                  }
                }}
              >
                <span
                  className={`text-[15px] font-normal ${
                    active ? 'text-primaryColor font-medium' : 'text-gray-600'
                  }`}
                >
                  {language === 'ar' ? `حتى ${time} دقيقة` : `Up to ${time} min`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-6xl xl2:max-w-7xl mx-auto px-4 sm:px-6 py-8 mb-[3rem] md:mb-[4rem] lg:mb-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-primaryColor" />
              <h1 className="text-[20px] md:text-3xl font-bold text-gray-900">{t.explore.title}</h1>
            </div>
            <p className="text-gray-600">{t.explore.discover_recipes}</p>
          </div>

          {/* Mobile Filter Trigger */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Filter className="w-4 h-4" />
                  {language === 'ar' ? 'تصفية' : 'Filters'}
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isRTL ? 'right' : 'left'}
                className="w-[300px] sm:w-[400px] overflow-y-auto"
              >
                <div className="py-4">
                  <h3 className="text-lg font-bold mb-4">
                    {language === 'ar' ? 'تصفية' : 'Filters'}
                  </h3>
                  <FilterContent />
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    className="w-full mt-4 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="mb-10">
          <FeaturedCategories categories={featuredCategories} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">
                  {language === 'ar' ? 'تصفية' : 'Filters'}
                </h3>
                {(selectedCategory.length > 0 ||
                  selectedCuisine.length > 0 ||
                  selectedMealType.length > 0 ||
                  selectedDiet.length > 0 ||
                  selectedIngredient.length > 0 ||
                  selectedDifficulty !== 'All' ||
                  searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    {language === 'ar' ? 'مسح' : 'Clear'}
                  </button>
                )}
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="flex flex-col gap-6">
              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-700 shadow-sm"
                    >
                      <span className="font-medium text-gray-500">{filter.label}:</span>
                      <span className="font-semibold text-primaryColor">{filter.displayValue}</span>
                      <button
                        onClick={() => {
                          filter.onRemove();
                          setPage(1);
                        }}
                        className="ml-1 hover:bg-gray-100 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-600 font-medium px-2 hover:underline"
                  >
                    {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                  </button>
                </div>
              )}

              {/* Results Header */}
              <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-600 font-medium">
                  {t.explore.showing_results}{' '}
                  <span className="text-primaryColor font-bold">{totalCount}</span>{' '}
                  {language === 'ar' ? 'وصفة' : 'recipes'}
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-8 w-8 p-0 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primaryColor' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-8 w-8 p-0 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primaryColor' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Recipes Grid/List */}
              {isLoading ? (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <RecipiSkeleton key={i} variant="grid" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <RecipiSkeleton key={i} variant="list" />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="block md:hidden">
                    <GridView
                      recipes={recipes}
                      language={language}
                      likes={likes}
                      handleToggleLike={handleToggleLike}
                      columns={1}
                    />
                  </div>

                  <div className="hidden md:block">
                    {viewMode === 'grid' ? (
                      <GridView
                        recipes={recipes}
                        language={language}
                        likes={likes}
                        handleToggleLike={handleToggleLike}
                        columns={3}
                      />
                    ) : (
                      <ListView
                        recipes={recipes}
                        language={language}
                        likes={likes}
                        handleToggleLike={handleToggleLike}
                      />
                    )}
                  </div>

                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mt-8"
                  />

                  {recipes.length === 0 && !isLoading && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                      <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {t.explore.no_recipes_found}
                      </h3>
                      <p className="text-gray-500 max-w-xs mx-auto">{t.explore.adjust_filters}</p>
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="mt-6 border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-white"
                      >
                        {language === 'ar' ? 'مسح جميع المرشحات' : 'Clear all filters'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
