import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocale } from '../localization';
import type { PartialLocaleData } from '../localization/types';
import { type DatePreset, getStandardRangePresets } from '../presets';
import { useTheme } from '../theme';
import type { ThemeConfig, ThemeMode } from '../theme/types';
import type { BaseModalProps, PresentationMode } from '../types/presentation';
import { CalendarPicker, type MarkedDatesMap } from './CalendarPicker';
import { ModalWrapper } from './common/ModalWrapper';
import { PickerHeader } from './common/PickerHeader';
import { PresetsBar } from './common/PresetsBar';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface DateRangePickerRef {
  open: () => void;
  close: () => void;
  getValue: () => DateRange;
  setValue: (range: DateRange) => void;
  reset: () => void;
}

export interface DateRangePickerProps extends Omit<
  BaseModalProps,
  'onConfirm'
> {
  presentation?: PresentationMode;
  startDate?: Date | null;
  endDate?: Date | null;
  defaultStartDate?: Date | null;
  defaultEndDate?: Date | null;
  onChange?: (range: DateRange) => void;
  onConfirmRange?: (range: { startDate: Date; endDate: Date }) => void;
  /**
   * Alias for `onConfirmRange`.
   */
  onConfirm?: (range: { startDate: Date; endDate: Date }) => void;
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

export const DateRangePicker = forwardRef<
  DateRangePickerRef,
  DateRangePickerProps
>(
  (
    {
      presentation = 'bottom-sheet',
      visible: propVisible,
      onClose,
      title,
      confirmText,
      cancelText,
      onConfirmRange,
      onCancel,
      startDate: propStartDate,
      endDate: propEndDate,
      defaultStartDate,
      defaultEndDate,
      onChange,
      minimumDate,
      maximumDate,
      disabledDates,
      disabledWeekdays,
      markedDates,
      firstDayOfWeek,
      showPresets = true,
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
    const effectiveOnConfirm = onConfirmRange ?? restProps.onConfirm;

    const theme = useTheme(propTheme);
    const locale = useLocale(propLocale);

    const [isVisible, setIsVisible] = useState(false);
    const [range, setRange] = useState<DateRange>({
      startDate: propStartDate || defaultStartDate || null,
      endDate: propEndDate || defaultEndDate || null,
    });
    const [activePresetId, setActivePresetId] = useState<string | undefined>();

    const modalVisible =
      restProps.isVisible !== undefined
        ? restProps.isVisible
        : propVisible !== undefined
          ? propVisible
          : isVisible;

    useImperativeHandle(ref, () => ({
      open: () => setIsVisible(true),
      close: () => {
        setIsVisible(false);
        onClose?.();
      },
      getValue: () => range,
      setValue: (newRange: DateRange) => setRange(newRange),
      reset: () => {
        setRange({ startDate: null, endDate: null });
        setActivePresetId(undefined);
      },
    }));

    const presets = useMemo(() => {
      if (!showPresets) return [];
      return customPresets || getStandardRangePresets();
    }, [showPresets, customPresets]);

    const handleSelectPreset = useCallback(
      (preset: DatePreset) => {
        setActivePresetId(preset.id);
        const val = preset.getValue();
        if (Array.isArray(val) && val.length === 2) {
          const newRange = { startDate: val[0], endDate: val[1] };
          setRange(newRange);
          onChange?.(newRange);
        }
      },
      [onChange]
    );

    const handleRangeChange = useCallback(
      (newRange: { startDate: Date | null; endDate: Date | null }) => {
        setActivePresetId(undefined);
        setRange(newRange);
        onChange?.(newRange);
      },
      [onChange]
    );

    const handleConfirm = useCallback(() => {
      if (range.startDate && range.endDate) {
        effectiveOnConfirm?.({
          startDate: range.startDate,
          endDate: range.endDate,
        });
      }
      setIsVisible(false);
      onClose?.();
    }, [range, effectiveOnConfirm, onClose]);

    const handleCancel = useCallback(() => {
      onCancel?.();
      setIsVisible(false);
      onClose?.();
    }, [onCancel, onClose]);

    const content = (
      <View style={styles.innerContent}>
        {presentation !== 'inline' && (
          <PickerHeader
            title={title || locale.selectRangeTitle}
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
          rangeMode
          startDate={range.startDate}
          endDate={range.endDate}
          onRangeChange={handleRangeChange}
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

DateRangePicker.displayName = 'DateRangePicker';

const styles = StyleSheet.create({
  innerContent: {
    width: '100%',
  },
});
