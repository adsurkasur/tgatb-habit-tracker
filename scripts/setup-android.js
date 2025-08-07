#!/usr/bin/env node

/**
 * Cross-platform setup script for TGATB Habit Tracker Android development
 * Helps users set up the development environment on Windows, macOS, and Linux
 */

import { platform } from 'os';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

const currentPlatform = platform();

console.log('🚀 TGATB Habit Tracker - Android Setup');
console.log('=====================================');
console.log(`Detected platform: ${currentPlatform}`);
console.log('');

// Check Node.js version
console.log('📋 Checking prerequisites...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/');
  process.exit(1);
}

// Check npm
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm: ${npmVersion}`);
} catch (error) {
  console.error('❌ npm not found. Please install npm');
  process.exit(1);
}

// Check Java
console.log('');
console.log('☕ Checking Java installation...');
try {
  let javaCommand;
  if (currentPlatform === 'win32') {
    javaCommand = 'java --version 2>&1';
  } else {
    javaCommand = 'java --version 2>&1 | head -n 1';
  }
  
  const javaOutput = execSync(javaCommand, { 
    encoding: 'utf8',
    shell: currentPlatform === 'win32' ? 'powershell.exe' : '/bin/bash'
  });
  
  const javaVersion = javaOutput.split('\n')[0].trim();
  
  if (javaVersion.includes('17') || javaVersion.includes('18') || javaVersion.includes('19') || javaVersion.includes('20') || javaVersion.includes('21')) {
    console.log(`✅ Java: ${javaVersion}`);
  } else {
    console.log(`⚠️ Java found but may not be compatible: ${javaVersion}`);
    console.log('   Android development requires Java 17 or higher');
  }
} catch (error) {
  console.error('❌ Java not found or not in PATH');
  console.log('');
  console.log('📖 Java Installation Guide:');
  
  switch (currentPlatform) {
    case 'win32':
      console.log('   Windows: Download from https://adoptium.net/ or use:');
      console.log('   > winget install EclipseAdoptium.Temurin.21.JDK');
      break;
    case 'darwin':
      console.log('   macOS: Use Homebrew:');
      console.log('   > brew install openjdk@21');
      console.log('   > echo \'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"\' >> ~/.zshrc');
      break;
    case 'linux':
      console.log('   Linux (Ubuntu/Debian):');
      console.log('   > sudo apt update && sudo apt install openjdk-21-jdk');
      console.log('   Linux (Fedora):');
      console.log('   > sudo dnf install java-21-openjdk-devel');
      break;
    default:
      console.log('   Please install Java 17 or higher from https://adoptium.net/');
  }
}

// Check Android SDK
console.log('');
console.log('📱 Checking Android development environment...');

const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (androidHome && existsSync(androidHome)) {
  console.log(`✅ Android SDK found at: ${androidHome}`);
} else {
  console.log('❌ Android SDK not found');
  console.log('');
  console.log('📖 Android SDK Setup Guide:');
  console.log('   1. Install Android Studio from https://developer.android.com/studio');
  console.log('   2. Open Android Studio and install SDK through SDK Manager');
  console.log('   3. Set environment variables:');
  
  switch (currentPlatform) {
    case 'win32':
      console.log('      Add to System Environment Variables:');
      console.log('      ANDROID_HOME=C:\\Users\\%USERNAME%\\AppData\\Local\\Android\\Sdk');
      console.log('      Add to PATH: %ANDROID_HOME%\\tools;%ANDROID_HOME%\\platform-tools');
      break;
    case 'darwin':
      console.log('      Add to ~/.zshrc or ~/.bash_profile:');
      console.log('      export ANDROID_HOME=$HOME/Library/Android/sdk');
      console.log('      export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools');
      break;
    case 'linux':
      console.log('      Add to ~/.bashrc or ~/.zshrc:');
      console.log('      export ANDROID_HOME=$HOME/Android/Sdk');
      console.log('      export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools');
      break;
  }
}

// Check Capacitor CLI
console.log('');
console.log('⚡ Checking Capacitor...');
try {
  const capVersion = execSync('npx cap --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Capacitor CLI: ${capVersion}`);
} catch (error) {
  console.log('⚠️ Capacitor CLI not found, will be installed with npm install');
}

console.log('');
console.log('🛠️ Setup Instructions:');
console.log('======================');
console.log('1. Install dependencies: npm install');
console.log('2. Build for Android: npm run android:build');
console.log('3. Open in Android Studio: npm run android:open');
console.log('4. Or run directly: npm run android:run');
console.log('');
console.log('📚 Platform-specific notes:');

switch (currentPlatform) {
  case 'win32':
    console.log('   • Use PowerShell or Command Prompt');
    console.log('   • Make sure Windows Subsystem for Android is not interfering');
    console.log('   • Use Android Studio\'s built-in emulator for testing');
    break;
  case 'darwin':
    console.log('   • Xcode is not required for Android development');
    console.log('   • Use Android Studio for emulator management');
    console.log('   • Consider using Homebrew for package management');
    break;
  case 'linux':
    console.log('   • Install Android Studio as a flatpak or snap for easier management');
    console.log('   • You may need to install additional packages: build-essential');
    console.log('   • Ensure your user is in the correct groups for device access');
    break;
}

console.log('');
console.log('✨ Ready to start building Android apps! ✨');
