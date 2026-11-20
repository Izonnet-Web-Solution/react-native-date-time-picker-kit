import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  DateTimePickerError,
  NativeDateTimePicker,
  openDateTimePickerModal,
} from '../src';
import {
  clampDate,
  clampTime,
  normalizeDateWithTimezone,
  parseDate,
} from '../src/utils/dateConversion';
import { validateMinuteInterval } from '../src/utils/dateValidation';

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

describe('Platform-Specific Support & Compatibility Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('iOS Native Picker Behavior', () => {
    it('supports countdown mode on iOS via openCountdownPicker', async () => {
      const targetDate = new Date(2026, 4, 15, 0, 25);
      (NativeDateTimePicker.openCountdownPicker as any).mockResolvedValue({
        action: 'confirmed',
        timestamp: targetDate.getTime(),
      });

      const onConfirm = jest.fn();
      const res = await openDateTimePickerModal({
        mode: 'countdown',
        onConfirm,
      });

      expect(NativeDateTimePicker.openCountdownPicker).toHaveBeenCalled();
      expect(res?.getTime()).toBe(targetDate.getTime());
      expect(onConfirm).toHaveBeenCalled();
    });

    it('passes iOS custom styling parameters (accentColorIOS, buttonTextColorIOS)', async () => {
      (NativeDateTimePicker.openDatePicker as any).mockResolvedValue({
        action: 'confirmed',
        timestamp: Date.now(),
      });

      await openDateTimePickerModal({
        accentColorIOS: '#007AFF',
        buttonTextColorIOS: '#FF3B30',
        confirmTextIOS: 'Select',
        cancelTextIOS: 'Close',
        isDarkModeEnabled: true,
      });

      expect(NativeDateTimePicker.openDatePicker).toHaveBeenCalledWith(
        expect.objectContaining({
          accentColor: '#007AFF',
          accentColorIOS: '#007AFF',
          buttonTextColor: '#FF3B30',
          buttonTextColorIOS: '#FF3B30',
          confirmText: 'Select',
          confirmTextIOS: 'Select',
          cancelText: 'Close',
          cancelTextIOS: 'Close',
          theme: 'dark',
          isDarkModeEnabled: true,
        })
      );
    });

    it('supports iOS display styles (compact, inline, spinner, default)', async () => {
      (NativeDateTimePicker.openDatePicker as any).mockResolvedValue({
        action: 'confirmed',
        timestamp: Date.now(),
      });

      await openDateTimePickerModal({ display: 'compact' });
      expect(NativeDateTimePicker.openDatePicker).toHaveBeenCalledWith(
        expect.objectContaining({ display: 'compact' })
      );

      await openDateTimePickerModal({ display: 'inline' });
      expect(NativeDateTimePicker.openDatePicker).toHaveBeenCalledWith(
        expect.objectContaining({ display: 'inline' })
      );

      await openDateTimePickerModal({ display: 'spinner' });
      expect(NativeDateTimePicker.openDatePicker).toHaveBeenCalledWith(
        expect.objectContaining({ display: 'spinner' })
      );
    });
  });

  describe('Android Native Picker Behavior & Limitations', () => {
    it('rejects countdown mode on Android with UNSUPPORTED_FEATURE', async () => {
      (NativeDateTimePicker.openCountdownPicker as any).mockRejectedValue(
        new DateTimePickerError(
          'UNSUPPORTED_FEATURE',
          'Countdown picker mode is not natively supported on Android.'
        )
      );

      const onError = jest.fn();
      await expect(
        openDateTimePickerModal({
          mode: 'countdown',
          onError,
        })
      ).rejects.toThrow(
        'Countdown picker mode is not natively supported on Android.'
      );

      expect(onError).toHaveBeenCalledWith(expect.any(DateTimePickerError));
    });

    it('supports 12-hour and 24-hour mode toggling for Android TimePickerDialog', async () => {
      (NativeDateTimePicker.openTimePicker as any).mockResolvedValue({
        action: 'confirmed',
        timestamp: Date.now(),
      });

      await openDateTimePickerModal({
        mode: 'time',
        is24Hour: true,
      });

      expect(NativeDateTimePicker.openTimePicker).toHaveBeenCalledWith(
        expect.objectContaining({ is24Hour: true })
      );

      await openDateTimePickerModal({
        mode: 'time',
        is24Hour: false,
      });

      expect(NativeDateTimePicker.openTimePicker).toHaveBeenCalledWith(
        expect.objectContaining({ is24Hour: false })
      );
    });

    it('validates minute intervals strictly for native snapping', () => {
      expect(validateMinuteInterval(1)).toBe(true);
      expect(validateMinuteInterval(5)).toBe(true);
      expect(validateMinuteInterval(10)).toBe(true);
      expect(validateMinuteInterval(15)).toBe(true);
      expect(validateMinuteInterval(20)).toBe(true);
      expect(validateMinuteInterval(30)).toBe(true);

      // Non-divisors of 60 or invalid intervals
      expect(validateMinuteInterval(7)).toBe(false);
      expect(validateMinuteInterval(0)).toBe(false);
      expect(validateMinuteInterval(-5)).toBe(false);
      expect(validateMinuteInterval(45)).toBe(false);
    });

    it('throws INVALID_MINUTE_INTERVAL error when invalid interval is provided', async () => {
      const onError = jest.fn();
      await expect(
        openDateTimePickerModal({
          // @ts-expect-error Testing invalid runtime value
          minuteInterval: 7,
          onError,
        })
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'INVALID_MINUTE_INTERVAL' })
      );
    });
  });

  describe('Timezone, Locale and Boundary Clamping', () => {
    it('normalizes date with IANA timezone string and offsets', () => {
      const baseDate = new Date('2026-06-15T12:00:00Z');
      const ny = normalizeDateWithTimezone(baseDate, 'America/New_York');
      expect(ny).toBeInstanceOf(Date);

      const tokyo = normalizeDateWithTimezone(baseDate, 'Asia/Tokyo');
      expect(tokyo).toBeInstanceOf(Date);

      const ist = normalizeDateWithTimezone(baseDate, undefined, 330);
      expect(ist).toBeInstanceOf(Date);
    });

    it('clamps dates strictly to minimumDate and maximumDate bounds', () => {
      const min = new Date(2026, 4, 10);
      const max = new Date(2026, 4, 20);

      // Before min
      const before = new Date(2026, 4, 5);
      const clampedBefore = clampDate(before, min, max);
      expect(clampedBefore?.getTime()).toBe(min.getTime());

      // After max
      const after = new Date(2026, 4, 25);
      const clampedAfter = clampDate(after, min, max);
      expect(clampedAfter?.getTime()).toBe(max.getTime());

      // Within range
      const within = new Date(2026, 4, 15);
      const clampedWithin = clampDate(within, min, max);
      expect(clampedWithin?.getTime()).toBe(within.getTime());
    });

    it('clamps time components strictly when on the boundary dates', () => {
      const minDate = new Date(2026, 4, 15, 10, 30);
      const maxDate = new Date(2026, 4, 15, 16, 45);

      const tooEarly = new Date(2026, 4, 15, 8, 0);
      const clampedEarly = clampTime(tooEarly, minDate, maxDate);
      expect(clampedEarly.getHours()).toBe(10);
      expect(clampedEarly.getMinutes()).toBe(30);

      const tooLate = new Date(2026, 4, 15, 18, 0);
      const clampedLate = clampTime(tooLate, minDate, maxDate);
      expect(clampedLate.getHours()).toBe(16);
      expect(clampedLate.getMinutes()).toBe(45);
    });

    it('parses string, numeric and Date values consistently without date drift', () => {
      const fromObj = parseDate(new Date(2026, 6, 20));
      expect(fromObj?.getDate()).toBe(20);

      const fromTs = parseDate(new Date(2026, 6, 20).getTime());
      expect(fromTs?.getDate()).toBe(20);

      const fromIso = parseDate('2026-07-20');
      expect(fromIso?.getFullYear()).toBe(2026);
      expect(fromIso?.getMonth()).toBe(6);
      expect(fromIso?.getDate()).toBe(20);
    });
  });
});
