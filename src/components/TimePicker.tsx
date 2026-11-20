import { forwardRef } from 'react';
import type { DateTimePickerProps, DateTimePickerRef } from '../types';
import { DateTimePicker } from './DateTimePicker';

export type TimePickerRef = DateTimePickerRef;

export interface TimePickerProps extends Omit<DateTimePickerProps, 'mode'> {
  mode?: 'time';
  /**
   * Alias for `onConfirm`.
   */
  onConfirmTime?: (date: Date) => void;
}

export const TimePicker = forwardRef<TimePickerRef, TimePickerProps>(
  ({ onConfirmTime, onConfirm, ...restProps }, ref) => {
    const handleConfirm = (date: Date) => {
      onConfirmTime?.(date);
      onConfirm?.(date);
    };

    return (
      <DateTimePicker
        ref={ref}
        mode="time"
        onConfirm={handleConfirm}
        {...restProps}
      />
    );
  }
);

TimePicker.displayName = 'TimePicker';
