// Primary Modal Component (Drop-in replacement for react-native-modal-datetime-picker)
import { DateTimePickerModal } from './components/DateTimePickerModal';

export { DateTimePickerModal } from './components/DateTimePickerModal';
export default DateTimePickerModal;

// Core Components
export {
  DateTimePicker,
  openDateTimePickerModal,
} from './components/DateTimePicker';

export {
  DatePicker,
  type DatePickerProps,
  type DatePickerRef,
} from './components/DatePicker';

export {
  TimePicker,
  type TimePickerProps,
  type TimePickerRef,
} from './components/TimePicker';

// Custom Hooks
export {
  useDateTimePicker,
  type UseDateTimePickerResult,
} from './hooks/useDateTimePicker';

// Native Bridge & TurboModule
export { NativeDateTimePicker } from './native/NativeDateTimePicker';

// Error System
export {
  DateTimePickerError,
  type DateTimePickerErrorCode,
} from './errors/DateTimePickerError';

// Types & Utilities
export * from './types';
export * from './utils';
