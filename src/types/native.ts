export type NativePickerMode = 'date' | 'time' | 'datetime' | 'countdown';
export type NativePickerDisplay =
  'default' | 'spinner' | 'calendar' | 'clock' | 'compact' | 'inline';
export type NativePickerTheme = 'light' | 'dark' | 'auto';
export type NativePickerAction = 'confirmed' | 'cancelled' | 'dismissed';

export interface NativePickerOptions {
  value?: number;
  minimumDate?: number;
  maximumDate?: number;
  display?: NativePickerDisplay;
  locale?: string;
  timeZoneOffsetInMinutes?: number;
  is24Hour?: boolean;
  minuteInterval?: number;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  theme?: NativePickerTheme;
  accentColor?: string;
  textColor?: string;
  backgroundColor?: string;
}

export interface NativePickerResult {
  action: NativePickerAction;
  timestamp: number;
}
