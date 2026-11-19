/**
 * Pure TypeScript Date Conversion Utilities
 * Zero external dependencies.
 */

export function parseDate(input: unknown): Date | null {
  if (input === null || input === undefined) {
    return null;
  }

  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : new Date(input.getTime());
  }

  if (typeof input === 'number') {
    if (isNaN(input) || !isFinite(input)) {
      return null;
    }
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }

    // Try standard Date.parse
    const timestamp = Date.parse(trimmed);
    if (!isNaN(timestamp)) {
      // Check for YYYY-MM-DD date-only strings: Date.parse treats them as UTC
      // If matches YYYY-MM-DD format strictly, parse as local date components to avoid timezone shifting
      const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
      if (dateOnlyMatch) {
        const year = parseInt(dateOnlyMatch[1] as string, 10);
        const month = parseInt(dateOnlyMatch[2] as string, 10) - 1;
        const day = parseInt(dateOnlyMatch[3] as string, 10);
        const localDate = new Date(year, month, day);
        return isNaN(localDate.getTime()) ? null : localDate;
      }
      return new Date(timestamp);
    }
  }

  return null;
}

export function dateToTimestamp(input: unknown): number | null {
  const parsed = parseDate(input);
  return parsed ? parsed.getTime() : null;
}

export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp);
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function padZero(num: number, size = 2): string {
  let s = num.toString();
  while (s.length < size) {
    s = '0' + s;
  }
  return s;
}

/**
 * Serializes local date as YYYY-MM-DD
 */
export function serializeDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Serializes local time as HH:mm or hh:mm a
 */
export function serializeTimeOnly(date: Date, is24Hour = true): string {
  const hours = date.getHours();
  const minutes = padZero(date.getMinutes());

  if (is24Hour) {
    return `${padZero(hours)}:${minutes}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${padZero(displayHours)}:${minutes} ${period}`;
}

/**
 * Serializes date & time to local ISO string: YYYY-MM-DDTHH:mm:ss
 */
export function serializeDateTime(date: Date): string {
  return `${serializeDateOnly(date)}T${serializeTimeOnly(date, true)}:${padZero(date.getSeconds())}`;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date.getTime());
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

export function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

/**
 * Clamps a day of month to the valid range [1, daysInMonth] for a given year and month.
 * Fixes edge cases when switching months (e.g. Jan 31 -> Feb 28 or 29 in leap years).
 */
export function clampMonthDay(
  year: number,
  month: number,
  day: number
): number {
  const maxDays = getDaysInMonth(year, month);
  return Math.max(1, Math.min(day, maxDays));
}

/**
 * Clamps a date strictly within an optional [minimumDate, maximumDate] range.
 */
export function clampDate(
  date: unknown,
  minDate?: unknown,
  maxDate?: unknown
): Date | null {
  const d = parseDate(date);
  if (!d) {
    return null;
  }
  if (minDate !== undefined && minDate !== null) {
    const min = parseDate(minDate);
    if (min && d.getTime() < min.getTime()) {
      return new Date(min.getTime());
    }
  }
  if (maxDate !== undefined && maxDate !== null) {
    const max = parseDate(maxDate);
    if (max && d.getTime() > max.getTime()) {
      return new Date(max.getTime());
    }
  }
  return new Date(d.getTime());
}

/**
 * Dynamically clamps a date's time components (hour, minute) if date falls on the
 * same calendar day as minimumDate or maximumDate.
 */
export function clampTime(
  date: Date,
  minDate?: unknown,
  maxDate?: unknown
): Date {
  const result = new Date(date.getTime());
  const dateStr = serializeDateOnly(result);

  if (minDate !== undefined && minDate !== null) {
    const min = parseDate(minDate);
    if (min && serializeDateOnly(min) === dateStr) {
      if (result.getHours() < min.getHours()) {
        result.setHours(min.getHours(), min.getMinutes(), min.getSeconds());
      } else if (
        result.getHours() === min.getHours() &&
        result.getMinutes() < min.getMinutes()
      ) {
        result.setMinutes(min.getMinutes(), min.getSeconds());
      }
    }
  }

  if (maxDate !== undefined && maxDate !== null) {
    const max = parseDate(maxDate);
    if (max && serializeDateOnly(max) === dateStr) {
      if (result.getHours() > max.getHours()) {
        result.setHours(max.getHours(), max.getMinutes(), max.getSeconds());
      } else if (
        result.getHours() === max.getHours() &&
        result.getMinutes() > max.getMinutes()
      ) {
        result.setMinutes(max.getMinutes(), max.getSeconds());
      }
    }
  }

  return result;
}

/**
 * Normalizes a date using a target IANA timezone (e.g. "America/New_York", "Asia/Kolkata")
 * or a UTC offset in minutes, returning a Date object reflecting the local components in that zone.
 */
export function normalizeDateWithTimezone(
  date: Date,
  timeZone?: string,
  utcOffsetMinutes?: number
): Date {
  if (isNaN(date.getTime())) {
    return date;
  }

  if (timeZone && typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });
      const parts = formatter.formatToParts(date);
      let year = date.getFullYear();
      let month = date.getMonth();
      let day = date.getDate();
      let hour = date.getHours();
      let minute = date.getMinutes();
      let second = date.getSeconds();

      for (const part of parts) {
        if (part.type === 'year') year = parseInt(part.value, 10);
        else if (part.type === 'month') month = parseInt(part.value, 10) - 1;
        else if (part.type === 'day') day = parseInt(part.value, 10);
        else if (part.type === 'hour') {
          const h = parseInt(part.value, 10);
          hour = h === 24 ? 0 : h;
        } else if (part.type === 'minute') minute = parseInt(part.value, 10);
        else if (part.type === 'second') second = parseInt(part.value, 10);
      }

      return new Date(year, month, day, hour, minute, second);
    } catch {
      // Fallback
    }
  }

  if (typeof utcOffsetMinutes === 'number') {
    const offsetMin =
      Math.abs(utcOffsetMinutes) <= 14 && !Number.isInteger(utcOffsetMinutes)
        ? utcOffsetMinutes * 60
        : utcOffsetMinutes;
    const currentOffsetMin = -date.getTimezoneOffset();
    const diffMin = offsetMin - currentOffsetMin;
    return new Date(date.getTime() + diffMin * 60 * 1000);
  }

  return new Date(date.getTime());
}
