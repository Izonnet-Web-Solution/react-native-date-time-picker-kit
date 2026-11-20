import type React from 'react';
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
  DateTimePickerHideEvent,
  DateTimePickerOpenEvent,
} from './events';
import type { BaseModalProps, PresentationMode } from './presentation';

export type MinuteInterval = 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;

export type PickerMode = NativePickerMode;
export type PickerTheme = NativePickerTheme | 'light' | 'dark' | 'auto';
export type PickerDisplay = NativePickerDisplay;
export type PickerPresentation = PresentationMode;
export type PickerAction = NativePickerAction;

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColorsOverride {
  primary?: string;
  background?: string;
  text?: string;
  card?: string;
  border?: string;
  subtext?: string;
  [key: string]: string | undefined;
}

export interface ThemeConfig {
  mode?: ThemeMode;
  colors?: ThemeColorsOverride;
  [key: string]: any;
}

export type PartialLocaleData = Record<string, any>;
export type MarkedDatesMap = Record<string, any>;

export interface DatePreset {
  id: string;
  label: string;
  getValue: () => Date | { startDate: Date; endDate: Date };
}

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
   * Selection mode for picker: 'date', 'time', 'datetime', or 'countdown' (iOS only).
   * @default 'date'
   */
  mode?: NativePickerMode;

  /**
   * Controlled Date value. Accepts Date object, numeric epoch timestamp, or ISO string.
   * Compatible with `react-native-modal-datetime-picker` and standard React inputs.
   */
  value?: Date | number | string | null;

  /**
   * Alias for `value`. Used extensively in `react-native-modal-datetime-picker`.
   * Accepts Date object, numeric epoch timestamp, or ISO string.
   */
  date?: Date | number | string | null;

  /**
   * Uncontrolled initial Date value.
   */
  defaultValue?: Date | number | string | null;

  /**
   * Native display presentation style on iOS/Android.
   * iOS: 'default' | 'spinner' | 'compact' | 'inline'
   * Android: 'default' | 'spinner' | 'calendar' | 'clock'
   * @default 'default'
   */
  display?: NativePickerDisplay;

  /**
   * Whether the picker interactions are disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Presentation mode:
   * - 'native': OS native modal dialog (TurboModule, highest performance)
   * - 'inline': Inline embedded view
   * - 'modal': React Native JS centered modal
   * - 'bottom-sheet': Sliding bottom-sheet modal
   * - 'fullscreen': Fullscreen view presentation
   * @default 'native'
   */
  presentation?: PresentationMode;

  /**
   * Minimum selectable date/time boundary. Selection before this timestamp is clamped.
   */
  minimumDate?: Date | number | string;

  /**
   * Alias for `minimumDate`.
   */
  minDate?: Date | number | string;

  /**
   * Maximum selectable date/time boundary. Selection after this timestamp is clamped.
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
   * Map of marked dates.
   */
  markedDates?: MarkedDatesMap;

  /**
   * Locale string identifier (e.g. 'en', 'en_US', 'hi', 'gu', 'es_ES', 'fr_FR').
   * @default Device locale
   */
  locale?: string | PartialLocaleData;

  /**
   * Target IANA timezone identifier (e.g. 'America/New_York', 'Asia/Kolkata', 'UTC').
   */
  timeZone?: string;

  /**
   * Alias for `timeZone`.
   */
  timeZoneName?: string;

  /**
   * Explicit UTC offset in minutes (e.g. 330 for IST +05:30, -300 for EST).
   */
  timeZoneOffsetInMinutes?: number;

  /**
   * UTC offset in hours or minutes (e.g. 5.5 or 330).
   */
  utcOffset?: number;

  /**
   * Explicit override for 24-hour time representation (Android).
   */
  is24Hour?: boolean;

  /**
   * First day of the week (0 = Sunday, 1 = Monday, 6 = Saturday).
   */
  firstDayOfWeek?: number;

  /**
   * Visual theme mode ('light', 'dark', 'auto') or ThemeConfig object.
   * @default 'auto'
   */
  theme?: NativePickerTheme | ThemeMode | ThemeConfig;

  /**
   * Whether dark mode should be explicitly enabled.
   * Directly compatible with `react-native-modal-datetime-picker`.
   */
  isDarkModeEnabled?: boolean;

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
   * @default 'Confirm'
   */
  confirmText?: string;

  /**
   * iOS alias for `confirmText`, matching `react-native-modal-datetime-picker`.
   * @default 'Confirm'
   */
  confirmTextIOS?: string;

  /**
   * Cancel button action label.
   * @default 'Cancel'
   */
  cancelText?: string;

  /**
   * iOS alias for `cancelText`, matching `react-native-modal-datetime-picker`.
   * @default 'Cancel'
   */
  cancelTextIOS?: string;

  /**
   * Accent color override (hex color string or color name).
   */
  accentColor?: string;

  /**
   * iOS alias for `accentColor`, matching `react-native-modal-datetime-picker`.
   */
  accentColorIOS?: string;

  /**
   * Button text color override for modal actions.
   */
  buttonTextColor?: string;

  /**
   * iOS alias for `buttonTextColor`, matching `react-native-modal-datetime-picker`.
   */
  buttonTextColorIOS?: string;

  /**
   * Text color override.
   */
  textColor?: string;

  /**
   * Background color override for modal or container.
   */
  backgroundColor?: string;

  /**
   * Custom React component or node for iOS confirm button.
   * Matches `react-native-modal-datetime-picker`.
   */
  customConfirmButtonIOS?: React.ComponentType<any> | React.ReactNode;

  /**
   * Custom React component or node for iOS cancel button.
   * Matches `react-native-modal-datetime-picker`.
   */
  customCancelButtonIOS?: React.ComponentType<any> | React.ReactNode;

  /**
   * Custom React component or node for iOS header.
   * Matches `react-native-modal-datetime-picker`.
   */
  customHeaderIOS?: React.ComponentType<any> | React.ReactNode;

  /**
   * Additional props passed to the underlying modal on iOS.
   */
  modalPropsIOS?: Record<string, any>;

  /**
   * Custom style for the picker container view on iOS.
   */
  pickerContainerStyleIOS?: any;

  /**
   * Custom style for the picker component on iOS.
   */
  pickerComponentStyleIOS?: any;

  /**
   * Custom style for the backdrop overlay on iOS.
   */
  backdropStyleIOS?: any;

  /**
   * Corner radius for the ActionSheet cards on iOS.
   * @default 14
   */
  cardBorderRadius?: number;

  /**
   * Whether haptic feedback is triggered on date/time selection changes on iOS.
   * @default true
   */
  hapticFeedbackEnabled?: boolean;

  /**
   * Header title text displayed above the picker on iOS.
   * Alias for `title`.
   */
  headerTextIOS?: string;

  /**
   * Accessibility: Whether this element is an accessibility element.
   */
  accessible?: boolean;

  /**
   * Accessibility label read aloud by VoiceOver / TalkBack.
   */
  accessibilityLabel?: string;

  /**
   * Accessibility hint explaining the outcome of interaction.
   */
  accessibilityHint?: string;

  /**
   * Accessibility role.
   */
  accessibilityRole?: any;

  /**
   * Whether to show quick date presets bar.
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
   * Callback fired when the picker dialog or modal is completely hidden/dismissed.
   * Receives `isConfirmed` boolean and the confirmed `date` (if confirmed).
   * Directly matches `react-native-modal-datetime-picker`.
   */
  onHide?: DateTimePickerHideEvent;

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
   * Declarative visibility control flag.
   * Matches `react-native-modal-datetime-picker`.
   */
  isVisible?: boolean;
}

/**
 * Props for `DateTimePickerModal`, providing 100% functional and TypeScript
 * compatibility with `react-native-modal-datetime-picker`.
 */
export interface DateTimePickerModalProps extends DateTimePickerProps {
  /**
   * Controls the visibility of the modal dialog.
   * @default false
   */
  isVisible?: boolean;

  /**
   * The currently selected or initial date.
   * Accepts a `Date` object, numeric epoch timestamp, or ISO string.
   */
  date?: Date | number | string | null;

  /**
   * Callback fired when the user confirms their selection.
   * Receives the selected `Date` object.
   */
  onConfirm?: DateTimePickerConfirmEvent;

  /**
   * Callback fired when the user cancels or dismisses the picker without confirming.
   */
  onCancel?: DateTimePickerCancelEvent;

  /**
   * Callback fired after the modal has been dismissed/hidden.
   * @param isConfirmed Whether the dialog closed via confirmation.
   * @param date The confirmed Date, or undefined if cancelled.
   */
  onHide?: DateTimePickerHideEvent;
}

export type ModalDateTimePickerProps = DateTimePickerModalProps;

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
