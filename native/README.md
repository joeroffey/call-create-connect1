# EezyBuild Native - React Native + Expo Implementation

This directory contains the React Native + Expo implementation of EezyBuild, providing a native mobile experience for iOS and Android.

## Architecture

- **React Native + Expo**: For cross-platform native mobile development
- **Expo Router**: File-based routing system
- **Supabase**: Backend integration (shared with web app)
- **TypeScript**: Type safety
- **Expo Build Service (EAS)**: For building and deploying to app stores

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development on macOS)
- Android Studio and emulator (for Android development)

### Installation

```bash
# From the root directory
cd native
npm install
```

### Development

```bash
# Start the development server
npm start

# Run on iOS simulator (macOS only)
npm run ios

# Run on Android emulator
npm run android

# Run in web browser (for testing)
npm run web
```

### Building for Production

#### Setup EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure the project
eas build:configure
```

#### Build Apps

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios

# Build for both platforms
eas build --platform all
```

### Submitting to App Stores

```bash
# Submit to Google Play Store
npm run submit:android

# Submit to Apple App Store
npm run submit:ios
```

## Features

### Implemented
- ✅ Authentication (Login/Register)
- ✅ Main chat interface
- ✅ Advanced search
- ✅ Workspace/projects view
- ✅ User profile and settings
- ✅ Tab-based navigation
- ✅ Dark theme
- ✅ Supabase integration

### To Be Added
- 🔄 Real chat functionality with AI
- 🔄 Push notifications
- 🔄 Document management
- 🔄 Team collaboration
- 🔄 Subscription management
- 🔄 Deep linking
- 🔄 Offline support

## App Store Deployment

### iOS App Store

1. **Prerequisites**:
   - Apple Developer Account ($99/year)
   - iOS Distribution Certificate
   - App Store Provisioning Profile

2. **Build Configuration**:
   ```json
   {
     "ios": {
       "bundleIdentifier": "com.eezybuild.app",
       "buildNumber": "1.0.0"
     }
   }
   ```

3. **Submission Process**:
   - Build with EAS: `eas build --platform ios`
   - Submit with EAS: `eas submit --platform ios`
   - Review in App Store Connect

### Android Play Store

1. **Prerequisites**:
   - Google Play Developer Account ($25 one-time)
   - Android signing key

2. **Build Configuration**:
   ```json
   {
     "android": {
       "package": "com.eezybuild.app",
       "versionCode": 1
     }
   }
   ```

3. **Submission Process**:
   - Build with EAS: `eas build --platform android`
   - Submit with EAS: `eas submit --platform android`
   - Review in Google Play Console

## Project Structure

```
native/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Landing screen
├── components/            # Reusable components
├── services/              # API and service layer
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── assets/                # Static assets (images, icons)
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
└── package.json          # Dependencies and scripts
```

## Shared Logic

The React Native app shares business logic with the web app through:

- **Supabase Client**: Same backend and authentication
- **API Layer**: Shared service functions
- **Types**: Common TypeScript definitions
- **Utils**: Shared utility functions

## Development Guidelines

### Code Style
- Use TypeScript for all files
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

### Performance
- Use FlatList for large lists
- Implement proper memoization with React.memo
- Optimize image loading and caching
- Minimize bundle size

### Testing
- Use Jest for unit tests
- Use Detox for E2E testing (optional)
- Test on both iOS and Android devices

## Environment Variables

Create a `.env` file in the native directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**:
   ```bash
   npx expo start --clear
   ```

2. **Build failures**:
   - Check EAS build logs
   - Ensure all dependencies are compatible
   - Verify app.json configuration

3. **iOS simulator not starting**:
   - Ensure Xcode is installed
   - Reset iOS simulator

4. **Android emulator issues**:
   - Ensure Android Studio is installed
   - Check AVD configuration

## Contributing

1. Create feature branch from main
2. Implement changes in the native directory
3. Test on both iOS and Android
4. Submit pull request

## Support

For issues specific to the React Native implementation, please check:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)