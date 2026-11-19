# Bugs Identified and Resolution Ledger

This document tracks all defects, edge cases, and architectural issues discovered during Round 1 and Round 2 QA audits of `@izonnet-web-solution/react-native-date-time-picker-kit`.

---

## 1. Bug Registry

### Bug #1: Unresolved `initialTimestamp` in `DatePickerHelper.kt`
- **Bug ID:** `BUG-AND-001`
- **Severity:** **HIGH**
- **Platform:** Android Native (Kotlin)
- **React Native Version:** 0.88.0
- **Relevant File & Line:** `android/src/main/java/com/datetimepickerkit/DatePickerHelper.kt:164`
- **Reproduction Steps:**
  1. Open Android project in `example/android`.
  2. Execute `./gradlew assembleDebug` or `./gradlew :izonnet-web-solution_react-native-date-time-picker-kit:compileDebugKotlin`.
- **Expected Result:** Kotlin compiles cleanly without errors.
- **Actual Result:** Gradle task failed with:
  ```text
  e: DatePickerHelper.kt:164:35 Unresolved reference 'initialTimestamp'.
  ```
- **Root Cause:** `initialTimestamp` was declared as a local `val` inside `fun show(): DatePickerDialog`. When `cancelAndDismiss()` was invoked, `initialTimestamp` was out of scope.
- **Suggested Fix:** Promote `initialTimestamp` to a private class property:
  ```kotlin
  private var initialTimestamp: Long = 0L
  ```
- **Retest Status:** **VERIFIED & FIXED** (Passed in `./gradlew assembleDebug` and `./gradlew assembleRelease`).

---

### Bug #2: Unresolved `initialTimestamp` in `TimePickerHelper.kt`
- **Bug ID:** `BUG-AND-002`
- **Severity:** **HIGH**
- **Platform:** Android Native (Kotlin)
- **React Native Version:** 0.88.0
- **Relevant File & Line:** `android/src/main/java/com/datetimepickerkit/TimePickerHelper.kt:178`
- **Reproduction Steps:**
  1. Execute `./gradlew :izonnet-web-solution_react-native-date-time-picker-kit:compileDebugKotlin`.
- **Expected Result:** Kotlin compiles cleanly.
- **Actual Result:** Gradle task failed with:
  ```text
  e: TimePickerHelper.kt:178:35 Unresolved reference 'initialTimestamp'.
  ```
- **Root Cause:** Identical to `BUG-AND-001`; `initialTimestamp` was declared locally in `show()` rather than as a class field.
- **Suggested Fix:** Defined `private var initialTimestamp: Long = 0L` at class level, initialized during `show()`.
- **Retest Status:** **VERIFIED & FIXED** (Passed in `./gradlew assembleDebug` and `./gradlew assembleRelease`).

---

### Bug #3: Duplicate Repository Path in `DateTimePickerKit.podspec`
- **Bug ID:** `BUG-IOS-001`
- **Severity:** **MEDIUM**
- **Platform:** iOS (CocoaPods)
- **React Native Version:** 0.72 – 0.88+
- **Relevant File & Line:** `DateTimePickerKit.podspec:14`
- **Reproduction Steps:**
  1. Inspect `DateTimePickerKit.podspec`.
- **Expected Result:** `s.source` points to `https://github.com/Izonnet-Web-Solution/react-native-date-time-picker-kit.git`.
- **Actual Result:** `s.source` contained duplicate repository path: `.../react-native-date-time-picker-kit/react-native-date-time-picker-kit.git`.
- **Root Cause:** Monorepo folder path was inadvertently concatenated into the git URL.
- **Suggested Fix:** Corrected URL to `https://github.com/Izonnet-Web-Solution/react-native-date-time-picker-kit.git`.
- **Retest Status:** **VERIFIED & FIXED** (Committed in `6f0ebf9`).

---

### Bug #4: Monorepo Metro Bundling ESM Error in Example App
- **Bug ID:** `BUG-EX-001`
- **Severity:** **MEDIUM**
- **Platform:** Node / Metro Bundler (Release build)
- **React Native Version:** 0.88.0
- **Relevant File & Line:** `example/metro.config.js:3` & `example/babel.config.js:2`
- **Reproduction Steps:**
  1. Execute `./gradlew assembleRelease` in `example/android`.
- **Expected Result:** Task `:app:createBundleReleaseJsAndAssets` generates release bundle.
- **Actual Result:** Build failed with `Error [ERR_REQUIRE_ESM]: require() of ES Module react-native-monorepo-config not supported`.
- **Root Cause:** `react-native-monorepo-config` is an ESM-only package, but Node 20's default CommonJS loader does not support synchronous `require()` of ESM without `--experimental-require-module`.
- **Suggested Fix:** Replaced `withMetroConfig` wrapper with standard React Native Metro configuration specifying `watchFolders: [root]` and `nodeModulesPaths`. Simplified `babel.config.js` to `module:@react-native/babel-preset`.
- **Retest Status:** **VERIFIED & FIXED** (Passed in `assembleRelease` in 26s).

---

### Bug #5: `formatTime` Function Signature Rigidity
- **Bug ID:** `BUG-TS-001`
- **Severity:** **LOW**
- **Platform:** TypeScript / JavaScript Utilities
- **Relevant File & Line:** `src/utils/dateFormatting.ts:158`
- **Reproduction Steps:**
  1. Call `formatTime(new Date(), '12h')`.
- **Expected Result:** Formats time to `"12:00 AM"` or `"12:00 PM"`.
- **Actual Result:** Previously returned `""` because the function strictly required `(hour: number, minute: number, is24Hour?: boolean)`.
- **Root Cause:** Function signature did not accept Date objects as the first argument.
- **Suggested Fix:** Enhanced `formatTime` with an overloaded signature accepting `(hourOrDate: number | Date, minuteOrIs24Hour?: number | boolean | '12h' | '24h', is24Hour = false)`.
- **Retest Status:** **VERIFIED & FIXED** (Covered in `__tests__/secondRoundAccuracy.test.ts`).
