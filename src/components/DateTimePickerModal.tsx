import { forwardRef } from 'react';
import type { DateTimePickerModalProps, DateTimePickerRef } from '../types';
import { DateTimePicker } from './DateTimePicker';

/**
 * `DateTimePickerModal` is a drop-in, cross-platform modal date and time picker
 * designed as a modernized, high-performance alternative to `react-native-modal-datetime-picker`.
 *
 * Built directly on top of Swift and Kotlin TurboModules for native iOS and Android dialogs,
 * with zero external picker runtime dependencies.
 *
 * @example
 * ```tsx
 * import DateTimePickerModal from '@izonnet-web-solution/react-native-date-time-modal';
 *
 * export default function Example() {
 *   const [isPickerVisible, setPickerVisibility] = useState(false);
 *
 *   const showDatePicker = () => setPickerVisibility(true);
 *   const hideDatePicker = () => setPickerVisibility(false);
 *
 *   const handleConfirm = (date: Date) => {
 *     console.warn("A date has been picked: ", date);
 *     hideDatePicker();
 *   };
 *
 *   return (
 *     <View>
 *       <Button title="Show Date Picker" onPress={showDatePicker} />
 *       <DateTimePickerModal
 *         isVisible={isPickerVisible}
 *         mode="date"
 *         onConfirm={handleConfirm}
 *         onCancel={hideDatePicker}
 *         onHide={(isConfirmed, date) => console.log('Hidden:', isConfirmed, date)}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */
export const DateTimePickerModal = forwardRef<
  DateTimePickerRef,
  DateTimePickerModalProps
>((props, ref) => {
  const { presentation = 'native', ...restProps } = props;

  return (
    <DateTimePicker ref={ref} presentation={presentation} {...restProps} />
  );
});

DateTimePickerModal.displayName = 'DateTimePickerModal';

export default DateTimePickerModal;
