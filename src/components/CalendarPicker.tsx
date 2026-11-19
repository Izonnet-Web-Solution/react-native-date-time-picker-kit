import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocale } from '../localization';
import type { LocaleData, PartialLocaleData } from '../localization/types';
import { useTheme } from '../theme';
import type { ResolvedTheme, ThemeConfig, ThemeMode } from '../theme/types';
import { parseDate } from '../utils/dateConversion';
import { isDateDisabled } from '../utils/dateValidation';

export interface MarkedDateConfig {
  marked?: boolean;
  dotColor?: string;
  badge?: string;
  selected?: boolean;
  disabled?: boolean;
}

export type MarkedDatesMap = Record<string, MarkedDateConfig>;

export interface CalendarPickerProps {
  value?: Date | string | number | null;
  /**
   * Alias for `value`.
   */
  selectedDate?: Date | string | number | null;
  defaultValue?: Date | string | number | null;
  onChange?: (date: Date) => void;
  /**
   * Alias for `onChange`.
   */
  onDateSelect?: (date: Date) => void;
  minimumDate?: Date | string | number;
  /**
   * Alias for `minimumDate`.
   */
  minDate?: Date | string | number;
  maximumDate?: Date | string | number;
  /**
   * Alias for `maximumDate`.
   */
  maxDate?: Date | string | number;
  disabledDates?: (Date | string)[];
  disabledWeekdays?: number[];
  markedDates?: MarkedDatesMap;
  firstDayOfWeek?: number; // 0 = Sunday, 1 = Monday, 6 = Saturday
  locale?: string | PartialLocaleData;
  theme?: ThemeMode | ThemeConfig;
  // Range selection mode support
  rangeMode?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  onRangeChange?: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  onMonthChange?: (year: number, month: number) => void;
  testID?: string;
}

interface CalendarDay {
  day: number;
  date: Date;
  dateString: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  isDisabled: boolean;
  markedConfig?: MarkedDateConfig;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  value,
  defaultValue,
  onChange,
  minimumDate,
  maximumDate,
  disabledDates,
  disabledWeekdays,
  markedDates,
  firstDayOfWeek: propFirstDayOfWeek,
  locale: propLocale,
  theme: propTheme,
  rangeMode = false,
  startDate: propStartDate,
  endDate: propEndDate,
  onRangeChange,
  onMonthChange,
  testID,
  ...restProps
}) => {
  const effectiveMin = minimumDate ?? restProps.minDate;
  const effectiveMax = maximumDate ?? restProps.maxDate;
  const effectiveVal = value ?? restProps.selectedDate;
  const effectiveOnChange = onChange ?? restProps.onDateSelect;

  const resolvedTheme: ResolvedTheme = useTheme(propTheme);
  const localeData: LocaleData = useLocale(propLocale);

  const firstDay =
    propFirstDayOfWeek !== undefined
      ? propFirstDayOfWeek
      : localeData.firstDayOfWeek;

  // Selected date state (single mode)
  const initialDate =
    parseDate(effectiveVal) || parseDate(defaultValue) || new Date();
  const selectedDate =
    effectiveVal !== undefined ? parseDate(effectiveVal) : initialDate;

  // Range dates state (range mode)
  const [rangeStart, setRangeStart] = useState<Date | null>(
    propStartDate ? parseDate(propStartDate) : null
  );
  const [rangeEnd, setRangeEnd] = useState<Date | null>(
    propEndDate ? parseDate(propEndDate) : null
  );

  const activeStartDate =
    propStartDate !== undefined ? parseDate(propStartDate) : rangeStart;
  const activeEndDate =
    propEndDate !== undefined ? parseDate(propEndDate) : rangeEnd;

  // Visible view month & year
  const [viewDate, setViewDate] = useState<Date>(() => {
    return selectedDate || activeStartDate || new Date();
  });

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth(); // 0-11

  const minDateObj = useMemo(
    () => (effectiveMin ? parseDate(effectiveMin) : null),
    [effectiveMin]
  );
  const maxDateObj = useMemo(
    () => (effectiveMax ? parseDate(effectiveMax) : null),
    [effectiveMax]
  );

  // Month navigation
  const goToPrevMonth = useCallback(() => {
    setViewDate((prev) => {
      const prevM = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      onMonthChange?.(prevM.getFullYear(), prevM.getMonth());
      return prevM;
    });
  }, [onMonthChange]);

  const goToNextMonth = useCallback(() => {
    setViewDate((prev) => {
      const nextM = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      onMonthChange?.(nextM.getFullYear(), nextM.getMonth());
      return nextM;
    });
  }, [onMonthChange]);

  // Weekday headers sorted according to firstDayOfWeek
  const weekdayNames = useMemo(() => {
    const list = [...localeData.weekdaysMin];
    if (firstDay === 0) {
      return list;
    }
    const rotated = [...list.slice(firstDay), ...list.slice(0, firstDay)];
    return rotated;
  }, [localeData.weekdaysMin, firstDay]);

  // Generate calendar grid (6 rows of 7 days = 42 slots)
  const daysGrid: CalendarDay[] = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
    let leadOffset = firstDayOfMonth - firstDay;
    if (leadOffset < 0) {
      leadOffset += 7;
    }

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const grid: CalendarDay[] = [];

    // Leading days from previous month
    for (let i = leadOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(viewYear, viewMonth - 1, dayNum);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      grid.push({
        day: dayNum,
        date: d,
        dateString: str,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: false,
        isRangeStart: false,
        isRangeEnd: false,
        isInRange: false,
        isDisabled: true,
      });
    }

    // Precompute boundaries outside day loop for optimal performance
    const minDayStart = minDateObj
      ? new Date(
          minDateObj.getFullYear(),
          minDateObj.getMonth(),
          minDateObj.getDate()
        ).getTime()
      : null;
    const maxDayEnd = maxDateObj
      ? new Date(
          maxDateObj.getFullYear(),
          maxDateObj.getMonth(),
          maxDateObj.getDate(),
          23,
          59,
          59,
          999
        ).getTime()
      : null;

    // Days in current month
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const d = new Date(viewYear, viewMonth, dayNum);
      const str = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const isToday = str === todayStr;

      // Check min/max restriction
      let disabled = false;
      if (minDayStart !== null && d.getTime() < minDayStart) {
        disabled = true;
      }
      if (maxDayEnd !== null && d.getTime() > maxDayEnd) {
        disabled = true;
      }
      if (isDateDisabled(d, disabledDates, disabledWeekdays)) {
        disabled = true;
      }

      // Selection logic
      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInRange = false;

      if (rangeMode) {
        if (
          activeStartDate &&
          d.toDateString() === activeStartDate.toDateString()
        ) {
          isRangeStart = true;
          isSelected = true;
        }
        if (
          activeEndDate &&
          d.toDateString() === activeEndDate.toDateString()
        ) {
          isRangeEnd = true;
          isSelected = true;
        }
        if (
          activeStartDate &&
          activeEndDate &&
          d > activeStartDate &&
          d < activeEndDate
        ) {
          isInRange = true;
        }
      } else if (
        selectedDate &&
        d.toDateString() === selectedDate.toDateString()
      ) {
        isSelected = true;
      }

      const mark = markedDates?.[str];
      if (mark?.disabled) {
        disabled = true;
      }

      grid.push({
        day: dayNum,
        date: d,
        dateString: str,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isRangeStart,
        isRangeEnd,
        isInRange,
        isDisabled: disabled,
        markedConfig: mark,
      });
    }

    // Trailing days from next month to complete rows (up to 35 or 42)
    const totalSlots = grid.length > 35 ? 42 : 35;
    const remaining = totalSlots - grid.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const d = new Date(viewYear, viewMonth + 1, dayNum);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      grid.push({
        day: dayNum,
        date: d,
        dateString: str,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: false,
        isRangeStart: false,
        isRangeEnd: false,
        isInRange: false,
        isDisabled: true,
      });
    }

    return grid;
  }, [
    viewYear,
    viewMonth,
    firstDay,
    selectedDate,
    rangeMode,
    activeStartDate,
    activeEndDate,
    minDateObj,
    maxDateObj,
    disabledDates,
    disabledWeekdays,
    markedDates,
  ]);

  // Handle day click
  const handleDayPress = useCallback(
    (item: CalendarDay) => {
      if (item.isDisabled || !item.isCurrentMonth) {
        return;
      }

      if (rangeMode) {
        if (!activeStartDate || (activeStartDate && activeEndDate)) {
          // Starting a new range
          setRangeStart(item.date);
          setRangeEnd(null);
          onRangeChange?.({ startDate: item.date, endDate: null });
        } else if (activeStartDate && !activeEndDate) {
          // Selecting the second date of range
          if (item.date < activeStartDate) {
            // Clicked date is earlier, make it start
            setRangeStart(item.date);
            setRangeEnd(activeStartDate);
            onRangeChange?.({ startDate: item.date, endDate: activeStartDate });
          } else {
            setRangeEnd(item.date);
            onRangeChange?.({ startDate: activeStartDate, endDate: item.date });
          }
        }
      } else {
        effectiveOnChange?.(item.date);
      }
    },
    [
      rangeMode,
      activeStartDate,
      activeEndDate,
      onRangeChange,
      effectiveOnChange,
    ]
  );

  const monthLabel = `${localeData.months[viewMonth]} ${viewYear}`;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        { backgroundColor: resolvedTheme.colors.background },
      ]}
    >
      {/* Month Navigation Header */}
      <View
        style={[
          styles.headerRow,
          { flexDirection: localeData.isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Previous Month"
          onPress={goToPrevMonth}
          style={styles.navButton}
        >
          <Text
            style={[styles.navArrow, { color: resolvedTheme.colors.primary }]}
          >
            {localeData.isRTL ? '›' : '‹'}
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.monthTitle,
            {
              color: resolvedTheme.colors.text,
              fontSize: resolvedTheme.typography.fontSizeLarge,
              fontWeight: resolvedTheme.typography.fontWeightBold,
            },
          ]}
        >
          {monthLabel}
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Next Month"
          onPress={goToNextMonth}
          style={styles.navButton}
        >
          <Text
            style={[styles.navArrow, { color: resolvedTheme.colors.primary }]}
          >
            {localeData.isRTL ? '‹' : '›'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekday Row */}
      <View
        style={[
          styles.weekdaysRow,
          { flexDirection: localeData.isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {weekdayNames.map((wk, idx) => (
          <View key={`wk-${idx}`} style={styles.weekdayCell}>
            <Text
              style={[
                styles.weekdayText,
                {
                  color: resolvedTheme.colors.textMuted,
                  fontSize: resolvedTheme.typography.fontSizeSmall,
                  fontWeight: resolvedTheme.typography.fontWeightMedium,
                },
              ]}
            >
              {wk}
            </Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View
        style={[
          styles.daysGrid,
          { flexDirection: localeData.isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {daysGrid.map((item, index) => {
          const isSelected = item.isSelected;
          const isInRange = item.isInRange;
          const isToday = item.isToday;
          const isDisabled = item.isDisabled;
          const notCurrent = !item.isCurrentMonth;

          let dayBg = 'transparent';
          let textColor = resolvedTheme.colors.text;

          if (notCurrent) {
            textColor = resolvedTheme.colors.disabledText;
          } else if (isDisabled) {
            textColor = resolvedTheme.colors.disabledText;
          } else if (isSelected) {
            dayBg = resolvedTheme.colors.selected;
            textColor = resolvedTheme.colors.selectedText;
          } else if (isInRange) {
            dayBg = resolvedTheme.colors.rangeHighlight;
            textColor = resolvedTheme.colors.rangeHighlightText;
          } else if (isToday) {
            textColor = resolvedTheme.colors.primary;
          }

          return (
            <TouchableOpacity
              key={`${item.dateString}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`${item.day} ${localeData.months[viewMonth]} ${viewYear}`}
              accessibilityState={{
                selected: isSelected,
                disabled: isDisabled || notCurrent,
              }}
              disabled={isDisabled || notCurrent}
              onPress={() => handleDayPress(item)}
              style={[
                styles.dayCell,
                isInRange && {
                  backgroundColor: resolvedTheme.colors.rangeHighlight,
                  borderRadius: 0,
                },
              ]}
            >
              <View
                style={[
                  styles.dayBadge,
                  isSelected && {
                    backgroundColor: dayBg,
                    borderRadius: resolvedTheme.borderRadius.full,
                  },
                  isToday &&
                    !isSelected && {
                      borderWidth: 1,
                      borderColor: resolvedTheme.colors.primary,
                      borderRadius: resolvedTheme.borderRadius.full,
                    },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: textColor,
                      fontSize: resolvedTheme.typography.fontSizeMedium,
                      fontWeight:
                        isSelected || isToday
                          ? resolvedTheme.typography.fontWeightBold
                          : resolvedTheme.typography.fontWeightRegular,
                    },
                  ]}
                >
                  {item.day}
                </Text>

                {/* Dot Marker */}
                {item.markedConfig?.marked && (
                  <View
                    style={[
                      styles.dotMarker,
                      {
                        backgroundColor:
                          item.markedConfig.dotColor ||
                          (isSelected
                            ? resolvedTheme.colors.selectedText
                            : resolvedTheme.colors.primary),
                      },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  monthTitle: {
    textAlign: 'center',
  },
  navButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrow: {
    fontSize: 26,
    lineHeight: 28,
  },
  weekdaysRow: {
    justifyContent: 'space-around',
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    textAlign: 'center',
  },
  daysGrid: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadge: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    textAlign: 'center',
  },
  dotMarker: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 3,
  },
});
