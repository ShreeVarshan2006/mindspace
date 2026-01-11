# Technical Requirements - MindSpace

This document outlines the software, versions, and configurations required to set up and run the MindSpace project on a new development device.

## 1. Core Runtime

- **Node.js**: `v18.x` or `v20.x` (LTS recommended).
  - Minimum requirement: `v16.0.0`.
- **npm**: `v8.x` or higher (usually bundled with Node.js).
- **Git**: For source control.

## 2. Backend Requirements

The backend is built with Express.js and uses Supabase as the primary database provider.

- **Supabase Project**:
  - An active Supabase project.
  - SQL Schema: Execute the contents of `backend/supabase_schema.sql` in the Supabase SQL Editor.
- **Environment Variables**: A `.env` file in the `/backend` directory containing:
  - `SUPABASE_URL`: Your project API URL.
  - `SUPABASE_SERVICE_ROLE_KEY`: Your service role secret key.
  - `JWT_SECRET`: A secure string for token signing.
  - `PORT`: (Optional) Default is `5000`.

## 3. Mobile Development Requirements

The mobile app is built using React Native and Expo (SDK 50).

### 3.1 Expo Environment

- **Expo Go**: Install the Expo Go app on your physical iOS or Android device from the App Store or Play Store for rapid testing.
- **Expo CLI**: Accessed via `npx expo`.

### 3.2 Native Android Environment (Optional/Advanced)

If you intend to run the app using `npm run android` (native build) rather than Expo Go:

- **Java Development Kit (JDK)**: Java 17 is required.
- **Android Studio**:
  - **Android SDK Platform**: API Level 34 (Android 14.0).
  - **Android SDK Build-Tools**: 34.0.0+.
  - **Android Emulator**: Or a physical device with USB debugging enabled.
- **Gradle**: Version `8.3` (automatically handled by the wrapper in `mobile/android/`).

### 3.3 Environment Variables

A `.env` file in the `/mobile` directory containing:

- `EXPO_PUBLIC_API_URL`: The URL of your running backend (e.g., `http://10.0.2.2:5000/api` for Android Emulator).

## 4. Developer Tools

- **Editor**: VS Code is recommended.
- **VS Code Extensions**:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

## 5. Network Requirements

- Access to `https://*.supabase.co` for database operations.
- Local network visibility if testing on a physical device (device must be on the same Wi-Fi as the development machine).
