import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

import { Calendar } from './Calender';
import { useCalendar } from '../../hooks/useCalander';
import {
  useGetMealPlansQuery,
  useGetUserMealsQuery,
  useImportMealPlanFromTemplateMutation,
  useUpdateMealPlanMutation,
} from '../../redux/Features/MealPlan/mealPlanApi';
import {
  findOriginalMealPlanByDate,
  formatDateKey,
  formatMealPlans,
  formatPayloadForMealPlan,
  getMealForDate,
  getSelectedDayNutrition,
  getWeeklySummary,
} from './helper';
import { DailyMeals } from './DailyMeals'; // Assume WeeklyMeals is in same file or import accordingly
import {
  AddMealItemModal,
  BrowseMealModal,
  CustomMealModal,
  ImportModeModal,
  ServingModal,
  StartDaySelectionModal,
} from './Modal';
import { NutritionGoals } from './NutritionGoals';
import { WeeklyMeals } from './WeeklyMeals';
import Loader from '@/components/ui/Loader';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/hooks/hook';
import { openPremiumModal } from '@/redux/Features/Global/globalSlice';

/**
 * Main meal planner component with calendar view and meal management
 * Allows users to view, add, and remove meals from their meal plans
 * Supports both daily and weekly views with calendar navigation
 */
const MealPlanner = () => {
  // Language and localization context
  const { t, language } = useLanguage();

  // Calendar state management hook
  const {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    visibleDates,
    weekDates,
  } = useCalendar();

  // Modal state management
  const [showCustomMealModal, setShowCustomMealModal] = useState(false);
  const [showAddMealItemMOdal, setShowAddMealItemModal] = useState(false);
  const [showServingSizeModal, setShowServingSizeModal] = useState(false);
  const [browseMealModal, setBrowseMealModal] = useState(false);
  const [importModeModalOpen, setImportModeModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'skip' | 'replace' | 'merge'>('replace');
  const [selectedImportTemplate, setSelectedImportTemplate] = useState<any | null>(null);
  const [startDaySelectionModalOpen, setStartDaySelectionModalOpen] = useState(false);

  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedMealItem, setSelectedMealItem] = useState<any | null>(null);
  const [templateImportStartDate, setTemplateImportStartDate] = useState<Date | null>(null);

  console.log('Template Import Start Date:', templateImportStartDate);
  const premiumUser = useAppSelector((state) => state.auth.user?.accountType === 'premium');
  const dispatch = useAppDispatch();

  // API query parameters for fetching meal plans within the visible date range
  const mealPlanQuery = {
    startDate: formatDateKey(visibleDates[0]),
    endDate: formatDateKey(visibleDates[visibleDates.length - 1]),
  };

  // Fetch user's meal plans for the visible date range
  const { data: mealPlan, isLoading: isLoadingMealPlan } = useGetMealPlansQuery(mealPlanQuery);

  // Fetch user's configured meal types (breakfast, lunch, dinner, etc.)
  const { data: mealType, isLoading: isLoadingMealType } = useGetUserMealsQuery(mealPlanQuery);

  // Mutation for updating meal plans
  const [updateMealPlan] = useUpdateMealPlanMutation();
  const [importMealPlanFromTemplate] = useImportMealPlanFromTemplateMutation();

  // Show loading state while data is being fetched
  if (isLoadingMealPlan || isLoadingMealType) {
    return <Loader />;
  }

  // Format raw meal plan data into structured format for display
  const formattedMealPlans = formatMealPlans(
    mealPlan?.data,
    mealType?.data,
    visibleDates,
    language,
  );

  // Get meals for the currently selected date
  const selectedMeal = getMealForDate(formattedMealPlans, selectedDate);

  const selectedDayNutrition = getSelectedDayNutrition(selectedMeal);
  const weeklySummary = getWeeklySummary(formattedMealPlans);
  /**
   * Handles adding a meal item to the meal plan for the selected date
   * @param mealItem - The meal item to add (recipe, processed food, or ingredient)
   */
  const handleAddItemtoMealPlan = async (
    mealItem: any,
    serving: { quantity: number; unit: string },
  ) => {
    // Find existing meal plan for the selected date
    const originalMealPlan = findOriginalMealPlanByDate(mealPlan.data, formatDateKey(selectedDate));

    // Prepare payload - use existing meal plan or create new one
    const payload = originalMealPlan
      ? formatPayloadForMealPlan(originalMealPlan) //  format it for payload
      : {
        date: formatDateKey(selectedDate),
        mealPlan: [],
      };
    // Add the new meal item to the meal plan
    payload.mealPlan.push({
      mealType: selectedMealType,
      [mealItem.itemType]: mealItem.id, // Dynamic property based on item type
      serving,
    });

    // if payload date is not in YYYY-MM-DD format, convert it
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
      payload.date = formatDateKey(new Date(payload.date));
    }

    try {
      await updateMealPlan(payload).unwrap();
      console.log('payload', payload);
      setShowServingSizeModal(false);
      setSelectedMealItem(null);
    } catch (error) {
      console.error('Failed to update meal plan:', error);
    }
  };

  const handleAddItemClick = (mealItem: any) => {
    setSelectedMealItem(mealItem);
    setShowAddMealItemModal(false);
    if (!premiumUser) {
      dispatch(openPremiumModal());
      return;
    }
    setShowServingSizeModal(true);
  };

  /**
   * Handles removing a meal item from the meal plan
   * @param itemId - The ID of the meal item to remove
   */
  const handleRemoveItemtoMealPlan = async (itemId: string) => {
    const originalMealPlan = findOriginalMealPlanByDate(mealPlan.data, formatDateKey(selectedDate));
    if (!originalMealPlan) return;

    // prepare payload for update
    const payload = formatPayloadForMealPlan(originalMealPlan);

    // Snapshot logs (use stringify to avoid lazy expansion issues)
    console.log(
      'Before removal ids:',
      payload.mealPlan.map((m: any) => String(m._id)),
    );
    console.log('Before removal snapshot:', JSON.stringify(payload.mealPlan, null, 2));

    const idToRemove = String(itemId);
    const newMealPlan = payload.mealPlan.filter((i: any) => String(i._id) !== idToRemove);

    // Create a new payload object (no mutation)
    const newPayload = { ...payload, mealPlan: newMealPlan };

    console.log(
      'After removal ids:',
      newPayload.mealPlan.map((m: any) => String(m._id)),
    );
    console.log('After removal snapshot:', JSON.stringify(newPayload.mealPlan, null, 2));

    // ensure date is formatted
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newPayload.date)) {
      newPayload.date = formatDateKey(new Date(newPayload.date));
    }

    try {
      await updateMealPlan(newPayload).unwrap();
    } catch (error) {
      console.error('Failed to update meal plan:', error);
    }
  };

  const handleSelectedTemplate = (template: any) => {
    setSelectedImportTemplate(template);
    if (!premiumUser) {
      dispatch(openPremiumModal());
      return;
    }
    setStartDaySelectionModalOpen(true);
  };

  const handleImportModeSelection = (importMode: 'replace' | 'merge' | 'skip') => {
    setImportMode(importMode);
    setImportModeModalOpen(false);
    const startDateKey = formatDateKey(templateImportStartDate as Date); // since templateImportStartDate is set when this modal is opened
    submitImportTemplate(importMode, startDateKey);
  };

  /**
   * Checks if the user has existing meal plans that overlap with the template date range
   * @param template - The template object containing meal plans
   * @param startDate - The selected start date for importing the template
   * @returns boolean - True if there's an overlap, false otherwise
   */
  const checkForOverlappingMealPlans = (template: any, startDate: Date): boolean => {
    console.log('Checking for overlapping meal plans with template:', template);
    if (!template?.mealPlans || !mealPlan?.data) return false;

    // Get the duration of the template (number of days)
    const templateDuration = template.mealPlans.length;

    // Calculate the end date based on template duration
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + templateDuration - 1);

    // Create a set of dates from the template range
    const templateDates = new Set<string>();
    for (let i = 0; i < templateDuration; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      templateDates.add(formatDateKey(currentDate));
    }

    // Check if any existing meal plans overlap with the template date range
    const hasOverlap = mealPlan.data.some((plan: any) => {
      const planDate = formatDateKey(new Date(plan.date));
      return templateDates.has(planDate) && plan.mealPlan && plan.mealPlan.length > 0;
    });

    return hasOverlap;
  };

  const handleStartDaySelection = (date: Date) => {
    console.log('Start day selected:', date);
    if (!date || !selectedImportTemplate) return;

    setTemplateImportStartDate(date);
    setStartDaySelectionModalOpen(false);
    const startDateKey = formatDateKey(date);

    // Check if user already has meal plans for the selected date range
    const hasOverlap = checkForOverlappingMealPlans(selectedImportTemplate, date);

    console.log('Overlapping meal plans found:', hasOverlap);

    if (hasOverlap) {
      // If yes, open import mode selection modal
      setImportModeModalOpen(true);
    } else {
      // Else submit the import directly with default mode 'replace'
      submitImportTemplate('replace', startDateKey);
    }
  };

  const submitImportTemplate = async (
    mode: 'replace' | 'merge' | 'skip' = importMode,
    startDateKey: string,
  ) => {
    console.log('Submitting import template with mode:', mode);
    console.log('template and date:', selectedImportTemplate, startDateKey);
    // Logic to import the selected template using selectedImportTemplate, mode, and templateImportStartDate
    if (!startDateKey || !selectedImportTemplate) return;

    console.log(
      'Importing template:',
      selectedImportTemplate._id,
      'with mode:',
      mode,
      'starting from date:',
      startDateKey,
    );

    try {
      await importMealPlanFromTemplate({
        templateId: selectedImportTemplate._id,
        startDate: startDateKey,
        mode,
      }).unwrap();
      // Close modals after successful import
      setImportModeModalOpen(false);
      setSelectedImportTemplate(null);
      setTemplateImportStartDate(new Date());
    } catch (error) {
      console.error('Failed to import meal plan from template:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl xl2:max-w-7xl mx-auto px-6 py-8 mb-[3rem] md:mb-[4rem] lg:mb-0">
        {/* Page title and description */}
        <div className="mb-6 sm:mb-8 mt-5 sm:mt-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <CalendarDays className="w-8 h-8 text-primaryColor" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.meal_planner.title}</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">{t.meal_planner.plan_meals}</p>
        </div>

        {/* Calendar component for date selection and navigation */}
        <Calendar
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          visibleDates={visibleDates}
          weekDates={weekDates}
        />

        <Button
          variant={'default'}
          className="my-4 mt-auto"
          onClick={() => setBrowseMealModal(true)}
        >
          {t.meal_planner.browse_templates}
        </Button>

        {/* Main content area with responsive grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left column - Daily meals or weekly view */}
          <div className="lg:col-span-8">
            {viewMode === 'day' ? (
              <DailyMeals
                meals={selectedMeal}
                selectedDate={selectedDate}
                setShowCustomMealModal={setShowCustomMealModal}
                setSelectedMealType={setSelectedMealType}
                setShowAddMealItemModal={setShowAddMealItemModal}
                removeItemFromMealPlan={handleRemoveItemtoMealPlan}
              />
            ) : (
              <WeeklyMeals
                formattedMealPlans={formattedMealPlans}
                visibleDates={visibleDates}
                setSelectedDate={setSelectedDate}
                setShowCustomMealModal={setShowCustomMealModal}
                setShowAddMealItemModal={setShowAddMealItemModal}
                setSelectedMealType={setSelectedMealType}
                removeItemFromMealPlan={handleRemoveItemtoMealPlan}
                language={language}
              />
            )}
          </div>

          {/* Right column - Nutrition goals and progress */}
          <NutritionGoals
            selectedDayNutrition={selectedDayNutrition}
            weeklySummary={weeklySummary}
          />
        </div>
      </div>

      {/* Modal components for adding meals */}
      <AddMealItemModal
        showAddMealItemModal={showAddMealItemMOdal}
        setShowAddMealItemModal={setShowAddMealItemModal}
        addItemtoMealPlan={handleAddItemClick}
      />

      {/* modal for adjusting serving size */}
      <ServingModal
        showServingSizeModal={showServingSizeModal}
        setShowServingSizeModal={setShowServingSizeModal}
        mealItem={selectedMealItem}
        onAdd={handleAddItemtoMealPlan}
      />

      {/* Modal for adding custom meal type */}
      <CustomMealModal
        showCustomMealModal={showCustomMealModal}
        setShowCustomMealModal={setShowCustomMealModal}
        selectedDate={selectedDate}
      />

      <BrowseMealModal
        isOpen={browseMealModal}
        onOpenChange={setBrowseMealModal}
        onSelectTemplate={handleSelectedTemplate}
      />

      <StartDaySelectionModal
        isOpen={startDaySelectionModalOpen}
        selectedDate={templateImportStartDate}
        onOpenChange={setStartDaySelectionModalOpen}
        onSelectedDateChange={handleStartDaySelection}
      />

      {/* Import Mode Selection Modal */}
      <ImportModeModal
        isOpen={importModeModalOpen}
        onOpenChange={setImportModeModalOpen}
        importMode={handleImportModeSelection}
      />
    </div>
  );
};

export { MealPlanner };
