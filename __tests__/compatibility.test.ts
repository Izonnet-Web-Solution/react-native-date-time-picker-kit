import { describe, expect, it, jest } from '@jest/globals';

jest.mock('../src/native/NativeDateTimePicker', () => ({
  NativeDateTimePicker: {
    openDatePicker: jest.fn(),
    openTimePicker: jest.fn(),
    openDateTimePicker: jest.fn(),
    openCountdownPicker: jest.fn(),
    closePicker: jest.fn(),
    confirmPicker: jest.fn(),
    cancelPicker: jest.fn(),
    setSelectedDate: jest.fn(),
    getSelectedDate: jest.fn(),
    resetPicker: jest.fn(),
  },
}));

import DateTimePickerModalDefault, {
  DatePicker,
  DateTimePicker,
  DateTimePickerError,
  DateTimePickerModal,
  NativeDateTimePicker,
  openDateTimePickerModal,
  TimePicker,
  useDateTimePicker,
  formatDate,
  formatTime,
  parseDate,
  clampDate,
  dateToTimestamp,
  timestampToDate,
} from '../src';

describe('Backward Compatibility & Repository Integrity Suite', () => {
  it('exports DateTimePickerModal as both default export and named export', () => {
    expect(DateTimePickerModalDefault).toBeDefined();
    expect(DateTimePickerModal).toBeDefined();
    expect(DateTimePickerModalDefault).toBe(DateTimePickerModal);
  });

  it('preserves all public core date/time picker component exports', () => {
    expect(DateTimePicker).toBeDefined();
    expect(DatePicker).toBeDefined();
    expect(TimePicker).toBeDefined();
  });

  it('preserves imperative function and hooks exports', () => {
    expect(typeof openDateTimePickerModal).toBe('function');
    expect(typeof useDateTimePicker).toBe('function');
  });

  it('preserves native bridge module export', () => {
    expect(NativeDateTimePicker).toBeDefined();
    expect(typeof NativeDateTimePicker.openDatePicker).toBe('function');
    expect(typeof NativeDateTimePicker.openTimePicker).toBe('function');
    expect(typeof NativeDateTimePicker.openDateTimePicker).toBe('function');
    expect(typeof NativeDateTimePicker.openCountdownPicker).toBe('function');
    expect(typeof NativeDateTimePicker.closePicker).toBe('function');
    expect(typeof NativeDateTimePicker.confirmPicker).toBe('function');
    expect(typeof NativeDateTimePicker.cancelPicker).toBe('function');
  });

  it('preserves error system exports', () => {
    const err = new DateTimePickerError('UNKNOWN_ERROR', 'Test error message');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DateTimePickerError);
    expect(err.code).toBe('UNKNOWN_ERROR');
    expect(err.name).toBe('DateTimePickerError');
  });

  it('preserves date conversion and formatting utility exports', () => {
    expect(typeof formatDate).toBe('function');
    expect(typeof formatTime).toBe('function');
    expect(typeof parseDate).toBe('function');
    expect(typeof clampDate).toBe('function');
    expect(typeof dateToTimestamp).toBe('function');
    expect(typeof timestampToDate).toBe('function');

    const d = new Date(2026, 10, 20, 15, 30);
    expect(formatDate(d, 'YYYY-MM-DD')).toBe('2026-11-20');
    expect(formatTime(d, '24h')).toBe('15:30');
  });
});
