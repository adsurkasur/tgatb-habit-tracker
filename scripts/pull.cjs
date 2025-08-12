#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('Running git pull...');
try {
  execSync('git pull', { stdio: 'inherit' });
  console.log('Git pull completed successfully.');
} catch (error) {
  console.error('Git pull failed.');
  process.exit(1);
}
