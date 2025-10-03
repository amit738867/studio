#!/usr/bin/env node

// Build script that handles optional canvas dependency
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running custom build script...');

// Check if we're in a Vercel environment
const isVercel = !!process.env.VERCEL;

if (isVercel) {
  console.log('Detected Vercel environment, handling canvas dependency...');
  
  // Try to install canvas, but don't fail if it doesn't work
  try {
    execSync('npm install canvas --no-save', { stdio: 'inherit' });
    console.log('Canvas installed successfully');
  } catch (error) {
    console.warn('Failed to install canvas, continuing with build...');
    console.warn('This is expected in some deployment environments');
    
    // Create a dummy canvas module for build time
    const canvasDir = path.join(__dirname, '../node_modules/canvas');
    if (!fs.existsSync(canvasDir)) {
      fs.mkdirSync(canvasDir, { recursive: true });
      fs.writeFileSync(path.join(canvasDir, 'index.js'), `
        // Dummy canvas module for build time
        module.exports = {
          createCanvas: () => {
            throw new Error('Canvas not available in this environment');
          },
          loadImage: () => {
            throw new Error('Canvas not available in this environment');
          }
        };
      `);
    }
  }
}

// Run the actual build command
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}