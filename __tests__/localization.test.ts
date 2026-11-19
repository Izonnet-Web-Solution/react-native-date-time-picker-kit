import { describe, expect, it } from '@jest/globals';
import {
  enLocale,
  formatLocalized,
  guLocale,
  hiLocale,
  resolveLocale,
} from '../src/localization';

describe('Localization System', () => {
  it('resolves built-in English locale by default', () => {
    const loc = resolveLocale('en');
    expect(loc.code).toBe('en');
    expect(loc.isRTL).toBe(false);
    expect(loc.months[0]).toBe('January');
    expect(loc.weekdays[0]).toBe('Sunday');
  });

  it('resolves built-in Hindi locale', () => {
    const loc = resolveLocale('hi');
    expect(loc.code).toBe('hi');
    expect(loc.months[0]).toBe('जनवरी');
    expect(loc.weekdays[0]).toBe('रविवार');
    expect(loc.confirmText).toBe('पुष्टि करें');
  });

  it('resolves built-in Gujarati locale', () => {
    const loc = resolveLocale('gu');
    expect(loc.code).toBe('gu');
    expect(loc.months[0]).toBe('જાન્યુઆરી');
    expect(loc.weekdays[0]).toBe('રવિવાર');
    expect(loc.confirmText).toBe('ખાતરી કરો');
  });

  it('resolves Arabic locale with RTL flag', () => {
    const loc = resolveLocale('ar');
    expect(loc.code).toBe('ar');
    expect(loc.isRTL).toBe(true);
    expect(loc.firstDayOfWeek).toBe(6); // Saturday
  });

  it('formats dates accurately with formatLocalized in English', () => {
    const date = new Date(2026, 10, 19, 14, 30); // 19 Nov 2026 2:30 PM (Thursday)
    const formatted = formatLocalized(
      date,
      'YYYY-MM-DD dddd hh:mm A',
      enLocale
    );
    expect(formatted).toBe('2026-11-19 Thursday 02:30 PM');
  });

  it('formats dates accurately with formatLocalized in Hindi', () => {
    const date = new Date(2026, 10, 19, 14, 30);
    const formatted = formatLocalized(date, 'DD MMMM YYYY (dddd) A', hiLocale);
    expect(formatted).toBe('19 नवंबर 2026 (गुरुवार) अपराह्न');
  });

  it('formats dates accurately with formatLocalized in Gujarati', () => {
    const date = new Date(2026, 10, 19, 9, 15);
    const formatted = formatLocalized(date, 'DD MMMM YYYY hh:mm A', guLocale);
    expect(formatted).toBe('19 નવેમ્બર 2026 09:15 સવાર');
  });

  it('supports custom locale object overrides', () => {
    const custom = resolveLocale({
      code: 'custom',
      confirmText: 'Done',
      cancelText: 'Dismiss',
    });
    expect(custom.code).toBe('custom');
    expect(custom.confirmText).toBe('Done');
    expect(custom.cancelText).toBe('Dismiss');
    expect(custom.months[0]).toBe('January'); // fallback to en
  });

  it('regression: correctly preserves escaped literal text in formatLocalized', () => {
    const date = new Date(2026, 10, 19, 14, 30);
    // Escaped brackets [at] should NOT collide with single letter 'a' token
    const formatted = formatLocalized(date, 'YYYY-MM-DD [at] HH:mm', enLocale);
    expect(formatted).toBe('2026-11-19 at 14:30');
  });
});
