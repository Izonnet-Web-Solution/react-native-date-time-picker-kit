# @izonnet-web-solution/react-native-date-time-modal

A high-performance, production-ready, strongly typed cross-platform date and time picker library for React Native. Engineered as a modern, zero-dependency, fully native drop-in replacement for `react-native-modal-datetime-picker`.

Powered by native Swift on iOS (`UIDatePicker` in an ActionSheet two-card layout) and native Kotlin on Android (`DatePickerDialog` and `TimePickerDialog`), seamlessly communicating through React Native TurboModules and Codegen.

[![npm version](https://img.shields.io/npm/v/@izonnet-web-solution/react-native-date-time-modal.svg)](https://www.npmjs.com/package/@izonnet-web-solution/react-native-date-time-modal)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Zero Runtime Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](https://www.npmjs.com/package/@izonnet-web-solution/react-native-date-time-modal)
[![Architecture: TurboModule](https://img.shields.io/badge/Architecture-New%20Architecture%20%2F%20TurboModule-purple.svg)](https://reactnative.dev/docs/the-new-architecture/landing-page)

---

## 🌟 Key Features

- **100% Fully Native**: Swift on iOS and Kotlin on Android. No web views, no external JS date libraries.
- **Zero Third-Party Dependencies**: Works directly with native OS dialogs.
- **Drop-in Replacement for `react-native-modal-datetime-picker`**: Same component names, props (`isVisible`, `date`, `mode`, `onConfirm`, `onCancel`, `onHide`, `confirmTextIOS`, `cancelTextIOS`, etc.).
- **Native iOS Modal UI**: Standard iOS ActionSheet appearance featuring two separate floating rounded cards (Top card: UIDatePicker wheels spinner + hairline divider + full-width Confirm button; Bottom card: full-width Cancel button) with smooth slide-up animation and dimmed backdrop overlay.
- **Native Android Dialog UI**: Material `DatePickerDialog` and `TimePickerDialog` with 12/24-hour support, dark theme, and boundary safety.
- **Modes Supported**: `'date'`, `'time'`, `'datetime'`, and `'countdown'` (iOS).
- **Comprehensive Callbacks**: `onConfirm`, `onCancel`, `onHide`, `onChange`, `onDismiss`, `onOpen`, and `onError`.
- **Imperative & Declarative**: Use declaratively via `<DateTimePickerModal isVisible={...} />` or imperatively via `openDateTimePickerModal({ ... })` or `useDateTimePicker()`.

---

## 📦 Installation

```bash
# npm
npm install @izonnet-web-solution/react-native-date-time-modal

# yarn
yarn add @izonnet-web-solution/react-native-date-time-modal

# pnpm
pnpm add @izonnet-web-solution/react-native-date-time-modal
```

### iOS Setup

Install CocoaPods dependencies:

```bash
cd ios && pod install && cd ..
```

### Android Setup

No additional setup is required. The library auto-links via the React Native Gradle plugin.

---

## 🚀 Quick Start

### Drop-in Replacement (`DateTimePickerModal`)

```tsx
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import DateTimePickerModal from '@izonnet-web-solution/react-native-date-time-modal';

export default function App() {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    setSelectedDate(date.toLocaleDateString());
    hideDatePicker();
  };

  return (
    <View style={styles.container}>
      <Button title="Show Date Picker" onPress={showDatePicker} />
      {selectedDate && (
        <Text style={styles.output}>A date has been picked: {selectedDate}</Text>
      )}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        onHide={(isConfirmed, date) => {
          console.log('Dialog hidden. Confirmed:', isConfirmed, date);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  output: {
    marginTop: 20,
    fontSize: 16,
    color: '#007AFF',
  },
});
```

---

## 🔄 Migration Guide from `react-native-modal-datetime-picker`

Migrating is a 1-line import change:

```diff
- import DateTimePickerModal from 'react-native-modal-datetime-picker';
+ import DateTimePickerModal from '@izonnet-web-solution/react-native-date-time-modal';
```

All standard props and callbacks are identical:

| Prop / Callback | `react-native-modal-datetime-picker` | `@izonnet-web-solution/react-native-date-time-modal` |
| :--- | :---: | :---: |
| `isVisible` | ✅ Supported | ✅ Supported |
| `date` / `value` | ✅ Supported | ✅ Supported |
| `mode` (`'date'`, `'time'`, `'datetime'`) | ✅ Supported | ✅ Supported |
| `onConfirm: (date: Date) => void` | ✅ Supported | ✅ Supported |
| `onCancel: () => void` | ✅ Supported | ✅ Supported |
| `onHide: (isConfirmed: boolean, date?: Date) => void` | ✅ Supported | ✅ Supported |
| `confirmTextIOS` | ✅ Supported | ✅ Supported |
| `cancelTextIOS` | ✅ Supported | ✅ Supported |
| `buttonTextColorIOS` | ✅ Supported | ✅ Supported |
| `accentColorIOS` | ✅ Supported | ✅ Supported |
| `isDarkModeEnabled` | ✅ Supported | ✅ Supported |
| `minimumDate` / `maximumDate` | ✅ Supported | ✅ Supported |
| `minuteInterval` | ✅ Supported | ✅ Supported |
| `timeZoneOffsetInMinutes` | ✅ Supported | ✅ Supported |
| `is24Hour` | ✅ Supported | ✅ Supported |

---

## 📖 API Reference

### Exported Components

- `DateTimePickerModal` (default and named export): The drop-in modal date/time picker.
- `DateTimePicker`: Core unified component.
- `DatePicker`: Convenience wrapper with `mode="date"`.
- `TimePicker`: Convenience wrapper with `mode="time"`.

### Imperative Methods & Hooks

- `openDateTimePickerModal(options)`: Open the modal imperatively via async Promise.
- `useDateTimePicker(options)`: React hook managing picker state, visibility, and value.
- `NativeDateTimePicker`: Direct TurboModule bridge methods (`openDatePicker`, `openTimePicker`, `openDateTimePicker`, `openCountdownPicker`, `closePicker`, `confirmPicker`, `cancelPicker`).

---

## 📋 Props Table

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `isVisible` | `boolean` | `false` | Controls whether the picker modal is visible. |
| `date` | `Date \| number \| string` | `new Date()` | The selected or initial date value. |
| `mode` | `'date' \| 'time' \| 'datetime' \| 'countdown'` | `'date'` | Selection mode. |
| `onConfirm` | `(date: Date) => void` | Required | Callback called when the user confirms their selection. |
| `onCancel` | `() => void` | Required | Callback called when the user cancels. |
| `onHide` | `(confirmed: boolean, date?: Date) => void` | Optional | Called when modal is completely hidden. |
| `onChange` | `(date: Date) => void` | Optional | Called when intermediate date value changes. |
| `minimumDate` | `Date \| number \| string` | `undefined` | Minimum selectable date boundary. |
| `maximumDate` | `Date \| number \| string` | `undefined` | Maximum selectable date boundary. |
| `display` | `'default' \| 'spinner' \| 'compact' \| 'inline'` | `'default'` | Display presentation style. |
| `minuteInterval` | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 10 \| 12 \| 15 \| 20 \| 30` | `1` | Minute step interval. |
| `timeZoneOffsetInMinutes` | `number` | `undefined` | Timezone offset in minutes relative to GMT/UTC. |
| `is24Hour` | `boolean` | `false` | Force 24-hour time representation on Android. |
| `isDarkModeEnabled` | `boolean` | `undefined` | Explicitly enforce dark or light appearance. |
| `confirmTextIOS` | `string` | `'Confirm'` | Label for the iOS confirmation button. |
| `cancelTextIOS` | `string` | `'Cancel'` | Label for the iOS cancel button. |
| `buttonTextColorIOS` | `string` | `'#007AFF'` | Color for iOS action buttons. |
| `accentColorIOS` | `string` | `'#007AFF'` | Tint color for iOS picker controls. |
| `locale` | `string` | Device default | Locale identifier (e.g. `'en_US'`, `'es_ES'`). |

---

## 📱 Platform Differences & Support

| Feature | iOS | Android | Notes |
| :--- | :---: | :---: | :--- |
| Date Mode | ✅ | ✅ | iOS uses `UIDatePicker`, Android uses `DatePickerDialog`. |
| Time Mode | ✅ | ✅ | iOS uses `UIDatePicker`, Android uses `TimePickerDialog`. |
| DateTime Mode | ✅ | ✅ | Sequential dialogs on Android; unified picker on iOS. |
| Countdown Mode | ✅ | ❌ | Supported on iOS via `countDownTimer`. |
| ActionSheet 2-Card Layout | ✅ | N/A | Matches standard iOS ActionSheet design. |
| 12h / 24h Toggle | Auto | ✅ | Driven by `is24Hour` prop. |
| Minute Interval | ✅ | N/A | Standard iOS picker interval. |
| Zero External Dependencies | ✅ | ✅ | Completely native OS dialogs. |

---

## 📄 License

MIT © [Izonnet Web Solution](https://github.com/Izonnet-Web-Solution)
