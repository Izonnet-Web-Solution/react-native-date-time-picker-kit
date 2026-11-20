import { padZero } from './dateConversion';

const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_NAMES_SHORT_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAY_NAMES_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const DAY_NAMES_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLocaleMonthName(
  date: Date,
  style: 'long' | 'short',
  locale?: string
): string {
  try {
    return new Intl.DateTimeFormat(locale || 'en-US', {
      month: style,
    }).format(date);
  } catch {
    const month = date.getMonth();
    return style === 'long'
      ? (MONTH_NAMES_EN[month] as string)
      : (MONTH_NAMES_SHORT_EN[month] as string);
  }
}

function getLocaleWeekdayName(
  date: Date,
  style: 'long' | 'short',
  locale?: string
): string {
  try {
    return new Intl.DateTimeFormat(locale || 'en-US', {
      weekday: style,
    }).format(date);
  } catch {
    const day = date.getDay();
    return style === 'long'
      ? (DAY_NAMES_EN[day] as string)
      : (DAY_NAMES_SHORT_EN[day] as string);
  }
}

/**
 * Formats a Date object according to a format string pattern.
 * Tokens supported:
 * YYYY, YY, MMMM, MMM, MM, M, DD, D, dddd, ddd, HH, H, hh, h, mm, m, ss, s, A, a
 */
export function formatDate(
  date: Date,
  formatStr: string,
  locale?: string
): string {
  if (!date || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const dayOfMonth = date.getDate();
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const isPM = hours24 >= 12;

  return formatStr.replace(
    /(\[[^\]]*\]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|A|a)/g,
    (match) => {
      // Escaped text in brackets [text]
      if (match.startsWith('[') && match.endsWith(']')) {
        return match.slice(1, -1);
      }

      switch (match) {
        case 'YYYY':
          return year.toString();
        case 'YY':
          return year.toString().slice(-2);
        case 'MMMM':
          return getLocaleMonthName(date, 'long', locale);
        case 'MMM':
          return getLocaleMonthName(date, 'short', locale);
        case 'MM':
          return padZero(month + 1);
        case 'M':
          return (month + 1).toString();
        case 'DD':
          return padZero(dayOfMonth);
        case 'D':
          return dayOfMonth.toString();
        case 'dddd':
          return getLocaleWeekdayName(date, 'long', locale);
        case 'ddd':
          return getLocaleWeekdayName(date, 'short', locale);
        case 'HH':
          return padZero(hours24);
        case 'H':
          return hours24.toString();
        case 'hh':
          return padZero(hours12);
        case 'h':
          return hours12.toString();
        case 'mm':
          return padZero(minutes);
        case 'm':
          return minutes.toString();
        case 'ss':
          return padZero(seconds);
        case 's':
          return seconds.toString();
        case 'A':
          return isPM ? 'PM' : 'AM';
        case 'a':
          return isPM ? 'pm' : 'am';
        default:
          return match;
      }
    }
  );
}

export function formatTime(
  hourOrDate: number | Date,
  minuteOrIs24Hour?: number | boolean | '12h' | '24h',
  is24Hour = false
): string {
  if (hourOrDate instanceof Date) {
    const is24 =
      minuteOrIs24Hour === true ||
      minuteOrIs24Hour === '24h' ||
      (typeof minuteOrIs24Hour !== 'boolean' &&
        minuteOrIs24Hour !== '12h' &&
        is24Hour);
    return formatDate(hourOrDate, is24 ? 'HH:mm' : 'hh:mm A');
  }
  const hour = hourOrDate;
  const minute = typeof minuteOrIs24Hour === 'number' ? minuteOrIs24Hour : 0;
  const is24 =
    typeof minuteOrIs24Hour === 'boolean'
      ? minuteOrIs24Hour
      : minuteOrIs24Hour === '24h'
        ? true
        : is24Hour;
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return formatDate(d, is24 ? 'HH:mm' : 'hh:mm A');
}

export function formatLocalized(
  date: Date,
  formatStr: string = 'YYYY-MM-DD',
  locale?: string
): string {
  return formatDate(date, formatStr, locale);
}
