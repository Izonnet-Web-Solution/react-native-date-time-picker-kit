import { describe, expect, it } from '@jest/globals';
import {
  addDays,
  dateToTimestamp,
  endOfDay,
  getDaysInMonth,
  isLeapYear,
  padZero,
  parseDate,
  serializeDateOnly,
  serializeDateTime,
  serializeTimeOnly,
  startOfDay,
  timestampToDate,
} from '../src/utils/dateConversion';

describe('dateConversion', () => {
  describe('parseDate', () => {
    it('returns null for null or undefined', () => {
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
    });

    it('returns a clone when input is already a Date', () => {
      const orig = new Date(2026, 4, 15, 10, 30);
      const parsed = parseDate(orig);
      expect(parsed).not.toBeNull();
      expect(parsed?.getTime()).toBe(orig.getTime());
      expect(parsed).not.toBe(orig); // Must be a new instance
    });

    it('returns null for invalid Date', () => {
      const invalid = new Date('invalid');
      expect(parseDate(invalid)).toBeNull();
    });

    it('parses numeric timestamps', () => {
      const now = Date.now();
      const parsed = parseDate(now);
      expect(parsed?.getTime()).toBe(now);
    });

    it('returns null for invalid numbers', () => {
      expect(parseDate(NaN)).toBeNull();
      expect(parseDate(Infinity)).toBeNull();
      expect(parseDate(-Infinity)).toBeNull();
    });

    it('parses ISO date strings', () => {
      const iso = '2026-05-15T10:30:00.000Z';
      const parsed = parseDate(iso);
      expect(parsed?.toISOString()).toBe(iso);
    });

    it('parses date-only YYYY-MM-DD as local date without UTC drift', () => {
      const parsed = parseDate('2024-02-29');
      expect(parsed).not.toBeNull();
      expect(parsed?.getFullYear()).toBe(2024);
      expect(parsed?.getMonth()).toBe(1); // Feb is 1
      expect(parsed?.getDate()).toBe(29);
    });

    it('returns null for garbage string input', () => {
      expect(parseDate('not-a-date')).toBeNull();
      expect(parseDate('')).toBeNull();
      expect(parseDate('   ')).toBeNull();
    });
  });

  describe('dateToTimestamp and timestampToDate', () => {
    it('converts Date to millisecond timestamp and back', () => {
      const date = new Date(2026, 10, 18, 16, 50, 0);
      const ts = dateToTimestamp(date);
      expect(ts).toBe(date.getTime());

      const reconstructed = timestampToDate(ts!);
      expect(reconstructed.getTime()).toBe(date.getTime());
    });

    it('returns null for invalid date input to dateToTimestamp', () => {
      expect(dateToTimestamp(null)).toBeNull();
      expect(dateToTimestamp('invalid')).toBeNull();
    });
  });

  describe('isLeapYear', () => {
    it('identifies leap years correctly', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2000)).toBe(true); // divisible by 400
      expect(isLeapYear(2400)).toBe(true);
    });

    it('identifies non-leap years correctly', () => {
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(2100)).toBe(false); // divisible by 100 but not 400
      expect(isLeapYear(1900)).toBe(false);
    });
  });

  describe('getDaysInMonth', () => {
    it('returns 29 for February in a leap year', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it('returns 28 for February in a normal year', () => {
      expect(getDaysInMonth(2023, 1)).toBe(28);
    });

    it('returns 31 for January, March, May, July, August, October, December', () => {
      const months31 = [0, 2, 4, 6, 7, 9, 11];
      for (const m of months31) {
        expect(getDaysInMonth(2026, m)).toBe(31);
      }
    });

    it('returns 30 for April, June, September, November', () => {
      const months30 = [3, 5, 8, 10];
      for (const m of months30) {
        expect(getDaysInMonth(2026, m)).toBe(30);
      }
    });
  });

  describe('padZero', () => {
    it('pads single digit numbers with leading zero', () => {
      expect(padZero(5)).toBe('05');
      expect(padZero(0)).toBe('00');
    });

    it('does not pad two digit numbers', () => {
      expect(padZero(15)).toBe('15');
    });
  });

  describe('Serialization', () => {
    it('serializeDateOnly formats YYYY-MM-DD', () => {
      const d = new Date(2026, 0, 5); // Jan 5, 2026
      expect(serializeDateOnly(d)).toBe('2026-01-05');
    });

    it('serializeTimeOnly formats 24h correctly', () => {
      const d = new Date(2026, 0, 5, 14, 7);
      expect(serializeTimeOnly(d, true)).toBe('14:07');
    });

    it('serializeTimeOnly formats 12h AM/PM correctly', () => {
      const dPM = new Date(2026, 0, 5, 14, 7);
      expect(serializeTimeOnly(dPM, false)).toBe('02:07 PM');

      const dAM = new Date(2026, 0, 5, 9, 30);
      expect(serializeTimeOnly(dAM, false)).toBe('09:30 AM');

      const dMidnight = new Date(2026, 0, 5, 0, 15);
      expect(serializeTimeOnly(dMidnight, false)).toBe('12:15 AM');

      const dNoon = new Date(2026, 0, 5, 12, 0);
      expect(serializeTimeOnly(dNoon, false)).toBe('12:00 PM');
    });

    it('serializeDateTime formats YYYY-MM-DDTHH:mm:ss', () => {
      const d = new Date(2026, 4, 15, 10, 30, 45);
      expect(serializeDateTime(d)).toBe('2026-05-15T10:30:45');
    });
  });

  describe('startOfDay and endOfDay', () => {
    it('sets start of day to 00:00:00.000', () => {
      const d = new Date(2026, 4, 15, 14, 32, 10, 500);
      const start = startOfDay(d);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(start.getMilliseconds()).toBe(0);
      expect(start.getDate()).toBe(15);
    });

    it('sets end of day to 23:59:59.999', () => {
      const d = new Date(2026, 4, 15, 14, 32, 10, 500);
      const end = endOfDay(d);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
      expect(end.getMilliseconds()).toBe(999);
      expect(end.getDate()).toBe(15);
    });
  });

  describe('addDays', () => {
    it('adds days across month boundaries', () => {
      const jan30 = new Date(2026, 0, 30);
      const feb2 = addDays(jan30, 3);
      expect(feb2.getMonth()).toBe(1);
      expect(feb2.getDate()).toBe(2);
    });

    it('adds days across leap year Feb 28 -> Feb 29', () => {
      const feb28Leap = new Date(2024, 1, 28);
      const feb29 = addDays(feb28Leap, 1);
      expect(feb29.getDate()).toBe(29);
      expect(feb29.getMonth()).toBe(1);
    });

    it('subtracts days when negative', () => {
      const mar1 = new Date(2024, 2, 1);
      const feb29 = addDays(mar1, -1);
      expect(feb29.getDate()).toBe(29);
      expect(feb29.getMonth()).toBe(1);
    });
  });
});
