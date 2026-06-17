# Habit-Tracker-

A cross-platform mobile application built with React Native and Expo.

## 🚀 Getting Started

The easiest way to run this app is using **Expo Go** on your physical device. This requires zero setup for Android or iOS SDKs.

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your computer.
- **Expo Go** app installed on your physical [iOS](https://apps.apple.com/us/app/expo-go/id982107779) or [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) device.

### 1. Installation

Navigate to the mobile app directory and install the dependencies:

```bash
cd mobile-app
npm install
```

### 2. Run the App (The Easy Way)

1. Make sure your computer and your phone are connected to the **same Wi-Fi network**.
2. Start the Expo development server:
   ```bash
   npx expo start
   ```
3. A large QR code will appear in your terminal.
   - **Android**: Open the **Expo Go** app and tap "Scan QR Code".
   - **iOS**: Open the default **Camera** app, point it at the QR code, and tap the Expo Go prompt that appears.

---

## 💻 Advanced: Running on Emulators (Optional)

If you prefer to run the app on your computer using an emulator, you will need to set up the respective SDKs.

### Android Emulator (Windows / Mac / Linux)
1. Install [Android Studio](https://developer.android.com/studio). This is the easiest way to get the SDK and emulators.
2. Open Android Studio, go to the **Virtual Device Manager**, and start an Android emulator.
3. Run the app:
   ```bash
   npx expo start --android
   ```

### iOS Simulator (Mac Only)
1. Install **Xcode** from the Mac App Store.
2. Open Xcode to agree to the terms and ensure the command line tools are installed.
3. Run the app:
   ```bash
   npx expo start --ios
   ```

---

## 📦 Building for Production (APK / IPA)

To build standalone files for app stores (or to install permanently on your phone), we use **EAS (Expo Application Services)**.

1. Install the EAS CLI globally on your computer:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Build for Android (generates an `.apk` or `.aab`):
   ```bash
   eas build -p android --profile preview
   ```
4. Build for iOS (generates an `.ipa`):
   ```bash
   eas build -p ios --profile preview
   ```
*(Note: iOS builds require a paid Apple Developer account).*