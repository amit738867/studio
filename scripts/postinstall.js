#!/usr/bin/env node

// Post-install script to handle optional canvas dependency
const fs = require('fs');
const path = require('path');

console.log('Running post-install script...');

// Check if we're in a Vercel environment
if (process.env.VERCEL) {
  console.log('Detected Vercel environment, skipping canvas installation');
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
} else {
  console.log('Not in Vercel environment, canvas should be available');
}

console.log('Post-install script completed');