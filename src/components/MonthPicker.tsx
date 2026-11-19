import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocale } from '../localization';
import type { PartialLocaleData } from '../localization/types';
import { useTheme } from '../theme';
import type { ThemeConfig, ThemeMode } from '../theme/types';

export interface MonthPickerProps {
  value?: Date | { year: number; month: number };
  onChange?: (result: { year: number; month: number; date: Date }) => void;
  minYear?: number;
  maxYear?: number;
  locale?: string | PartialLocaleData;
  theme?: ThemeMode | ThemeConfig;
  testID?: string;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
  value,
  onChange,
  minYear = 1900,
  maxYear = 2100,
  locale: propLocale,
  theme: propTheme,
  testID,
}) => {
  const theme = useTheme(propTheme);
  const locale = useLocale(propLocale);

  const initialYear =
    value instanceof Date
      ? value.getFullYear()
      : value?.year || new Date().getFullYear();
  const initialMonth =
    value instanceof Date
      ? value.getMonth()
      : value?.month !== undefined
        ? value.month
        : new Date().getMonth();

  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);

  const prevYear = useCallback(() => {
    if (currentYear > minYear) {
      setCurrentYear((y) => y - 1);
    }
  }, [currentYear, minYear]);

  const nextYear = useCallback(() => {
    if (currentYear < maxYear) {
      setCurrentYear((y) => y + 1);
    }
  }, [currentYear, maxYear]);

  const selectMonth = useCallback(
    (monthIndex: number) => {
      setSelectedMonth(monthIndex);
      const date = new Date(currentYear, monthIndex, 1);
      onChange?.({ year: currentYear, month: monthIndex, date });
    },
    [currentYear, onChange]
  );

  return (
    <View
      testID={testID}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Year Selector Header */}
      <View
        style={[
          styles.headerRow,
          { flexDirection: locale.isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Previous Year"
          onPress={prevYear}
          disabled={currentYear <= minYear}
          style={styles.navButton}
        >
          <Text
            style={[
              styles.navArrow,
              {
                color:
                  currentYear <= minYear
                    ? theme.colors.disabledText
                    : theme.colors.primary,
              },
            ]}
          >
            {locale.isRTL ? '›' : '‹'}
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.yearTitle,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSizeLarge,
              fontWeight: theme.typography.fontWeightBold,
            },
          ]}
        >
          {currentYear}
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Next Year"
          onPress={nextYear}
          disabled={currentYear >= maxYear}
          style={styles.navButton}
        >
          <Text
            style={[
              styles.navArrow,
              {
                color:
                  currentYear >= maxYear
                    ? theme.colors.disabledText
                    : theme.colors.primary,
              },
            ]}
          >
            {locale.isRTL ? '‹' : '›'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3x4 Month Grid */}
      <View
        style={[
          styles.monthsGrid,
          { flexDirection: locale.isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {locale.monthsShort.map((monthName, idx) => {
          const isSelected = selectedMonth === idx;
          return (
            <TouchableOpacity
              key={`month-${idx}`}
              onPress={() => selectMonth(idx)}
              style={[
                styles.monthCell,
                isSelected && {
                  backgroundColor: theme.colors.selected,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.monthText,
                  {
                    color: isSelected
                      ? theme.colors.selectedText
                      : theme.colors.text,
                    fontSize: theme.typography.fontSizeMedium,
                    fontWeight: isSelected
                      ? theme.typography.fontWeightBold
                      : theme.typography.fontWeightRegular,
                  },
                ]}
              >
                {monthName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  yearTitle: {
    textAlign: 'center',
  },
  navButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrow: {
    fontSize: 24,
    lineHeight: 26,
  },
  monthsGrid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  monthCell: {
    width: '31%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    textAlign: 'center',
  },
});
