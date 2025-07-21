# App Store Deployment Guide for EezyBuild

This guide covers the complete process of deploying the EezyBuild React Native app to both iOS App Store and Google Play Store using Expo Application Services (EAS).

## Prerequisites

### General Requirements
- Expo account (free): https://expo.dev/signup
- EAS CLI installed: `npm install -g eas-cli`
- Git repository with the project

### iOS App Store Requirements
- Apple Developer Account ($99/year): https://developer.apple.com/programs/
- macOS machine (for local iOS builds, optional with EAS)
- Xcode (latest version recommended)

### Google Play Store Requirements
- Google Play Developer Account ($25 one-time): https://play.google.com/console/
- Android signing key (generated automatically by EAS)

## Setup Process

### 1. Initial EAS Setup

```bash
# Navigate to the native directory
cd native

# Login to Expo
eas login

# Initialize EAS in your project
eas build:configure
```

This will create an `eas.json` file with build configurations.

### 2. Configure App Information

Update `app.json` with your app information:

```json
{
  "expo": {
    "name": "EezyBuild",
    "slug": "eezybuild",
    "version": "1.0.0",
    "scheme": "eezybuild",
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.eezybuild.app",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses camera for document scanning",
        "NSMicrophoneUsageDescription": "This app uses microphone for voice notes"
      }
    },
    "android": {
      "package": "com.eezybuild.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ]
    }
  }
}
```

## iOS App Store Deployment

### Step 1: Apple Developer Account Setup

1. **Enroll in Apple Developer Program**:
   - Visit https://developer.apple.com/programs/
   - Pay $99 annual fee
   - Complete enrollment process

2. **App Store Connect Setup**:
   - Login to https://appstoreconnect.apple.com/
   - Create new app with bundle ID: `com.eezybuild.app`
   - Fill in app information, categories, and metadata

### Step 2: Build iOS App

```bash
# Build for iOS App Store
eas build --platform ios --profile production

# Or build for internal testing
eas build --platform ios --profile preview
```

### Step 3: Submit to App Store

#### Option A: Using EAS Submit (Recommended)
```bash
# Submit directly from EAS
eas submit --platform ios

# Follow prompts to select build and provide App Store Connect credentials
```

#### Option B: Manual Upload
1. Download the `.ipa` file from EAS build
2. Use Xcode or Application Loader to upload to App Store Connect
3. Process the build in App Store Connect

### Step 4: App Store Review

1. **Complete App Information**:
   - App description and keywords
   - Screenshots for all supported devices
   - App icon (1024x1024px)
   - Privacy policy URL
   - Support URL

2. **Submit for Review**:
   - Select the build in App Store Connect
   - Add review notes if needed
   - Submit for Apple review

3. **Review Process**:
   - Typically takes 24-48 hours
   - Apple will test the app for compliance
   - You'll receive approval or rejection via email

## Google Play Store Deployment

### Step 1: Google Play Console Setup

1. **Create Developer Account**:
   - Visit https://play.google.com/console/
   - Pay $25 one-time registration fee
   - Complete account verification

2. **Create App in Console**:
   - Create new app with package name: `com.eezybuild.app`
   - Fill in app details and store listing

### Step 2: Build Android App

```bash
# Build for Google Play Store
eas build --platform android --profile production

# The build will create an AAB (Android App Bundle) file
```

### Step 3: Submit to Google Play

#### Option A: Using EAS Submit (Recommended)
```bash
# Submit directly from EAS
eas submit --platform android

# Follow prompts and provide Google Play Console credentials
```

#### Option B: Manual Upload
1. Download the `.aab` file from EAS build
2. Upload to Google Play Console under "Release management"
3. Complete the release process

### Step 4: Play Store Review

1. **Complete Store Listing**:
   - App description and short description
   - Screenshots for phones and tablets
   - Feature graphic (1024x500px)
   - App icon (512x512px)
   - Content rating questionnaire
   - Privacy policy URL

2. **Release to Production**:
   - Review release summary
   - Submit for Google review
   - Typical review time: 2-3 hours to 1 day

## Build Configuration Details

### EAS Build Profiles

Update `eas.json` for different build types:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Environment Variables

Set production environment variables:

```bash
# Set environment variables for builds
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your_production_url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_production_key"
```

## Required Assets

### App Icons

Create the following icon files:

- **iOS**: `icon.png` (1024x1024px)
- **Android**: `adaptive-icon.png` (1024x1024px)
- **Favicon**: `favicon.png` (48x48px)

### Splash Screens

- **Splash Icon**: `splash-icon.png` (1284x2778px recommended)

### Store Assets

#### iOS App Store
- App Icon: 1024x1024px
- Screenshots: Various sizes for different devices
- Optional: App Preview videos

#### Google Play Store
- App Icon: 512x512px
- Feature Graphic: 1024x500px
- Screenshots: Various sizes for phones/tablets
- Optional: Promo video

## Version Management

### Updating the App

1. **Update Version Numbers**:
   ```json
   {
     "expo": {
       "version": "1.1.0",
       "ios": {
         "buildNumber": "2"
       },
       "android": {
         "versionCode": 2
       }
     }
   }
   ```

2. **Build and Submit**:
   ```bash
   eas build --platform all --profile production
   eas submit --platform all
   ```

### Release Strategy

- **iOS**: Use TestFlight for beta testing
- **Android**: Use Internal/Closed testing tracks
- **Production**: Gradual rollout (start with 5-10% of users)

## Monitoring and Analytics

### Crash Reporting
EAS builds include crash reporting by default. Monitor crashes in:
- Expo dashboard
- Apple App Store Connect
- Google Play Console

### Analytics Integration
Add analytics services like:
- Firebase Analytics
- Amplitude
- Mixpanel

## Troubleshooting

### Common Build Issues

1. **Invalid Bundle Identifier/Package Name**:
   - Ensure uniqueness across app stores
   - Check for typos in configuration

2. **Missing Permissions**:
   - Add required permissions to `app.json`
   - Update Info.plist descriptions for iOS

3. **Build Timeouts**:
   - Reduce bundle size
   - Optimize dependencies

### Common Submission Issues

1. **iOS Rejection Reasons**:
   - Missing privacy policy
   - Incomplete app information
   - UI/UX issues
   - Performance problems

2. **Android Rejection Reasons**:
   - Policy violations
   - Technical issues
   - Incomplete metadata

## Support Resources

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **Apple Developer**: https://developer.apple.com/documentation/
- **Google Play**: https://developer.android.com/distribute

## Cost Summary

| Service | Cost | Frequency |
|---------|------|-----------|
| Apple Developer Account | $99 | Annual |
| Google Play Developer Account | $25 | One-time |
| Expo (for builds) | Free tier available | Monthly |
| EAS Build (if exceeding free tier) | $29+/month | Monthly |

This guide should cover everything needed to successfully deploy EezyBuild to both app stores. The process typically takes 1-2 weeks for first-time submissions including review times.