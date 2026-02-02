# 📱 Android Development Setup

This guide helps you set up Android development for the TGATB Habit Tracker on **Windows**, **macOS**, and **Linux**.

> Audit note (2025-12-12): The codebase includes a working Capacitor configuration and Android Gradle settings (AGP `8.13.0`). System bar handling is centralized in `hooks/use-system-bars-unified.ts`. Before building, confirm your local JDK, Gradle and Android SDK versions match the project requirements and consult `docs/ANDROID_15_COMPATIBILITY.md` for Android 15 specifics.

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
| **Java JDK** | 21 | Android compilation |
| **Android Studio** | Latest | IDE and SDK |
| **Git** | Latest | Version control |

---

### 🖥️ Windows Setup

#### Windows: Install Java

```powershell
# Using winget (recommended)
winget install EclipseAdoptium.Temurin.21.JDK

# Or download from https://adoptium.net/
```

#### Windows: Install Android Studio

1. Download from [Android Developer](https://developer.android.com/studio)
2. Run installer and follow setup wizard
3. Install Android SDK through SDK Manager

#### Windows: Environment variables

```powershell
# Add to System Environment Variables
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk

# Add to PATH
%ANDROID_HOME%\tools
%ANDROID_HOME%\platform-tools
```

#### Windows: Verify installation

```powershell
java --version
adb version
npm run setup:android
```

---

### 🍎 macOS Setup

#### macOS: Install Java

```bash
# Using Homebrew (recommended)
brew install openjdk@21

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### macOS: Install Android Studio

```bash
# Using Homebrew Cask
brew install --cask android-studio

# Or download from https://developer.android.com/studio
```

#### macOS: Environment variables

Add to `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### macOS: Verify installation

```bash
java --version
adb version
npm run setup:android
```

---

### 🐧 Linux Setup

#### Linux: Install Java

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-21-jdk

# Fedora
sudo dnf install java-21-openjdk-devel

# Arch Linux
sudo pacman -S jdk21-openjdk
```

#### Linux: Install Android Studio

```bash
# Using Flatpak (recommended)
flatpak install flathub com.google.AndroidStudio

# Using Snap
sudo snap install android-studio --classic

# Or download from https://developer.android.com/studio
```

#### Linux: Environment variables

Add to `~/.bashrc` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### Linux: Additional packages

```bash
# Ubuntu/Debian
sudo apt install build-essential

# Fedora
sudo dnf groupinstall "Development Tools"
```

#### Linux: Device access (physical device)

```bash
# Add user to plugdev group
sudo usermod -a -G plugdev $USER

# Create udev rules for Android devices
sudo curl -o /etc/udev/rules.d/51-android.rules https://raw.githubusercontent.com/M0Rf30/android-udev-rules/master/51-android.rules
sudo udevadm control --reload-rules
```

#### Linux: Verify installation

```bash
java --version
adb version
npm run setup:android
```

---

## 🛠️ Build Commands

| Command | Description |
|---------|-------------|
| `npm run setup:android` | Check prerequisites and setup guide |
| `npm run android:build` | Build Android APK |
| `npm run android:open` | Open project in Android Studio |
| `npm run android:run` | Build and run on connected device |
| `npm run android:sync` | Sync Capacitor plugins |

---

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

---

## 🛠️ Troubleshooting

### Common issues

#### "Java not found"

- Ensure Java 17-21 is installed
- Check JAVA_HOME environment variable
- Restart terminal after setting environment variables

#### "Android SDK not found"

- Install Android Studio completely
- Set ANDROID_HOME environment variable
- Install Android SDK through Android Studio SDK Manager

#### "Device not found"

- Enable USB Debugging on device
- Install device drivers (Windows)
- Check USB cable (data cable, not charging-only)
- Run `adb devices` to verify

#### "Build failed"

- Run `npm run setup:android` to check prerequisites
- Clear Gradle cache: `cd android && ./gradlew clean`
- Sync project: `npm run android:sync`

### Platform-specific issues

#### Windows

- Use PowerShell as Administrator if needed
- Disable Windows Defender real-time protection temporarily during build
- Ensure no spaces in your project path

#### macOS

- Grant Android Studio permissions in System Preferences
- Use `sudo` only if absolutely necessary
- Check Gatekeeper permissions for Android Studio

#### Linux

- Install missing development packages
- Check user permissions for device access
- Ensure snap/flatpak Android Studio has necessary permissions

---

## 📚 Additional Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Developer Guides](https://developer.android.com/guide)
- [Gradle Build Tool](https://gradle.org/guides/)

---

## 🎯 Next Steps

Once your environment is set up:

1. Customize app icon and splash screen in `android/app/src/main/res/`
2. Configure app permissions in `android/app/src/main/AndroidManifest.xml`
3. Build release APK: `cd android && ./gradlew assembleRelease`

4. CI: Upload to Play Store (internal test)

   - A CI job `upload-playstore` is available which builds a signed AAB and uploads it to the **internal** test track using the Play Console API.
   - Triggers: `workflow_dispatch` (manual) or tag push matching `v*`.
   - Required GitHub Secrets (add these to the repository Settings → Secrets & variables → Actions):
     - `ANDROID_KEYSTORE_BASE64` (base64 of your keystore file)
     - `ANDROID_KEYSTORE_PASSWORD`
     - `ANDROID_KEY_ALIAS`
     - `ANDROID_KEY_PASSWORD`
     - `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (content of service account JSON)
   - To test locally before adding secrets: add `release.keystore` to `android/app/` and set `android/gradle.properties` with `storeFile`, `androidKeystorePassword`, `androidKeyPassword`, and `androidKeyAlias` (do NOT commit these values).

5. Prepare for Play Store: [Publishing Guide](https://developer.android.com/studio/publish)
