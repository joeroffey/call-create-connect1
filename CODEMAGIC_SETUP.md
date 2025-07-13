# Codemagic Setup Guide for APK and IPA Builds

This guide will help you configure Codemagic to build both Android APK and iOS IPA files for your EezyBuild app.

## Prerequisites

1. **Codemagic Account**: Sign up at [codemagic.io](https://codemagic.io)
2. **Repository Access**: Connect your GitHub repository to Codemagic
3. **Android Keystore**: For signing Android APKs
4. **iOS Certificates**: For signing iOS IPAs (App Store Connect account required)

## Quick Start

1. **Connect Repository**:
   - Go to your Codemagic dashboard
   - Click "Add application"
   - Select your repository
   - Codemagic will automatically detect the `codemagic.yaml` configuration

2. **Configure Environment Variables** (see detailed sections below)

3. **Run Builds**:
   - **Android**: Push to `main` or `develop` branch to trigger `android-build`
   - **iOS**: Push to `main` or `develop` branch to trigger `ios-build`
   - **Development**: Create PR to `develop` branch to trigger `dev-build`

## Android Configuration

### 1. Generate Android Keystore

```bash
# Generate keystore (run this locally)
keytool -genkey -v -keystore keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key0

# Convert to base64 for Codemagic
base64 -i keystore.jks | pbcopy  # macOS
base64 -i keystore.jks | xclip -selection clipboard  # Linux
```

### 2. Configure Android Environment Variables

In your Codemagic app settings → Environment variables:

| Variable | Type | Value |
|----------|------|-------|
| `CM_KEYSTORE` | Secure | Base64 encoded keystore file |
| `CM_KEYSTORE_PASSWORD` | Secure | Keystore password |
| `CM_KEY_ALIAS` | Secure | Key alias (usually `key0`) |
| `CM_KEY_PASSWORD` | Secure | Key password |

### 3. Google Play Console (Optional)

For automatic publishing to Google Play:

1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Add to Codemagic environment variables:
   - `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`: JSON key file content

## iOS Configuration

### 1. App Store Connect Setup

1. **Create App ID**:
   - Go to Apple Developer Portal
   - Create App ID with identifier: `com.eezybuild.app`
   - Enable required capabilities (Push Notifications, etc.)

2. **App Store Connect**:
   - Create new app in App Store Connect
   - Note the App ID number (replace `1234567890` in `codemagic.yaml`)

### 2. Code Signing Setup

**Option A: Automatic (Recommended)**
- Codemagic will automatically generate certificates and profiles
- Requires App Store Connect API key (see below)

**Option B: Manual**
- Upload certificates and provisioning profiles manually
- More control but requires manual maintenance

### 3. Configure iOS Environment Variables

In your Codemagic app settings → Environment variables:

| Variable | Type | Value |
|----------|------|-------|
| `APP_ID` | Text | Your App Store Connect App ID |
| `BUNDLE_ID` | Text | `com.eezybuild.app` |
| `APP_STORE_CONNECT_ISSUER_ID` | Secure | From App Store Connect API |
| `APP_STORE_CONNECT_KEY_IDENTIFIER` | Secure | From App Store Connect API |
| `APP_STORE_CONNECT_PRIVATE_KEY` | Secure | From App Store Connect API |

### 4. App Store Connect API Key

1. Go to App Store Connect → Users and Access → Keys
2. Create new key with "Developer" role
3. Download the .p8 file
4. Note the Key ID and Issuer ID
5. Add to Codemagic environment variables

## Build Configuration

### Available Workflows

1. **`android-build`**: 
   - Builds signed Android APK
   - Publishes to Google Play (internal track)
   - Triggers on: push to `main`/`develop`

2. **`ios-build`**: 
   - Builds signed iOS IPA
   - Publishes to TestFlight
   - Triggers on: push to `main`/`develop`

3. **`dev-build`**: 
   - Builds unsigned debug versions
   - Runs tests and linting
   - Triggers on: pull requests to `develop`

### Customization

Edit `codemagic.yaml` to customize:

- **Build triggers**: Modify `triggering.branch_patterns`
- **Build duration**: Adjust `max_build_duration`
- **Publishing**: Configure `publishing` sections
- **Environment**: Update `environment.vars`

## Troubleshooting

### Common Android Issues

1. **Keystore errors**: Ensure base64 encoding is correct
2. **Gradle errors**: Check Android SDK/NDK versions
3. **Signing errors**: Verify keystore passwords

### Common iOS Issues

1. **Code signing**: Ensure App Store Connect API key is valid
2. **Build failures**: Check Xcode version compatibility
3. **App Store Connect**: Verify App ID and bundle identifier

### General Issues

1. **Dependencies**: Ensure `package.json` is up to date
2. **Capacitor sync**: Make sure web assets build correctly
3. **Environment**: Check Node.js version compatibility

## Build Artifacts

### Android
- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Mapping**: `android/app/build/outputs/mapping/release/mapping.txt`

### iOS
- **IPA**: `build/ios/ipa/App.ipa`
- **dSYM**: `build/ios/dsym/App.app.dSYM.zip`
- **Archive**: `build/ios/xcarchive/App.xcarchive`

## Next Steps

1. **Test Builds**: Start with `dev-build` workflow
2. **Configure Signing**: Set up Android keystore and iOS certificates
3. **Production Builds**: Use `android-build` and `ios-build` workflows
4. **Store Submission**: Configure automatic publishing (optional)

## Support

- **Codemagic Docs**: [docs.codemagic.io](https://docs.codemagic.io)
- **Capacitor Docs**: [capacitorjs.com](https://capacitorjs.com)
- **Issues**: Check build logs in Codemagic dashboard

---

**Note**: Replace `1234567890` in `codemagic.yaml` with your actual App Store Connect App ID before running iOS builds.