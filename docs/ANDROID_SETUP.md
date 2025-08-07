# 📱 Android Development Setup

This guide helps you set up Android development for the TGATB Habit Tracker on **Windows**, **macOS**, and **Linux**.

## 🚀 Quick Start

1. **Check prerequisites**: `npm run setup:android`
2. **Install dependencies**: `npm install`
3. **Build Android app**: `npm run android:build`
4. **Open in Android Studio**: `npm run android:open`

## 📋 Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Java JDK** | 17-21 | Android compilation |
| **Android Studio** | Latest | IDE and SDK |
| **Git** | Latest | Version control |

### 🖥️ Platform-Specific Setup

<details>
<summary><strong>🪟 Windows Setup</strong></summary>

#### Install Java
```powershell
# Using winget (recommended)
winget install EclipseAdoptium.Temurin.21.JDK

# Or download from https://adoptium.net/
```

#### Install Android Studio
1. Download from [Android Developer](https://developer.android.com/studio)
2. Run installer and follow setup wizard
3. Install Android SDK through SDK Manager

#### Environment Variables
```powershell
# Add to System Environment Variables
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk

# Add to PATH
%ANDROID_HOME%\tools
%ANDROID_HOME%\platform-tools
```

#### Verify Installation
```powershell
java --version
adb version
npm run setup:android
```

</details>

<details>
<summary><strong>🍎 macOS Setup</strong></summary>

#### Install Java
```bash
# Using Homebrew (recommended)
brew install openjdk@21

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Install Android Studio
```bash
# Using Homebrew Cask
brew install --cask android-studio

# Or download from https://developer.android.com/studio
```

#### Environment Variables
Add to `~/.zshrc` or `~/.bash_profile`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### Verify Installation
```bash
java --version
adb version
npm run setup:android
```

</details>

<details>
<summary><strong>🐧 Linux Setup</strong></summary>

#### Install Java
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-21-jdk

# Fedora
sudo dnf install java-21-openjdk-devel

# Arch Linux
sudo pacman -S jdk21-openjdk
```

#### Install Android Studio
```bash
# Using Flatpak (recommended)
flatpak install flathub com.google.AndroidStudio

# Using Snap
sudo snap install android-studio --classic

# Or download from https://developer.android.com/studio
```

#### Environment Variables
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### Additional Packages
```bash
# Ubuntu/Debian
sudo apt install build-essential

# Fedora
sudo dnf groupinstall "Development Tools"
```

#### Device Access (if using physical device)
```bash
# Add user to plugdev group
sudo usermod -a -G plugdev $USER

# Create udev rules for Android devices
sudo curl -o /etc/udev/rules.d/51-android.rules https://raw.githubusercontent.com/M0Rf30/android-udev-rules/master/51-android.rules
sudo udevadm control --reload-rules
```

#### Verify Installation
```bash
java --version
adb version
npm run setup:android
```

</details>

## 🛠️ Build Commands

| Command | Description |
|---------|-------------|
| `npm run setup:android` | Check prerequisites and setup guide |
| `npm run android:build` | Build Android APK |
| `npm run android:open` | Open project in Android Studio |
| `npm run android:run` | Build and run on connected device |
| `npm run android:sync` | Sync Capacitor plugins |

## 📱 Testing Your App

### Using Android Emulator
1. Open Android Studio
2. AVD Manager → Create Virtual Device
3. Choose device definition and API level
4. Run: `npm run android:run`

### Using Physical Device
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect via USB cable
4. Run: `adb devices` to verify connection
5. Run: `npm run android:run`

### APK Installation
```bash
# Find your built APK
ls android/app/build/outputs/apk/debug/

# Install on connected device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔧 Troubleshooting

<details>
<summary><strong>Common Issues</strong></summary>

### "Java not found"
- Ensure Java 17-21 is installed
- Check JAVA_HOME environment variable
- Restart terminal after setting environment variables

### "Android SDK not found"
- Install Android Studio completely
- Set ANDROID_HOME environment variable
- Install Android SDK through Android Studio SDK Manager

### "Device not found"
- Enable USB Debugging on device
- Install device drivers (Windows)
- Check USB cable (data cable, not charging-only)
- Run `adb devices` to verify

### "Build failed"
- Run `npm run setup:android` to check prerequisites
- Clear Gradle cache: `cd android && ./gradlew clean`
- Sync project: `npm run android:sync`

### Platform-specific Issues

**Windows:**
- Use PowerShell as Administrator if needed
- Disable Windows Defender real-time protection temporarily during build
- Ensure no spaces in your project path

**macOS:**
- Grant Android Studio permissions in System Preferences
- Use `sudo` only if absolutely necessary
- Check Gatekeeper permissions for Android Studio

**Linux:**
- Install missing development packages
- Check user permissions for device access
- Ensure snap/flatpak Android Studio has necessary permissions

</details>

## 📚 Additional Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Developer Guides](https://developer.android.com/guide)
- [Gradle Build Tool](https://gradle.org/guides/)

## 🎯 Next Steps

Once your environment is set up:
1. Customize app icon and splash screen in `android/app/src/main/res/`
2. Configure app permissions in `android/app/src/main/AndroidManifest.xml`
3. Build release APK: `cd android && ./gradlew assembleRelease`
4. Prepare for Play Store: [Publishing Guide](https://developer.android.com/studio/publish)
