# Devotio

Catholic prayer app built with React Native (Expo bare workflow) + Firebase.

## Prerequisites

- Node.js + npm
- Android Studio with an emulator configured (or a physical Android device)
- Android SDK + `adb` on your PATH (included with Android Studio)
- Java 17+

---

## Running in development (Metro + emulator/device)

Metro bundler serves JS on the fly. The app connects to it on launch.

```bash
npx expo run:android
```

This compiles the native code, installs the debug APK, and starts Metro. The app reloads automatically on JS changes.

To target a specific device when multiple are connected:

```bash
npx expo run:android --device
```

---

## Building a standalone APK (no Metro needed)

The release build embeds the JS bundle inside the APK. Once installed, the app runs independently — no console, no USB.

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

> First build takes ~5 minutes (compiles native C++). Subsequent builds are much faster due to Gradle cache.

---

## Installing on a physical Android phone

### One-time phone setup

1. Settings → About Phone → tap **Build Number** 7 times
2. Settings → Developer Options → enable **USB Debugging**
3. Connect phone via USB and tap **Allow** on the USB debugging prompt

### Verify the phone is detected

```bash
adb devices
```

You should see your device ID listed with status `device`.

### Install the APK

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

The `-r` flag reinstalls over an existing version without uninstalling first.

### Full build + install in one go

```bash
cd android && ./gradlew assembleRelease && cd .. && adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## Project structure

```
src/
  components/       Reusable UI components
  constants/        Theme (colors, fonts)
  context/          AuthContext (Firebase Auth)
  data/             Seed prayers (PT-PT)
  navigation/       React Navigation stacks + tabs
  screens/          All app screens
  services/         Firebase (auth + firestore)
  types/            TypeScript interfaces
```

## Tech stack

- React Native 0.83 + Expo SDK 55 (bare workflow)
- Firebase 12 (Auth + Firestore)
- React Navigation 7 (bottom tabs + stacks)
- expo-notifications (prayer session reminders)
- expo-blur, expo-linear-gradient
- Lato + Lora fonts via @expo-google-fonts
