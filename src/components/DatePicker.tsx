import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocale } from '../localization';
import type { PartialLocaleData } from '../localization/types';
import { NativeDateTimePicker } from '../native/NativeDateTimePicker';
import { type DatePreset, getStandardSinglePresets } from '../presets';
import { useTheme } from '../theme';
import type { ThemeConfig, ThemeMode } from '../theme/types';
import type { BaseModalProps, PresentationMode } from '../types/presentation';
import {
  clampDate,
  dateToTimestamp,
  parseDate,
  timestampToDate,
} from '../utils/dateConversion';
import { CalendarPicker, type MarkedDatesMap } from './CalendarPicker';
import { ModalWrapper } from './common/ModalWrapper';
import { PickerHeader } from './common/PickerHeader';
import { PresetsBar } from './common/PresetsBar';

export interface DatePickerRef {
  open: () => Promise<Date | null> | void;
  close: () => Promise<boolean> | void;
  getValue: () => Date | null;
  setValue: (date: Date | string | number) => void;
  reset: () => void;
}

export interface DatePickerProps extends Omit<BaseModalProps, 'onConfirm'> {
  presentation?: PresentationMode;
  value?: Date | string | number | null;
  defaultValue?: Date | string | number | null;
  onChange?: (date: Date) => void;
  onConfirmDate?: (date: Date) => void;
  /**
   * Alias for `onConfirmDate`.
   */
  onConfirm?: (date: Date) => void;
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
  firstDayOfWeek?: number;
  showPresets?: boolean;
  customPresets?: DatePreset[];
  locale?: string | PartialLocaleData;
  theme?: ThemeMode | ThemeConfig;
  testID?: string;
}

export const DatePicker = forwardRef<DatePickerRef, DatePickerProps>(
  (
    {
      presentation = 'bottom-sheet',
      visible: propVisible,
      onClose,
      title,
      confirmText,
      cancelText,
      onConfirmDate,
      onCancel,
      value: propValue,
      defaultValue,
      onChange,
      minimumDate,
      maximumDate,
      disabledDates,
      disabledWeekdays,
      markedDates,
      firstDayOfWeek,
      showPresets = false,
      customPresets,
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
    const effectiveMin = minimumDate ?? restProps.minDate;
    const effectiveMax = maximumDate ?? restProps.maxDate;
    const effectiveOnConfirm = onConfirmDate ?? restProps.onConfirm;

    const theme = useTheme(propTheme);
    const locale = useLocale(propLocale);

    const initialDate =
      parseDate(propValue) || parseDate(defaultValue) || new Date();
    const clampedInitial =
      clampDate(initialDate, effectiveMin, effectiveMax) ?? initialDate;
    const [selectedDate, setSelectedDate] = useState<Date>(clampedInitial);
    const [isVisible, setIsVisible] = useState(false);
    const [activePresetId, setActivePresetId] = useState<string | undefined>();

    const modalVisible =
      restProps.isVisible !== undefined
        ? restProps.isVisible
        : propVisible !== undefined
          ? propVisible
          : isVisible;

    // Imperative ref implementation
    useImperativeHandle(ref, () => ({
      open: async () => {
        if (presentation === 'native') {
          const res = await NativeDateTimePicker.openDatePicker({
            value: selectedDate.getTime(),
            minimumDate: effectiveMin
              ? (dateToTimestamp(effectiveMin) ?? undefined)
              : undefined,
            maximumDate: effectiveMax
              ? (dateToTimestamp(effectiveMax) ?? undefined)
              : undefined,
            title: title || locale.selectDateTitle,
            confirmText: confirmText || locale.confirmText,
            cancelText: cancelText || locale.cancelText,
          });
          if (res.action === 'confirmed') {
            const confirmedDate = timestampToDate(res.timestamp);
            const clamped =
              clampDate(confirmedDate, effectiveMin, effectiveMax) ??
              confirmedDate;
            setSelectedDate(clamped);
            onChange?.(clamped);
            effectiveOnConfirm?.(clamped);
            return clamped;
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
      getValue: () => selectedDate,
      setValue: (newDate: Date | string | number) => {
        const parsed = parseDate(newDate);
        if (parsed) {
          setSelectedDate(parsed);
        }
      },
      reset: () => {
        setSelectedDate(initialDate);
        setActivePresetId(undefined);
      },
    }));

    const presets = showPresets
      ? customPresets || getStandardSinglePresets()
      : [];

    const handleSelectPreset = useCallback(
      (preset: DatePreset) => {
        setActivePresetId(preset.id);
        const val = preset.getValue();
        if (val instanceof Date) {
          setSelectedDate(val);
          onChange?.(val);
        }
      },
      [onChange]
    );

    const handleDayChange = useCallback(
      (date: Date) => {
        setActivePresetId(undefined);
        setSelectedDate(date);
        onChange?.(date);
      },
      [onChange]
    );

    const handleConfirm = useCallback(() => {
      const clamped =
        clampDate(selectedDate, effectiveMin, effectiveMax) ?? selectedDate;
      effectiveOnConfirm?.(clamped);
      setIsVisible(false);
      onClose?.();
    }, [selectedDate, effectiveMin, effectiveMax, effectiveOnConfirm, onClose]);

    const handleCancel = useCallback(() => {
      onCancel?.();
      setIsVisible(false);
      onClose?.();
    }, [onCancel, onClose]);

    // If native presentation, render nothing in React DOM (Native dialog handles UI)
    if (presentation === 'native') {
      return null;
    }

    const content = (
      <View style={styles.innerContent}>
        {presentation !== 'inline' && (
          <PickerHeader
            title={title || locale.selectDateTitle}
            cancelText={cancelText || locale.cancelText}
            confirmText={confirmText || locale.confirmText}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            theme={theme}
            isRTL={locale.isRTL}
          />
        )}

        {showPresets && presets.length > 0 && (
          <PresetsBar
            presets={presets}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
            theme={theme}
            isRTL={locale.isRTL}
          />
        )}

        <CalendarPicker
          value={selectedDate}
          onChange={handleDayChange}
          minimumDate={effectiveMin}
          maximumDate={effectiveMax}
          disabledDates={disabledDates}
          disabledWeekdays={disabledWeekdays}
          markedDates={markedDates}
          firstDayOfWeek={firstDayOfWeek}
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

DatePicker.displayName = 'DatePicker';

const styles = StyleSheet.create({
  innerContent: {
    width: '100%',
  },
});
