#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

const apiPath = join(projectRoot, 'app', 'api');
const backupPath = join(projectRoot, 'temp-api-backup');
const backupApiPath = join(backupPath, 'api');

const action = process.argv[2];

if (action === 'move-out') {
  console.log('📁 Moving API routes out for Android build...');
  
  // Create backup directory if it doesn't exist
  if (!existsSync(backupPath)) {
    mkdirSync(backupPath, { recursive: true });
  }
  
  // Move API directory to backup location
  if (existsSync(apiPath)) {
    try {
      // Use appropriate move command for platform
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        execSync(`move "${apiPath}" "${backupApiPath}"`, { stdio: 'inherit' });
      } else {
        execSync(`mv "${apiPath}" "${backupApiPath}"`, { stdio: 'inherit' });
      }
      console.log('✅ API routes moved to backup location');
    } catch (error) {
      console.error('❌ Failed to move API routes:', error.message);
      process.exit(1);
    }
  } else {
    console.log('ℹ️ No API directory found to move');
  }
  
} else if (action === 'move-back') {
  console.log('📁 Moving API routes back...');
  
  // Move API directory back from backup
  if (existsSync(backupApiPath)) {
    try {
      // Use appropriate move command for platform
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        execSync(`move "${backupApiPath}" "${apiPath}"`, { stdio: 'inherit' });
      } else {
        execSync(`mv "${backupApiPath}" "${apiPath}"`, { stdio: 'inherit' });
      }
      console.log('✅ API routes restored');
    } catch (error) {
      console.error('❌ Failed to restore API routes:', error.message);
      process.exit(1);
    }
  }
  
  // Clean up backup directory
  if (existsSync(backupPath)) {
    try {
      rmSync(backupPath, { recursive: true, force: true });
      console.log('✅ Backup directory cleaned up');
    } catch (error) {
      console.warn('⚠️ Could not clean up backup directory:', error.message);
    }
  }
  
} else {
  console.error('❌ Usage: node api-backup.js [move-out|move-back]');
  process.exit(1);
}
