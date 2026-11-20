import { forwardRef } from 'react';
import type { DateTimePickerProps, DateTimePickerRef } from '../types';
import { DateTimePicker } from './DateTimePicker';

export type DatePickerRef = DateTimePickerRef;

export interface DatePickerProps extends Omit<DateTimePickerProps, 'mode'> {
  mode?: 'date';
  /**
   * Alias for `onConfirm`.
   */
  onConfirmDate?: (date: Date) => void;
}

export const DatePicker = forwardRef<DatePickerRef, DatePickerProps>(
  ({ onConfirmDate, onConfirm, ...restProps }, ref) => {
    const handleConfirm = (date: Date) => {
      onConfirmDate?.(date);
      onConfirm?.(date);
    };

    return (
      <DateTimePicker
        ref={ref}
        mode="date"
        onConfirm={handleConfirm}
        {...restProps}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';
