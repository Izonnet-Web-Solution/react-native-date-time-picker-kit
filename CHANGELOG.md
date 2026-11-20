# Changelog

All notable changes to `@izonnet-web-solution/react-native-date-time-modal` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-19

### Added
- **10 Core Picker Components**:
  - `DateTimePicker`: Unified picker supporting `native`, `inline`, `modal`, `bottom-sheet`, and `fullscreen`.
  - `DatePicker`: Standalone date selection component with native and custom view rendering.
  - `TimePicker`: Standalone time selection component supporting 12/24-hour modes and minute intervals.
  - `DateRangePicker`: Interactive start and end date selection with range highlighting.
  - `CalendarPicker`: Rich month-grid calendar with marked dates, dots, badges, and weekday headers.
  - `MonthPicker`: Multi-column month selection grid with localized names.
  - `YearPicker`: Decade-based scrollable year selector with boundary limits.
  - `ClockPicker`: Analog clock dial UI with interactive touch angles for hours and minutes.
  - `WheelPicker`: Smooth inertial wheel picker with centered selection guides.
  - `TimeSlotPicker`: Appointment slot generator with start/end bounds, slot duration, and custom breaks.
- **Theme Engine**:
  - Full support for `light`, `dark`, and automatic system themes.
  - Deep customization via `ThemeConfig` (colors, typography, border radii, padding, accents).
  - High-contrast accessibility support with customizable selected state indicators.
- **Localization & Internationalization**:
  - Built-in localized dictionaries for English (`en`), Hindi (`hi`), Gujarati (`gu`), Spanish (`es`), French (`fr`), German (`de`), Arabic (`ar`), Chinese (`zh`), and Japanese (`ja`).
  - Automatic device locale detection with custom dictionary override capability.
  - First-class Right-to-Left (RTL) layout support.
  - Bracket-escaped literal token formatting (e.g. `'YYYY-MM-DD [at] HH:mm'`).
- **Quick Date Presets**:
  - Built-in presets: Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Last Month.
  - Support for custom preset callbacks and quick action bars.
- **Accessibility**:
  - Added VoiceOver and TalkBack support across all components.
  - Semantic `accessibilityRole="button"`, descriptive `accessibilityLabel`, and dynamic `accessibilityState={{ selected, disabled }}`.
- **Imperative Ref APIs & Hooks**:
  - Ref controls: `open()`, `close()`, `confirm()`, `cancel()`, `reset()`, and `getValue()`.
  - Convenient `useDateTimePicker` React hook.

### Fixed
- **iOS Promise Resolution**: Resolved hanging promise when `closePicker()`, `confirmPicker()`, or `cancelPicker()` was called programmatically while a picker was open.
- **Android Dismissal Action**: Fixed issue where programmatic `confirmPicker()` was misidentified as `"dismissed"` by the native dialog's dismissal listener.
- **Date Formatting Collision**: Fixed regex token collision in `formatLocalized` where characters in literal words (such as `at` in `[at]`) matched format tokens.
- **Negative Fractional Timezones**: Fixed sign bug on Android where negative timezones with minutes (e.g. `-03:30`) formatted as `GMT+00:30`.
- **Date Range Bounds Validation**: Fixed issue where passing invalid non-null objects/strings to `minDate` or `maxDate` bypassed boundary enforcement.
- **Calendar Render Performance**: Optimized `CalendarPicker` by moving boundary date calculations outside the day iteration loop.
- **Module Exports**: Cleaned up duplicated export statements in `src/index.tsx`.

### Changed
- Streamlined TurboModule communication with UI-thread safety checks on both iOS (Swift) and Android (Kotlin).
- Zero third-party runtime dependencies confirmed (`dependencies: {}`).

---

## [0.1.0] - Initial Release

- Initial TurboModule implementation for React Native Codegen.
- Basic native iOS UIDatePicker and Android DatePickerDialog / TimePickerDialog integration.
- Preliminary TypeScript types and test suites.
