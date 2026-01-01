import { useState } from 'react';
import { Calendar } from '@/pages/MealPlanner/Calender';
import { useCalendar } from '@/hooks/useCalander';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    useGetMealPlansQuery,
    useGetUserMealsQuery,
    useUpdateMealPlanMutation,
} from '@/redux/Features/MealPlan/mealPlanApi';
import {
    findOriginalMealPlanByDate,
    formatDateKey,
    formatMealPlans,
    formatPayloadForMealPlan,
    getMealForDate,
} from '@/pages/MealPlanner/helper';
import { DailyMeals } from '@/pages/MealPlanner/DailyMeals';
import { WeeklyMeals } from '@/pages/MealPlanner/WeeklyMeals';
import Loader from '@/components/ui/Loader';
import {
    AddMealItemModal,
    CustomMealModal,
    ServingModal,
} from '@/pages/MealPlanner/Modal';
import { useAppDispatch, useAppSelector } from '@/hooks/hook';
import { openPremiumModal } from '@/redux/Features/Global/globalSlice';

const ProfileMealHistory = () => {
    const { t, language } = useLanguage();
    const dispatch = useAppDispatch();
    const premiumUser = useAppSelector((state) => state.auth.user?.accountType === 'premium');

    // Calendar state
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

    // Modal state
    const [showCustomMealModal, setShowCustomMealModal] = useState(false);
    const [showAddMealItemModal, setShowAddMealItemModal] = useState(false);
    const [showServingSizeModal, setShowServingSizeModal] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState('');
    const [selectedMealItem, setSelectedMealItem] = useState<any | null>(null);


    // Data Fetching
    const mealPlanQuery = {
        startDate: formatDateKey(visibleDates[0]),
        endDate: formatDateKey(visibleDates[visibleDates.length - 1]),
    };

    const { data: mealPlan, isLoading: isLoadingMealPlan } = useGetMealPlansQuery(mealPlanQuery);
    const { data: mealType, isLoading: isLoadingMealType } = useGetUserMealsQuery(mealPlanQuery);
    const [updateMealPlan] = useUpdateMealPlanMutation();

    if (isLoadingMealPlan || isLoadingMealType) {
        return <Loader />;
    }

    // Formatting
    const formattedMealPlans = formatMealPlans(
        mealPlan?.data,
        mealType?.data,
        visibleDates,
        language,
    );
    const selectedMeal = getMealForDate(formattedMealPlans, selectedDate);


    // Handlers (Replicated from MealPlanner.tsx)
    const handleAddItemtoMealPlan = async (
        mealItem: any,
        serving: { quantity: number; unit: string },
    ) => {
        const originalMealPlan = findOriginalMealPlanByDate(mealPlan.data, formatDateKey(selectedDate));
        const payload = originalMealPlan
            ? formatPayloadForMealPlan(originalMealPlan)
            : {
                date: formatDateKey(selectedDate),
                mealPlan: [],
            };
        payload.mealPlan.push({
            mealType: selectedMealType,
            [mealItem.itemType]: mealItem.id,
            serving,
        });

        if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
            payload.date = formatDateKey(new Date(payload.date));
        }

        try {
            await updateMealPlan(payload).unwrap();
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

    const handleRemoveItemtoMealPlan = async (itemId: string) => {
        const originalMealPlan = findOriginalMealPlanByDate(mealPlan.data, formatDateKey(selectedDate));
        if (!originalMealPlan) return;

        const payload = formatPayloadForMealPlan(originalMealPlan);
        const idToRemove = String(itemId);
        const newMealPlan = payload.mealPlan.filter((i: any) => String(i._id) !== idToRemove);
        const newPayload = { ...payload, mealPlan: newMealPlan };

        if (!/^\d{4}-\d{2}-\d{2}$/.test(newPayload.date)) {
            newPayload.date = formatDateKey(new Date(newPayload.date));
        }

        try {
            await updateMealPlan(newPayload).unwrap();
        } catch (error) {
            console.error('Failed to update meal plan:', error);
        }
    };


    return (
        <div className="flex flex-col gap-6">
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

            {/* Modals */}
            <AddMealItemModal
                showAddMealItemModal={showAddMealItemModal}
                setShowAddMealItemModal={setShowAddMealItemModal}
                addItemtoMealPlan={handleAddItemClick}
            />
            <ServingModal
                showServingSizeModal={showServingSizeModal}
                setShowServingSizeModal={setShowServingSizeModal}
                mealItem={selectedMealItem}
                onAdd={handleAddItemtoMealPlan}
            />
            <CustomMealModal
                showCustomMealModal={showCustomMealModal}
                setShowCustomMealModal={setShowCustomMealModal}
                selectedDate={selectedDate}
            />
        </div>
    );
};

export default ProfileMealHistory;
