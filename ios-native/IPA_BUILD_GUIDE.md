# 🍎 iOS IPA Build Guide - GitHub Actions

## Quick Start: Building Your iOS App

Your repository is set up to automatically build iOS IPA files using GitHub Actions. Here's how to use it:

### 🚀 Method 1: Simple Build (For Testing)

1. **Go to GitHub Actions**:
   - Visit your repository on GitHub
   - Click the **"Actions"** tab
   - Select **"🍎 Build iOS App"** workflow

2. **Trigger Manual Build**:
   - Click **"Run workflow"** button
   - Select options:
     - **Build Type**: `simulator` (default)
     - **Export IPA**: `false` (default)
   - Click **"Run workflow"**

3. **Download Results**:
   - Wait for build to complete (5-10 minutes)
   - Click on the completed workflow run
   - Scroll down to **"Artifacts"** section
   - Download `EezyBuild-iOS-simulator-[number]`

### 📱 Method 2: Device IPA Build (Requires Apple Developer Account)

To build IPAs that work on real devices, you need an **Apple Developer Account ($99/year)**.

#### Prerequisites Setup:

1. **Apple Developer Account**
   - Enroll at [developer.apple.com](https://developer.apple.com)
   - Cost: $99/year

2. **Create iOS Distribution Certificate**
   - Go to Apple Developer Portal > Certificates
   - Create "iOS Distribution" certificate
   - Download the `.p12` file (you'll set a password)

3. **Create Provisioning Profile**
   - Go to Apple Developer Portal > Profiles
   - Create "Ad Hoc" or "App Store" profile
   - Include your app's bundle ID: `com.eezybuild.app`
   - Download the `.mobileprovision` file

#### Add Secrets to GitHub:

1. **Go to Repository Settings**:
   - Your repo > Settings > Secrets and variables > Actions

2. **Add Required Secrets**:
   ```
   BUILD_CERTIFICATE_BASE64
   - Convert your .p12 file to base64: `base64 -i certificate.p12 | pbcopy`
   - Paste the base64 string
   
   P12_PASSWORD
   - The password you set for the .p12 certificate
   
   BUILD_PROVISION_PROFILE_BASE64
   - Convert .mobileprovision to base64: `base64 -i profile.mobileprovision | pbcopy`
   - Paste the base64 string
   
   KEYCHAIN_PASSWORD
   - Any secure password for the temporary keychain
   ```

#### Build Device IPA:

1. **Trigger Workflow**:
   - Actions > "🍎 Build iOS App" > "Run workflow"
   - **Build Type**: `device-adhoc` (for testing) or `device-development`
   - **Export IPA**: `true`
   - Click "Run workflow"

2. **Download IPA**:
   - Wait for completion (10-15 minutes)
   - Download artifacts
   - IPA file will be included for device installation

---

## 🔧 Build Options Explained

### Build Types:

| Build Type | Description | Use Case | Requires Certificates |
|------------|-------------|----------|----------------------|
| `simulator` | iOS Simulator only | Testing, development | ❌ No |
| `device-development` | Development devices | Team testing | ✅ Yes |
| `device-adhoc` | Ad Hoc distribution | Beta testing | ✅ Yes |
| `appstore` | App Store submission | Production release | ✅ Yes |

### Export Options:

- **Export IPA**: `true` = Creates installable .ipa file
- **Export IPA**: `false` = Build verification only

---

## 📦 What You Get

### Simulator Build Artifacts:
- ✅ Build verification logs
- ✅ Test results
- ✅ Build information
- ❌ No installable IPA

### Device Build Artifacts:
- ✅ Build verification logs
- ✅ Test results
- ✅ **Installable IPA file**
- ✅ Archive information
- ✅ Build information

---

## 📱 Installing IPA on Devices

### For Development/Ad Hoc IPAs:

1. **Using Xcode**:
   - Connect device to Mac
   - Open Xcode > Window > Devices and Simulators
   - Drag IPA file to device

2. **Using TestFlight** (when configured):
   - IPAs automatically uploaded to TestFlight
   - Share with testers via TestFlight app

3. **Using Third-Party Tools**:
   - Tools like 3uTools, AltStore, or similar
   - Follow tool-specific installation instructions

---

## 🔄 Automatic Triggers

The workflow automatically runs when:

- ✅ **Push to main branch** (simulator build only)
- ✅ **Push to develop branch** (simulator build only)
- ✅ **Pull request to main** (simulator build only)
- ✅ **Manual trigger** (all build types available)

**Note**: Device IPAs are only built on manual triggers with proper configuration.

---

## 🚀 Advanced: TestFlight Deployment

For automatic TestFlight uploads, add these additional secrets:

```
APP_STORE_CONNECT_API_KEY_ID
- Your App Store Connect API Key ID

APP_STORE_CONNECT_API_ISSUER_ID  
- Your App Store Connect Issuer ID

APP_STORE_CONNECT_API_KEY_BASE64
- Your App Store Connect API Key (.p8 file) as base64
```

Then use build type `appstore` with export IPA enabled.

---

## ❓ Troubleshooting

### Common Issues:

1. **"Certificate not found"**
   - Check that `BUILD_CERTIFICATE_BASE64` secret is correctly encoded
   - Verify certificate is valid and not expired

2. **"Provisioning profile mismatch"**
   - Ensure bundle ID matches: `com.eezybuild.app`
   - Verify provisioning profile includes required devices

3. **"Export failed"**
   - Check that certificate and provisioning profile match
   - Verify all required secrets are set

4. **"Upload to TestFlight failed"**
   - Verify App Store Connect API credentials
   - Check that app record exists in App Store Connect

### Getting Help:

- Check the workflow logs in GitHub Actions
- Review the build-info.txt file in downloaded artifacts
- Ensure all secrets are properly configured

---

## 💡 Tips

- **Free Testing**: Use `simulator` builds for initial testing
- **Team Testing**: Use `device-adhoc` for sharing with team members
- **Beta Testing**: Use `appstore` + TestFlight for wider beta testing
- **Production**: Use `appstore` for final App Store submission

Your EezyBuild iOS app is ready to build! 🚀