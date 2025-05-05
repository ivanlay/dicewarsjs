/**
 * DiceWars Health Check Script
 *
 * This script tests basic functionality of the build system and webpack configuration.
 * It's meant to be run directly from Node.js.
 */

// Check if required files are built
const fs = require('fs');
const path = require('path');

console.log('🎲 DiceWarsJS Health Check 🎲');
console.log('==============================');

function checkFileExists(filePath, description, critical = true) {
  try {
    const fullPath = path.join(__dirname, 'dist', filePath);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      const stats = fs.statSync(fullPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✅ ${description} (${sizeKB}KB) - ${filePath}`);
      return true;
    } else {
      if (critical) {
        console.error(`❌ CRITICAL: ${description} not found - ${filePath}`);
      } else {
        console.warn(`⚠️ WARNING: ${description} not found - ${filePath}`);
      }
      return false;
    }
  } catch (err) {
    console.error(`❌ ERROR checking ${filePath}: ${err.message}`);
    return false;
  }
}

// Check for build output
console.log('\nChecking build output:');
const mainBundleExists = checkFileExists('main.bundle.js', 'Main bundle');
const runtimeBundleExists = checkFileExists('runtime.bundle.js', 'Runtime bundle');
const soundAssetsExists = checkFileExists('sound-assets.bundle.js', 'Sound assets bundle', false);

// Check for legacy files that should be copied
console.log('\nChecking legacy files:');
checkFileExists('game.js', 'Legacy game.js', false);
checkFileExists('main.js', 'Legacy main.js', false);
checkFileExists('areadice.js', 'Legacy areadice.js', false);

// Check for asset modules
console.log('\nChecking assets:');
checkFileExists('assets/sounds/button.wav', 'Button sound', false);
checkFileExists('assets/sounds/dice.wav', 'Dice sound', false);

// Check HTML files
console.log('\nChecking HTML:');
checkFileExists('index.html', 'Main index.html');
checkFileExists('debug.html', 'Debug HTML', false);

// Report summary
console.log('\nSummary:');
if (mainBundleExists && runtimeBundleExists) {
  console.log('✅ Build appears successful. All critical bundles are present.');
  console.log('🔍 To test the application, open http://localhost:8081 in your browser');
  console.log('🔍 For debugging, open http://localhost:8081/debug.html');
} else {
  console.error('❌ Build incomplete. Some critical bundles are missing.');
}

console.log('\nIf you notice any issues:');
console.log('1. Check browser console for JavaScript errors');
console.log('2. Verify that all required chunks and modules are loaded');
console.log('3. Check webpack configuration for asset loading issues');
