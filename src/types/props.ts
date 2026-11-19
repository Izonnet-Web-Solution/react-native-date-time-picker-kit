import type {
  NativePickerAction,
  NativePickerDisplay,
  NativePickerMode,
  NativePickerTheme,
} from './native';
import type {
  DateTimePickerCancelEvent,
  DateTimePickerChangeEvent,
  DateTimePickerConfirmEvent,
  DateTimePickerDismissEvent,
  DateTimePickerErrorEvent,
  DateTimePickerOpenEvent,
} from './events';
import type { ThemeConfig, ThemeMode } from '../theme/types';
import type { PartialLocaleData } from '../localization/types';
import type { BaseModalProps, PresentationMode } from './presentation';
import type { MarkedDatesMap } from '../components/CalendarPicker';
import type { DatePreset } from '../presets';

export type MinuteInterval = 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;

export interface TimeObject {
  hour: number;
  minute: number;
  second?: number;
}

export interface DateTimePickerProps extends Omit<
  BaseModalProps,
  'onConfirm' | 'onCancel'
> {
  // Selection
  mode?: NativePickerMode;
  value?: Date | number | string | null;
  defaultValue?: Date | number | string | null;
  display?: NativePickerDisplay;
  disabled?: boolean;
  presentation?: PresentationMode; // 'native' | 'inline' | 'modal' | 'bottom-sheet' | 'fullscreen'

  // Restrictions
  minimumDate?: Date | number | string;
  maximumDate?: Date | number | string;
  minimumTime?: string | TimeObject;
  maximumTime?: string | TimeObject;
  minuteInterval?: MinuteInterval;
  disabledDates?: (Date | string)[];
  disabledWeekdays?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  markedDates?: MarkedDatesMap;

  // Localization
  locale?: string | PartialLocaleData;
  timeZoneName?: string;
  timeZoneOffsetInMinutes?: number;
  is24Hour?: boolean;
  firstDayOfWeek?: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Appearance
  theme?: NativePickerTheme | ThemeMode | ThemeConfig;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  accentColor?: string;
  textColor?: string;
  backgroundColor?: string;
  showPresets?: boolean;
  customPresets?: DatePreset[];

  // Callbacks
  onChange?: DateTimePickerChangeEvent;
  onConfirm?: DateTimePickerConfirmEvent;
  onCancel?: DateTimePickerCancelEvent;
  onDismiss?: DateTimePickerDismissEvent;
  onOpen?: DateTimePickerOpenEvent;
  onError?: DateTimePickerErrorEvent;

  // Testing
  testID?: string;

  // Declarative open control (optional)
  open?: boolean;
}

export interface DateTimePickerRef {
  open: () => Promise<Date | null>;
  close: () => Promise<boolean>;
  confirm: () => Promise<Date | null>;
  cancel: () => Promise<boolean>;
  reset: () => void;
  getValue: () => Date | null;
  setValue: (date: Date | number | string) => void;
}

export interface OpenPickerOptions extends Omit<
  DateTimePickerProps,
  'open' | 'testID'
> {
  value?: Date | number | string;
}

export interface PickerResultEvent {
  action: NativePickerAction;
  date: Date | null;
}
