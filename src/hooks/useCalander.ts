import { useState, useMemo } from 'react';
import { ViewMode } from '../types/mealPlanner.types';
import { formatDateKey, getMonthDates, getWeekDates } from '../pages/MealPlanner/helper';

export const useCalendar = (initialDate = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  const visibleDates = useMemo(() => {
    if (viewMode === 'day') {
      return [selectedDate];
    } else if (viewMode === 'week') {
      return weekDates;
    } else {
      return getMonthDates(currentDate);
    }
  }, [weekDates, selectedDate, viewMode, currentDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (viewMode === 'day') {
      setCurrentDate(date);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // When switching to day view, ensure selected date is in current week
    if (
      mode === 'day' &&
      !weekDates.some((d) => formatDateKey(d) === formatDateKey(selectedDate))
    ) {
      setSelectedDate(currentDate);
    }
    // No specific logic needed for switching to month view yet
  };

  return {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate: handleDateSelect,
    viewMode,
    setViewMode: handleViewModeChange,
    weekDates,
    visibleDates,
  };
};
