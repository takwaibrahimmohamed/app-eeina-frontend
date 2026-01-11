import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDayNames, getMonthNames } from './data';
import { formatDateKey } from './helper';
import { ViewMode } from '../../types/mealPlanner.types';

interface CalendarProps {
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  visibleDates: Date[];
  weekDates: Date[];
}

export const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  onCurrentDateChange,
  selectedDate,
  onSelectedDateChange,
  viewMode,
  onViewModeChange,
  visibleDates,
  weekDates,
}) => {
  const { t, language } = useLanguage();
  const dayNames = getDayNames(language);
  const monthNames = getMonthNames(language);
  const [isExpanded, setIsExpanded] = useState(true);

  // For month view, we want to show the days of the month in a grid
  // visibleDates already contains all days of the month if viewMode is 'month'
  // But we might want padding days for empty grid cells (start of month).
  // For now, let's just render the visibleDates which are the full month.

  // To render a proper calendar grid, we need to know the day of the week the month starts on.
  const displayDates = viewMode === 'month' ? visibleDates : weekDates;

  // If month view, calculate padding for start of month
  const startPending = viewMode === 'month' ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() : 0;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
      {/* Calendar Header with Navigation and View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Month/Year Display with Navigation Arrows */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(currentDate);
              if (viewMode === 'day') {
                newDate.setDate(currentDate.getDate() - 1);
              } else if (viewMode === 'week') {
                newDate.setDate(currentDate.getDate() - 7);
              } else {
                newDate.setMonth(currentDate.getMonth() - 1);
              }
              onCurrentDateChange(newDate);
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 select-none">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(currentDate);
              if (viewMode === 'day') {
                newDate.setDate(currentDate.getDate() + 1);
              } else if (viewMode === 'week') {
                newDate.setDate(currentDate.getDate() + 7);
              } else {
                newDate.setMonth(currentDate.getMonth() + 1);
              }
              onCurrentDateChange(newDate);
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* View Mode Toggle (Week/Day/Month) */}
        <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('month')}
            className={viewMode === 'month' ? 'bg-primaryColor shadow-sm' : 'hover:bg-white/50'}
          >
            {t.meal_planner.view_month || 'Month'}
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('week')}
            className={viewMode === 'week' ? 'bg-primaryColor shadow-sm' : 'hover:bg-white/50'}
          >
            {t.meal_planner.view_week}
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('day')}
            className={viewMode === 'day' ? 'bg-primaryColor shadow-sm' : 'hover:bg-white/50'}
          >
            {t.meal_planner.view_day}
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {isExpanded && (
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {/* Day headers */}
          {dayNames.map((day, i) => (
            <div key={i} className="text-center text-[.6rem] sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              {day.substring(0, 3)}
            </div>
          ))}

          {/* Month view padding */}
          {viewMode === 'month' && Array.from({ length: startPending }).map((_, i) => (
            <div key={`padding-${i}`} className="hidden sm:block"></div>
          ))}

          {displayDates.map((date: Date, index: number) => {
            const isSelected = formatDateKey(date) === formatDateKey(selectedDate);
            const isToday = formatDateKey(date) === formatDateKey(new Date());

            return (
              <div
                key={index}
                className={`flex items-center justify-center p-2 sm:p-4 rounded-lg cursor-pointer transition-all aspect-square sm:aspect-auto ${isSelected
                  ? 'bg-primaryColor text-white'
                  : isToday
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                onClick={() => onSelectedDateChange(date)}
              >
                <div className="text-center">
                  {viewMode !== 'month' && (
                    <div className="text-[.5rem] sm:text-sm font-medium mb-1">
                      {dayNames[date.getDay()]}
                    </div>
                  )}
                  <div className="text-xs sm:text-2xl font-bold mb-1 sm:mb-2">{date.getDate()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
