import { VALID_MINUTE_INTERVALS } from './constants';
import { parseDate, serializeDateOnly } from './dateConversion';

/**
 * Validates that an input resolves to a valid, non-NaN Date.
 */
export function validateDate(date: unknown): boolean {
  const parsed = parseDate(date);
  return parsed !== null;
}

/**
 * Validates 24-hour time components.
 */
export function validateTime(hour: number, minute: number): boolean {
  if (typeof hour !== 'number' || typeof minute !== 'number') {
    return false;
  }
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return false;
  }
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

/**
 * Validates that a date range is valid: both dates are valid and start <= end.
 */
export function validateDateRange(
  startDate: unknown,
  endDate: unknown
): boolean {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) {
    return false;
  }
  return start.getTime() <= end.getTime();
}

/**
 * Checks if a date is strictly before another date.
 */
export function isDateBefore(date: unknown, compareDate: unknown): boolean {
  const d1 = parseDate(date);
  const d2 = parseDate(compareDate);
  if (!d1 || !d2) {
    return false;
  }
  return d1.getTime() < d2.getTime();
}

/**
 * Checks if a date is strictly after another date.
 */
export function isDateAfter(date: unknown, compareDate: unknown): boolean {
  const d1 = parseDate(date);
  const d2 = parseDate(compareDate);
  if (!d1 || !d2) {
    return false;
  }
  return d1.getTime() > d2.getTime();
}

/**
 * Checks if a date falls within an optional [minimumDate, maximumDate] range.
 */
export function isDateWithinRange(
  date: unknown,
  minDate?: unknown,
  maxDate?: unknown
): boolean {
  const d = parseDate(date);
  if (!d) {
    return false;
  }

  if (minDate !== undefined && minDate !== null) {
    const min = parseDate(minDate);
    if (!min || d.getTime() < min.getTime()) {
      return false;
    }
  }

  if (maxDate !== undefined && maxDate !== null) {
    const max = parseDate(maxDate);
    if (!max || d.getTime() > max.getTime()) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if the weekday of a date is disabled.
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export function isWeekdayDisabled(
  date: unknown,
  disabledWeekdays?: number[]
): boolean {
  if (!disabledWeekdays || disabledWeekdays.length === 0) {
    return false;
  }
  const d = parseDate(date);
  if (!d) {
    return false;
  }
  const day = d.getDay();
  return disabledWeekdays.includes(day);
}

/**
 * Checks if a date is disabled either specifically in disabledDates or by weekday.
 */
export function isDateDisabled(
  date: unknown,
  disabledDates?: unknown[],
  disabledWeekdays?: number[]
): boolean {
  const d = parseDate(date);
  if (!d) {
    return true;
  }

  if (isWeekdayDisabled(d, disabledWeekdays)) {
    return true;
  }

  if (disabledDates && disabledDates.length > 0) {
    const targetDateStr = serializeDateOnly(d);
    for (const disabledItem of disabledDates) {
      const parsedItem = parseDate(disabledItem);
      if (parsedItem && serializeDateOnly(parsedItem) === targetDateStr) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validates that date is >= minDate.
 */
export function validateMinimumDate(date: unknown, minDate: unknown): boolean {
  const d = parseDate(date);
  const min = parseDate(minDate);
  if (!d || !min) {
    return false;
  }
  return d.getTime() >= min.getTime();
}

/**
 * Validates that date is <= maxDate.
 */
export function validateMaximumDate(date: unknown, maxDate: unknown): boolean {
  const d = parseDate(date);
  const max = parseDate(maxDate);
  if (!d || !max) {
    return false;
  }
  return d.getTime() <= max.getTime();
}

/**
 * Validates that the minute interval is a valid divisor of 60.
 */
export function validateMinuteInterval(interval?: number): boolean {
  if (interval === undefined || interval === null) {
    return true;
  }
  if (!Number.isInteger(interval)) {
    return false;
  }
  return (VALID_MINUTE_INTERVALS as readonly number[]).includes(interval);
}
