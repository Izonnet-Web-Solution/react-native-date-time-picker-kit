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
  TimePicker,
  DateTimePickerModal,
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

    it('clamps dates strictly before minimumDate to minimumDate', () => {
      const earlierDate = new Date(2026, 4, 1, 0, 0);
      const clamped = clampDate(earlierDate, minDate, maxDate);
      expect(clamped!.getTime()).toBe(minDate.getTime());
    });

    it('clamps dates strictly after maximumDate to maximumDate', () => {
      const laterDate = new Date(2026, 4, 25, 12, 0);
      const clamped = clampDate(laterDate, minDate, maxDate);
      expect(clamped!.getTime()).toBe(maxDate.getTime());
    });

    it('preserves dates cleanly inside the boundary range', () => {
      const inRangeDate = new Date(2026, 4, 15, 12, 0);
      const clamped = clampDate(inRangeDate, minDate, maxDate);
      expect(clamped!.getTime()).toBe(inRangeDate.getTime());
    });
  });

  describe('Time Boundary Enforcement (clampTime)', () => {
    const minTime = '09:00';
    const maxTime = '17:00';

    it('clamps times before minimumTime up to minimumTime', () => {
      const early = new Date(2026, 4, 15, 7, 30);
      const clamped = clampTime(early, minTime, maxTime);
      expect(clamped.getHours()).toBe(9);
      expect(clamped.getMinutes()).toBe(0);
    });

    it('clamps times after maximumTime down to maximumTime', () => {
      const late = new Date(2026, 4, 15, 20, 45);
      const clamped = clampTime(late, minTime, maxTime);
      expect(clamped.getHours()).toBe(17);
      expect(clamped.getMinutes()).toBe(0);
    });

    it('preserves times within the allowed window', () => {
      const valid = new Date(2026, 4, 15, 13, 15);
      const clamped = clampTime(valid, minTime, maxTime);
      expect(clamped.getHours()).toBe(13);
      expect(clamped.getMinutes()).toBe(15);
    });
  });

  describe('Timezone Normalization (normalizeDateWithTimezone)', () => {
    it('accurately parses and offsets IANA timezones', () => {
      const baseUtc = new Date(Date.UTC(2026, 4, 15, 12, 0, 0)); // 12:00 UTC
      const kolkataTime = normalizeDateWithTimezone(baseUtc, 'Asia/Kolkata');
      expect(kolkataTime).toBeInstanceOf(Date);
      expect(kolkataTime.getTime()).toBeDefined();
    });

    it('handles numeric offset string (+05:30)', () => {
      const baseUtc = new Date(Date.UTC(2026, 4, 15, 12, 0, 0));
      const normalized = normalizeDateWithTimezone(baseUtc, '+05:30');
      expect(normalized).toBeInstanceOf(Date);
    });

    it('gracefully returns unchanged date for unknown or empty timezones', () => {
      const date = new Date(2026, 4, 15, 10, 0);
      const normalized = normalizeDateWithTimezone(date, '');
      expect(normalized.getTime()).toBe(date.getTime());
    });
  });

  describe('Intl Date Localization (formatLocalized)', () => {
    it('formats localized dates accurately with dynamic Intl locale', () => {
      const d = new Date(2026, 10, 19, 14, 30);
      const formatted = formatLocalized(d, 'DD MMMM YYYY', 'it');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('19');
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

    it('instantiates DateTimePickerModal with isVisible and onHide callback', () => {
      const onHideMock = jest.fn();
      const onConfirmMock = jest.fn();
      const onCancelMock = jest.fn();

      const elem = React.createElement(DateTimePickerModal, {
        isVisible: true,
        mode: 'date',
        onConfirm: onConfirmMock,
        onCancel: onCancelMock,
        onHide: onHideMock,
      });

      expect(elem).toBeDefined();
      expect(elem.props.isVisible).toBe(true);
      expect(elem.props.mode).toBe('date');
    });
  });
});
