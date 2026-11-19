import { describe, expect, it, jest } from '@jest/globals';
import React, { createRef } from 'react';

jest.mock('../src/native/NativeDateTimePicker', () => ({
  NativeDateTimePicker: {
    openDatePicker: jest.fn(),
    openTimePicker: jest.fn(),
    openDateTimePicker: jest.fn(),
    openCountdownPicker: jest.fn(),
    closePicker: jest.fn(),
    confirmPicker: jest.fn(),
    cancelPicker: jest.fn(),
    setSelectedDate: jest.fn(),
    getSelectedDate: jest.fn(),
    resetPicker: jest.fn(),
  },
}));

import {
  CalendarPicker,
  ClockPicker,
  DatePicker,
  type DatePickerRef,
  DateRangePicker,
  type DateRangePickerRef,
  MonthPicker,
  TimePicker,
  type TimePickerRef,
  TimeSlotPicker,
  WheelPicker,
  YearPicker,
} from '../src';

describe('New Public Components', () => {
  it('instantiates CalendarPicker with value and callbacks', () => {
    const testDate = new Date(2026, 10, 19);
    const onChange = jest.fn();
    const element = React.createElement(CalendarPicker, {
      value: testDate,
      onChange,
      firstDayOfWeek: 1,
      testID: 'cal-picker',
    });

    expect(element).toBeDefined();
    expect(element.props.value).toBe(testDate);
    expect(element.props.firstDayOfWeek).toBe(1);
  });

  it('instantiates MonthPicker with year and month', () => {
    const onChange = jest.fn();
    const element = React.createElement(MonthPicker, {
      value: { year: 2026, month: 10 },
      onChange,
      minYear: 2000,
      maxYear: 2030,
    });

    expect(element).toBeDefined();
    expect(element.props.value).toEqual({ year: 2026, month: 10 });
    expect(element.props.minYear).toBe(2000);
  });

  it('instantiates YearPicker with range', () => {
    const onChange = jest.fn();
    const element = React.createElement(YearPicker, {
      value: 2026,
      minYear: 1990,
      maxYear: 2050,
      onChange,
    });

    expect(element).toBeDefined();
    expect(element.props.value).toBe(2026);
  });

  it('instantiates ClockPicker in 12-hour and 24-hour modes', () => {
    const onChange = jest.fn();
    const element12 = React.createElement(ClockPicker, {
      value: { hour: 14, minute: 30 },
      is24Hour: false,
      minuteInterval: 5,
      onChange,
    });

    expect(element12).toBeDefined();
    expect(element12.props.is24Hour).toBe(false);
    expect(element12.props.minuteInterval).toBe(5);

    const element24 = React.createElement(ClockPicker, {
      value: { hour: 14, minute: 30 },
      is24Hour: true,
      onChange,
    });
    expect(element24.props.is24Hour).toBe(true);
  });

  it('instantiates WheelPicker with items and item height', () => {
    const items = [
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 2 },
    ];
    const onChange = jest.fn();
    const element = React.createElement(WheelPicker, {
      items,
      selectedValue: 1,
      itemHeight: 48,
      visibleItems: 5,
      onChange,
    });

    expect(element).toBeDefined();
    expect(element.props.items).toHaveLength(2);
    expect(element.props.itemHeight).toBe(48);
  });

  it('instantiates TimeSlotPicker with custom slots and config', () => {
    const onSelectSlot = jest.fn();
    const element = React.createElement(TimeSlotPicker, {
      startTime: '08:00',
      endTime: '12:00',
      intervalMinutes: 15,
      disabledSlots: ['09:00', '09:15'],
      onSelectSlot,
    });

    expect(element).toBeDefined();
    expect(element.props.startTime).toBe('08:00');
    expect(element.props.intervalMinutes).toBe(15);
  });

  it('supports DatePicker imperative ref contract', () => {
    const ref = createRef<DatePickerRef>();
    const element = React.createElement(DatePicker, {
      ref,
      presentation: 'bottom-sheet',
      value: new Date(2026, 10, 19),
    });

    expect(element).toBeDefined();
    expect(ref).toBeDefined();
  });

  it('supports TimePicker imperative ref contract', () => {
    const ref = createRef<TimePickerRef>();
    const element = React.createElement(TimePicker, {
      ref,
      presentation: 'modal',
      is24Hour: true,
    });

    expect(element).toBeDefined();
    expect(ref).toBeDefined();
  });

  it('supports DateRangePicker with presets and ref contract', () => {
    const ref = createRef<DateRangePickerRef>();
    const element = React.createElement(DateRangePicker, {
      ref,
      presentation: 'bottom-sheet',
      showPresets: true,
      startDate: new Date(2026, 10, 1),
      endDate: new Date(2026, 10, 7),
    });

    expect(element).toBeDefined();
    expect(ref).toBeDefined();
  });
});
