# @izonnet-web-solution/react-native-date-time-picker-kit

A customizable date and time picker toolkit for React Native, combining native iOS and Android picker interfaces with JavaScript-based calendar, clock, wheel, and time-slot components.

[![npm version](https://img.shields.io/npm/v/@izonnet-web-solution/react-native-date-time-picker-kit.svg)](https://www.npmjs.com/package/@izonnet-web-solution/react-native-date-time-picker-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)

> **Documentation note:** This README is organized from the library documentation supplied with the request. Confirm the package's actual exports, TypeScript declarations, native setup, and supported React Native versions against the published release before treating every example as a guaranteed API contract.

## Contents

- [Overview](#overview)
- [Features](#features)
- [Platform support](#platform-support)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Presentation modes](#presentation-modes)
- [Components](#components)
- [Themes](#themes)
- [Localization and RTL](#localization-and-rtl)
- [Presets and time slots](#presets-and-time-slots)
- [Ref methods](#ref-methods)
- [useDateTimePicker hook](#usedatetimepicker-hook)
- [Utilities](#utilities)
- [Error handling](#error-handling)
- [API reference](#api-reference)
- [Compatibility](#compatibility)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

The package provides a set of date and time selection components for React Native applications.

It combines:

- Native iOS picker UI implemented with Swift and UIKit.
- Native Android date and time dialogs implemented with Kotlin and the Android SDK.
- JavaScript-rendered components for calendar, month, year, clock, wheel, and time-slot selection.
- TypeScript APIs, date utilities, theming, localization, and right-to-left (RTL) support.

## Features

- **Multiple selection modes:** date, time, datetime, and countdown.
- **Multiple presentations:** native, inline, modal, bottom sheet, and fullscreen.
- **10 picker components:** unified DateTimePicker, DatePicker, TimePicker, DateRangePicker, CalendarPicker, MonthPicker, YearPicker, ClockPicker, WheelPicker, and TimeSlotPicker.
- **Date constraints:** minimum and maximum values, disabled dates, disabled weekdays, and minute intervals.
- **Date ranges and presets:** select a date range or use standard/custom presets.
- **Calendar customization:** marked dates, colored dots, badges, and first-day-of-week configuration.
- **Theming:** light, dark, automatic system appearance, and custom theme configuration.
- **Localization:** documented built-in locales include English, Hindi, Gujarati, Spanish, French, German, Arabic, Chinese, and Japanese.
- **RTL support:** documented for Arabic layouts.
- **Developer APIs:** declarative components, imperative refs, a custom hook, and date utility functions.
- **No third-party runtime dependencies:** the supplied package documentation describes the runtime implementation as dependency-free.

## Platform support

| Platform | Native implementation | Minimum version stated in supplied documentation |
|---|---|---:|
| iOS | Swift, UIKit (`UIDatePicker`, `UIViewController`) | iOS 15.1+ |
| Android | Kotlin, Android SDK (`DatePickerDialog`, `TimePickerDialog`) | Android API 24+ |

### React Native architecture

The supplied documentation describes the native module as using React Native Codegen and TurboModules.

It states support for React Native 0.74 through 0.88+, with the New Architecture enabled. Treat this range as the README's stated compatibility claim and verify it against the specific package release and its CI matrix.

### Expo

The native picker functionality requires a native build. The supplied documentation describes support for Expo Prebuild and Development Builds, rather than the standard Expo Go app.

For Expo projects, install the package and rebuild the native application after adding it. The JavaScript-rendered presentations (`inline`, `modal`, and `bottom-sheet`) are described as not requiring the native picker UI, but the package's actual import/native-module behavior should still be tested in your Expo setup.

## Installation

Install from npm:

```bash
npm install @izonnet-web-solution/react-native-date-time-picker-kit
```

Or use Yarn:

```bash
yarn add @izonnet-web-solution/react-native-date-time-picker-kit
```

Or pnpm:

```bash
pnpm add @izonnet-web-solution/react-native-date-time-picker-kit
```

### iOS

Install CocoaPods dependencies:

```bash
cd ios
pod install
cd ..
```

Then rebuild the iOS app.

### Android

Check the New Architecture setting in `android/gradle.properties`:

```properties
newArchEnabled=true
```

Then rebuild the Android app. If your project uses a different React Native architecture or build configuration, follow the requirements of the package version you installed.

> Native libraries require a native rebuild after installation. Reloading Metro alone is not sufficient.

## Quick start

The following example demonstrates the documented `DateTimePicker` API in date mode.

```tsx
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import {
  DateTimePicker,
  formatDate,
} from '@izonnet-web-solution/react-native-date-time-picker-kit';

export default function BasicDatePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPickerVisible, setPickerVisible] = useState(false);

  return (
    <View style={{ padding: 20 }}>
      <Text>
        Selected date: {formatDate(selectedDate, 'YYYY-MM-DD')}
      </Text>

      <Button
        title="Choose date"
        onPress={() => setPickerVisible(true)}
      />

      {isPickerVisible && (
        <DateTimePicker
          mode="date"
          presentation="native"
          value={selectedDate}
          onConfirm={(date) => {
            setSelectedDate(date);
            setPickerVisible(false);
          }}
          onCancel={() => setPickerVisible(false)}
        />
      )}
    </View>
  );
}
```

## Presentation modes

Use the `presentation` prop to choose how a picker is displayed.

| Mode | Description |
|---|---|
| `native` | Uses the platform's native picker interface. |
| `inline` | Renders the picker inside the current view hierarchy. |
| `modal` | Displays a centered modal dialog. |
| `bottom-sheet` | Displays a slide-up panel with a backdrop. |
| `fullscreen` | Displays a fullscreen overlay. |

Example:

```tsx
<DatePicker
  presentation="bottom-sheet"
  value={new Date()}
  onConfirmDate={(date) => {
    console.log('Selected date:', date);
  }}
/>
```

## Components

The package documentation describes the following components.

### 1. `DateTimePicker`

The unified picker. The documented modes are `date`, `time`, `datetime`, and `countdown`.

```tsx
<DateTimePicker
  mode="datetime"
  presentation="bottom-sheet"
  value={new Date()}
  minuteInterval={5}
  onConfirm={(date) => {
    console.log('Confirmed:', date);
  }}
  onCancel={() => {
    console.log('Cancelled');
  }}
/>
```

### 2. `DatePicker`

A single-date picker. The supplied documentation also describes support for presets and a ref API.

```tsx
<DatePicker
  presentation="bottom-sheet"
  value={selectedDate}
  showPresets
  onConfirmDate={(date) => setSelectedDate(date)}
/>
```

### 3. `TimePicker`

A time-focused picker with documented 12-hour/24-hour and minute-interval options.

```tsx
<TimePicker
  presentation="modal"
  is24Hour={false}
  minuteInterval={15}
  onConfirmTime={(time) => {
    console.log('Selected time:', time);
  }}
/>
```

### 4. `DateRangePicker`

Selects a start date and end date.

```tsx
<DateRangePicker
  presentation="bottom-sheet"
  showPresets
  startDate={range.startDate}
  endDate={range.endDate}
  onConfirmRange={({ startDate, endDate }) => {
    console.log('Range:', startDate, 'to', endDate);
  }}
/>
```

### 5. `CalendarPicker`

A calendar component with documented marked-date and first-day-of-week options.

```tsx
<CalendarPicker
  value={new Date()}
  onChange={(date) => console.log('Selected:', date)}
  markedDates={{
    '2026-11-20': { marked: true, dotColor: '#EF4444' },
    '2026-11-25': { marked: true, dotColor: '#10B981' },
  }}
  firstDayOfWeek={0}
/>
```

`firstDayOfWeek` uses `0` for Sunday and `1` for Monday in the supplied documentation.

### 6. `MonthPicker`

A month-selection grid.

```tsx
<MonthPicker
  value={{ year: 2026, month: 10 }}
  onChange={({ year, month, date }) => {
    console.log('Selected month:', month, 'year:', year);
  }}
/>
```

### 7. `YearPicker`

A year-selection grid with optional bounds.

```tsx
<YearPicker
  value={2026}
  minYear={2000}
  maxYear={2040}
  onChange={(year) => console.log('Selected year:', year)}
/>
```

### 8. `ClockPicker`

A clock-style time selector.

```tsx
<ClockPicker
  value={{ hour: 10, minute: 30 }}
  is24Hour={false}
  minuteInterval={5}
  onChange={({ hour, minute, date }) => {
    console.log('Selected time:', hour, minute);
  }}
/>
```

### 9. `WheelPicker`

A scroll-wheel selector for a list of custom options.

```tsx
<WheelPicker
  items={[
    { label: 'Morning (09:00 AM)', value: 'morning' },
    { label: 'Afternoon (01:00 PM)', value: 'afternoon' },
    { label: 'Evening (05:00 PM)', value: 'evening' },
  ]}
  selectedValue="morning"
  onChange={(value, index) => {
    console.log('Selected:', value, 'at index:', index);
  }}
/>
```

### 10. `TimeSlotPicker`

A time-slot grid with generated intervals and disabled slots.

```tsx
<TimeSlotPicker
  startTime="09:00"
  endTime="17:00"
  intervalMinutes={30}
  disabledSlots={['12:00', '12:30']}
  onSelectSlot={(slot) => {
    console.log('Selected slot:', slot.id);
  }}
/>
```

## Themes

The supplied documentation describes three built-in theme modes:

```tsx
<DateTimePicker theme="light" />
<DateTimePicker theme="dark" />
<DateTimePicker theme="auto" />
```

`auto` is documented as following the device's system appearance.

### Custom theme

The following is the custom-theme shape shown in the supplied README. Check the installed TypeScript definitions for the complete supported `ThemeConfig` shape.

```tsx
const customTheme = {
  mode: 'light',
  colors: {
    primary: '#6366F1',
    selected: '#6366F1',
    selectedText: '#FFFFFF',
    background: '#FAFAFA',
    rangeHighlight: '#E0E7FF',
  },
  borderRadius: {
    lg: 20,
  },
};

<CalendarPicker theme={customTheme} />
```

The supplied documentation also lists `themeColors`, `accentColor`, `textColor`, `backgroundColor`, and `styles` as customization options for applicable picker components.

## Localization and RTL

The supplied README lists these locale identifiers:

| Locale | Language |
|---|---|
| `en` | English |
| `hi` | Hindi |
| `gu` | Gujarati |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `ar` | Arabic |
| `zh` | Chinese |
| `ja` | Japanese |

Examples:

```tsx
<CalendarPicker locale="hi" />
<DateTimePicker locale="gu" />
<CalendarPicker locale="ar" />
```

Arabic is documented as supporting RTL layout behavior.

### Localized formatting

```tsx
import {
  formatLocalized,
  hiLocale,
} from '@izonnet-web-solution/react-native-date-time-picker-kit';

const formatted = formatLocalized(
  new Date(),
  'DD MMMM YYYY (dddd) A',
  hiLocale
);

console.log(formatted);
```

The available locale objects and format tokens should be checked against the package's exported TypeScript declarations.

## Presets and time slots

### Standard date presets

```tsx
import {
  getStandardRangePresets,
  getStandardSinglePresets,
} from '@izonnet-web-solution/react-native-date-time-picker-kit';

const rangePresets = getStandardRangePresets();
const singleDatePresets = getStandardSinglePresets();
```

The supplied README lists common presets such as Today, Yesterday, Last 7 Days, Last 30 Days, This Month, and Next Month. Which presets are returned depends on the helper used.

### Generate appointment slots

```tsx
import {
  generateTimeSlots,
} from '@izonnet-web-solution/react-native-date-time-picker-kit';

const slots = generateTimeSlots({
  startTime: '09:00',
  endTime: '18:00',
  intervalMinutes: 30,
  disabledSlots: ['13:00', '13:30'],
  is24Hour: false,
});
```

## Ref methods

The supplied documentation describes an imperative ref API for `DateTimePicker`-derived components. It lists these methods:

- `open()`
- `confirm()`
- `cancel()`
- `close()`
- `getValue()`
- `setValue(value)`
- `reset()`

Example:

```tsx
import React, { useRef } from 'react';
import {
  DatePicker,
  type DatePickerRef,
} from '@izonnet-web-solution/react-native-date-time-picker-kit';

export default function RefExample() {
  const pickerRef = useRef<DatePickerRef>(null);

  const openPicker = async () => {
    await pickerRef.current?.open();
  };

  return (
    <>
      <Button title="Open picker" onPress={openPicker} />
      <DatePicker ref={pickerRef} />
    </>
  );
}
```

> Confirm the exact ref type names and method signatures in the installed package declarations. The example above focuses on the documented API shape.

## `useDateTimePicker` hook

The supplied README describes a `useDateTimePicker` hook that returns a ref, an `open` function, and an `isOpen` state.

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import {
  DateTimePicker,
  useDateTimePicker,
} from '@izonnet-web-solution/react-native-date-time-picker-kit';

export default function HookExample() {
  const { ref, open, isOpen } = useDateTimePicker({
    mode: 'date',
  });

  return (
    <View>
      <Button
        title={isOpen ? 'Picker open' : 'Choose date'}
        onPress={() => open()}
      />
      <DateTimePicker ref={ref} mode="date" />
    </View>
  );
}
```

## Utilities

The supplied README lists the following date helpers:

```tsx
import {
  validateDate,
  validateDateRange,
  isDateDisabled,
  isWeekdayDisabled,
  validateMinuteInterval,
  formatDate,
  parseDate,
} from '@izonnet-web-solution/react-native-date-time-picker-kit';
```

Example usage:

```tsx
const valid = validateDate(new Date());

const formatted = formatDate(
  new Date(),
  'YYYY-MM-DD hh:mm A'
);

const disabled = isDateDisabled(
  new Date(),
  ['2026-12-25'],
  [0, 6]
);
```

The supplied documentation describes `isDateDisabled` as checking disabled dates and weekdays. Refer to the package's TypeScript declarations for exact parameter and return types for each utility.

## Error handling

The supplied README describes a typed `DateTimePickerError` and an `onError` callback.

```tsx
import {
  DateTimePicker,
  DateTimePickerError,
} from '@izonnet-web-solution/react-native-date-time-picker-kit';

<DateTimePicker
  onError={(error: DateTimePickerError) => {
    console.error('Picker error code:', error.code);
    console.error('Picker error message:', error.message);
  }}
/>;
```

Documented error codes:

| Code | Meaning indicated by the code |
|---|---|
| `NATIVE_MODULE_NOT_FOUND` | Native module could not be found. |
| `PICKER_ALREADY_OPEN` | A picker is already open. |
| `PICKER_NOT_OPEN` | An operation requires an open picker. |
| `INVALID_DATE` | A supplied date is invalid. |
| `INVALID_MODE` | The requested mode is invalid. |
| `INVALID_MINUTE_INTERVAL` | The minute interval is invalid. |
| `DATE_OUT_OF_RANGE` | The selected date is outside the allowed range. |
| `UNSUPPORTED_FEATURE` | The requested feature is not supported. |
| `ACTIVITY_UNAVAILABLE` | The Android activity is unavailable. |
| `PRESENTATION_FAILED` | The picker presentation failed. |
| `UNKNOWN_ERROR` | An unclassified error occurred. |

## API reference

The table below consolidates the common props listed in the supplied README for `DateTimePicker` and related components. Not every prop necessarily applies to every specialized component. Use the TypeScript definitions shipped with your installed version as the authoritative reference.

| Prop | Documented type / values | Description |
|---|---|---|
| `mode` | `'date' \| 'time' \| 'datetime' \| 'countdown'` | Selection mode. |
| `value` | `Date \| number \| string \| null` | Controlled selected value. |
| `defaultValue` | `Date \| number \| string \| null` | Initial uncontrolled value. |
| `presentation` | `'native' \| 'inline' \| 'modal' \| 'bottom-sheet' \| 'fullscreen'` | Presentation style. |
| `display` | `'default' \| 'compact' \| 'inline' \| 'spinner' \| 'clock'` | Native picker display style. |
| `open` | `boolean` | Controls visibility in declarative presentations. |
| `isVisible` | `boolean` | Documented visibility alias. |
| `minimumDate` / `minDate` | `Date \| number \| string` | Lower date boundary. |
| `maximumDate` / `maxDate` | `Date \| number \| string` | Upper date boundary. |
| `minimumTime` | `string \| { hour: number; minute: number }` | Lower time boundary. |
| `maximumTime` | `string \| { hour: number; minute: number }` | Upper time boundary. |
| `minuteInterval` | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 10 \| 12 \| 15 \| 20 \| 30` | Minute stepping interval. |
| `locale` | `string \| PartialLocaleData` | Locale identifier or custom locale data. |
| `timeZone` | `string` | IANA timezone identifier. |
| `timeZoneOffsetInMinutes` | `number` | UTC offset in minutes. |
| `utcOffset` | `number` | Documented offset alias; README describes hours or minutes. |
| `is24Hour` | `boolean` | 12-hour or 24-hour time display. |
| `disabledDates` | `(Date \| string)[]` | Dates unavailable for selection. |
| `disabledWeekdays` | `number[]` | Weekdays unavailable for selection (`0` = Sunday). |
| `markedDates` | `MarkedDatesMap` | Calendar date markers. |
| `firstDayOfWeek` | `number` | First weekday in calendar layout. |
| `theme` | `'light' \| 'dark' \| 'auto' \| ThemeConfig` | Theme selection or custom theme. |
| `themeColors` | `ThemeColorsOverride` | Theme color overrides. |
| `styles` | Object | Styles for supported picker regions. |
| `title` | `string` | Picker/dialog title. |
| `confirmText` | `string` | Confirm button label. |
| `cancelText` | `string` | Cancel button label. |
| `accentColor` | `string` | Accent color. |
| `textColor` | `string` | Text color. |
| `backgroundColor` | `string` | Background color. |
| `showPresets` | `boolean` | Shows date presets where supported. |
| `customPresets` | `DatePreset[]` | Custom preset definitions. |
| `disabled` | `boolean` | Disables interaction. |
| `onChange` | `(event: { date: Date; mode: string }) => void` | Intermediate selection callback, as documented. |
| `onConfirm` | `(date: Date) => void` | Confirmed selection callback. |
| `onCancel` | `() => void` | Cancel callback. |
| `onDismiss` | `() => void` | Dismiss callback. |
| `onOpen` | `() => void` | Open callback. |
| `onError` | `(error: DateTimePickerError) => void` | Error callback. |
| `testID` | `string` | Testing identifier. |

### Component-specific callbacks

The supplied README also shows specialized callbacks:

- `DatePicker`: `onConfirmDate(date)`
- `TimePicker`: `onConfirmTime(time)`
- `DateRangePicker`: `onConfirmRange({ startDate, endDate })`
- `CalendarPicker`, `MonthPicker`, `YearPicker`, and `ClockPicker`: `onChange(...)`
- `WheelPicker`: `onChange(value, index)`
- `TimeSlotPicker`: `onSelectSlot(slot)`

These callback shapes are reproduced from the supplied documentation; verify them against the installed `.d.ts` files before relying on them in production.

## Compatibility

The supplied README contains this compatibility statement:

| Library version | React Native | iOS | Android | New Architecture |
|---|---|---|---|---|
| `1.0.x` | `0.74.0` – `0.88.x+` | iOS 15.1+ | API 24+ | Required |

**Important:** The original README also contains examples and package metadata that refer to different release stages. Keep this matrix synchronized with the actual npm release, `peerDependencies`, Codegen configuration, and tested CI versions before publishing. Do not advertise a React Native range that has not been tested.

## Troubleshooting

### Native module not found

1. Confirm the package is installed in the app that is being built.
2. Run `cd ios && pod install` for iOS.
3. Confirm the New Architecture requirement for your installed version.
4. Rebuild the native app; a Metro reload does not compile native code.
5. If the issue continues, clean the native build and rebuild.

### Changes do not appear after installation

Rebuild the iOS or Android application after installing or updating a native package. Restart Metro if needed.

### Expo project

Use an Expo development build or Prebuild workflow when native functionality is required. Standard Expo Go may not contain this package's native module.

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

### Local development

```bash
git clone https://github.com/Izonnet-Web-Solution/react-native-date-time-picker-kit.git
cd react-native-date-time-picker-kit
npm install
```

Run the checks documented by the project:

```bash
npm run typecheck
npm run lint
npm test
npm run prepare
```

### Pull requests

1. Create a feature branch.
2. Use clear commit messages (for example, `feat:`, `fix:`, `docs:`, or `test:`).
3. Run the relevant tests, lint, and type checks.
4. Include a clear description and testing notes in the pull request.

## License

MIT. See the [MIT License](https://opensource.org/licenses/MIT).
