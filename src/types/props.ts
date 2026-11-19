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
import type {
  ThemeColorsOverride,
  ThemeConfig,
  ThemeMode,
} from '../theme/types';
import type { PartialLocaleData } from '../localization/types';
import type { BaseModalProps, PresentationMode } from './presentation';
import type { MarkedDatesMap } from '../components/CalendarPicker';
import type { DatePreset } from '../presets';

export type MinuteInterval = 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;

export type PickerMode = NativePickerMode;
export type PickerTheme = NativePickerTheme | ThemeMode;
export type PickerDisplay = NativePickerDisplay;
export type PickerPresentation = PresentationMode;

export interface TimeObject {
  hour: number;
  minute: number;
  second?: number;
}

export interface DateTimePickerProps extends Omit<
  BaseModalProps,
  'onConfirm' | 'onCancel'
> {
  /**
   * Selection mode for picker: 'date', 'time', 'datetime', or 'countdown'.
   * @default 'date'
   */
  mode?: NativePickerMode;

  /**
   * Controlled Date value. Accepts Date object, numeric epoch timestamp, or ISO string.
   */
  value?: Date | number | string | null;

  /**
   * Uncontrolled initial Date value.
   */
  defaultValue?: Date | number | string | null;

  /**
   * Native display presentation style on iOS/Android (e.g. 'compact', 'inline', 'spinner', 'clock').
   * @default 'default'
   */
  display?: NativePickerDisplay;

  /**
   * Whether the picker interactions are disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Presentation mode: 'native' (OS dialog), 'inline', 'modal', 'bottom-sheet', or 'fullscreen'.
   * @default 'native'
   */
  presentation?: PresentationMode;

  /**
   * Minimum selectable date/time boundary. Selection before this timestamp is prevented/clamped.
   */
  minimumDate?: Date | number | string;

  /**
   * Alias for `minimumDate`.
   */
  minDate?: Date | number | string;

  /**
   * Maximum selectable date/time boundary. Selection after this timestamp is prevented/clamped.
   */
  maximumDate?: Date | number | string;

  /**
   * Alias for `maximumDate`.
   */
  maxDate?: Date | number | string;

  /**
   * Minimum allowable time components (e.g. "09:00" or { hour: 9, minute: 0 }).
   */
  minimumTime?: string | TimeObject;

  /**
   * Maximum allowable time components (e.g. "17:00" or { hour: 17, minute: 0 }).
   */
  maximumTime?: string | TimeObject;

  /**
   * Minute snapping interval (1, 2, 3, 4, 5, 6, 10, 12, 15, 20, or 30).
   * @default 1
   */
  minuteInterval?: MinuteInterval;

  /**
   * Specific dates to disable from selection.
   */
  disabledDates?: (Date | string)[];

  /**
   * Weekdays to disable from selection (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
   */
  disabledWeekdays?: number[];

  /**
   * Map of marked dates with colored dots, badges, or custom highlights.
   */
  markedDates?: MarkedDatesMap;

  /**
   * Locale string identifier (e.g. 'en', 'hi', 'gu', 'ar', 'es') or custom LocaleData object.
   * @default Device locale
   */
  locale?: string | PartialLocaleData;

  /**
   * Target IANA timezone identifier (e.g. 'America/New_York', 'Asia/Kolkata').
   */
  timeZone?: string;

  /**
   * Alias for `timeZone`.
   */
  timeZoneName?: string;

  /**
   * Explicit UTC offset in minutes (e.g. 330 for IST +05:30).
   */
  timeZoneOffsetInMinutes?: number;

  /**
   * UTC offset in hours or minutes (e.g. 5.5 or 330).
   */
  utcOffset?: number;

  /**
   * Explicit override for 24-hour time representation.
   */
  is24Hour?: boolean;

  /**
   * First day of the week (0 = Sunday, 1 = Monday, 6 = Saturday).
   */
  firstDayOfWeek?: number;

  /**
   * Visual theme mode ('light', 'dark', 'auto') or comprehensive ThemeConfig object.
   * @default 'auto'
   */
  theme?: NativePickerTheme | ThemeMode | ThemeConfig;

  /**
   * Convenient color override palette for quick styling without breaking layouts.
   */
  themeColors?: ThemeColorsOverride;

  /**
   * Optional custom style overrides for modal header, button, or container.
   */
  styles?: {
    headerStyle?: any;
    confirmButtonStyle?: any;
    cancelButtonStyle?: any;
    containerStyle?: any;
  };

  /**
   * Title text displayed in header or native dialog.
   */
  title?: string;

  /**
   * Confirm button action label.
   */
  confirmText?: string;

  /**
   * Cancel button action label.
   */
  cancelText?: string;

  /**
   * Accent color override.
   */
  accentColor?: string;

  /**
   * Text color override.
   */
  textColor?: string;

  /**
   * Background color override.
   */
  backgroundColor?: string;

  /**
   * Whether to show quick date presets bar (Today, Yesterday, Last 7 Days, This Month).
   * @default false
   */
  showPresets?: boolean;

  /**
   * Custom date presets to display.
   */
  customPresets?: DatePreset[];

  /**
   * Callback fired on any intermediate date or time selection change.
   */
  onChange?: DateTimePickerChangeEvent;

  /**
   * Callback fired when selection is confirmed with the final Date object.
   */
  onConfirm?: DateTimePickerConfirmEvent;

  /**
   * Callback fired when picker is cancelled or closed without confirmation.
   */
  onCancel?: DateTimePickerCancelEvent;

  /**
   * Callback fired on native dialog dismissal.
   */
  onDismiss?: DateTimePickerDismissEvent;

  /**
   * Callback fired when picker modal opens.
   */
  onOpen?: DateTimePickerOpenEvent;

  /**
   * Callback fired when an error occurs during presentation or validation.
   */
  onError?: DateTimePickerErrorEvent;

  /**
   * Test identifier for automation testing.
   */
  testID?: string;

  /**
   * Declarative open control flag.
   */
  open?: boolean;

  /**
   * Alias for `open` or `visible`.
   */
  isVisible?: boolean;
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
