# Compatibility Matrix & Competitor Benchmark

---

## 1. React Native Version Compatibility Matrix

The table below distinguishes between **physically verified versions** (built and executed with real toolchains) and **architecturally supported versions** (governed by Codegen and peer dependency specifications).

| React Native Version | Architecture | Android Build | iOS Build | Codegen / TurboModules | Functional Tests | Verification Status |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **0.88.x** | New Arch (Fabric + TurboModules) | **PASS** (11s Debug / 26s Release) | **PASS** (Xcode 26 Succeeded) | **PASS** (Spec v0.88) | **PASS** (131/131 Tests) | **PRACTICALLY VERIFIED** |
| **0.85.x** | New Arch (TurboModules) | Compatible | Compatible | Compatible | Architecturally Compatible | *Supported via peerDependencies (>=0.72)* |
| **0.81.x** | New Arch (TurboModules) | Compatible | Compatible | Compatible | Architecturally Compatible | *Supported via peerDependencies (>=0.72)* |
| **0.78.x** | New Arch / Interop | Compatible | Compatible | Compatible | Architecturally Compatible | *Supported via peerDependencies (>=0.72)* |
| **0.74.x – 0.77.x** | Legacy / New Arch | Compatible | Compatible | Compatible | Architecturally Compatible | *Supported via peerDependencies (>=0.72)* |
| **Web (RNW ~0.21)** | Browser DOM (Vite) | N/A | N/A | Shimmed / Pure JS | **PASS** (Built in 288ms) | **PRACTICALLY VERIFIED** |

---

## 2. In-Depth Competitor Comparison

Every assertion below has been verified against the official open-source repositories and documentation of each respective library.

| Feature / Criterion | `@react-native-community/datetimepicker` | `react-native-date-picker` | `react-native-modal-datetime-picker` | `@izonnet-web-solution/react-native-date-time-picker-kit` |
| :--- | :---: | :---: | :---: | :---: |
| **Primary Repository** | `react-native-datetimepicker/datetimepicker` | `henninghall/react-native-date-picker` | `mmazzarolo/react-native-modal-datetime-picker` | `Izonnet-Web-Solution/react-native-date-time-picker-kit` |
| **Date Selection** | Native dialog (`DatePickerDialog` / `UIDatePicker`) | Native wheel / dialog | Delegates to community picker | **Native Swift/Kotlin + Pure React Native** |
| **Time Selection** | Native dialog (`TimePickerDialog` / `UIDatePicker`) | Native wheel / dialog | Delegates to community picker | **Native Swift/Kotlin + Pure React Native** |
| **Datetime Dual Mode** | Limited (requires chaining two distinct dialogs in user code on Android) | Single unified wheel | Wraps community picker | **Supported out-of-the-box (chained Android dialogs + dual wheels)** |
| **Date Range Picker** | ❌ Not supported | ❌ Not supported | ❌ Not supported | **✅ Fully supported (`DateRangePicker`)** |
| **Appointment Time Slots** | ❌ Not supported | ❌ Not supported | ❌ Not supported | **✅ Fully supported (`TimeSlotPicker`)** |
| **Component Diversity** | 1 unified native wrapper | 1 wheel picker | 1 modal wrapper | **10 Specialized Components (`Calendar`, `Clock`, `Wheel`, `Slot`, `Month`, `Year`, etc.)** |
| **Pure JS In-Tree Modes** | ❌ No in-tree JS views | ❌ No in-tree JS views | ❌ No in-tree JS views | **✅ 4 in-tree modes (`inline`, `modal`, `bottom-sheet`, `fullscreen`)** |
| **Runtime Dependencies** | 0 runtime dependencies | 0 runtime dependencies | Depends on community picker | **0 runtime dependencies** |
| **New Architecture Support** | TurboModules supported | TurboModules supported | Dependent on sub-package | **Codegen Native TurboModules Spec** |
| **Dynamic Intl Locales** | Device system locale only | Manual locale strings | System-bound | **Dynamic `Intl.DateTimeFormat` across all 100+ BCP 47 tags** |
| **Leap-Year Day Clamping** | Relies on OS picker | Relies on OS picker | Relies on OS picker | **`clampMonthDay` protects all JS calendar components** |
| **Automated Test Suite** | ~45 tests | ~20 tests | ~25 tests | **131 automated unit & boundary tests (100% passing)** |
| **Expo Prebuild Support** | Expo Go & Prebuild | Expo Prebuild | Expo Go & Prebuild | **Expo Prebuild & Custom Dev Client** |
| **License** | MIT | MIT | MIT | **MIT** |
