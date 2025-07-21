# EezyBuild React Native with Expo

This project now includes both a React web application and a React Native mobile application built with Expo for publishing to iOS and Android app stores.

## Project Structure

```
├── src/                  # React web application
├── screens/              # React Native screens
├── shared/               # Shared components and utilities
│   ├── components/       # Reusable UI components
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── AppNative.tsx        # React Native app entry point
├── app.json             # Expo configuration
├── eas.json             # EAS Build configuration
└── metro.config.cjs     # Metro bundler configuration
```

## Development

### Web Development (Vite)
```bash
npm run dev                # Start development server
npm run build              # Build for production
```

### React Native Development (Expo)
```bash
npm run expo:start         # Start Expo development server
npm run expo:web           # Start web version with Expo
npm run expo:ios           # Start iOS simulator
npm run expo:android       # Start Android emulator
```

## Building for App Stores

### Prerequisites
1. Install EAS CLI: `npm install -g @expo/cli`
2. Create an Expo account: `npx expo register`
3. Login: `npx expo login`

### Build Commands
```bash
# Build for iOS App Store
npm run expo:build:ios

# Build for Google Play Store
npm run expo:build:android

# Build for both platforms
npm run expo:build:all
```

## Features

### Current Features
- ✅ React Native navigation with React Navigation
- ✅ Shared component library
- ✅ TypeScript support
- ✅ Dark theme design
- ✅ Cross-platform compatibility (iOS, Android, Web)
- ✅ EAS Build configuration for app store deployment

### Screens Implemented
- **Home Screen**: Main dashboard with quick actions
- **Notifications Screen**: Display and manage notifications

### Shared Components
- **ActionCard**: Reusable action buttons with consistent styling
- **NotificationCard**: Styled notification items with different types

## App Store Configuration

### iOS Configuration
- Bundle Identifier: `com.eezybuild.app`
- App Name: `EezyBuild`
- Supports iPad: Yes

### Android Configuration
- Package Name: `com.eezybuild.app`
- App Name: `EezyBuild`
- Build Type: APK (configurable for AAB)

## Next Steps for Full Implementation

1. **Authentication**: Implement login/logout screens
2. **Projects Management**: Create project list and detail screens
3. **Document Management**: File upload and viewing capabilities
4. **Team Collaboration**: Chat and team member management
5. **Push Notifications**: Implement native push notifications
6. **Offline Support**: Add offline data synchronization
7. **Camera Integration**: Document scanning capabilities
8. **File System**: Native file handling

## Environment Setup

The app detects the platform and adjusts behavior accordingly:
- **Web**: Uses existing React web components when possible
- **iOS/Android**: Uses native React Native components for optimal performance

## Dependencies

### Core Dependencies
- `expo`: Expo SDK
- `react-native`: React Native framework
- `@react-navigation/native`: Navigation library
- `@react-navigation/native-stack`: Stack navigator
- `react-native-screens`: Native screen components
- `react-native-safe-area-context`: Safe area handling

### Development Dependencies
- `@expo/cli`: Expo CLI tools
- `metro-config`: Metro bundler configuration