# Compatibility Matrix

**Package:** `@izonnet-web-solution/react-native-date-time-picker-kit`

This document outlines the verified platform, runtime, and framework compatibility for `@izonnet-web-solution/react-native-date-time-picker-kit`.

---

## 1. React & React Native Versions

| React Native Version | React Version | New Architecture (TurboModules) | Legacy Architecture (Bridge) | Status | Notes |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **0.80.x – 0.88.x+** | 19.x+ | Supported (Default) | Deprecated upstream | Verified | Full native Codegen support |
| **0.76.x – 0.79.x** | 18.3.x | Supported (Default) | Supported with fallback | Verified | Tested on RN 0.77.1 example app |
| **0.74.x – 0.75.x** | 18.2.x | Supported | Supported | Verified | Requires `newArchEnabled=true` for TurboModule |
| **< 0.74.0** | 17.x / 18.0 | Not Recommended | Not Supported | Unsupported | Codegen specs require RN >= 0.74 |

---

## 2. Operating System & Platform Requirements

### iOS Platform

| Component | Minimum Version | Recommended Version | Details |
| :--- | :--- | :--- | :--- |
| **iOS Deployment Target** | iOS 15.1+ | iOS 16.0+ / 17.0+ / 18.0+ | Compatible with all active iOS releases |
| **Language & Toolchain** | Swift 5.0+ | Swift 5.9+ / Xcode 15+ & 16+ | Native UIKit implementation |
| **Primary Native APIs** | `UIDatePicker`, `UIViewController`, `UIAlertController`, `UIImpactFeedbackGenerator` | Fully backward compatible |
| **Device Architectures** | `arm64` (Physical devices & Apple Silicon Simulators), `x86_64` (Intel Simulators) | Both architecture slices fully supported |
| **Package Managers** | CocoaPods 1.13+, Swift Package Manager (framework build) | CocoaPods standard integration |

### Android Platform

| Component | Minimum Version | Recommended Version | Details |
| :--- | :--- | :--- | :--- |
| **Minimum SDK (`minSdkVersion`)** | API 24 (Android 7.0 Nougat) | API 26+ | Covers >96% of global active Android devices |
| **Target SDK (`targetSdkVersion`)** | API 34 (Android 14) | API 35 (Android 15) | Meets Google Play Store submission policies |
| **Compile SDK (`compileSdkVersion`)** | API 34+ | API 35 | Compatible with latest Android SDK tools |
| **Language & Toolchain** | Kotlin 1.9+ | Kotlin 1.9.24+ / Gradle 8.0+ | Native Android SDK APIs |
| **Primary Native APIs** | `DatePickerDialog`, `TimePickerDialog`, `android.icu.util.Calendar`, `java.util.Calendar` | Zero AndroidX third-party picker dependencies |
| **ABIs Supported** | `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64` | All CPU ABIs supported |

---

## 3. Expo & Framework Compatibility

| Environment | Supported | Configuration / Requirements |
| :--- | :---: | :--- |
| **Bare React Native (CLI)** | Yes | Fully supported out-of-the-box (`npx react-native init`) |
| **Expo Prebuild (`npx expo run:ios/android`)** | Yes | Supported via standard Config Plugin / Native Directory |
| **Expo Development Build (`expo-dev-client`)** | Yes | Supported; builds custom native client with TurboModule |
| **Expo Go (Managed App)** | No | Expo Go does not allow custom native C++/Swift/Kotlin TurboModules |
| **React Native macOS / Windows** | In-Tree Only | JavaScript components (`inline`, `modal`, `bottom-sheet`) work; native picker falls back to modal |
| **React Native Web** | In-Tree Only | JavaScript components (`CalendarPicker`, `ClockPicker`, etc.) render on web |

---

## 4. Build Tools & Compilers

| Tool | Supported Versions | Notes |
| :--- | :--- | :--- |
| **Node.js** | 18.x, 20.x, 22.x LTS | Node 20+ recommended |
| **TypeScript** | 5.0+ | Strict type checking enabled (`strict: true`) |
| **Xcode** | 15.0 – 16.2+ | macOS Sonoma / Sequoia supported |
| **Android Studio / Gradle** | Android Studio Jellyfish / Ladybug, Gradle 8.0 – 8.14+ | AGP 8.0+ compatible |
| **Package Bundlers** | Metro, Webpack, Vite, esbuild | Tree-shakeable ESM (`lib/module`) + CommonJS ready |
