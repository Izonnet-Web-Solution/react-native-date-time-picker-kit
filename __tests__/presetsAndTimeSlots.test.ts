import { describe, expect, it } from '@jest/globals';
import {
  getStandardRangePresets,
  getStandardSinglePresets,
} from '../src/presets';
import { generateTimeSlots } from '../src/slots';

describe('Presets and Time Slots', () => {
  it('generates standard single date presets', () => {
    const today = new Date(2026, 10, 19);
    const presets = getStandardSinglePresets(today);

    expect(presets.length).toBe(3);
    expect(presets[0]?.id).toBe('today');
    expect(presets[1]?.id).toBe('tomorrow');

    const tomorrowVal = presets[1]?.getValue() as Date;
    expect(tomorrowVal.getDate()).toBe(20);
  });

  it('generates standard date range presets', () => {
    const today = new Date(2026, 10, 19);
    const presets = getStandardRangePresets(today);

    expect(presets.length).toBe(6);
    expect(presets.map((p) => p.id)).toEqual([
      'today',
      'yesterday',
      'last7days',
      'last30days',
      'thisMonth',
      'nextMonth',
    ]);

    const last7 = presets.find((p) => p.id === 'last7days');
    const range = last7?.getValue() as [Date, Date];
    expect(range[0].getDate()).toBe(13); // 19 - 6 = 13
    expect(range[1].getDate()).toBe(19);
  });

  it('generates appointment time slots with intervals', () => {
    const slots = generateTimeSlots({
      startTime: '09:00',
      endTime: '11:00',
      intervalMinutes: 30,
      is24Hour: false,
    });

    expect(slots.length).toBe(4);
    expect(slots[0]?.startTime).toBe('09:00');
    expect(slots[0]?.endTime).toBe('09:30');
    expect(slots[0]?.formattedStart).toBe('9:00 AM');
    expect(slots[3]?.startTime).toBe('10:30');
    expect(slots[3]?.endTime).toBe('11:00');
  });

  it('correctly disables specific time slots', () => {
    const slots = generateTimeSlots({
      startTime: '10:00',
      endTime: '12:00',
      intervalMinutes: 30,
      disabledSlots: ['10:30', '11:00'],
    });

    expect(slots.length).toBe(4);
    expect(slots[0]?.available).toBe(true);
    expect(slots[1]?.available).toBe(false); // 10:30 disabled
    expect(slots[2]?.available).toBe(false); // 11:00 disabled
    expect(slots[3]?.available).toBe(true); // 11:30 available
  });

  it('supports 24-hour formatted time slots', () => {
    const slots = generateTimeSlots({
      startTime: '14:00',
      endTime: '15:00',
      intervalMinutes: 30,
      is24Hour: true,
    });

    expect(slots.length).toBe(2);
    expect(slots[0]?.formattedStart).toBe('14:00');
    expect(slots[1]?.formattedStart).toBe('14:30');
  });
});
