#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('Starting git sync...');

try {
  console.log('Running git pull...');
  execSync('git pull', { stdio: 'inherit' });
  console.log('Git pull completed successfully.');

  console.log('Running git push...');
  execSync('git push', { stdio: 'inherit' });
  console.log('Git push completed successfully.');

  console.log('Git sync completed.');
} catch (error) {
  console.error('Git sync failed.');
  process.exit(1);
}