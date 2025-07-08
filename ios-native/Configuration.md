# EezyBuild iOS Configuration Guide

## 🔧 **SUPABASE SETUP**

To connect your native iOS app to your existing Supabase backend, you need to update the configuration in `SupabaseService.swift`.

### **Step 1: Find Your Supabase Credentials**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your EezyBuild project
3. Navigate to **Settings** → **API**
4. Copy these values:
   - **Project URL** (starts with `https://`)
   - **Anon Key** (starts with `eyJ`)

### **Step 2: Update the iOS App**

Open `ios-native/EezyBuild/EezyBuild/Services/SupabaseService.swift` and replace:

```swift
// TODO: Replace with your actual Supabase configuration
private let supabaseURL = "YOUR_SUPABASE_URL"
private let supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"
```

With your actual values:

```swift
// Your actual Supabase configuration
private let supabaseURL = "https://yourproject.supabase.co"
private let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Step 3: Verify Connection**

1. Build and run the app in Xcode
2. Try to create a new account or sign in
3. If successful, you'll see the main app interface
4. If there are errors, check the Xcode console for details

## 📱 **BUNDLE IDENTIFIER SETUP**

For App Store deployment, you'll need a unique bundle identifier:

### **Step 1: Choose Your Bundle ID**
- Format: `com.yourcompany.eezybuild`
- Example: `com.acme.eezybuild`
- Must be unique across the App Store

### **Step 2: Update in Xcode**
1. Open `EezyBuild.xcodeproj`
2. Select the project in the navigator
3. Under **Targets** → **EezyBuild** → **General**
4. Change **Bundle Identifier** to your chosen ID

## 🎨 **APP ICONS & BRANDING**

### **Required Icon Sizes**
Add your app icons to `Assets.xcassets/AppIcon.appiconset/`:

- 60x60 (iPhone 2x)
- 120x120 (iPhone 3x)
- 76x76 (iPad 1x)
- 152x152 (iPad 2x)
- 167x167 (iPad Pro 2x)
- 180x180 (iPhone 3x)
- 1024x1024 (App Store)

### **Design Guidelines**
- Use your EezyBuild logo
- Ensure good contrast
- Test on both light and dark backgrounds
- Follow [Apple's Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## 🔐 **SIGNING & CERTIFICATES**

For device testing and App Store deployment:

### **Step 1: Apple Developer Account**
- Sign up at [developer.apple.com](https://developer.apple.com)
- Cost: $99/year

### **Step 2: Xcode Signing**
1. In Xcode, select your project
2. Go to **Signing & Capabilities**
3. Check **Automatically manage signing**
4. Select your Apple Developer team
5. Xcode will handle the rest automatically

## 🚀 **FIRST BUILD**

### **Quick Test Checklist**

1. ✅ Supabase credentials updated
2. ✅ Bundle identifier set
3. ✅ Signing configured
4. ✅ Device/simulator selected
5. ✅ Press `Cmd+R` to build and run

### **Common Issues**

**Build Errors:**
- Check Supabase URLs are valid
- Ensure proper quotation marks around strings
- Verify bundle identifier format

**Runtime Errors:**
- Check Supabase credentials are correct
- Verify your Supabase project is active
- Check network connectivity

**Signing Issues:**
- Ensure Apple Developer account is active
- Verify bundle ID is unique
- Check certificate validity

## 📞 **SUPPORT**

If you encounter any issues:

1. Check the Xcode console for error messages
2. Verify Supabase project status in dashboard
3. Test API endpoints manually
4. Check this configuration is correct

---

## 🎯 **NEXT STEPS**

Once configured:

1. **Test thoroughly** on different devices
2. **Add your branding** (icons, colors)
3. **Customize features** as needed
4. **Prepare for App Store** submission

Your native iOS app is ready to provide users with a premium mobile experience! 🚀