import type { TurboModule } from 'react-native';
import { NativeModules, TurboModuleRegistry } from 'react-native';

export type UnsafeObject = Object;

export interface Spec extends TurboModule {
  openDatePicker(options: UnsafeObject): Promise<UnsafeObject>;
  openTimePicker(options: UnsafeObject): Promise<UnsafeObject>;
  openDateTimePicker(options: UnsafeObject): Promise<UnsafeObject>;
  openCountdownPicker(options: UnsafeObject): Promise<UnsafeObject>;
  closePicker(): Promise<boolean>;
  confirmPicker(): Promise<UnsafeObject>;
  cancelPicker(): Promise<boolean>;
  setSelectedDate(timestamp: number): Promise<boolean>;
  getSelectedDate(): Promise<UnsafeObject>;
  resetPicker(): Promise<boolean>;
}

export default (TurboModuleRegistry.get<Spec>('DateTimePickerKit') ||
  NativeModules.DateTimePickerKit) as Spec | null;
