import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocale } from '../localization';
import type { PartialLocaleData } from '../localization/types';
import { NativeDateTimePicker } from '../native/NativeDateTimePicker';
import { useTheme } from '../theme';
import type { ThemeConfig, ThemeMode } from '../theme/types';
import type { MinuteInterval } from '../types';
import type { BaseModalProps, PresentationMode } from '../types/presentation';
import { parseDate, timestampToDate } from '../utils/dateConversion';
import { ClockPicker } from './ClockPicker';
import { ModalWrapper } from './common/ModalWrapper';
import { PickerHeader } from './common/PickerHeader';

export interface TimePickerRef {
  open: () => Promise<Date | null> | void;
  close: () => Promise<boolean> | void;
  getValue: () => Date | null;
  setValue: (time: Date | string | number) => void;
  reset: () => void;
}

function parseTimeBoundary(
  t?: string | { hour: number; minute: number }
): { hour: number; minute: number } | null {
  if (!t) return null;
  if (
    typeof t === 'object' &&
    typeof t.hour === 'number' &&
    typeof t.minute === 'number'
  ) {
    return { hour: t.hour, minute: t.minute };
  }
  if (typeof t === 'string') {
    const parts = t.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0] as string, 10);
      const m = parseInt(parts[1] as string, 10);
      if (!isNaN(h) && !isNaN(m)) return { hour: h, minute: m };
    }
  }
  return null;
}

function clampTimeToBoundary(
  date: Date,
  minTime?: string | { hour: number; minute: number },
  maxTime?: string | { hour: number; minute: number }
): Date {
  const result = new Date(date.getTime());
  const min = parseTimeBoundary(minTime);
  const max = parseTimeBoundary(maxTime);
  if (min) {
    if (
      result.getHours() < min.hour ||
      (result.getHours() === min.hour && result.getMinutes() < min.minute)
    ) {
      result.setHours(min.hour, min.minute, 0, 0);
    }
  }
  if (max) {
    if (
      result.getHours() > max.hour ||
      (result.getHours() === max.hour && result.getMinutes() > max.minute)
    ) {
      result.setHours(max.hour, max.minute, 0, 0);
    }
  }
  return result;
}

export interface TimePickerProps extends Omit<BaseModalProps, 'onConfirm'> {
  presentation?: PresentationMode;
  value?: Date | string | number | null;
  defaultValue?: Date | string | number | null;
  onChange?: (date: Date) => void;
  onConfirmTime?: (date: Date) => void;
  /**
   * Alias for `onConfirmTime`.
   */
  onConfirm?: (date: Date) => void;
  is24Hour?: boolean;
  minuteInterval?: MinuteInterval;
  minimumTime?: string | { hour: number; minute: number };
  minTime?: string | { hour: number; minute: number };
  maximumTime?: string | { hour: number; minute: number };
  maxTime?: string | { hour: number; minute: number };
  timeZone?: string;
  utcOffset?: number;
  locale?: string | PartialLocaleData;
  theme?: ThemeMode | ThemeConfig;
  testID?: string;
}

export const TimePicker = forwardRef<TimePickerRef, TimePickerProps>(
  (
    {
      presentation = 'bottom-sheet',
      visible: propVisible,
      onClose,
      title,
      confirmText,
      cancelText,
      onConfirmTime,
      onCancel,
      value: propValue,
      defaultValue,
      onChange,
      is24Hour = false,
      minuteInterval = 1,
      minimumTime,
      maximumTime,
      locale: propLocale,
      theme: propTheme,
      backdropOpacity,
      animationType,
      showHandle,
      closeOnBackdropPress,
      testID,
      ...restProps
    },
    ref
  ) => {
    const effectiveOnConfirm = onConfirmTime ?? restProps.onConfirm;
    const effectiveMinTime = minimumTime ?? restProps.minTime;
    const effectiveMaxTime = maximumTime ?? restProps.maxTime;
    const theme = useTheme(propTheme);
    const locale = useLocale(propLocale);

    const initialDate = clampTimeToBoundary(
      parseDate(propValue) || parseDate(defaultValue) || new Date(),
      effectiveMinTime,
      effectiveMaxTime
    );
    const [selectedTime, setSelectedTime] = useState<Date>(initialDate);
    const [isVisible, setIsVisible] = useState(false);

    const modalVisible =
      restProps.isVisible !== undefined
        ? restProps.isVisible
        : propVisible !== undefined
          ? propVisible
          : isVisible;

    useImperativeHandle(ref, () => ({
      open: async () => {
        if (presentation === 'native') {
          const res = await NativeDateTimePicker.openTimePicker({
            value: selectedTime.getTime(),
            is24Hour,
            minuteInterval,
            title: title || locale.selectTimeTitle,
            confirmText: confirmText || locale.confirmText,
            cancelText: cancelText || locale.cancelText,
          });
          if (res.action === 'confirmed') {
            const confirmedDate = clampTimeToBoundary(
              timestampToDate(res.timestamp),
              effectiveMinTime,
              effectiveMaxTime
            );
            setSelectedTime(confirmedDate);
            onChange?.(confirmedDate);
            effectiveOnConfirm?.(confirmedDate);
            return confirmedDate;
          }
          return null;
        } else {
          setIsVisible(true);
          return null;
        }
      },
      close: async () => {
        if (presentation === 'native') {
          return await NativeDateTimePicker.closePicker();
        } else {
          setIsVisible(false);
          onClose?.();
          return true;
        }
      },
      getValue: () => selectedTime,
      setValue: (newTime: Date | string | number) => {
        const parsed = parseDate(newTime);
        if (parsed) {
          setSelectedTime(
            clampTimeToBoundary(parsed, effectiveMinTime, effectiveMaxTime)
          );
        }
      },
      reset: () => {
        setSelectedTime(initialDate);
      },
    }));

    const handleClockChange = useCallback(
      (res: { date: Date }) => {
        const clamped = clampTimeToBoundary(
          res.date,
          effectiveMinTime,
          effectiveMaxTime
        );
        setSelectedTime(clamped);
        onChange?.(clamped);
      },
      [onChange, effectiveMinTime, effectiveMaxTime]
    );

    const handleConfirm = useCallback(() => {
      const clamped = clampTimeToBoundary(
        selectedTime,
        effectiveMinTime,
        effectiveMaxTime
      );
      effectiveOnConfirm?.(clamped);
      setIsVisible(false);
      onClose?.();
    }, [
      selectedTime,
      effectiveOnConfirm,
      effectiveMinTime,
      effectiveMaxTime,
      onClose,
    ]);

    const handleCancel = useCallback(() => {
      onCancel?.();
      setIsVisible(false);
      onClose?.();
    }, [onCancel, onClose]);

    if (presentation === 'native') {
      return null;
    }

    const content = (
      <View style={styles.innerContent}>
        {presentation !== 'inline' && (
          <PickerHeader
            title={title || locale.selectTimeTitle}
            cancelText={cancelText || locale.cancelText}
            confirmText={confirmText || locale.confirmText}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            theme={theme}
            isRTL={locale.isRTL}
          />
        )}

        <ClockPicker
          value={selectedTime}
          onChange={handleClockChange}
          is24Hour={is24Hour}
          minuteInterval={minuteInterval}
          locale={locale}
          theme={theme}
        />
      </View>
    );

    return (
      <ModalWrapper
        testID={testID}
        presentation={presentation}
        visible={modalVisible}
        onClose={handleCancel}
        theme={theme}
        backdropOpacity={backdropOpacity}
        animationType={animationType}
        showHandle={showHandle}
        closeOnBackdropPress={closeOnBackdropPress}
      >
        {content}
      </ModalWrapper>
    );
  }
);

TimePicker.displayName = 'TimePicker';

const styles = StyleSheet.create({
  innerContent: {
    width: '100%',
  },
});
