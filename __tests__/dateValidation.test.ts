import { describe, expect, it } from '@jest/globals';
import {
  isDateAfter,
  isDateBefore,
  isDateDisabled,
  isDateWithinRange,
  isWeekdayDisabled,
  validateDate,
  validateDateRange,
  validateMaximumDate,
  validateMinimumDate,
  validateMinuteInterval,
  validateTime,
} from '../src/utils/dateValidation';

describe('dateValidation', () => {
  describe('validateDate', () => {
    it('validates Date objects', () => {
      expect(validateDate(new Date())).toBe(true);
      expect(validateDate(new Date(2026, 0, 1))).toBe(true);
      expect(validateDate(new Date('invalid'))).toBe(false);
    });

    it('validates strings and numbers', () => {
      expect(validateDate('2026-05-15')).toBe(true);
      expect(validateDate(Date.now())).toBe(true);
      expect(validateDate(null)).toBe(false);
      expect(validateDate(undefined)).toBe(false);
      expect(validateDate('abc')).toBe(false);
      expect(validateDate(NaN)).toBe(false);
    });
  });

  describe('validateTime', () => {
    it('accepts valid 24h hours and minutes', () => {
      expect(validateTime(0, 0)).toBe(true);
      expect(validateTime(12, 30)).toBe(true);
      expect(validateTime(23, 59)).toBe(true);
    });

    it('rejects out-of-range hours and minutes', () => {
      expect(validateTime(-1, 0)).toBe(false);
      expect(validateTime(24, 0)).toBe(false);
      expect(validateTime(12, -1)).toBe(false);
      expect(validateTime(12, 60)).toBe(false);
      expect(validateTime(12.5, 30)).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    it('returns true when startDate <= endDate', () => {
      const d1 = new Date(2026, 0, 1);
      const d2 = new Date(2026, 0, 2);
      expect(validateDateRange(d1, d2)).toBe(true);
      expect(validateDateRange(d1, d1)).toBe(true);
    });

    it('returns false when startDate > endDate', () => {
      const d1 = new Date(2026, 0, 2);
      const d2 = new Date(2026, 0, 1);
      expect(validateDateRange(d1, d2)).toBe(false);
    });

    it('returns false when any date is invalid', () => {
      expect(validateDateRange('invalid', new Date())).toBe(false);
      expect(validateDateRange(new Date(), null)).toBe(false);
    });
  });

  describe('isDateBefore and isDateAfter', () => {
    it('compares dates accurately', () => {
      const earlier = new Date(2026, 0, 1);
      const later = new Date(2026, 0, 2);

      expect(isDateBefore(earlier, later)).toBe(true);
      expect(isDateBefore(later, earlier)).toBe(false);
      expect(isDateBefore(earlier, earlier)).toBe(false);

      expect(isDateAfter(later, earlier)).toBe(true);
      expect(isDateAfter(earlier, later)).toBe(false);
      expect(isDateAfter(later, later)).toBe(false);
    });
  });

  describe('isDateWithinRange', () => {
    const min = new Date(2026, 0, 1);
    const max = new Date(2026, 0, 31);

    it('returns true when date is within range', () => {
      const date = new Date(2026, 0, 15);
      expect(isDateWithinRange(date, min, max)).toBe(true);
    });

    it('returns true on exact boundary', () => {
      expect(isDateWithinRange(min, min, max)).toBe(true);
      expect(isDateWithinRange(max, min, max)).toBe(true);
    });

    it('returns false when outside range', () => {
      const before = new Date(2025, 11, 31);
      const after = new Date(2026, 1, 1);
      expect(isDateWithinRange(before, min, max)).toBe(false);
      expect(isDateWithinRange(after, min, max)).toBe(false);
    });

    it('supports one-sided bounds', () => {
      const date = new Date(2026, 0, 15);
      expect(isDateWithinRange(date, min, undefined)).toBe(true);
      expect(isDateWithinRange(new Date(2025, 0, 1), min, undefined)).toBe(
        false
      );
      expect(isDateWithinRange(date, undefined, max)).toBe(true);
      expect(isDateWithinRange(new Date(2027, 0, 1), undefined, max)).toBe(
        false
      );
    });

    it('regression: rejects invalid boundaries instead of ignoring them', () => {
      const date = new Date(2026, 0, 15);
      expect(isDateWithinRange(date, 'garbage-date', max)).toBe(false);
      expect(isDateWithinRange(date, min, 'garbage-date')).toBe(false);
      expect(isDateWithinRange('invalid-target', min, max)).toBe(false);
    });
  });

  describe('isWeekdayDisabled', () => {
    it('identifies disabled weekdays', () => {
      // 2026-05-17 is Sunday (0), 2026-05-18 is Monday (1)
      const sunday = new Date(2026, 4, 17);
      const monday = new Date(2026, 4, 18);

      expect(isWeekdayDisabled(sunday, [0, 6])).toBe(true); // weekend disabled
      expect(isWeekdayDisabled(monday, [0, 6])).toBe(false);
    });
  });

  describe('isDateDisabled', () => {
    it('checks disabledDates list and weekdays', () => {
      const d1 = new Date(2026, 4, 15);
      const d2 = new Date(2026, 4, 16);

      expect(isDateDisabled(d1, ['2026-05-15'])).toBe(true);
      expect(isDateDisabled(d2, ['2026-05-15'])).toBe(false);

      // Check weekday disabling combined
      expect(isDateDisabled(d2, [], [d2.getDay()])).toBe(true);
    });
  });

  describe('validateMinimumDate and validateMaximumDate', () => {
    const min = new Date(2026, 0, 10);
    const max = new Date(2026, 0, 20);

    it('validates minimumDate boundary', () => {
      expect(validateMinimumDate(new Date(2026, 0, 15), min)).toBe(true);
      expect(validateMinimumDate(min, min)).toBe(true);
      expect(validateMinimumDate(new Date(2026, 0, 5), min)).toBe(false);
    });

    it('validates maximumDate boundary', () => {
      expect(validateMaximumDate(new Date(2026, 0, 15), max)).toBe(true);
      expect(validateMaximumDate(max, max)).toBe(true);
      expect(validateMaximumDate(new Date(2026, 0, 25), max)).toBe(false);
    });
  });

  describe('validateMinuteInterval', () => {
    it('accepts valid minute intervals dividing 60', () => {
      const valid = [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30];
      for (const interval of valid) {
        expect(validateMinuteInterval(interval)).toBe(true);
      }
      expect(validateMinuteInterval(undefined)).toBe(true);
    });

    it('rejects intervals not dividing 60 or negative or non-integers', () => {
      expect(validateMinuteInterval(7)).toBe(false);
      expect(validateMinuteInterval(0)).toBe(false);
      expect(validateMinuteInterval(-5)).toBe(false);
      expect(validateMinuteInterval(60)).toBe(false);
      expect(validateMinuteInterval(2.5)).toBe(false);
    });
  });
});
