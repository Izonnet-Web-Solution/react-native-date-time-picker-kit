import NativeDateTimePickerKit from '../NativeDateTimePickerKit';
import {
  DateTimePickerError,
  type DateTimePickerErrorCode,
} from '../errors/DateTimePickerError';
import type { NativePickerOptions, NativePickerResult } from '../types/native';

function getNativeModule() {
  if (!NativeDateTimePickerKit) {
    throw new DateTimePickerError(
      'NATIVE_MODULE_NOT_FOUND',
      'The native module DateTimePickerKit was not found. Please ensure the library is linked correctly.'
    );
  }
  return NativeDateTimePickerKit;
}

function normalizeError(error: unknown): DateTimePickerError {
  if (error instanceof DateTimePickerError) {
    return error;
  }

  const err = error as { code?: string; message?: string } | null;
  const rawCode = err?.code || 'UNKNOWN_ERROR';
  const message = err?.message || 'An unknown error occurred in DateTimePicker';

  const validCodes: DateTimePickerErrorCode[] = [
    'NATIVE_MODULE_NOT_FOUND',
    'PICKER_ALREADY_OPEN',
    'PICKER_NOT_OPEN',
    'INVALID_DATE',
    'INVALID_MODE',
    'INVALID_MINUTE_INTERVAL',
    'DATE_OUT_OF_RANGE',
    'UNSUPPORTED_FEATURE',
    'ACTIVITY_UNAVAILABLE',
    'PRESENTATION_FAILED',
    'UNKNOWN_ERROR',
  ];

  const code: DateTimePickerErrorCode = validCodes.includes(
    rawCode as DateTimePickerErrorCode
  )
    ? (rawCode as DateTimePickerErrorCode)
    : 'UNKNOWN_ERROR';

  return new DateTimePickerError(code, message, error);
}

export const NativeDateTimePicker = {
  async openDatePicker(
    options: NativePickerOptions
  ): Promise<NativePickerResult> {
    try {
      const module = getNativeModule();
      const res = await module.openDatePicker(options as Object);
      return res as unknown as NativePickerResult;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async openTimePicker(
    options: NativePickerOptions
  ): Promise<NativePickerResult> {
    try {
      const module = getNativeModule();
      const res = await module.openTimePicker(options as Object);
      return res as unknown as NativePickerResult;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async openDateTimePicker(
    options: NativePickerOptions
  ): Promise<NativePickerResult> {
    try {
      const module = getNativeModule();
      const res = await module.openDateTimePicker(options as Object);
      return res as unknown as NativePickerResult;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async openCountdownPicker(
    options: NativePickerOptions
  ): Promise<NativePickerResult> {
    try {
      const module = getNativeModule();
      const res = await module.openCountdownPicker(options as Object);
      return res as unknown as NativePickerResult;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async closePicker(): Promise<boolean> {
    try {
      const module = getNativeModule();
      return await module.closePicker();
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async confirmPicker(): Promise<NativePickerResult> {
    try {
      const module = getNativeModule();
      const res = await module.confirmPicker();
      return res as unknown as NativePickerResult;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async cancelPicker(): Promise<boolean> {
    try {
      const module = getNativeModule();
      return await module.cancelPicker();
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async setSelectedDate(timestamp: number): Promise<boolean> {
    try {
      const module = getNativeModule();
      return await module.setSelectedDate(timestamp);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async getSelectedDate(): Promise<NativePickerResult> {
    try {
      const module = getNativeModule();
      const res = await module.getSelectedDate();
      return res as unknown as NativePickerResult;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async resetPicker(): Promise<boolean> {
    try {
      const module = getNativeModule();
      return await module.resetPicker();
    } catch (err) {
      throw normalizeError(err);
    }
  },
};
