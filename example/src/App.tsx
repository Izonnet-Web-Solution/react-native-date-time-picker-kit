import { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from '@izonnet-web-solution/react-native-date-time-modal';

export default function App() {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isDateTimePickerVisible, setDateTimePickerVisibility] =
    useState(false);

  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [pickedTime, setPickedTime] = useState<string | null>(null);
  const [pickedDateTime, setPickedDateTime] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const isIOS = Platform.OS === 'ios';

  const dateLabel = isIOS ? 'Show Date Picker' : 'Show "date" picker';
  const timeLabel = isIOS ? 'Show Time Picker' : 'Show "time" picker';
  const dateTimeLabel = isIOS
    ? 'Show DateTime Picker'
    : 'Show "datetime" picker';

  // Date Picker Handlers
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    hideDatePicker();
    const formatted = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    setPickedDate(formatted);
    setLastAction(`A date has been picked: ${formatted}`);
    console.log('A date has been picked: ', date);
  };

  // Time Picker Handlers
  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirmTime = (time: Date) => {
    hideTimePicker();
    const formatted = time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    setPickedTime(formatted);
    setLastAction(`A time has been picked: ${formatted}`);
    console.log('A time has been picked: ', time);
  };

  // DateTime Picker Handlers
  const showDateTimePicker = () => {
    setDateTimePickerVisibility(true);
  };

  const hideDateTimePicker = () => {
    setDateTimePickerVisibility(false);
  };

  const handleConfirmDateTime = (dateTime: Date) => {
    hideDateTimePicker();
    const formatted = dateTime.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    setPickedDateTime(formatted);
    setLastAction(`A date-time has been picked: ${formatted}`);
    console.log('A date-time has been picked: ', dateTime);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Centered Action Buttons matching reference UI */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.7}
            onPress={showDatePicker}
            accessibilityRole="button"
            accessibilityLabel={dateLabel}
          >
            <Text style={styles.buttonText}>{dateLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.7}
            onPress={showTimePicker}
            accessibilityRole="button"
            accessibilityLabel={timeLabel}
          >
            <Text style={styles.buttonText}>{timeLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.7}
            onPress={showDateTimePicker}
            accessibilityRole="button"
            accessibilityLabel={dateTimeLabel}
          >
            <Text style={styles.buttonText}>{dateTimeLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* Output Section displaying selected results */}
        <View style={styles.outputContainer}>
          {pickedDate ? (
            <View style={styles.outputRow}>
              <Text style={styles.outputLabel}>Picked Date:</Text>
              <Text style={styles.outputValue}>{pickedDate}</Text>
            </View>
          ) : null}

          {pickedTime ? (
            <View style={styles.outputRow}>
              <Text style={styles.outputLabel}>Picked Time:</Text>
              <Text style={styles.outputValue}>{pickedTime}</Text>
            </View>
          ) : null}

          {pickedDateTime ? (
            <View style={styles.outputRow}>
              <Text style={styles.outputLabel}>Picked DateTime:</Text>
              <Text style={styles.outputValue}>{pickedDateTime}</Text>
            </View>
          ) : null}

          {lastAction ? (
            <Text style={styles.statusMessage}>{lastAction}</Text>
          ) : null}
        </View>
      </View>

      {/* Modal Pickers */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        onHide={(confirmed, _date) => {
          if (!confirmed) {
            setLastAction('Date picker cancelled');
          }
        }}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={hideTimePicker}
        onHide={(confirmed, _date) => {
          if (!confirmed) {
            setLastAction('Time picker cancelled');
          }
        }}
      />

      <DateTimePickerModal
        isVisible={isDateTimePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmDateTime}
        onCancel={hideDateTimePicker}
        onHide={(confirmed, _date) => {
          if (!confirmed) {
            setLastAction('DateTime picker cancelled');
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
  outputContainer: {
    marginTop: 40,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  outputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  outputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginRight: 6,
  },
  outputValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#007AFF',
  },
  statusMessage: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
