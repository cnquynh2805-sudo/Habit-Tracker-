# Habit-Tracker-

A cross-platform mobile application built with React Native and Expo.

## 🚀 Getting Started

Since this app uses custom native modules (e.g., NFC capabilities) via `expo-dev-client`, **Expo Go** can no longer be used to run the app. Instead, you will create a **Custom Development Build** using Expo Application Services (EAS).

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your computer.
- An Expo account (create one at [expo.dev](https://expo.dev)).

### 1. Installation

Navigate to the mobile app directory and install the dependencies:

```bash
cd mobile-app
npm install
```

### 2. Create a Development Build (Online)

To build the app so it can run on your physical device, we use EAS Build. 

1. Install the EAS CLI globally on your computer:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Start the build process for your desired platform. For Android (generates an `.apk`):
   ```bash
   eas build --profile development --platform android
   ```
   > **Note:** The first build can take anywhere from several minutes to a few hours depending on the queue for the free tier on Expo.

### 3. Install and Run the App on Your Phone

Once the EAS build is completed online:
1. On your mobile phone, log in to [expo.dev](https://expo.dev) with the same account.
2. Go to the provided build link, or use your phone's camera to scan the QR code generated in your terminal.
3. Download the app (`.apk` for Android) and install it on your device.
4. Back on your computer, start the local development server:
   ```bash
   npx expo start
   ```
5. Open the newly installed app on your phone. Scan the QR code shown in your computer's terminal using the app's built-in scanner to connect to your local Metro server.

---

## ✨ Best Practices & Architecture Implemented

This project follows modern React Native architectural guidelines to ensure scalability, maintainability, and top-tier user experience:

- **State Management**: **Zustand** is utilized (`src/stores/`) for lightweight, boilerplate-free global state management.
- **Component-Level Styling**: Styles are strictly decoupled into independent `.styles.js` files using `StyleSheet.create` to improve rendering performance and keep component code clean.
- **Adaptive UI**: Heavy usage of Flexbox instead of hardcoded pixel dimensions to ensure layouts adapt gracefully across various screen sizes and orientations.
- **Accessibility (a11y)**: Enforced via `eslint-plugin-react-native-a11y`. Interactive elements (`Pressable`, `TouchableOpacity`) proactively use `accessible`, `accessibilityRole`, and `accessibilityLabel` properties.
- **Internationalization (i18n)**: Robust multi-language support built with `react-i18next` and `expo-localization` to automatically detect system language while allowing persistent manual overrides via local storage.
- **Robust Theming**: A dedicated `ThemeProvider` wrapper manages dynamic switching between custom system, light, and dark themes.
- **Offline-First Persistence**: `@react-native-async-storage/async-storage` is used extensively to cache user habits, language preferences, and theme choices locally.
## 🛡️ UI Guidelines Enforcement

This project strictly enforces UI guidelines documented in mobile-app/docs/UI_GUIDELINES.md to ensure structural integrity and accessibility.

### Auditing UI Code
To scan the codebase for any responsive layout violations (e.g., hardcoded pixels > 48) or missing accessibility labels on interactive elements, run the auditor script:
```bash
cd mobile-app
npm run ui-audit
```

### Auto-Fixing Violations
If you have existing UI violations, you can automatically remediate common layout and accessibility issues (e.g. converting width: 150 to relative percentages or injecting missing accessible={true} tags) by running the auto-fix script:
```bash
cd mobile-app
node scripts/auto-fix.js
```

> Note: These tools are integrated into a GitHub Actions CI pipeline (.github/workflows/lint.yml) to automatically block Pull Requests that contain UI violations or invalid ESLint configurations.
