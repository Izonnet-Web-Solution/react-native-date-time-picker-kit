import { useCallback, useRef, useState } from 'react';
import type { DateTimePickerProps, DateTimePickerRef } from '../types';
import type { DateTimePickerError } from '../errors/DateTimePickerError';
import { parseDate } from '../utils/dateConversion';

export interface UseDateTimePickerResult {
  ref: React.RefObject<DateTimePickerRef | null>;
  isOpen: boolean;
  value: Date;
  error: DateTimePickerError | null;
  open: () => Promise<Date | null>;
  close: () => Promise<boolean>;
  confirm: () => Promise<Date | null>;
  cancel: () => Promise<boolean>;
  reset: () => void;
  getValue: () => Date | null;
  setValue: (date: Date | number | string) => void;
}

export function useDateTimePicker(
  options: Partial<DateTimePickerProps> = {}
): UseDateTimePickerResult {
  const pickerRef = useRef<DateTimePickerRef>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [value, setValueState] = useState<Date>(
    () =>
      parseDate(options.date) ||
      parseDate(options.value) ||
      parseDate(options.defaultValue) ||
      new Date()
  );
  const [error, setError] = useState<DateTimePickerError | null>(null);

  const open = useCallback(async (): Promise<Date | null> => {
    setIsOpen(true);
    setError(null);
    try {
      const selected = await pickerRef.current?.open();
      if (selected) {
        setValueState(selected);
      }
      return selected ?? null;
    } catch (err) {
      setError(err as DateTimePickerError);
      return null;
    } finally {
      setIsOpen(false);
    }
  }, []);

  const close = useCallback(async (): Promise<boolean> => {
    const closed = (await pickerRef.current?.close()) ?? false;
    setIsOpen(false);
    return closed;
  }, []);

  const confirm = useCallback(async (): Promise<Date | null> => {
    const confirmed = await pickerRef.current?.confirm();
    if (confirmed) {
      setValueState(confirmed);
      setIsOpen(false);
    }
    return confirmed ?? null;
  }, []);

  const cancel = useCallback(async (): Promise<boolean> => {
    const cancelled = (await pickerRef.current?.cancel()) ?? false;
    setIsOpen(false);
    return cancelled;
  }, []);

  const reset = useCallback(() => {
    pickerRef.current?.reset();
    const resetDate = parseDate(options.defaultValue) || new Date();
    setValueState(resetDate);
  }, [options.defaultValue]);

  const getValue = useCallback((): Date | null => {
    return pickerRef.current?.getValue() ?? value;
  }, [value]);

  const setValue = useCallback((newDate: Date | number | string) => {
    pickerRef.current?.setValue(newDate);
    const parsed = parseDate(newDate);
    if (parsed) {
      setValueState(parsed);
    }
  }, []);

  return {
    ref: pickerRef,
    isOpen,
    value,
    error,
    open,
    close,
    confirm,
    cancel,
    reset,
    getValue,
    setValue,
  };
}
