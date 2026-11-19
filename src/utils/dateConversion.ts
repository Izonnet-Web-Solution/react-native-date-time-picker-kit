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
