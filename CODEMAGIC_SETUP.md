# 🚀 Codemagic iOS Build Setup Guide

Codemagic is often more reliable than GitHub Actions for iOS builds. Here's how to set up your EezyBuild iOS app with Codemagic.

## 🎯 **Quick Start (Free Tier)**

### **1. Connect Repository to Codemagic**

1. **Sign up**: https://codemagic.io/
2. **Connect GitHub**: Link your `call-create-connect1` repository
3. **Select workflow**: Choose `ios-simulator` for free builds

### **2. Automatic Detection**

Codemagic will automatically:
- ✅ Detect the `codemagic.yaml` file
- ✅ Show 3 available workflows
- ✅ Configure build environment

### **3. Test Simulator Build (Free)**

- **Workflow**: `ios-simulator`
- **Triggers**: Automatically on push to `main` or `develop`
- **Duration**: ~10-15 minutes
- **Result**: Validates your app builds correctly

---

## 📱 **Device IPA Builds (Requires Apple Developer Account)**

### **Prerequisites**

1. **Apple Developer Account** ($99/year)
2. **iOS Development Certificate**
3. **Provisioning Profile**
4. **Codemagic Pro subscription** (for private repos and device builds)

### **Setup Steps**

#### **Step 1: Add Certificates to Codemagic**

1. **Go to**: Codemagic Teams > Your Team > Integrations
2. **Click**: "Code signing identities"
3. **Add**: iOS Development Certificate (.p12 file + password)
4. **Add**: Provisioning Profile (.mobileprovision file)
5. **Create group**: Name it `ios_credentials`

#### **Step 2: Trigger Device Build**

- **Method 1**: Create a git tag starting with `v` (e.g., `v1.0.0`)
- **Method 2**: Manual trigger in Codemagic dashboard
- **Workflow**: `ios-device` will run automatically

#### **Step 3: Download IPA**

- **Build artifacts** will include the signed IPA file
- **Install on device** using Xcode, TestFlight, or third-party tools

---

## 🏪 **App Store Builds (Production)**

### **For TestFlight & App Store**

#### **Step 1: App Store Connect Integration**

1. **Go to**: Codemagic Teams > Integrations
2. **Add**: App Store Connect API key
3. **Create group**: `app_store_credentials`

#### **Step 2: Trigger Release Build**

- **Create tag**: `release-v1.0.0` (triggers `ios-appstore` workflow)
- **Automatic**: Builds, signs, and uploads to TestFlight
- **Review**: Submit to App Store when ready

---

## 🔧 **Workflow Overview**

### **1. `ios-simulator` (Free)**
- **Triggers**: Push to `main`/`develop`, Pull Requests
- **Purpose**: Validation and testing
- **Output**: Build verification
- **Cost**: Free (within monthly limits)

### **2. `ios-device` (Paid)**
- **Triggers**: Git tags like `v1.0.0`
- **Purpose**: Device testing and beta distribution
- **Output**: Signed IPA file
- **Cost**: Uses build minutes

### **3. `ios-appstore` (Paid)**
- **Triggers**: Release tags like `release-v1.0.0`
- **Purpose**: Production App Store releases
- **Output**: App Store submission + TestFlight
- **Cost**: Uses build minutes + App Store integration

---

## 💰 **Pricing & Plans**

### **Free Tier**
- ✅ **500 build minutes/month**
- ✅ **Public repositories**
- ✅ **Simulator builds**
- ❌ No device builds or IPA export

### **Paid Plans** (Starting ~$28/month)
- ✅ **Unlimited build minutes**
- ✅ **Private repositories**
- ✅ **Device builds & IPA export**
- ✅ **App Store/TestFlight integration**
- ✅ **Advanced features**

---

## 🎯 **Advantages of Codemagic**

### **vs GitHub Actions**
- ✅ **Better iOS support** (M1 Mac minis)
- ✅ **Faster builds** (dedicated iOS infrastructure)
- ✅ **Easier certificate management**
- ✅ **Built-in App Store integration**
- ✅ **Better error handling** for iOS-specific issues

### **vs Xcode Cloud**
- ✅ **More flexible** configuration
- ✅ **Support for non-Apple CI/CD**
- ✅ **Better pricing** for small teams
- ✅ **Multi-platform** support

---

## 🚀 **Getting Started Commands**

### **Trigger Device Build**
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

### **Trigger App Store Build**
```bash
# Create and push a release tag
git tag release-v1.0.0
git push origin release-v1.0.0
```

### **Check Build Status**
- Visit: https://codemagic.io/apps
- Or get notifications via email/Slack

---

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"No provisioning profile found"**
   - Ensure profile includes your device UDID
   - Check bundle ID matches: `com.eezybuild.app`

2. **"Certificate not trusted"**
   - Verify certificate is valid and not expired
   - Check it's properly uploaded to Codemagic

3. **"Build failed on signing"**
   - Ensure certificate and provisioning profile match
   - Check team ID and bundle ID consistency

### **Getting Help**

- **Codemagic Docs**: https://docs.codemagic.io/
- **Slack Community**: https://codemagicio.slack.com/
- **Support**: support@codemagic.io

---

## ✅ **Next Steps**

1. **Start with simulator builds** (free)
2. **Add certificates** when ready for device testing
3. **Set up App Store integration** for production
4. **Configure notifications** for build status

Your EezyBuild iOS app is ready for professional CI/CD with Codemagic! 🎉