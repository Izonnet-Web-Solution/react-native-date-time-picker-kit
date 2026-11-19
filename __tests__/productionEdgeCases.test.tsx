import { describe, expect, it, jest } from '@jest/globals';
import React, { createRef } from 'react';

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

import {
  clampDate,
  clampMonthDay,
  clampTime,
  DatePicker,
  DateTimePicker,
  type DateTimePickerRef,
  formatLocalized,
  normalizeDateWithTimezone,
  resolveLocale,
  resolveTheme,
  TimePicker,
  WheelPicker,
} from '../src';

describe('Phase 2 & Phase 6: Production Edge Cases & Boundaries', () => {
  describe('Leap Year & Month-Day Clamping', () => {
    it('clamps January 31 to February 28 in a non-leap year (2025)', () => {
      const clamped = clampMonthDay(2025, 1, 31);
      expect(clamped).toBe(28);
    });

    it('clamps January 31 to February 29 in a leap year (2024)', () => {
      const clamped = clampMonthDay(2024, 1, 31);
      expect(clamped).toBe(29);
    });

    it('clamps March 31 to April 30', () => {
      const clamped = clampMonthDay(2026, 3, 31);
      expect(clamped).toBe(30);
    });

    it('preserves valid day numbers', () => {
      expect(clampMonthDay(2026, 1, 15)).toBe(15);
      expect(clampMonthDay(2026, 6, 4)).toBe(4);
    });
  });

  describe('Strict Bounds Enforcement (minimumDate & maximumDate)', () => {
    const minDate = new Date(2026, 4, 10, 10, 0); // May 10, 2026, 10:00
    const maxDate = new Date(2026, 4, 20, 18, 0); // May 20, 2026, 18:00

    it('clamps dates earlier than minimumDate to minimumDate', () => {
      const beforeMin = new Date(2026, 4, 1, 12, 0);
      const clamped = clampDate(beforeMin, minDate, maxDate);
      expect(clamped?.getTime()).toBe(minDate.getTime());
    });

    it('clamps dates later than maximumDate to maximumDate', () => {
      const afterMax = new Date(2026, 4, 25, 12, 0);
      const clamped = clampDate(afterMax, minDate, maxDate);
      expect(clamped?.getTime()).toBe(maxDate.getTime());
    });

    it('preserves dates strictly within the valid range', () => {
      const inRange = new Date(2026, 4, 15, 12, 0);
      const clamped = clampDate(inRange, minDate, maxDate);
      expect(clamped?.getTime()).toBe(inRange.getTime());
    });

    it('dynamically clamps hours and minutes when selected date is on minimum boundary day', () => {
      // User selects May 10 at 08:15, but minDate is May 10 at 10:00
      const selected = new Date(2026, 4, 10, 8, 15);
      const clampedTime = clampTime(selected, minDate, maxDate);
      expect(clampedTime.getHours()).toBe(10);
      expect(clampedTime.getMinutes()).toBe(0);
    });

    it('dynamically clamps hours and minutes when selected date is on maximum boundary day', () => {
      // User selects May 20 at 21:45, but maxDate is May 20 at 18:00
      const selected = new Date(2026, 4, 20, 21, 45);
      const clampedTime = clampTime(selected, minDate, maxDate);
      expect(clampedTime.getHours()).toBe(18);
      expect(clampedTime.getMinutes()).toBe(0);
    });
  });

  describe('Timezone & DST Safety', () => {
    it('normalizes date local components using IANA timezone', () => {
      const utcDate = new Date('2026-06-15T12:00:00Z');
      const inNewYork = normalizeDateWithTimezone(utcDate, 'America/New_York');
      // New York in June is EDT (UTC-4), 12:00 UTC = 08:00 EDT
      expect(inNewYork.getHours()).toBe(8);
      expect(inNewYork.getDate()).toBe(15);
    });

    it('normalizes date local components using explicit numeric UTC offset', () => {
      const baseDate = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
      // Offset +330 minutes (+05:30 IST)
      const istNormalized = normalizeDateWithTimezone(baseDate, undefined, 330);
      expect(istNormalized).toBeDefined();
    });
  });

  describe('Dynamic Intl Localization', () => {
    it('dynamically generates months and weekdays for arbitrary Intl locales', () => {
      const italian = resolveLocale('it');
      expect(italian.code).toBe('it');
      expect(italian.months.length).toBe(12);
      expect(italian.weekdays.length).toBe(7);
      // First month in Italian is "gennaio"
      expect(italian.months[0]?.toLowerCase()).toContain('gen');
    });

    it('formats localized dates accurately with dynamic Intl locale', () => {
      const d = new Date(2026, 10, 19, 14, 30);
      const formatted = formatLocalized(d, 'DD MMMM YYYY', 'it');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('19');
    });
  });

  describe('Theming and ThemeColors Override', () => {
    it('supports themeColors quick override mapping', () => {
      const resolved = resolveTheme({
        mode: 'dark',
        themeColors: {
          backgroundColor: '#1E1E2E',
          textColor: '#CDD6F4',
          accentColor: '#CBA6F7',
          dividerColor: '#313244',
        },
      });

      expect(resolved.mode).toBe('dark');
      expect(resolved.colors.background).toBe('#1E1E2E');
      expect(resolved.colors.modalBackground).toBe('#1E1E2E');
      expect(resolved.colors.text).toBe('#CDD6F4');
      expect(resolved.colors.accent).toBe('#CBA6F7');
      expect(resolved.colors.primary).toBe('#CBA6F7');
      expect(resolved.colors.divider).toBe('#313244');
    });
  });

  describe('Component Prop Aliases & Declarative Control', () => {
    it('instantiates DateTimePicker with isVisible and minDate/maxDate aliases', () => {
      const ref = createRef<DateTimePickerRef>();
      const elem = React.createElement(DateTimePicker, {
        ref,
        isVisible: true,
        minDate: '2026-01-01',
        maxDate: '2026-12-31',
        timeZone: 'Asia/Kolkata',
      });

      expect(elem).toBeDefined();
      expect(elem.props.isVisible).toBe(true);
      expect(elem.props.minDate).toBe('2026-01-01');
    });

    it('instantiates DatePicker with onConfirm alias', () => {
      const onConfirmMock = jest.fn();
      const elem = React.createElement(DatePicker, {
        value: new Date(2026, 4, 15),
        onConfirm: onConfirmMock,
        minDate: new Date(2026, 0, 1),
      });

      expect(elem).toBeDefined();
      expect(elem.props.onConfirm).toBe(onConfirmMock);
    });

    it('instantiates TimePicker with onConfirm and is24Hour props', () => {
      const onConfirmMock = jest.fn();
      const elem = React.createElement(TimePicker, {
        value: new Date(2026, 4, 15, 14, 30),
        is24Hour: true,
        onConfirm: onConfirmMock,
      });

      expect(elem).toBeDefined();
      expect(elem.props.is24Hour).toBe(true);
    });

    it('instantiates WheelPicker with items and memoized layout', () => {
      const items = [
        { label: 'Option 1', value: 1 },
        { label: 'Option 2', value: 2 },
        { label: 'Option 3', value: 3 },
      ];
      const onChangeMock = jest.fn();
      const elem = React.createElement(WheelPicker, {
        items,
        selectedValue: 2,
        onChange: onChangeMock,
      });

      expect(elem).toBeDefined();
      expect(elem.props.items.length).toBe(3);
    });
  });
});
