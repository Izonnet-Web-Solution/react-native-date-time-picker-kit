export type DateTimePickerErrorCode =
  | 'NATIVE_MODULE_NOT_FOUND'
  | 'PICKER_ALREADY_OPEN'
  | 'PICKER_NOT_OPEN'
  | 'INVALID_DATE'
  | 'INVALID_MODE'
  | 'INVALID_MINUTE_INTERVAL'
  | 'DATE_OUT_OF_RANGE'
  | 'UNSUPPORTED_FEATURE'
  | 'ACTIVITY_UNAVAILABLE'
  | 'PRESENTATION_FAILED'
  | 'UNKNOWN_ERROR';

export class DateTimePickerError extends Error {
  readonly code: DateTimePickerErrorCode;
  readonly details?: unknown;

  constructor(
    code: DateTimePickerErrorCode,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'DateTimePickerError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, DateTimePickerError.prototype);
  }
}
