import { describe, expect, it } from '@jest/globals';
import type {
  DateTimePickerModalProps,
  DateTimePickerProps,
  ModalDateTimePickerProps,
  PickerMode,
  PickerDisplay,
  PickerTheme,
  PickerAction,
  MinuteInterval,
  DateTimePickerConfirmEvent,
  DateTimePickerCancelEvent,
  DateTimePickerChangeEvent,
  DateTimePickerHideEvent,
  DateTimePickerRef,
  DatePickerProps,
  TimePickerProps,
} from '../src';

// Compile-time type assertions helper
type AssertExtends<T, Expected> = T extends Expected ? true : false;
type AssertEqual<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false;

describe('TypeScript Compile-Time & Type Definition Suite', () => {
  it('verifies PickerMode union options', () => {
    const validModes: PickerMode[] = ['date', 'time', 'datetime', 'countdown'];
    expect(validModes.length).toBe(4);

    type ModeCheck = AssertEqual<
      PickerMode,
      'date' | 'time' | 'datetime' | 'countdown'
    >;
    const isModeValid: ModeCheck = true;
    expect(isModeValid).toBe(true);
  });

  it('verifies PickerDisplay union options', () => {
    const validDisplays: PickerDisplay[] = [
      'default',
      'spinner',
      'compact',
      'inline',
      'calendar',
      'clock',
    ];
    expect(validDisplays.length).toBe(6);
  });

  it('verifies PickerAction union options', () => {
    const validActions: PickerAction[] = [
      'confirmed',
      'cancelled',
      'dismissed',
    ];
    expect(validActions.length).toBe(3);
  });

  it('verifies PickerTheme union options', () => {
    const validThemes: PickerTheme[] = ['light', 'dark', 'auto'];
    expect(validThemes.length).toBe(3);
  });

  it('verifies MinuteInterval union values', () => {
    const validIntervals: MinuteInterval[] = [
      1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30,
    ];
    expect(validIntervals.length).toBe(11);
  });

  it('verifies DateTimePickerModalProps contract against reference API', () => {
    type ModalPropsCompatible = AssertExtends<
      {
        isVisible?: boolean;
        date?: Date;
        mode?: 'date' | 'time' | 'datetime';
        onConfirm: (date: Date) => void;
        onCancel: () => void;
        onHide?: (isConfirmed: boolean, date?: Date) => void;
        confirmTextIOS?: string;
        cancelTextIOS?: string;
        isDarkModeEnabled?: boolean;
      },
      DateTimePickerModalProps
    >;
    const isCompatible: ModalPropsCompatible = true;
    expect(isCompatible).toBe(true);

    type AliasCheck = AssertEqual<
      ModalDateTimePickerProps,
      DateTimePickerModalProps
    >;
    const isAliasMatch: AliasCheck = true;
    expect(isAliasMatch).toBe(true);
  });

  it('verifies callback signatures', () => {
    const onConfirm: DateTimePickerConfirmEvent = (date: Date) => {
      expect(date).toBeInstanceOf(Date);
    };
    onConfirm(new Date());

    const onCancel: DateTimePickerCancelEvent = () => {};
    expect(typeof onCancel).toBe('function');

    const onChange: DateTimePickerChangeEvent = (date: Date) => {
      expect(date).toBeInstanceOf(Date);
    };
    onChange(new Date());

    const onHide: DateTimePickerHideEvent = (
      isConfirmed: boolean,
      _date?: Date
    ) => {
      expect(typeof isConfirmed).toBe('boolean');
    };
    onHide(true, new Date());
  });

  it('verifies all component prop shapes', () => {
    const modalProps: DateTimePickerModalProps = {
      isVisible: true,
      mode: 'date',
      date: new Date(),
      onConfirm: () => {},
      onCancel: () => {},
      onHide: () => {},
      confirmTextIOS: 'Done',
      cancelTextIOS: 'Close',
      accentColorIOS: '#007AFF',
      buttonTextColorIOS: '#007AFF',
      isDarkModeEnabled: false,
    };
    expect(modalProps.isVisible).toBe(true);

    const pickerProps: DateTimePickerProps = {
      value: new Date(),
      date: new Date(),
      mode: 'datetime',
      display: 'spinner',
      minuteInterval: 15,
      timeZone: 'Asia/Kolkata',
      timeZoneOffsetInMinutes: 330,
      is24Hour: false,
      title: 'Select date and time',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(2030, 11, 31),
    };
    expect(pickerProps.mode).toBe('datetime');

    const datePickerProps: DatePickerProps = {
      date: new Date(),
      value: new Date(),
      minDate: new Date(),
      maxDate: new Date(),
      confirmTextIOS: 'Select Date',
    };
    expect(datePickerProps).toBeDefined();

    const timePickerProps: TimePickerProps = {
      date: new Date(),
      value: new Date(),
      is24Hour: true,
      minuteInterval: 5,
      confirmTextIOS: 'Select Time',
    };
    expect(timePickerProps).toBeDefined();
  });

  it('verifies DateTimePickerRef imperative methods contract', () => {
    const dummyRef: DateTimePickerRef = {
      open: async () => new Date(),
      close: async () => true,
      confirm: async () => new Date(),
      cancel: async () => true,
      reset: () => {},
      getValue: () => new Date(),
      setValue: (_d) => {},
    };

    expect(typeof dummyRef.open).toBe('function');
    expect(typeof dummyRef.close).toBe('function');
    expect(typeof dummyRef.confirm).toBe('function');
    expect(typeof dummyRef.cancel).toBe('function');
    expect(typeof dummyRef.reset).toBe('function');
    expect(typeof dummyRef.getValue).toBe('function');
    expect(typeof dummyRef.setValue).toBe('function');
  });
});
