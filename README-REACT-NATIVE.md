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
- ✅ React Native navigation with React Navigation (Stack + Tabs)
- ✅ Authentication system with login/logout
- ✅ Shared component library (ActionCard, NotificationCard, CameraScanner)
- ✅ TypeScript support with comprehensive type definitions
- ✅ Dark theme design consistent across all screens
- ✅ Cross-platform compatibility (iOS, Android, Web)
- ✅ EAS Build configuration for app store deployment
- ✅ Projects Management with CRUD operations
- ✅ Document Management with file handling
- ✅ Team Collaboration with member management
- ✅ Push Notifications support with Expo Notifications
- ✅ Offline Support with AsyncStorage and sync capabilities
- ✅ Camera Integration for document scanning
- ✅ Native File System handling
- ✅ Network status monitoring
- ✅ Settings and user profile management

### Screens Implemented
- **Authentication Screen**: Login and registration with form validation
- **Home Screen**: Main dashboard with quick actions and navigation
- **Projects Screen**: List, create, and manage building projects
- **Project Detail Screen**: Detailed project view with progress tracking
- **Documents Screen**: File management with upload, scan, and sharing
- **Team Screen**: Team member management and collaboration
- **Notifications Screen**: Display and manage notifications with different types
- **Settings Screen**: User profile, app preferences, and account management

### Shared Components
- **ActionCard**: Reusable action buttons with consistent styling
- **NotificationCard**: Styled notification items with different types
- **CameraScanner**: Document scanning with camera integration

### Utilities and Services
- **Offline Storage**: Complete offline data management with AsyncStorage
- **Network Status**: Real-time network connectivity monitoring
- **Push Notifications**: Full notification system with categories and actions

## App Store Configuration

### iOS Configuration
- Bundle Identifier: `com.eezybuild.app`
- App Name: `EezyBuild`
- Supports iPad: Yes

### Android Configuration
- Package Name: `com.eezybuild.app`
- App Name: `EezyBuild`
- Build Type: APK (configurable for AAB)

## Next Steps for Advanced Features

1. **Real-time Chat**: Implement WebSocket-based chat system
2. **File Sync**: Cloud storage integration for document synchronization
3. **Advanced Camera**: OCR text recognition for scanned documents
4. **Geolocation**: Project location tracking and mapping
5. **Analytics**: Usage analytics and project insights
6. **Collaboration Tools**: Real-time document editing and commenting
7. **Integration APIs**: Connect with external building management systems
8. **Advanced Security**: Biometric authentication and encryption

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