# Mobile (Capacitor) Setup

- Uses @capacitor-firebase/authentication for Google Auth
- Uses Google Drive REST API for sync

## Setup

1. Install dependencies:
   npm install @capacitor-firebase/authentication firebase
   npx cap sync

2. Configure Firebase project and enable Google provider

3. Add plugin config to capacitor.config.ts

## Usage

### Sign In

import { signInWithGoogle } from './google-auth';
const accessToken = await signInWithGoogle();

### Export Habits

import { uploadHabitsToDrive } from './drive-sync';
const fileId = await uploadHabitsToDrive(habits, accessToken);

### Import Habits

import { downloadHabitsFromDrive } from './drive-sync';
const habits = await downloadHabitsFromDrive(fileId, accessToken);
