import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocale } from '../localization';
import type { PartialLocaleData } from '../localization/types';
import { useTheme } from '../theme';
import type { ThemeConfig, ThemeMode } from '../theme/types';

export interface YearPickerProps {
  value?: number | Date;
  onChange?: (year: number) => void;
  minYear?: number;
  maxYear?: number;
  locale?: string | PartialLocaleData;
  theme?: ThemeMode | ThemeConfig;
  testID?: string;
}

const PAGE_SIZE = 12; // 12 years per view (3x4 grid)

export const YearPicker: React.FC<YearPickerProps> = ({
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
      : typeof value === 'number'
        ? value
        : new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  // Base start year for current page (e.g. 2020..2031)
  const [pageStartYear, setPageStartYear] = useState<number>(() => {
    return Math.floor(initialYear / PAGE_SIZE) * PAGE_SIZE;
  });

  const pageYears = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < PAGE_SIZE; i++) {
      const yr = pageStartYear + i;
      if (yr >= minYear && yr <= maxYear) {
        list.push(yr);
      }
    }
    return list;
  }, [pageStartYear, minYear, maxYear]);

  const prevPage = useCallback(() => {
    setPageStartYear((p) => Math.max(minYear, p - PAGE_SIZE));
  }, [minYear]);

  const nextPage = useCallback(() => {
    setPageStartYear((p) => (p + PAGE_SIZE <= maxYear ? p + PAGE_SIZE : p));
  }, [maxYear]);

  const handleSelectYear = useCallback(
    (yr: number) => {
      setSelectedYear(yr);
      onChange?.(yr);
    },
    [onChange]
  );

  const pageRangeLabel = `${pageStartYear} - ${Math.min(
    maxYear,
    pageStartYear + PAGE_SIZE - 1
  )}`;

  return (
    <View
      testID={testID}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Decade Header */}
      <View
        style={[
          styles.headerRow,
          { flexDirection: locale.isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Previous Years"
          onPress={prevPage}
          disabled={pageStartYear <= minYear}
          style={styles.navButton}
        >
          <Text
            style={[
              styles.navArrow,
              {
                color:
                  pageStartYear <= minYear
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
            styles.rangeTitle,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSizeLarge,
              fontWeight: theme.typography.fontWeightBold,
            },
          ]}
        >
          {pageRangeLabel}
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Next Years"
          onPress={nextPage}
          disabled={pageStartYear + PAGE_SIZE > maxYear}
          style={styles.navButton}
        >
          <Text
            style={[
              styles.navArrow,
              {
                color:
                  pageStartYear + PAGE_SIZE > maxYear
                    ? theme.colors.disabledText
                    : theme.colors.primary,
              },
            ]}
          >
            {locale.isRTL ? '‹' : '›'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3x4 Years Grid */}
      <View
        style={[
          styles.yearsGrid,
          { flexDirection: locale.isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {pageYears.map((yr) => {
          const isSelected = selectedYear === yr;
          return (
            <TouchableOpacity
              key={`yr-${yr}`}
              onPress={() => handleSelectYear(yr)}
              style={[
                styles.yearCell,
                isSelected && {
                  backgroundColor: theme.colors.selected,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.yearText,
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
                {yr}
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
  rangeTitle: {
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
  yearsGrid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  yearCell: {
    width: '31%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearText: {
    textAlign: 'center',
  },
});
