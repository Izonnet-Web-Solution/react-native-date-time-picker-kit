import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import React, { createRef } from 'react';
import {
  DateTimePickerModal,
  DateTimePicker,
  type DateTimePickerRef,
  openDateTimePickerModal,
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

describe('DateTimePickerModal - Functional & TypeScript API Reference Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Drop-in Component API (react-native-modal-datetime-picker compatibility)', () => {
    it('creates DateTimePickerModal element with isVisible and mode="date"', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      const element = React.createElement(DateTimePickerModal, {
        isVisible: true,
        mode: 'date',
        onConfirm,
        onCancel,
      });

      expect(element).toBeDefined();
      expect(element.props.isVisible).toBe(true);
      expect(element.props.mode).toBe('date');
      expect(element.props.onConfirm).toBe(onConfirm);
      expect(element.props.onCancel).toBe(onCancel);
    });

    it('accepts date prop as initial Date', () => {
      const initial = new Date(2026, 5, 20, 10, 30);
      const element = React.createElement(DateTimePickerModal, {
        isVisible: false,
        date: initial,
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
      });

      expect(element.props.date).toBe(initial);
    });

    it('accepts onHide callback with isConfirmed and date parameters', () => {
      const onHide = jest.fn();
      const element = React.createElement(DateTimePickerModal, {
        isVisible: false,
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
        onHide,
      });

      expect(element.props.onHide).toBe(onHide);
    });

    it('accepts iOS specific styling props', () => {
      const element = React.createElement(DateTimePickerModal, {
        isVisible: false,
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
        confirmTextIOS: 'Select',
        cancelTextIOS: 'Dismiss',
        accentColorIOS: '#007AFF',
        buttonTextColorIOS: '#007AFF',
        isDarkModeEnabled: true,
      });

      expect(element.props.confirmTextIOS).toBe('Select');
      expect(element.props.cancelTextIOS).toBe('Dismiss');
      expect(element.props.accentColorIOS).toBe('#007AFF');
      expect(element.props.buttonTextColorIOS).toBe('#007AFF');
      expect(element.props.isDarkModeEnabled).toBe(true);
    });

    it('accepts accessibility props', () => {
      const element = React.createElement(DateTimePickerModal, {
        isVisible: false,
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
        accessible: true,
        accessibilityLabel: 'Flight Departure Date Picker',
        accessibilityHint: 'Double tap to select departure date',
      });

      expect(element.props.accessible).toBe(true);
      expect(element.props.accessibilityLabel).toBe(
        'Flight Departure Date Picker'
      );
      expect(element.props.accessibilityHint).toBe(
        'Double tap to select departure date'
      );
    });
  });

  describe('Imperative openDateTimePickerModal execution & callbacks', () => {
    it('resolves confirmed date and triggers onConfirm, onChange, and onHide(true, date)', async () => {
      const targetDate = new Date(2026, 6, 15, 14, 0);
      (NativeDateTimePicker.openDatePicker as any).mockResolvedValue({
        action: 'confirmed',
        timestamp: targetDate.getTime(),
      });

      const onConfirm = jest.fn();
      const onChange = jest.fn();
      const onHide = jest.fn();

      const result = await openDateTimePickerModal({
        mode: 'date',
        date: new Date(2026, 0, 1),
        onConfirm,
        onChange,
        onHide,
      });

      expect(result).not.toBeNull();
      expect(result?.getTime()).toBe(targetDate.getTime());
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith(expect.any(Date));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onHide).toHaveBeenCalledTimes(1);
      expect(onHide).toHaveBeenCalledWith(true, expect.any(Date));
    });

    it('triggers onCancel and onHide(false, undefined) when cancelled', async () => {
      (NativeDateTimePicker.openDatePicker as any).mockResolvedValue({
        action: 'cancelled',
        timestamp: Date.now(),
      });

      const onCancel = jest.fn();
      const onHide = jest.fn();

      const result = await openDateTimePickerModal({
        mode: 'date',
        onCancel,
        onHide,
      });

      expect(result).toBeNull();
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onHide).toHaveBeenCalledTimes(1);
      expect(onHide).toHaveBeenCalledWith(false, undefined);
    });

    it('triggers onDismiss and onHide(false, undefined) when dialog is dismissed without confirmation', async () => {
      (NativeDateTimePicker.openDatePicker as any).mockResolvedValue({
        action: 'dismissed',
        timestamp: Date.now(),
      });

      const onDismiss = jest.fn();
      const onHide = jest.fn();

      const result = await openDateTimePickerModal({
        mode: 'date',
        onDismiss,
        onHide,
      });

      expect(result).toBeNull();
      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(onHide).toHaveBeenCalledTimes(1);
      expect(onHide).toHaveBeenCalledWith(false, undefined);
    });

    it('maps confirmTextIOS and cancelTextIOS to native options', async () => {
      (NativeDateTimePicker.openDatePicker as any).mockResolvedValue({
        action: 'confirmed',
        timestamp: Date.now(),
      });

      await openDateTimePickerModal({
        confirmTextIOS: 'Done',
        cancelTextIOS: 'Back',
        accentColorIOS: '#FF3B30',
        buttonTextColorIOS: '#FF3B30',
        isDarkModeEnabled: true,
      });

      expect(NativeDateTimePicker.openDatePicker).toHaveBeenCalledWith(
        expect.objectContaining({
          confirmText: 'Done',
          confirmTextIOS: 'Done',
          cancelText: 'Back',
          cancelTextIOS: 'Back',
          accentColor: '#FF3B30',
          accentColorIOS: '#FF3B30',
          buttonTextColor: '#FF3B30',
          buttonTextColorIOS: '#FF3B30',
          isDarkModeEnabled: true,
          theme: 'dark',
        })
      );
    });

    it('supports time mode routing to openTimePicker', async () => {
      const targetDate = new Date(2026, 4, 1, 9, 30);
      (NativeDateTimePicker.openTimePicker as any).mockResolvedValue({
        action: 'confirmed',
        timestamp: targetDate.getTime(),
      });

      const onConfirm = jest.fn();
      const result = await openDateTimePickerModal({
        mode: 'time',
        is24Hour: true,
        minuteInterval: 15,
        onConfirm,
      });

      expect(NativeDateTimePicker.openTimePicker).toHaveBeenCalledWith(
        expect.objectContaining({
          is24Hour: true,
          minuteInterval: 15,
        })
      );
      expect(result?.getTime()).toBe(targetDate.getTime());
      expect(onConfirm).toHaveBeenCalled();
    });

    it('supports datetime mode routing to openDateTimePicker', async () => {
      const targetDate = new Date(2026, 4, 1, 16, 45);
      (NativeDateTimePicker.openDateTimePicker as any).mockResolvedValue({
        action: 'confirmed',
        timestamp: targetDate.getTime(),
      });

      const onConfirm = jest.fn();
      const result = await openDateTimePickerModal({
        mode: 'datetime',
        onConfirm,
      });

      expect(NativeDateTimePicker.openDateTimePicker).toHaveBeenCalled();
      expect(result?.getTime()).toBe(targetDate.getTime());
    });
  });

  describe('Ref Contract & Imperative Methods', () => {
    it('creates ref with all imperative methods', () => {
      const ref = createRef<DateTimePickerRef>();
      React.createElement(DateTimePicker, {
        ref,
        mode: 'date',
      });

      expect(ref).toBeDefined();
    });
  });
});
