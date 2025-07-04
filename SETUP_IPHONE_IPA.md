# 📱 Setup iPhone IPA Build - Step by Step Guide

Since you have an Apple Developer account, let's get your iOS app building and running on your iPhone!

## 🚀 Quick Steps to Build IPA for iPhone

### Step 1: Create iOS Development Certificate

1. **Open Keychain Access** on your Mac
2. **Go to**: Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority
3. **Fill out**:
   - User Email: Your Apple ID email
   - Common Name: Your name
   - CA Email: Leave blank
   - Select: "Saved to disk"
4. **Save** the `.certSigningRequest` file to your desktop

5. **Go to Apple Developer Portal**:
   - Visit: https://developer.apple.com/account/resources/certificates/list
   - Click **"+"** to create new certificate
   - Select **"iOS Development"** (for testing on your device)
   - Upload your `.certSigningRequest` file
   - Download the certificate (`.cer` file)

6. **Install Certificate**:
   - Double-click the downloaded `.cer` file
   - It will install in Keychain Access

### Step 2: Export Certificate as P12

1. **Open Keychain Access**
2. **Find your certificate** (should be under "My Certificates")
3. **Right-click** the certificate > Export
4. **Save as**: `EezyBuild_Certificate.p12`
5. **Set a password** (remember this!)
6. **Save to desktop**

### Step 3: Create Provisioning Profile

1. **Register your iPhone**:
   - Go to: https://developer.apple.com/account/resources/devices/list
   - Click **"+"** to add device
   - Get your iPhone UDID:
     - Connect iPhone to Mac
     - Open Finder > iPhone > General tab
     - Click on serial number to show UDID
     - Copy UDID
   - Name: "My iPhone" and paste UDID

2. **Create App ID** (if not exists):
   - Go to: https://developer.apple.com/account/resources/identifiers/list
   - Click **"+"**
   - Select: App IDs > App
   - Bundle ID: `com.eezybuild.app` (exactly this)
   - Name: "EezyBuild"

3. **Create Provisioning Profile**:
   - Go to: https://developer.apple.com/account/resources/profiles/list
   - Click **"+"**
   - Select: **"iOS App Development"**
   - Select your EezyBuild App ID
   - Select your development certificate
   - Select your iPhone device
   - Name: "EezyBuild Development"
   - Download the `.mobileprovision` file

### Step 4: Add Secrets to GitHub

1. **Convert P12 to Base64**:
   ```bash
   # Open Terminal and run:
   base64 -i ~/Desktop/EezyBuild_Certificate.p12 | pbcopy
   ```
   This copies the base64 string to your clipboard.

2. **Convert Provisioning Profile to Base64**:
   ```bash
   # In Terminal:
   base64 -i ~/Downloads/EezyBuild_Development.mobileprovision | pbcopy
   ```

3. **Add to GitHub Secrets**:
   - Go to your repository on GitHub
   - Settings > Secrets and variables > Actions
   - Click **"New repository secret"**
   - Add these 4 secrets:

   **SECRET 1:**
   - Name: `BUILD_CERTIFICATE_BASE64`
   - Value: Paste the P12 base64 string

   **SECRET 2:**
   - Name: `P12_PASSWORD`
   - Value: The password you set for the P12 file

   **SECRET 3:**
   - Name: `BUILD_PROVISION_PROFILE_BASE64`
   - Value: Paste the provisioning profile base64 string

   **SECRET 4:**
   - Name: `KEYCHAIN_PASSWORD`
   - Value: Any secure password (e.g., `MySecurePassword123`)

### Step 5: Build IPA for iPhone

1. **Go to GitHub Actions**:
   - Your repo > Actions tab
   - Click **"🍎 Build iOS App"**

2. **Run Workflow**:
   - Click **"Run workflow"**
   - **Build Type**: Select `device-development`
   - **Export IPA**: Select `true` ✅
   - Click **"Run workflow"**

3. **Wait for Build** (10-15 minutes):
   - The workflow will build your app with your certificates
   - Create a signed IPA file

4. **Download IPA**:
   - Once complete, scroll down to **"Artifacts"**
   - Download: `EezyBuild-iOS-device-development-[number]`
   - Extract the zip file
   - Find the `.ipa` file

### Step 6: Install on iPhone

**Method 1: Using Xcode**
1. Connect iPhone to Mac
2. Open Xcode > Window > Devices and Simulators
3. Select your iPhone
4. Drag the `.ipa` file to the "Installed Apps" section

**Method 2: Using Finder (macOS Catalina+)**
1. Connect iPhone to Mac
2. Open Finder > iPhone
3. Click "Files" tab
4. Drag the `.ipa` file to install

**Method 3: Using 3uTools or similar**
1. Download 3uTools or AltStore
2. Connect iPhone
3. Use the tool to install the IPA

## 🔧 Troubleshooting

### If the build fails:

1. **Check the workflow logs** in GitHub Actions
2. **Verify all 4 secrets** are correctly set
3. **Ensure your iPhone is registered** in the provisioning profile
4. **Check that bundle ID matches**: `com.eezybuild.app`

### Common Issues:

- **"No matching certificates"**: Make sure you created an iOS Development certificate
- **"Device not found"**: Register your iPhone UDID in Apple Developer Portal
- **"Invalid provisioning profile"**: Ensure it includes your certificate and device

## 🎉 Success!

Once installed, you'll have the EezyBuild app running natively on your iPhone with:
- ✅ Supabase integration
- ✅ All your project data
- ✅ Native iOS performance
- ✅ Push notifications (when enabled)

## 🚀 Next Steps

- Test the app thoroughly on your iPhone
- For beta testing with others, use "Ad Hoc" distribution
- For App Store submission, use "App Store" build type

**Questions?** Check the build logs in GitHub Actions for detailed error messages!