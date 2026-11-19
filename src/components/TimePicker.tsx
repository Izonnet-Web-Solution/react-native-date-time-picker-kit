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

export interface TimePickerProps extends BaseModalProps {
  presentation?: PresentationMode;
  value?: Date | string | number | null;
  defaultValue?: Date | string | number | null;
  onChange?: (date: Date) => void;
  onConfirmTime?: (date: Date) => void;
  is24Hour?: boolean;
  minuteInterval?: MinuteInterval;
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
      locale: propLocale,
      theme: propTheme,
      backdropOpacity,
      animationType,
      showHandle,
      closeOnBackdropPress,
      testID,
    },
    ref
  ) => {
    const theme = useTheme(propTheme);
    const locale = useLocale(propLocale);

    const initialDate =
      parseDate(propValue) || parseDate(defaultValue) || new Date();
    const [selectedTime, setSelectedTime] = useState<Date>(initialDate);
    const [isVisible, setIsVisible] = useState(false);

    const modalVisible = propVisible !== undefined ? propVisible : isVisible;

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
            const confirmedDate = timestampToDate(res.timestamp);
            setSelectedTime(confirmedDate);
            onChange?.(confirmedDate);
            onConfirmTime?.(confirmedDate);
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
          setSelectedTime(parsed);
        }
      },
      reset: () => {
        setSelectedTime(initialDate);
      },
    }));

    const handleClockChange = useCallback(
      (res: { date: Date }) => {
        setSelectedTime(res.date);
        onChange?.(res.date);
      },
      [onChange]
    );

    const handleConfirm = useCallback(() => {
      onConfirmTime?.(selectedTime);
      setIsVisible(false);
      onClose?.();
    }, [selectedTime, onConfirmTime, onClose]);

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
