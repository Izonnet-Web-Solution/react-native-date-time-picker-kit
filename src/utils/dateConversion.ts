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

function parseTimeComponents(
  val: unknown
): { hour: number; minute: number; second?: number } | null {
  if (!val) return null;
  if (typeof val === 'string') {
    const match = val.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (match && match[1] && match[2]) {
      return {
        hour: parseInt(match[1], 10),
        minute: parseInt(match[2], 10),
        second: match[3] ? parseInt(match[3], 10) : 0,
      };
    }
  }
  if (
    typeof val === 'object' &&
    val !== null &&
    'hour' in val &&
    'minute' in val
  ) {
    const obj = val as any;
    return {
      hour: Number(obj.hour),
      minute: Number(obj.minute),
      second: obj.second !== undefined ? Number(obj.second) : 0,
    };
  }
  const parsedDate = parseDate(val);
  if (parsedDate) {
    return {
      hour: parsedDate.getHours(),
      minute: parsedDate.getMinutes(),
      second: parsedDate.getSeconds(),
    };
  }
  return null;
}

/**
 * Dynamically clamps a date's time components (hour, minute) if date falls on the
 * same calendar day as minimumDate or maximumDate, or against min/max time strings.
 */
export function clampTime(
  date: Date,
  minTime?: unknown,
  maxTime?: unknown
): Date {
  const result = new Date(date.getTime());
  const dateStr = serializeDateOnly(result);

  if (minTime !== undefined && minTime !== null) {
    const minParsed = parseDate(minTime);
    if (minParsed && typeof minTime !== 'string') {
      if (serializeDateOnly(minParsed) === dateStr) {
        if (result.getHours() < minParsed.getHours()) {
          result.setHours(
            minParsed.getHours(),
            minParsed.getMinutes(),
            minParsed.getSeconds()
          );
        } else if (
          result.getHours() === minParsed.getHours() &&
          result.getMinutes() < minParsed.getMinutes()
        ) {
          result.setMinutes(minParsed.getMinutes(), minParsed.getSeconds());
        }
      }
    } else {
      const minComp = parseTimeComponents(minTime);
      if (minComp) {
        if (result.getHours() < minComp.hour) {
          result.setHours(minComp.hour, minComp.minute, minComp.second ?? 0);
        } else if (
          result.getHours() === minComp.hour &&
          result.getMinutes() < minComp.minute
        ) {
          result.setMinutes(minComp.minute, minComp.second ?? 0);
        }
      }
    }
  }

  if (maxTime !== undefined && maxTime !== null) {
    const maxParsed = parseDate(maxTime);
    if (maxParsed && typeof maxTime !== 'string') {
      if (serializeDateOnly(maxParsed) === dateStr) {
        if (result.getHours() > maxParsed.getHours()) {
          result.setHours(
            maxParsed.getHours(),
            maxParsed.getMinutes(),
            maxParsed.getSeconds()
          );
        } else if (
          result.getHours() === maxParsed.getHours() &&
          result.getMinutes() > maxParsed.getMinutes()
        ) {
          result.setMinutes(maxParsed.getMinutes(), maxParsed.getSeconds());
        }
      }
    } else {
      const maxComp = parseTimeComponents(maxTime);
      if (maxComp) {
        if (result.getHours() > maxComp.hour) {
          result.setHours(maxComp.hour, maxComp.minute, maxComp.second ?? 0);
        } else if (
          result.getHours() === maxComp.hour &&
          result.getMinutes() > maxComp.minute
        ) {
          result.setMinutes(maxComp.minute, maxComp.second ?? 0);
        }
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
