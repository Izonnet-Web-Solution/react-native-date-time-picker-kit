import { useMemo } from 'react';
import { BUILTIN_LOCALES, enLocale } from './locales';
import type { LocaleData, PartialLocaleData } from './types';

export function getDeviceLocale(): string {
  try {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const resolved = Intl.DateTimeFormat().resolvedOptions().locale;
      if (resolved) {
        return resolved;
      }
    }
  } catch {
    // ignore
  }
  return 'en';
}

export function resolveLocale(
  localeInput?: string | PartialLocaleData | null
): LocaleData {
  if (!localeInput) {
    const devLocale = getDeviceLocale();
    const langCode = devLocale.split('-')[0]?.toLowerCase() || 'en';
    const base = BUILTIN_LOCALES[langCode] || enLocale;
    return { ...base, code: devLocale };
  }

  if (typeof localeInput === 'string') {
    const langCode = localeInput.split('-')[0]?.toLowerCase() || 'en';
    const base =
      BUILTIN_LOCALES[langCode] || BUILTIN_LOCALES[localeInput] || enLocale;
    return { ...base, code: localeInput };
  }

  // It's a custom PartialLocaleData object
  const langCode = localeInput.code?.split('-')[0]?.toLowerCase() || 'en';
  const base = BUILTIN_LOCALES[langCode] || enLocale;

  return {
    ...base,
    ...localeInput,
    code: localeInput.code || base.code,
    months: localeInput.months || base.months,
    monthsShort: localeInput.monthsShort || base.monthsShort,
    weekdays: localeInput.weekdays || base.weekdays,
    weekdaysShort: localeInput.weekdaysShort || base.weekdaysShort,
    weekdaysMin: localeInput.weekdaysMin || base.weekdaysMin,
  };
}

export function useLocale(
  localeInput?: string | PartialLocaleData | null
): LocaleData {
  return useMemo(() => resolveLocale(localeInput), [localeInput]);
}

/**
 * Format a Date using a format string and LocaleData
 * Tokens supported:
 * YYYY - Full year (2026)
 * YY   - 2-digit year (26)
 * MMMM - Full month name (November / नवंबर)
 * MMM  - Short month name (Nov / नव)
 * MM   - 2-digit month (01-12)
 * M    - 1-digit month (1-12)
 * DD   - 2-digit day of month (01-31)
 * D    - 1-digit day of month (1-31)
 * dddd - Full weekday name (Thursday / गुरुवार)
 * ddd  - Short weekday name (Thu / गुरु)
 * dd   - Min weekday name (Th / गु)
 * HH   - 24-hour padded (00-23)
 * H    - 24-hour unpadded (0-23)
 * hh   - 12-hour padded (01-12)
 * h    - 12-hour unpadded (1-12)
 * mm   - Minutes padded (00-59)
 * m    - Minutes unpadded (0-59)
 * ss   - Seconds padded (00-59)
 * s    - Seconds unpadded (0-59)
 * A    - Uppercase AM/PM from locale (AM / PM / पूर्वाह्न)
 * a    - Lowercase am/pm
 */
export function formatLocalized(
  date: Date,
  formatStr: string = 'YYYY-MM-DD',
  locale: LocaleData = enLocale
): string {
  if (isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0-6
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const isPM = hours24 >= 12;
  const ampm = isPM ? locale.pm : locale.am;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const replacements: Record<string, string> = {
    YYYY: String(year),
    YY: String(year).slice(-2),
    MMMM: locale.months[month] || '',
    MMM: locale.monthsShort[month] || '',
    MM: pad(month + 1),
    M: String(month + 1),
    DD: pad(day),
    D: String(day),
    dddd: locale.weekdays[dayOfWeek] || '',
    ddd: locale.weekdaysShort[dayOfWeek] || '',
    dd: locale.weekdaysMin[dayOfWeek] || '',
    HH: pad(hours24),
    H: String(hours24),
    hh: pad(hours12),
    h: String(hours12),
    mm: pad(minutes),
    m: String(minutes),
    ss: pad(seconds),
    s: String(seconds),
    A: ampm,
    a: ampm.toLowerCase(),
  };

  const regex =
    /(\[[^\]]*\]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|HH|H|hh|h|mm|m|ss|s|A|a)/g;
  return formatStr.replace(regex, (match) => {
    if (match.startsWith('[') && match.endsWith(']')) {
      return match.slice(1, -1);
    }
    return replacements[match] ?? match;
  });
}
