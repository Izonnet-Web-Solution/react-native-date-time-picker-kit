import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { generateTimeSlots, type TimeSlot } from '../slots';
import { useTheme } from '../theme';
import type { ThemeConfig, ThemeMode } from '../theme/types';

export interface TimeSlotPickerProps {
  slots?: TimeSlot[];
  startTime?: string; // "09:00"
  endTime?: string; // "18:00"
  intervalMinutes?: number;
  disabledSlots?: string[];
  is24Hour?: boolean;
  selectedSlotId?: string;
  onSelectSlot?: (slot: TimeSlot) => void;
  theme?: ThemeMode | ThemeConfig;
  columns?: number;
  testID?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots: propSlots,
  startTime,
  endTime,
  intervalMinutes,
  disabledSlots,
  is24Hour,
  selectedSlotId: propSelectedId,
  onSelectSlot,
  theme: propTheme,
  columns = 3,
  testID,
}) => {
  const theme = useTheme(propTheme);

  // If user provided slots, use them; otherwise auto-generate
  const availableSlots = useMemo(() => {
    if (propSlots && propSlots.length > 0) {
      return propSlots;
    }
    return generateTimeSlots({
      startTime,
      endTime,
      intervalMinutes,
      disabledSlots,
      is24Hour,
    });
  }, [propSlots, startTime, endTime, intervalMinutes, disabledSlots, is24Hour]);

  const [selectedId, setSelectedId] = useState<string | undefined>(
    propSelectedId || availableSlots[0]?.id
  );

  const activeId = propSelectedId !== undefined ? propSelectedId : selectedId;

  const handleSlotPress = useCallback(
    (slot: TimeSlot) => {
      if (!slot.available) {
        return;
      }
      setSelectedId(slot.id);
      onSelectSlot?.(slot);
    },
    [onSelectSlot]
  );

  const colWidthPercent = `${Math.floor(100 / columns) - 2}%`;

  return (
    <View
      testID={testID}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.slotsGrid}
      >
        {availableSlots.map((slot) => {
          const isSelected = activeId === slot.id;
          const isDisabled = !slot.available;

          let bg = theme.colors.card;
          let border = theme.colors.border;
          let textColor = theme.colors.text;

          if (isDisabled) {
            bg = theme.colors.disabled;
            textColor = theme.colors.disabledText;
            border = 'transparent';
          } else if (isSelected) {
            bg = theme.colors.selected;
            textColor = theme.colors.selectedText;
            border = theme.colors.selected;
          }

          return (
            <TouchableOpacity
              key={slot.id}
              accessibilityRole="button"
              accessibilityLabel={`${slot.formattedStart} to ${slot.formattedEnd}${isDisabled ? ', unavailable' : ''}`}
              accessibilityState={{
                selected: isSelected,
                disabled: isDisabled,
              }}
              disabled={isDisabled}
              onPress={() => handleSlotPress(slot)}
              style={[
                styles.slotButton,
                {
                  width: colWidthPercent as any,
                  backgroundColor: bg,
                  borderColor: border,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.slotText,
                  {
                    color: textColor,
                    fontSize: theme.typography.fontSizeSmall,
                    fontWeight: isSelected ? 'bold' : 'normal',
                  },
                ]}
              >
                {slot.formattedStart}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    maxHeight: 280,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  slotButton: {
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  slotText: {
    textAlign: 'center',
  },
});
