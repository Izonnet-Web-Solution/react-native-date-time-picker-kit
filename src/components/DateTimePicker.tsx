import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { DateTimePickerError } from '../errors/DateTimePickerError';
import { NativeDateTimePicker } from '../native/NativeDateTimePicker';
import type {
  DateTimePickerProps,
  DateTimePickerRef,
  NativePickerAction,
  NativePickerOptions,
  NativePickerTheme,
  OpenPickerOptions,
} from '../types';
import {
  clampDate,
  dateToTimestamp,
  normalizeDateWithTimezone,
  parseDate,
  timestampToDate,
} from '../utils/dateConversion';
import {
  validateDateRange,
  validateMinuteInterval,
} from '../utils/dateValidation';

export const DateTimePicker = forwardRef<
  DateTimePickerRef,
  DateTimePickerProps
>((props, ref) => {
  const {
    mode = 'date',
    value: propValue,
    date: propDate,
    defaultValue,
    display = 'default',
    disabled = false,
    minimumDate,
    maximumDate,
    minuteInterval,
    locale: propLocale,
    timeZoneOffsetInMinutes,
    is24Hour,
    theme: propTheme = 'auto',
    isDarkModeEnabled,
    title,
    headerTextIOS,
    backdropOpacity,
    cardBorderRadius,
    hapticFeedbackEnabled,
    confirmText,
    confirmTextIOS,
    cancelText,
    cancelTextIOS,
    accentColor,
    accentColorIOS,
    buttonTextColor,
    buttonTextColorIOS,
    textColor,
    backgroundColor,
    onChange,
    onConfirm,
    onCancel,
    onHide,
    onDismiss,
    onOpen,
    onError,
    open: propOpen,
    isVisible: propIsVisible,
    testID,
    accessible,
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole,
  } = props;

  const effectiveValue = propDate !== undefined ? propDate : propValue;
  const effectiveMinDate = minimumDate ?? props.minDate;
  const effectiveMaxDate = maximumDate ?? props.maxDate;
  const effectiveTimeZone = props.timeZone ?? props.timeZoneName;
  const effectiveConfirmText = confirmText ?? confirmTextIOS;
  const effectiveCancelText = cancelText ?? cancelTextIOS;
  const effectiveAccentColor = accentColor ?? accentColorIOS;
  const effectiveButtonTextColor = buttonTextColor ?? buttonTextColorIOS;

  const effectiveOffsetMinutes =
    timeZoneOffsetInMinutes !== undefined
      ? timeZoneOffsetInMinutes
      : props.utcOffset !== undefined
        ? Math.abs(props.utcOffset) <= 14
          ? Math.round(props.utcOffset * 60)
          : Math.round(props.utcOffset)
        : undefined;

  const resolvedInitialDate = useMemo(() => {
    const raw = effectiveValue ?? defaultValue ?? new Date();
    const parsed = parseDate(raw) ?? new Date();
    return clampDate(parsed, effectiveMinDate, effectiveMaxDate) ?? parsed;
  }, [effectiveValue, defaultValue, effectiveMinDate, effectiveMaxDate]);

  const [currentDate, setCurrentDate] = useState<Date>(resolvedInitialDate);
  const isOpenRef = useRef<boolean>(false);
  const isOpeningRef = useRef<boolean>(false);
  const internalDateRef = useRef<Date>(resolvedInitialDate);
  internalDateRef.current = currentDate;

  const isControlledVisible =
    propIsVisible !== undefined || propOpen !== undefined;
  const effectiveVisible = Boolean(propIsVisible ?? propOpen);

  useEffect(() => {
    if (effectiveValue !== undefined && effectiveValue !== null) {
      const parsed = parseDate(effectiveValue);
      if (parsed) {
        const clamped =
          clampDate(parsed, effectiveMinDate, effectiveMaxDate) ?? parsed;
        setCurrentDate(clamped);
      }
    }
  }, [effectiveValue, effectiveMinDate, effectiveMaxDate]);

  const serializeOptions = useCallback(
    (targetDate: Date): NativePickerOptions => {
      const ts = dateToTimestamp(targetDate) ?? Date.now();
      const rawMinTs = effectiveMinDate
        ? dateToTimestamp(effectiveMinDate)
        : undefined;
      const rawMaxTs = effectiveMaxDate
        ? dateToTimestamp(effectiveMaxDate)
        : undefined;
      const minTs = rawMinTs ?? undefined;
      const maxTs = rawMaxTs ?? undefined;

      let resolvedTheme: NativePickerTheme = 'auto';
      if (isDarkModeEnabled !== undefined) {
        resolvedTheme = isDarkModeEnabled ? 'dark' : 'light';
      } else if (typeof propTheme === 'string') {
        resolvedTheme = propTheme as NativePickerTheme;
      } else if (propTheme && typeof propTheme === 'object') {
        resolvedTheme = (propTheme.mode as NativePickerTheme) ?? 'auto';
      }

      const localeStr =
        typeof propLocale === 'string'
          ? propLocale
          : propLocale &&
              typeof propLocale === 'object' &&
              'languageTag' in propLocale
            ? (propLocale as any).languageTag
            : undefined;

      return {
        value: ts,
        mode: mode === 'datetime' ? 'datetime' : mode,
        display,
        minimumDate: minTs,
        maximumDate: maxTs,
        minuteInterval,
        locale: localeStr,
        timeZoneOffsetInMinutes: effectiveOffsetMinutes,
        timeZone: effectiveTimeZone,
        is24Hour,
        theme: resolvedTheme,
        isDarkModeEnabled: isDarkModeEnabled ?? resolvedTheme === 'dark',
        title: title ?? headerTextIOS,
        headerTextIOS: headerTextIOS ?? title,
        backdropOpacity,
        cardBorderRadius,
        hapticFeedbackEnabled,
        confirmText: effectiveConfirmText,
        confirmTextIOS: effectiveConfirmText,
        cancelText: effectiveCancelText,
        cancelTextIOS: effectiveCancelText,
        accentColor: effectiveAccentColor,
        accentColorIOS: effectiveAccentColor,
        buttonTextColor: effectiveButtonTextColor,
        buttonTextColorIOS: effectiveButtonTextColor,
        textColor,
        backgroundColor,
      };
    },
    [
      effectiveMinDate,
      effectiveMaxDate,
      isDarkModeEnabled,
      propTheme,
      propLocale,
      mode,
      display,
      minuteInterval,
      effectiveOffsetMinutes,
      effectiveTimeZone,
      is24Hour,
      title,
      headerTextIOS,
      backdropOpacity,
      cardBorderRadius,
      hapticFeedbackEnabled,
      effectiveConfirmText,
      effectiveCancelText,
      effectiveAccentColor,
      effectiveButtonTextColor,
      textColor,
      backgroundColor,
    ]
  );

  const openNativePicker = useCallback(async (): Promise<Date | null> => {
    if (disabled) {
      return null;
    }

    if (isOpenRef.current || isOpeningRef.current) {
      return null;
    }

    try {
      if (
        effectiveMinDate &&
        effectiveMaxDate &&
        !validateDateRange(effectiveMinDate, effectiveMaxDate)
      ) {
        throw new DateTimePickerError(
          'DATE_OUT_OF_RANGE',
          'minimumDate cannot be later than maximumDate.'
        );
      }
      if (
        minuteInterval !== undefined &&
        !validateMinuteInterval(minuteInterval)
      ) {
        throw new DateTimePickerError(
          'INVALID_MINUTE_INTERVAL',
          `Minute interval ${minuteInterval} is invalid. Must be one of 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30.`
        );
      }

      isOpeningRef.current = true;
      const opts = serializeOptions(internalDateRef.current ?? new Date());
      onOpen?.();

      let result: { action: NativePickerAction; timestamp?: number };

      if (mode === 'date') {
        result = await NativeDateTimePicker.openDatePicker(opts);
      } else if (mode === 'time') {
        result = await NativeDateTimePicker.openTimePicker(opts);
      } else if (mode === 'datetime') {
        result = await NativeDateTimePicker.openDateTimePicker(opts);
      } else if (mode === 'countdown') {
        result = await NativeDateTimePicker.openCountdownPicker(opts);
      } else {
        result = await NativeDateTimePicker.openDatePicker(opts);
      }

      isOpenRef.current = false;
      isOpeningRef.current = false;

      if (result.action === 'confirmed' && result.timestamp != null) {
        let confirmedDate = timestampToDate(result.timestamp);
        if (effectiveTimeZone) {
          confirmedDate = normalizeDateWithTimezone(
            confirmedDate,
            effectiveTimeZone
          );
        }
        confirmedDate =
          clampDate(confirmedDate, effectiveMinDate, effectiveMaxDate) ??
          confirmedDate;

        setCurrentDate(confirmedDate);
        onChange?.(confirmedDate);
        onConfirm?.(confirmedDate);
        onHide?.(true, confirmedDate);
        return confirmedDate;
      } else {
        onCancel?.();
        onDismiss?.();
        onHide?.(false);
        return null;
      }
    } catch (err: any) {
      isOpenRef.current = false;
      isOpeningRef.current = false;
      const errorObj =
        err instanceof DateTimePickerError
          ? err
          : new DateTimePickerError(
              'PRESENTATION_FAILED',
              err?.message || 'Failed to display picker'
            );
      onError?.(errorObj);
      onHide?.(false);
      return null;
    }
  }, [
    disabled,
    effectiveMinDate,
    effectiveMaxDate,
    minuteInterval,
    serializeOptions,
    onOpen,
    mode,
    effectiveTimeZone,
    onChange,
    onConfirm,
    onHide,
    onCancel,
    onDismiss,
    onError,
  ]);

  const closeNativePicker = useCallback(async (): Promise<boolean> => {
    try {
      const closed = await NativeDateTimePicker.closePicker();
      isOpenRef.current = false;
      isOpeningRef.current = false;
      return closed;
    } catch {
      isOpenRef.current = false;
      isOpeningRef.current = false;
      return false;
    }
  }, []);

  const confirmPicker = useCallback(async (): Promise<Date | null> => {
    try {
      const result = await NativeDateTimePicker.confirmPicker();
      if (result.action === 'confirmed' && result.timestamp != null) {
        const confirmedDate = timestampToDate(result.timestamp);
        setCurrentDate(confirmedDate);
        onConfirm?.(confirmedDate);
        onHide?.(true, confirmedDate);
        return confirmedDate;
      }
      return null;
    } catch {
      return null;
    }
  }, [onConfirm, onHide]);

  const cancelPicker = useCallback(async (): Promise<boolean> => {
    try {
      const success = await NativeDateTimePicker.cancelPicker();
      onCancel?.();
      onHide?.(false);
      return success;
    } catch {
      return false;
    }
  }, [onCancel, onHide]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => openNativePicker(),
      close: () => closeNativePicker(),
      confirm: () => confirmPicker(),
      cancel: () => cancelPicker(),
      reset: () => {
        const resetVal = defaultValue
          ? (parseDate(defaultValue) ?? new Date())
          : new Date();
        const clamped =
          clampDate(resetVal, effectiveMinDate, effectiveMaxDate) ?? resetVal;
        setCurrentDate(clamped);
      },
      getValue: () => currentDate,
      setValue: (val: Date | number | string) => {
        const parsed = parseDate(val);
        if (parsed) {
          const clamped =
            clampDate(parsed, effectiveMinDate, effectiveMaxDate) ?? parsed;
          setCurrentDate(clamped);
          const ts = dateToTimestamp(clamped);
          if (ts) {
            NativeDateTimePicker.setSelectedDate(ts).catch(() => {});
          }
        }
      },
    }),
    [
      openNativePicker,
      closeNativePicker,
      confirmPicker,
      cancelPicker,
      defaultValue,
      effectiveMinDate,
      effectiveMaxDate,
      currentDate,
    ]
  );

  useEffect(() => {
    if (!isControlledVisible) return;

    if (effectiveVisible) {
      if (!isOpenRef.current && !isOpeningRef.current) {
        openNativePicker();
      }
    } else {
      if (isOpenRef.current) {
        closeNativePicker();
      }
    }
  }, [
    effectiveVisible,
    isControlledVisible,
    openNativePicker,
    closeNativePicker,
  ]);

  return (
    <View
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      style={styles.hiddenContainer}
      pointerEvents="none"
    />
  );
});

DateTimePicker.displayName = 'DateTimePicker';

export async function openDateTimePickerModal(
  options: OpenPickerOptions
): Promise<Date | null> {
  const {
    mode = 'date',
    value,
    date,
    minimumDate,
    maximumDate,
    minuteInterval,
    locale,
    timeZoneOffsetInMinutes,
    timeZone,
    is24Hour,
    theme = 'auto',
    isDarkModeEnabled,
    title,
    confirmText,
    confirmTextIOS,
    cancelText,
    cancelTextIOS,
    accentColor,
    accentColorIOS,
    buttonTextColor,
    buttonTextColorIOS,
    textColor,
    backgroundColor,
    display = 'default',
    onChange,
    onConfirm,
    onCancel,
    onHide,
    onDismiss,
    onError,
  } = options;

  try {
    if (
      minimumDate &&
      maximumDate &&
      !validateDateRange(minimumDate, maximumDate)
    ) {
      throw new DateTimePickerError(
        'DATE_OUT_OF_RANGE',
        'minimumDate cannot be later than maximumDate.'
      );
    }
    if (
      minuteInterval !== undefined &&
      !validateMinuteInterval(minuteInterval)
    ) {
      throw new DateTimePickerError(
        'INVALID_MINUTE_INTERVAL',
        `Minute interval ${minuteInterval} is invalid. Must be one of 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30.`
      );
    }

    const targetDate = parseDate(date ?? value) ?? new Date();
    const ts = dateToTimestamp(targetDate) ?? Date.now();
    const rawMinTs = minimumDate ? dateToTimestamp(minimumDate) : undefined;
    const rawMaxTs = maximumDate ? dateToTimestamp(maximumDate) : undefined;
    const minTs = rawMinTs ?? undefined;
    const maxTs = rawMaxTs ?? undefined;

    let resolvedTheme: NativePickerTheme = 'auto';
    if (isDarkModeEnabled !== undefined) {
      resolvedTheme = isDarkModeEnabled ? 'dark' : 'light';
    } else if (typeof theme === 'string') {
      resolvedTheme = theme as NativePickerTheme;
    }

    const localeStr =
      typeof locale === 'string'
        ? locale
        : locale && typeof locale === 'object' && 'languageTag' in locale
          ? (locale as any).languageTag
          : undefined;

    const nativeOpts: NativePickerOptions = {
      value: ts,
      mode: mode === 'datetime' ? 'datetime' : mode,
      display,
      minimumDate: minTs,
      maximumDate: maxTs,
      minuteInterval,
      locale: localeStr,
      timeZoneOffsetInMinutes,
      timeZone,
      is24Hour,
      theme: resolvedTheme,
      isDarkModeEnabled: isDarkModeEnabled ?? resolvedTheme === 'dark',
      title,
      confirmText: confirmText ?? confirmTextIOS,
      confirmTextIOS: confirmTextIOS ?? confirmText,
      cancelText: cancelText ?? cancelTextIOS,
      cancelTextIOS: cancelTextIOS ?? cancelText,
      accentColor: accentColor ?? accentColorIOS,
      accentColorIOS: accentColorIOS ?? accentColor,
      buttonTextColor: buttonTextColor ?? buttonTextColorIOS,
      buttonTextColorIOS: buttonTextColorIOS ?? buttonTextColor,
      textColor,
      backgroundColor,
    };

    let result: { action: NativePickerAction; timestamp?: number };

    if (mode === 'date') {
      result = await NativeDateTimePicker.openDatePicker(nativeOpts);
    } else if (mode === 'time') {
      result = await NativeDateTimePicker.openTimePicker(nativeOpts);
    } else if (mode === 'datetime') {
      result = await NativeDateTimePicker.openDateTimePicker(nativeOpts);
    } else if (mode === 'countdown') {
      result = await NativeDateTimePicker.openCountdownPicker(nativeOpts);
    } else {
      result = await NativeDateTimePicker.openDatePicker(nativeOpts);
    }

    if (result.action === 'confirmed' && result.timestamp != null) {
      let confirmedDate = timestampToDate(result.timestamp);
      if (timeZone) {
        confirmedDate = normalizeDateWithTimezone(confirmedDate, timeZone);
      }
      const finalDate =
        clampDate(confirmedDate, minimumDate, maximumDate) ?? confirmedDate;
      onChange?.(finalDate);
      onConfirm?.(finalDate);
      onHide?.(true, finalDate);
      return finalDate;
    } else if (result.action === 'cancelled') {
      onCancel?.();
      onHide?.(false, undefined);
      return null;
    } else {
      onDismiss?.();
      onHide?.(false, undefined);
      return null;
    }
  } catch (err: any) {
    const errorObj =
      err instanceof DateTimePickerError
        ? err
        : new DateTimePickerError(
            'PRESENTATION_FAILED',
            err?.message || 'Failed to display picker'
          );
    onError?.(errorObj);
    onHide?.(false, undefined);
    throw errorObj;
  }
}

const styles = StyleSheet.create({
  hiddenContainer: {
    width: 0,
    height: 0,
    opacity: 0,
    position: 'absolute',
  },
});
