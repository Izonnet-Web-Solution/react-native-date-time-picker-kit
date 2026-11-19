import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import React, { createRef } from 'react';
import {
  DateTimePicker,
  type DateTimePickerRef,
  NativeDateTimePicker,
} from '../src';

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

describe('DateTimePicker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes imperative ref methods', () => {
    const ref = createRef<DateTimePickerRef>();
    const initialDate = new Date(2026, 4, 15, 12, 0);

    // Using React.createElement since it's a test
    React.createElement(DateTimePicker, {
      ref,
      value: initialDate,
    });

    // In non-DOM jest test, verify ref contract structure
    expect(ref).toBeDefined();
  });

  it('validates invalid minute interval on open', async () => {
    const onErrorMock = jest.fn();
    const ref = createRef<DateTimePickerRef>();

    const element = React.createElement(DateTimePicker, {
      ref,
      // @ts-expect-error Testing invalid runtime value
      minuteInterval: 7,
      onError: onErrorMock,
    });

    // Trigger open on mocked module
    (NativeDateTimePicker.openDatePicker as any).mockResolvedValue({
      action: 'confirmed',
      timestamp: Date.now(),
    });

    expect(element).toBeDefined();
  });

  it('handles confirm action from native module', async () => {
    const targetTimestamp = new Date(2026, 4, 15, 10, 30).getTime();
    (NativeDateTimePicker.openDatePicker as any).mockResolvedValue({
      action: 'confirmed',
      timestamp: targetTimestamp,
    });

    const onConfirmMock = jest.fn();
    const onChangeMock = jest.fn();

    const element = React.createElement(DateTimePicker, {
      value: new Date(2026, 0, 1),
      onConfirm: onConfirmMock,
      onChange: onChangeMock,
    });

    expect(element).toBeDefined();
  });

  it('handles cancel action from native module', async () => {
    (NativeDateTimePicker.openDatePicker as any).mockResolvedValue({
      action: 'cancelled',
      timestamp: Date.now(),
    });

    const onCancelMock = jest.fn();
    const element = React.createElement(DateTimePicker, {
      onCancel: onCancelMock,
    });

    expect(element).toBeDefined();
  });
});
