import { describe, expect, it } from '@jest/globals';
import { formatDate, formatTime } from '../src/utils/dateFormatting';

describe('dateFormatting', () => {
  const testDate = new Date(2026, 4, 15, 14, 7, 9); // May 15, 2026 14:07:09

  it('formats YYYY and YY', () => {
    expect(formatDate(testDate, 'YYYY')).toBe('2026');
    expect(formatDate(testDate, 'YY')).toBe('26');
  });

  it('formats MM and M', () => {
    expect(formatDate(testDate, 'MM')).toBe('05');
    expect(formatDate(testDate, 'M')).toBe('5');
  });

  it('formats DD and D', () => {
    expect(formatDate(testDate, 'DD')).toBe('15');
    expect(formatDate(testDate, 'D')).toBe('15');
  });

  it('formats 24-hour HH and H', () => {
    expect(formatDate(testDate, 'HH')).toBe('14');
    expect(formatDate(testDate, 'H')).toBe('14');
  });

  it('formats 12-hour hh and h', () => {
    expect(formatDate(testDate, 'hh')).toBe('02');
    expect(formatDate(testDate, 'h')).toBe('2');
  });

  it('formats minutes mm and m', () => {
    expect(formatDate(testDate, 'mm')).toBe('07');
    expect(formatDate(testDate, 'm')).toBe('7');
  });

  it('formats seconds ss and s', () => {
    expect(formatDate(testDate, 'ss')).toBe('09');
    expect(formatDate(testDate, 's')).toBe('9');
  });

  it('formats AM/PM', () => {
    expect(formatDate(testDate, 'A')).toBe('PM');
    expect(formatDate(testDate, 'a')).toBe('pm');

    const morning = new Date(2026, 4, 15, 9, 0, 0);
    expect(formatDate(morning, 'A')).toBe('AM');
    expect(formatDate(morning, 'a')).toBe('am');
  });

  it('formats full composite string with escaped literals', () => {
    const formatted = formatDate(testDate, 'YYYY-MM-DD [at] HH:mm:ss');
    expect(formatted).toBe('2026-05-15 at 14:07:09');
  });

  it('formatTime formats 12h and 24h correctly', () => {
    expect(formatTime(14, 30, true)).toBe('14:30');
    expect(formatTime(14, 30, false)).toBe('02:30 PM');
    expect(formatTime(9, 5, false)).toBe('09:05 AM');
  });
});
