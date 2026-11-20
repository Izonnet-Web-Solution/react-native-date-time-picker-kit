export type NativePickerMode = 'date' | 'time' | 'datetime' | 'countdown';
export type NativePickerDisplay =
  'default' | 'spinner' | 'calendar' | 'clock' | 'compact' | 'inline';
export type NativePickerTheme = 'light' | 'dark' | 'auto';
export type NativePickerAction = 'confirmed' | 'cancelled' | 'dismissed';

export interface NativePickerOptions {
  /**
   * Selection mode for picker: 'date', 'time', 'datetime', or 'countdown'.
   */
  mode?: NativePickerMode;

  /**
   * Initial or selected timestamp in milliseconds since Unix epoch.
   */
  value?: number;

  /**
   * Minimum selectable timestamp in milliseconds since Unix epoch.
   */
  minimumDate?: number;

  /**
   * Maximum selectable timestamp in milliseconds since Unix epoch.
   */
  maximumDate?: number;

  /**
   * Presentation display style for native dialog / picker.
   * On iOS: 'default' | 'spinner' | 'compact' | 'inline'.
   * On Android: 'default' | 'spinner' | 'calendar' | 'clock'.
   */
  display?: NativePickerDisplay;

  /**
   * Locale identifier (e.g. 'en_US', 'es_ES', 'hi_IN', 'fr_FR').
   */
  locale?: string;

  /**
   * Timezone offset in minutes relative to GMT/UTC.
   */
  timeZoneOffsetInMinutes?: number;

  /**
   * Target IANA timezone identifier (e.g. 'America/New_York', 'Asia/Kolkata').
   */
  timeZone?: string;

  /**
   * Alias for `timeZone`.
   */
  timeZoneName?: string;

  /**
   * Whether to force 24-hour time presentation (primarily Android).
   */
  is24Hour?: boolean;

  /**
   * Minute snapping interval (1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30).
   */
  minuteInterval?: number;

  /**
   * Header or dialog title text.
   */
  title?: string;

  /**
   * Confirm button text.
   */
  confirmText?: string;

  /**
   * iOS alias for confirm button text.
   */
  confirmTextIOS?: string;

  /**
   * Cancel button text.
   */
  cancelText?: string;

  /**
   * iOS alias for cancel button text.
   */
  cancelTextIOS?: string;

  /**
   * Native dialog visual theme.
   */
  theme?: NativePickerTheme;

  /**
   * Force dark mode presentation.
   */
  isDarkModeEnabled?: boolean;

  /**
   * Accent tint color override (hex string).
   */
  accentColor?: string;

  /**
   * iOS alias for accent tint color (hex string).
   */
  accentColorIOS?: string;

  /**
   * Button text color override (hex string).
   */
  buttonTextColor?: string;

  /**
   * iOS alias for button text color (hex string).
   */
  buttonTextColorIOS?: string;

  /**
   * Text color override (hex string).
   */
  textColor?: string;

  /**
   * Modal / dialog background color override (hex string).
   */
  backgroundColor?: string;

  /**
   * Semi-transparent backdrop opacity on iOS (0.0 to 1.0).
   * @default 0.4
   */
  backdropOpacity?: number;

  /**
   * Corner radius for ActionSheet cards on iOS.
   * @default 14
   */
  cardBorderRadius?: number;

  /**
   * Whether haptic feedback is triggered on date/time changes on iOS.
   * @default true
   */
  hapticFeedbackEnabled?: boolean;

  /**
   * Header text displayed above picker on iOS.
   */
  headerTextIOS?: string;

  /**
   * Accessibility label for screen readers.
   */
  accessibilityLabel?: string;

  /**
   * Accessibility hint for screen readers.
   */
  accessibilityHint?: string;
}

export interface NativePickerResult {
  action: NativePickerAction;
  timestamp: number;
}
