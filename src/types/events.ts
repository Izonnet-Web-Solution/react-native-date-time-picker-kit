import type { DateTimePickerError } from '../errors/DateTimePickerError';

export type DateTimePickerChangeEvent = (date: Date) => void;
export type DateTimePickerConfirmEvent = (date: Date) => void;
export type DateTimePickerCancelEvent = () => void;
export type DateTimePickerDismissEvent = () => void;
export type DateTimePickerOpenEvent = () => void;
export type DateTimePickerErrorEvent = (error: DateTimePickerError) => void;
