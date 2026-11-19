import { describe, expect, it } from '@jest/globals';
import {
  addDays,
  clampDate,
  clampMonthDay,
  clampTime,
  getDaysInMonth,
  isLeapYear,
  normalizeDateWithTimezone,
  parseDate,
  serializeDateOnly,
  serializeDateTime,
  serializeTimeOnly,
} from '../src/utils/dateConversion';
import {
  isDateWithinRange,
  validateDate,
  validateDateRange,
  validateTime,
} from '../src/utils/dateValidation';
import { formatDate, formatTime } from '../src/utils/dateFormatting';

describe('Second-Round QA Audit: Date and Time Accuracy & Boundaries', () => {
  describe('1. Leap Years & Gregorian 400-Year Rules', () => {
    it('accurately identifies 4-year leap years', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2028)).toBe(true);
      expect(isLeapYear(2032)).toBe(true);
    });

    it('accurately identifies non-leap standard years', () => {
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(2026)).toBe(false);
      expect(isLeapYear(2027)).toBe(false);
    });

    it('accurately identifies century leap years (divisible by 400)', () => {
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(2400)).toBe(true);
      expect(isLeapYear(1600)).toBe(true);
    });

    it('accurately identifies century non-leap years (divisible by 100 but not 400)', () => {
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2100)).toBe(false);
      expect(isLeapYear(2200)).toBe(false);
      expect(isLeapYear(2300)).toBe(false);
    });
  });

  describe('2. February 28 & February 29 Day Clamping', () => {
    it('getDaysInMonth returns 29 for February in leap years and 28 in non-leap years', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29);
      expect(getDaysInMonth(2025, 1)).toBe(28);
      expect(getDaysInMonth(2000, 1)).toBe(29);
      expect(getDaysInMonth(1900, 1)).toBe(28);
    });

    it('clampMonthDay clamps February 30 and 31 to 29 in leap year 2024', () => {
      expect(clampMonthDay(2024, 1, 29)).toBe(29);
      expect(clampMonthDay(2024, 1, 30)).toBe(29);
      expect(clampMonthDay(2024, 1, 31)).toBe(29);
    });

    it('clampMonthDay clamps February 29, 30, and 31 to 28 in non-leap year 2025', () => {
      expect(clampMonthDay(2025, 1, 28)).toBe(28);
      expect(clampMonthDay(2025, 1, 29)).toBe(28);
      expect(clampMonthDay(2025, 1, 30)).toBe(28);
      expect(clampMonthDay(2025, 1, 31)).toBe(28);
    });
  });

  describe('3. Month Boundaries & Rollover Clamping', () => {
    it('clamps 31-day months transitioning to 30-day months', () => {
      // April (month 3) has 30 days
      expect(clampMonthDay(2026, 3, 31)).toBe(30);
      // June (month 5) has 30 days
      expect(clampMonthDay(2026, 5, 31)).toBe(30);
      // September (month 8) has 30 days
      expect(clampMonthDay(2026, 8, 31)).toBe(30);
      // November (month 10) has 30 days
      expect(clampMonthDay(2026, 10, 31)).toBe(30);
    });

    it('preserves 31 days for 31-day months', () => {
      // January, March, May, July, August, October, December
      [0, 2, 4, 6, 7, 9, 11].forEach((m) => {
        expect(clampMonthDay(2026, m, 31)).toBe(31);
      });
    });

    it('addDays crosses month boundaries without drift', () => {
      const jan31 = new Date(2026, 0, 31);
      const feb1 = addDays(jan31, 1);
      expect(feb1.getFullYear()).toBe(2026);
      expect(feb1.getMonth()).toBe(1);
      expect(feb1.getDate()).toBe(1);
    });
  });

  describe('4. Year Boundaries & Midnight/Noon Transitions', () => {
    it('transitions smoothly from Dec 31 23:59:59 to Jan 1 00:00:00', () => {
      const nye = new Date(2026, 11, 31, 23, 59, 59, 999);
      expect(serializeDateOnly(nye)).toBe('2026-12-31');
      const newYear = new Date(nye.getTime() + 1);
      expect(newYear.getFullYear()).toBe(2027);
      expect(newYear.getMonth()).toBe(0);
      expect(newYear.getDate()).toBe(1);
      expect(serializeDateOnly(newYear)).toBe('2027-01-01');
      expect(serializeTimeOnly(newYear, true)).toBe('00:00');
    });

    it('Midnight (00:00) serializes properly in 24h and 12h AM/PM', () => {
      const midnight = new Date(2026, 5, 15, 0, 0, 0);
      expect(serializeTimeOnly(midnight, true)).toBe('00:00');
      expect(serializeTimeOnly(midnight, false)).toBe('12:00 AM');
      expect(formatTime(midnight, '12h')).toBe('12:00 AM');
      expect(formatTime(midnight, '24h')).toBe('00:00');
    });

    it('Noon (12:00) serializes properly in 24h and 12h AM/PM', () => {
      const noon = new Date(2026, 5, 15, 12, 0, 0);
      expect(serializeTimeOnly(noon, true)).toBe('12:00');
      expect(serializeTimeOnly(noon, false)).toBe('12:00 PM');
      expect(formatTime(noon, '12h')).toBe('12:00 PM');
      expect(formatTime(noon, '24h')).toBe('12:00');
    });

    it('11:59 PM and 12:01 AM period checks', () => {
      const lateNight = new Date(2026, 5, 15, 23, 59, 0);
      expect(serializeTimeOnly(lateNight, false)).toBe('11:59 PM');

      const earlyMorning = new Date(2026, 5, 15, 0, 1, 0);
      expect(serializeTimeOnly(earlyMorning, false)).toBe('12:01 AM');
    });
  });

  describe('5. Timezone & Local Date Parsing (Preventing Off-By-One-Day Bugs)', () => {
    it('parseDate for YYYY-MM-DD date-only string treats as local date to prevent UTC midnight off-by-one bug', () => {
      const parsed = parseDate('2026-07-04');
      expect(parsed).not.toBeNull();
      expect(parsed?.getFullYear()).toBe(2026);
      expect(parsed?.getMonth()).toBe(6); // July
      expect(parsed?.getDate()).toBe(4);
      expect(serializeDateOnly(parsed as Date)).toBe('2026-07-04');
    });

    it('normalizeDateWithTimezone applies IANA timezone without crash', () => {
      const base = new Date('2026-06-15T12:00:00Z');
      const ny = normalizeDateWithTimezone(base, 'America/New_York');
      expect(validateDate(ny)).toBe(true);
      const tokyo = normalizeDateWithTimezone(base, 'Asia/Tokyo');
      expect(validateDate(tokyo)).toBe(true);
    });

    it('normalizeDateWithTimezone handles explicit UTC numeric offsets', () => {
      const base = new Date(2026, 5, 15, 12, 0, 0);
      const shifted = normalizeDateWithTimezone(base, undefined, 330); // IST +05:30
      expect(validateDate(shifted)).toBe(true);
    });
  });

  describe('6. Minimum, Maximum & Boundary Conditions', () => {
    it('minimumDate equal to maximumDate accepts exact boundary and rejects others', () => {
      const boundary = new Date(2026, 5, 15, 10, 0, 0);
      expect(isDateWithinRange(boundary, boundary, boundary)).toBe(true);

      const before = new Date(boundary.getTime() - 1000);
      expect(isDateWithinRange(before, boundary, boundary)).toBe(false);

      const after = new Date(boundary.getTime() + 1000);
      expect(isDateWithinRange(after, boundary, boundary)).toBe(false);
    });

    it('clampDate clamps to boundary when min === max', () => {
      const boundary = new Date(2026, 5, 15, 10, 0, 0);
      const clamped = clampDate(new Date(2026, 0, 1), boundary, boundary);
      expect(clamped?.getTime()).toBe(boundary.getTime());
    });

    it('validateDateRange returns false when minDate > maxDate', () => {
      const min = new Date(2026, 6, 1);
      const max = new Date(2026, 5, 1);
      expect(validateDateRange(min, max)).toBe(false);
    });

    it('clampTime clamps time when date falls on boundary day', () => {
      const minDate = new Date(2026, 5, 15, 14, 30, 0);
      const targetDate = new Date(2026, 5, 15, 10, 0, 0);
      const clamped = clampTime(targetDate, minDate, undefined);
      expect(clamped.getHours()).toBe(14);
      expect(clamped.getMinutes()).toBe(30);
    });
  });

  describe('7. Invalid Dates, Nulls & Edge-Case Inputs', () => {
    it('parseDate handles invalid dates safely without throwing', () => {
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
      expect(parseDate('')).toBeNull();
      expect(parseDate('   ')).toBeNull();
      expect(parseDate('invalid-date-string')).toBeNull();
      expect(parseDate(NaN)).toBeNull();
      expect(parseDate(Infinity)).toBeNull();
      expect(parseDate(new Date('invalid'))).toBeNull();
    });

    it('validateTime validates hour and minute ranges strictly', () => {
      expect(validateTime(0, 0)).toBe(true);
      expect(validateTime(23, 59)).toBe(true);
      expect(validateTime(-1, 0)).toBe(false);
      expect(validateTime(24, 0)).toBe(false);
      expect(validateTime(12, 60)).toBe(false);
      expect(validateTime(12, -1)).toBe(false);
      expect(validateTime(12.5, 30)).toBe(false);
    });

    it('serializeDateTime outputs compliant local ISO string', () => {
      const dt = new Date(2026, 10, 19, 14, 35, 20);
      expect(serializeDateTime(dt)).toBe('2026-11-19T14:35:20');
    });

    it('formatDate handles full composite tokens accurately', () => {
      const dt = new Date(2026, 10, 19, 9, 5, 7);
      const formatted = formatDate(dt, 'YYYY-MM-DD hh:mm:ss A');
      expect(formatted).toBe('2026-11-19 09:05:07 AM');
    });
  });
});
