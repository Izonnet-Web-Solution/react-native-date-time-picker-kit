import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DateTimePickerError } from '../errors/DateTimePickerError';
import { useLocale } from '../localization';
import { NativeDateTimePicker } from '../native/NativeDateTimePicker';
import { type DatePreset, getStandardSinglePresets } from '../presets';
import { useTheme } from '../theme';
import type { ResolvedTheme, ThemeConfig } from '../theme/types';
import type {
  DateTimePickerProps,
  DateTimePickerRef,
  NativePickerAction,
  NativePickerOptions,
  NativePickerTheme,
  OpenPickerOptions,
} from '../types';
import {
  dateToTimestamp,
  parseDate,
  timestampToDate,
} from '../utils/dateConversion';
import {
  isDateDisabled,
  validateDateRange,
  validateMinuteInterval,
} from '../utils/dateValidation';
import { CalendarPicker } from './CalendarPicker';
import { ClockPicker } from './ClockPicker';
import { ModalWrapper } from './common/ModalWrapper';
import { PickerHeader } from './common/PickerHeader';
import { PresetsBar } from './common/PresetsBar';
import { WheelPicker } from './WheelPicker';

export const DateTimePicker = forwardRef<
  DateTimePickerRef,
  DateTimePickerProps
>((props, ref) => {
  const {
    mode = 'date',
    value: propValue,
    defaultValue,
    display = 'default',
    disabled = false,
    presentation = 'native',
    minimumDate,
    maximumDate,
    minuteInterval,
    disabledDates,
    disabledWeekdays,
    markedDates,
    firstDayOfWeek,
    locale: propLocale,
    timeZoneOffsetInMinutes,
    is24Hour,
    theme: propTheme = 'auto',
    title,
    confirmText,
    cancelText,
    accentColor,
    textColor,
    backgroundColor,
    showPresets = false,
    customPresets,
    onChange,
    onConfirm,
    onCancel,
    onDismiss,
    onOpen,
    onError,
    open: propOpen,
    backdropOpacity,
    animationType,
    showHandle,
    closeOnBackdropPress,
    testID,
  } = props;

  // Track internal date state
  const initialDate = useMemo(
    () => parseDate(propValue) || parseDate(defaultValue) || new Date(),
    [propValue, defaultValue]
  );
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const isOpenRef = useRef<boolean>(false);
  const dateRef = useRef<Date>(currentDate);

  // JS modal presentation state
  const [isJsModalVisible, setIsJsModalVisible] = useState(false);
  const [dateTimeTab, setDateTimeTab] = useState<'date' | 'time'>('date');
  const [activePresetId, setActivePresetId] = useState<string | undefined>();

  // Theme & Locale
  const resolvedTheme: ResolvedTheme = useTheme(
    typeof propTheme === 'object'
      ? propTheme
      : ({ mode: propTheme } as ThemeConfig)
  );
  const localeData = useLocale(propLocale);

  // Keep dateRef synced
  useEffect(() => {
    dateRef.current = currentDate;
  }, [currentDate]);

  // Update if propValue changes
  useEffect(() => {
    if (propValue !== undefined && propValue !== null) {
      const parsed = parseDate(propValue);
      if (parsed) {
        setCurrentDate(parsed);
        dateRef.current = parsed;
      }
    }
  }, [propValue]);

  const buildNativeOptions = useCallback(
    (targetDate: Date): NativePickerOptions => {
      const minTimestamp = minimumDate
        ? dateToTimestamp(minimumDate)
        : undefined;
      const maxTimestamp = maximumDate
        ? dateToTimestamp(maximumDate)
        : undefined;

      const nativeTheme: NativePickerTheme =
        typeof propTheme === 'string' &&
        (propTheme === 'light' || propTheme === 'dark' || propTheme === 'auto')
          ? propTheme
          : 'auto';

      return {
        value: targetDate.getTime(),
        minimumDate: minTimestamp ?? undefined,
        maximumDate: maxTimestamp ?? undefined,
        display,
        locale: typeof propLocale === 'string' ? propLocale : propLocale?.code,
        timeZoneOffsetInMinutes,
        is24Hour,
        minuteInterval,
        title,
        confirmText,
        cancelText,
        theme: nativeTheme,
        accentColor,
        textColor,
        backgroundColor,
      };
    },
    [
      minimumDate,
      maximumDate,
      display,
      propLocale,
      timeZoneOffsetInMinutes,
      is24Hour,
      minuteInterval,
      title,
      confirmText,
      cancelText,
      propTheme,
      accentColor,
      textColor,
      backgroundColor,
    ]
  );

  const openPicker = useCallback(async (): Promise<Date | null> => {
    if (disabled) {
      const err = new DateTimePickerError(
        'UNKNOWN_ERROR',
        'Cannot open picker: component is disabled.'
      );
      onError?.(err);
      return null;
    }

    if (minuteInterval !== undefined) {
      if (!validateMinuteInterval(minuteInterval)) {
        const err = new DateTimePickerError(
          'INVALID_MINUTE_INTERVAL',
          `minuteInterval must be a positive integer that evenly divides 60. Received: ${minuteInterval}`
        );
        onError?.(err);
        throw err;
      }
    }

    if (minimumDate && maximumDate) {
      if (!validateDateRange(minimumDate, maximumDate)) {
        const err = new DateTimePickerError(
          'DATE_OUT_OF_RANGE',
          'minimumDate cannot be after maximumDate.'
        );
        onError?.(err);
        throw err;
      }
    }

    // Presentation: JS Modal / Bottom Sheet / Fullscreen
    if (presentation !== 'native') {
      setIsJsModalVisible(true);
      setDateTimeTab('date');
      isOpenRef.current = true;
      onOpen?.();
      return null;
    }

    // Presentation: Native (TurboModule)
    if (isOpenRef.current) {
      const err = new DateTimePickerError(
        'PICKER_ALREADY_OPEN',
        'A native picker dialog is already active.'
      );
      onError?.(err);
      throw err;
    }

    isOpenRef.current = true;
    onOpen?.();

    const targetDate = dateRef.current;
    const nativeOptions = buildNativeOptions(targetDate);

    try {
      let result: { action: NativePickerAction; timestamp: number };

      switch (mode) {
        case 'time':
          result = await NativeDateTimePicker.openTimePicker(nativeOptions);
          break;
        case 'datetime':
          result = await NativeDateTimePicker.openDateTimePicker(nativeOptions);
          break;
        case 'countdown':
          result =
            await NativeDateTimePicker.openCountdownPicker(nativeOptions);
          break;
        case 'date':
        default:
          result = await NativeDateTimePicker.openDatePicker(nativeOptions);
          break;
      }

      const action = result.action;
      if (action === 'confirmed') {
        const selectedDate = timestampToDate(result.timestamp);

        if (isDateDisabled(selectedDate, disabledDates, disabledWeekdays)) {
          const err = new DateTimePickerError(
            'DATE_OUT_OF_RANGE',
            'Selected date is in disabledDates or disabledWeekdays.'
          );
          onError?.(err);
        }

        setCurrentDate(selectedDate);
        dateRef.current = selectedDate;
        onChange?.(selectedDate);
        onConfirm?.(selectedDate);
        return selectedDate;
      } else if (action === 'cancelled') {
        onCancel?.();
        return null;
      } else {
        onDismiss?.();
        return null;
      }
    } catch (error) {
      const normalized =
        error instanceof DateTimePickerError
          ? error
          : new DateTimePickerError(
              'UNKNOWN_ERROR',
              error instanceof Error ? error.message : 'Unknown error',
              error
            );
      onError?.(normalized);
      throw normalized;
    } finally {
      isOpenRef.current = false;
    }
  }, [
    disabled,
    minuteInterval,
    minimumDate,
    maximumDate,
    presentation,
    onOpen,
    buildNativeOptions,
    mode,
    disabledDates,
    disabledWeekdays,
    onChange,
    onConfirm,
    onCancel,
    onDismiss,
    onError,
  ]);

  const closePicker = useCallback(async (): Promise<boolean> => {
    if (presentation !== 'native') {
      setIsJsModalVisible(false);
      isOpenRef.current = false;
      onDismiss?.();
      return true;
    }

    if (!isOpenRef.current) {
      return false;
    }
    try {
      const closed = await NativeDateTimePicker.closePicker();
      isOpenRef.current = false;
      onDismiss?.();
      return closed;
    } catch (error) {
      const normalized =
        error instanceof DateTimePickerError
          ? error
          : new DateTimePickerError(
              'UNKNOWN_ERROR',
              error instanceof Error ? error.message : 'Failed to close picker',
              error
            );
      onError?.(normalized);
      return false;
    }
  }, [presentation, onDismiss, onError]);

  const confirmProgrammatic = useCallback(async (): Promise<Date | null> => {
    if (presentation !== 'native') {
      const selectedDate = dateRef.current;
      setIsJsModalVisible(false);
      isOpenRef.current = false;
      onChange?.(selectedDate);
      onConfirm?.(selectedDate);
      return selectedDate;
    }

    try {
      const result = await NativeDateTimePicker.confirmPicker();
      const selectedDate = timestampToDate(result.timestamp);
      setCurrentDate(selectedDate);
      dateRef.current = selectedDate;
      isOpenRef.current = false;
      onChange?.(selectedDate);
      onConfirm?.(selectedDate);
      return selectedDate;
    } catch (error) {
      const normalized =
        error instanceof DateTimePickerError
          ? error
          : new DateTimePickerError(
              'PICKER_NOT_OPEN',
              error instanceof Error
                ? error.message
                : 'Picker is not currently open to confirm',
              error
            );
      onError?.(normalized);
      return null;
    }
  }, [presentation, onChange, onConfirm, onError]);

  const cancelProgrammatic = useCallback(async (): Promise<boolean> => {
    if (presentation !== 'native') {
      setIsJsModalVisible(false);
      isOpenRef.current = false;
      onCancel?.();
      return true;
    }

    try {
      const cancelled = await NativeDateTimePicker.cancelPicker();
      isOpenRef.current = false;
      onCancel?.();
      return cancelled;
    } catch (error) {
      const normalized =
        error instanceof DateTimePickerError
          ? error
          : new DateTimePickerError(
              'PICKER_NOT_OPEN',
              error instanceof Error
                ? error.message
                : 'Picker is not currently open to cancel',
              error
            );
      onError?.(normalized);
      return false;
    }
  }, [presentation, onCancel, onError]);

  const reset = useCallback(() => {
    setCurrentDate(initialDate);
    dateRef.current = initialDate;
    setActivePresetId(undefined);
  }, [initialDate]);

  const getValue = useCallback((): Date | null => {
    return dateRef.current;
  }, []);

  const setValue = useCallback((date: Date | number | string) => {
    const parsed = parseDate(date);
    if (parsed) {
      setCurrentDate(parsed);
      dateRef.current = parsed;
    }
  }, []);

  // Imperative handle
  useImperativeHandle(
    ref,
    () => ({
      open: openPicker,
      close: closePicker,
      confirm: confirmProgrammatic,
      cancel: cancelProgrammatic,
      reset,
      getValue,
      setValue,
    }),
    [
      openPicker,
      closePicker,
      confirmProgrammatic,
      cancelProgrammatic,
      reset,
      getValue,
      setValue,
    ]
  );

  // Declarative open prop support
  useEffect(() => {
    if (propOpen === true && !isOpenRef.current) {
      openPicker().catch(() => {});
    } else if (propOpen === false && isOpenRef.current) {
      closePicker().catch(() => {});
    }
  }, [propOpen, openPicker, closePicker]);

  // Presets handling
  const presets = useMemo(() => {
    if (!showPresets) return [];
    return customPresets || getStandardSinglePresets();
  }, [showPresets, customPresets]);

  const handleSelectPreset = useCallback(
    (preset: DatePreset) => {
      setActivePresetId(preset.id);
      const val = preset.getValue();
      if (val instanceof Date) {
        setCurrentDate(val);
        dateRef.current = val;
        onChange?.(val);
      }
    },
    [onChange]
  );

  const handleJsDateChange = useCallback(
    (newDate: Date) => {
      setActivePresetId(undefined);
      setCurrentDate(newDate);
      dateRef.current = newDate;
      onChange?.(newDate);
    },
    [onChange]
  );

  const handleJsConfirm = useCallback(() => {
    setIsJsModalVisible(false);
    isOpenRef.current = false;
    onConfirm?.(currentDate);
  }, [currentDate, onConfirm]);

  const handleJsCancel = useCallback(() => {
    setIsJsModalVisible(false);
    isOpenRef.current = false;
    onCancel?.();
  }, [onCancel]);

  // If native, don't render JS UI (TurboModule handles presentation)
  if (presentation === 'native') {
    return null;
  }

  const defaultHeaderTitle =
    title ||
    (mode === 'time'
      ? localeData.selectTimeTitle
      : mode === 'datetime'
        ? localeData.selectDateTimeTitle
        : localeData.selectDateTitle);

  const isModalVisible = isJsModalVisible;

  // Render JS UI based on mode
  const renderPickerBody = () => {
    if (mode === 'time') {
      return (
        <ClockPicker
          value={currentDate}
          is24Hour={is24Hour}
          minuteInterval={minuteInterval}
          locale={localeData}
          theme={resolvedTheme}
          onChange={(res) => handleJsDateChange(res.date)}
        />
      );
    }

    if (mode === 'countdown') {
      const minutesItems = Array.from({ length: 60 }, (_, i) => ({
        label: `${i} min`,
        value: i,
      }));
      return (
        <View style={styles.countdownContainer}>
          <WheelPicker
            items={minutesItems}
            selectedValue={currentDate.getMinutes()}
            theme={resolvedTheme}
            onChange={(val) => {
              const d = new Date(currentDate);
              d.setMinutes(val);
              handleJsDateChange(d);
            }}
          />
        </View>
      );
    }

    if (mode === 'datetime') {
      return (
        <View>
          {/* Tab selector between Date and Time */}
          <View
            style={[
              styles.tabsRow,
              {
                borderColor: resolvedTheme.colors.border,
                backgroundColor: resolvedTheme.colors.card,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => setDateTimeTab('date')}
              style={[
                styles.tabBtn,
                dateTimeTab === 'date' && {
                  backgroundColor: resolvedTheme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      dateTimeTab === 'date'
                        ? resolvedTheme.colors.primaryText
                        : resolvedTheme.colors.textSecondary,
                    fontWeight: dateTimeTab === 'date' ? 'bold' : 'normal',
                  },
                ]}
              >
                Date
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDateTimeTab('time')}
              style={[
                styles.tabBtn,
                dateTimeTab === 'time' && {
                  backgroundColor: resolvedTheme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      dateTimeTab === 'time'
                        ? resolvedTheme.colors.primaryText
                        : resolvedTheme.colors.textSecondary,
                    fontWeight: dateTimeTab === 'time' ? 'bold' : 'normal',
                  },
                ]}
              >
                Time
              </Text>
            </TouchableOpacity>
          </View>

          {dateTimeTab === 'date' ? (
            <CalendarPicker
              value={currentDate}
              onChange={handleJsDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              disabledDates={disabledDates}
              disabledWeekdays={disabledWeekdays}
              markedDates={markedDates}
              firstDayOfWeek={firstDayOfWeek}
              locale={localeData}
              theme={resolvedTheme}
            />
          ) : (
            <ClockPicker
              value={currentDate}
              is24Hour={is24Hour}
              minuteInterval={minuteInterval}
              locale={localeData}
              theme={resolvedTheme}
              onChange={(res) => {
                const combined = new Date(currentDate);
                combined.setHours(res.hour, res.minute);
                handleJsDateChange(combined);
              }}
            />
          )}
        </View>
      );
    }

    // Default mode === 'date'
    return (
      <CalendarPicker
        value={currentDate}
        onChange={handleJsDateChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        disabledDates={disabledDates}
        disabledWeekdays={disabledWeekdays}
        markedDates={markedDates}
        firstDayOfWeek={firstDayOfWeek}
        locale={localeData}
        theme={resolvedTheme}
      />
    );
  };

  const content = (
    <View style={styles.innerContent}>
      {presentation !== 'inline' && (
        <PickerHeader
          title={defaultHeaderTitle}
          cancelText={cancelText || localeData.cancelText}
          confirmText={confirmText || localeData.confirmText}
          onCancel={handleJsCancel}
          onConfirm={handleJsConfirm}
          theme={resolvedTheme}
          isRTL={localeData.isRTL}
        />
      )}

      {showPresets && presets.length > 0 && (
        <PresetsBar
          presets={presets}
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
          theme={resolvedTheme}
          isRTL={localeData.isRTL}
        />
      )}

      {renderPickerBody()}
    </View>
  );

  return (
    <ModalWrapper
      testID={testID}
      presentation={presentation}
      visible={isModalVisible}
      onClose={handleJsCancel}
      theme={resolvedTheme}
      backdropOpacity={backdropOpacity}
      animationType={animationType}
      showHandle={showHandle}
      closeOnBackdropPress={closeOnBackdropPress}
    >
      {content}
    </ModalWrapper>
  );
});

DateTimePicker.displayName = 'DateTimePicker';

/**
 * Imperative helper function to open the native Date Time Picker modal.
 */
export async function openDateTimePickerModal(
  options: OpenPickerOptions
): Promise<Date | null> {
  const {
    mode = 'date',
    value = new Date(),
    minimumDate,
    maximumDate,
    display = 'default',
    locale,
    timeZoneOffsetInMinutes,
    is24Hour,
    minuteInterval,
    title,
    confirmText,
    cancelText,
    theme = 'auto',
    accentColor,
    textColor,
    backgroundColor,
    disabledDates,
    disabledWeekdays,
    onChange,
    onConfirm,
    onCancel,
    onDismiss,
    onError,
  } = options;

  if (minuteInterval !== undefined && !validateMinuteInterval(minuteInterval)) {
    const err = new DateTimePickerError(
      'INVALID_MINUTE_INTERVAL',
      `minuteInterval must be a positive integer dividing 60. Received: ${minuteInterval}`
    );
    onError?.(err);
    throw err;
  }

  if (
    minimumDate &&
    maximumDate &&
    !validateDateRange(minimumDate, maximumDate)
  ) {
    const err = new DateTimePickerError(
      'DATE_OUT_OF_RANGE',
      'minimumDate cannot be after maximumDate.'
    );
    onError?.(err);
    throw err;
  }

  const parsedValue = parseDate(value) || new Date();
  const minTimestamp = minimumDate ? dateToTimestamp(minimumDate) : undefined;
  const maxTimestamp = maximumDate ? dateToTimestamp(maximumDate) : undefined;

  const nativeTheme: NativePickerTheme =
    typeof theme === 'string' &&
    (theme === 'light' || theme === 'dark' || theme === 'auto')
      ? theme
      : 'auto';

  const nativeOptions: NativePickerOptions = {
    value: parsedValue.getTime(),
    minimumDate: minTimestamp ?? undefined,
    maximumDate: maxTimestamp ?? undefined,
    display,
    locale: typeof locale === 'string' ? locale : locale?.code,
    timeZoneOffsetInMinutes,
    is24Hour,
    minuteInterval,
    title,
    confirmText,
    cancelText,
    theme: nativeTheme,
    accentColor,
    textColor,
    backgroundColor,
  };

  try {
    let result: { action: NativePickerAction; timestamp: number };

    switch (mode) {
      case 'time':
        result = await NativeDateTimePicker.openTimePicker(nativeOptions);
        break;
      case 'datetime':
        result = await NativeDateTimePicker.openDateTimePicker(nativeOptions);
        break;
      case 'countdown':
        result = await NativeDateTimePicker.openCountdownPicker(nativeOptions);
        break;
      case 'date':
      default:
        result = await NativeDateTimePicker.openDatePicker(nativeOptions);
        break;
    }

    const selectedDate = timestampToDate(result.timestamp);
    if (result.action === 'confirmed') {
      if (isDateDisabled(selectedDate, disabledDates, disabledWeekdays)) {
        const err = new DateTimePickerError(
          'DATE_OUT_OF_RANGE',
          'Selected date is disabled.'
        );
        onError?.(err);
      }
      onChange?.(selectedDate);
      onConfirm?.(selectedDate);
      return selectedDate;
    } else if (result.action === 'cancelled') {
      onCancel?.();
      return null;
    } else {
      onDismiss?.();
      return null;
    }
  } catch (error) {
    const normalized =
      error instanceof DateTimePickerError
        ? error
        : new DateTimePickerError(
            'UNKNOWN_ERROR',
            error instanceof Error ? error.message : 'Unknown error',
            error
          );
    onError?.(normalized);
    throw normalized;
  }
}

const styles = StyleSheet.create({
  innerContent: {
    width: '100%',
  },
  countdownContainer: {
    padding: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
  },
});
