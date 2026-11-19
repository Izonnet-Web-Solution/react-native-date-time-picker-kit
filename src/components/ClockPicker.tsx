import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocale } from '../localization';
import type { PartialLocaleData } from '../localization/types';
import { useTheme } from '../theme';
import type { ThemeConfig, ThemeMode } from '../theme/types';
import type { MinuteInterval } from '../types';

export interface ClockPickerProps {
  value?: Date | { hour: number; minute: number };
  onChange?: (result: { hour: number; minute: number; date: Date }) => void;
  is24Hour?: boolean;
  minuteInterval?: MinuteInterval;
  locale?: string | PartialLocaleData;
  theme?: ThemeMode | ThemeConfig;
  testID?: string;
}

export const ClockPicker: React.FC<ClockPickerProps> = ({
  value,
  onChange,
  is24Hour = false,
  minuteInterval = 1,
  locale: propLocale,
  theme: propTheme,
  testID,
}) => {
  const theme = useTheme(propTheme);
  const locale = useLocale(propLocale);

  const initialHour =
    value instanceof Date
      ? value.getHours()
      : value?.hour !== undefined
        ? value.hour
        : new Date().getHours();
  const initialMinute =
    value instanceof Date
      ? value.getMinutes()
      : value?.minute !== undefined
        ? value.minute
        : new Date().getMinutes();

  const [hour, setHour] = useState<number>(initialHour);
  const [minute, setMinute] = useState<number>(initialMinute);
  const [activeSegment, setActiveSegment] = useState<'hour' | 'minute'>('hour');

  const isPM = hour >= 12;
  const display12Hour = hour % 12 === 0 ? 12 : hour % 12;

  const emitChange = useCallback(
    (newHour: number, newMinute: number) => {
      const now = new Date();
      const d = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        newHour,
        newMinute,
        0,
        0
      );
      onChange?.({ hour: newHour, minute: newMinute, date: d });
    },
    [onChange]
  );

  const toggleAmPm = useCallback(
    (pm: boolean) => {
      let nextHour = hour;
      if (pm && hour < 12) {
        nextHour = hour + 12;
      } else if (!pm && hour >= 12) {
        nextHour = hour - 12;
      }
      setHour(nextHour);
      emitChange(nextHour, minute);
    },
    [hour, minute, emitChange]
  );

  const handleSelectHour = useCallback(
    (selectedH: number) => {
      let finalH = selectedH;
      if (!is24Hour) {
        if (isPM && selectedH < 12) {
          finalH = selectedH + 12;
        } else if (!isPM && selectedH === 12) {
          finalH = 0;
        }
      }
      setHour(finalH);
      emitChange(finalH, minute);
      setActiveSegment('minute');
    },
    [is24Hour, isPM, minute, emitChange]
  );

  const handleSelectMinute = useCallback(
    (selectedM: number) => {
      setMinute(selectedM);
      emitChange(hour, selectedM);
    },
    [hour, emitChange]
  );

  // Hours array to display in selection grid
  const hoursList = useMemo(() => {
    if (is24Hour) {
      return Array.from({ length: 24 }, (_, i) => i);
    }
    return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  }, [is24Hour]);

  // Minutes array to display in selection grid
  const minutesList = useMemo(() => {
    const list: number[] = [];
    for (let m = 0; m < 60; m += minuteInterval) {
      list.push(m);
    }
    return list;
  }, [minuteInterval]);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <View
      testID={testID}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Time Display Header */}
      <View style={styles.displayRow}>
        <View style={styles.timeBox}>
          {/* Hour Segment */}
          <TouchableOpacity
            onPress={() => setActiveSegment('hour')}
            style={[
              styles.segmentBtn,
              activeSegment === 'hour' && {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color:
                    activeSegment === 'hour'
                      ? theme.colors.primary
                      : theme.colors.text,
                  fontSize: 32,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              {is24Hour ? pad(hour) : pad(display12Hour)}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.colonText,
              { color: theme.colors.textMuted, fontSize: 32 },
            ]}
          >
            :
          </Text>

          {/* Minute Segment */}
          <TouchableOpacity
            onPress={() => setActiveSegment('minute')}
            style={[
              styles.segmentBtn,
              activeSegment === 'minute' && {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color:
                    activeSegment === 'minute'
                      ? theme.colors.primary
                      : theme.colors.text,
                  fontSize: 32,
                  fontWeight: theme.typography.fontWeightBold,
                },
              ]}
            >
              {pad(minute)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AM / PM Toggle (for 12-hour mode) */}
        {!is24Hour && (
          <View
            style={[
              styles.ampmContainer,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.card,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => toggleAmPm(false)}
              style={[
                styles.ampmBtn,
                !isPM && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.ampmText,
                  {
                    color: !isPM
                      ? theme.colors.primaryText
                      : theme.colors.textSecondary,
                    fontWeight: !isPM ? 'bold' : 'normal',
                  },
                ]}
              >
                {locale.am}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleAmPm(true)}
              style={[
                styles.ampmBtn,
                isPM && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.ampmText,
                  {
                    color: isPM
                      ? theme.colors.primaryText
                      : theme.colors.textSecondary,
                    fontWeight: isPM ? 'bold' : 'normal',
                  },
                ]}
              >
                {locale.pm}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Grid of Choices */}
      <View style={styles.gridContainer}>
        {activeSegment === 'hour' ? (
          <View style={styles.choicesGrid}>
            {hoursList.map((h) => {
              const isSelected = is24Hour ? hour === h : display12Hour === h;
              return (
                <TouchableOpacity
                  key={`h-${h}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${pad(h)} hours`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleSelectHour(h)}
                  style={[
                    styles.choiceCell,
                    isSelected && {
                      backgroundColor: theme.colors.selected,
                      borderRadius: theme.borderRadius.full,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      {
                        color: isSelected
                          ? theme.colors.selectedText
                          : theme.colors.text,
                        fontWeight: isSelected ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {pad(h)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.choicesGrid}>
            {minutesList.map((m) => {
              const isSelected = minute === m;
              return (
                <TouchableOpacity
                  key={`m-${m}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${pad(m)} minutes`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleSelectMinute(m)}
                  style={[
                    styles.choiceCell,
                    isSelected && {
                      backgroundColor: theme.colors.selected,
                      borderRadius: theme.borderRadius.full,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      {
                        color: isSelected
                          ? theme.colors.selectedText
                          : theme.colors.text,
                        fontWeight: isSelected ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {pad(m)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 16,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentText: {},
  colonText: {
    marginHorizontal: 4,
  },
  ampmContainer: {
    flexDirection: 'column',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ampmBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  ampmText: {
    fontSize: 12,
  },
  gridContainer: {
    width: '100%',
    minHeight: 180,
    justifyContent: 'center',
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  choiceCell: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 16,
  },
});
