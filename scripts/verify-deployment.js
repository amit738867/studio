#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment configuration...');

// Check if vercel.json exists
const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  console.log('✅ vercel.json found');
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    console.log('✅ vercel.json is valid JSON');
    
    // Check for conflicting properties
    const hasBuilds = vercelConfig.builds !== undefined;
    const hasFunctions = vercelConfig.functions !== undefined;
    
    if (hasBuilds && hasFunctions) {
      console.log('❌ ERROR: vercel.json contains both "builds" and "functions" properties which cannot be used together');
      process.exit(1);
    } else {
      console.log('✅ vercel.json does not contain conflicting properties');
    }
    
    // Check if builds property is correctly configured
    if (hasBuilds) {
      if (Array.isArray(vercelConfig.builds) && vercelConfig.builds.length > 0) {
        console.log('✅ vercel.json builds property is correctly configured');
      } else {
        console.log('⚠️  WARNING: vercel.json builds property is empty or not an array');
      }
    }
    
    // Check for deprecated properties
    if (vercelConfig.builds && vercelConfig.routes) {
      console.log('⚠️  WARNING: Using both "builds" and "routes" - this might cause issues in some cases');
      console.log('💡 Consider using "headers" property instead of "routes" for header configuration');
    }
  } catch (err) {
    console.log('❌ ERROR: vercel.json is not valid JSON:', err.message);
    process.exit(1);
  }
} else {
  console.log('⚠️  WARNING: vercel.json not found (this is OK if using default settings)');
}

// Check if .env files are properly ignored
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env')) {
    console.log('✅ .env files are properly ignored in .gitignore');
  } else {
    console.log('⚠️  WARNING: .env files may not be ignored in .gitignore');
  }
} else {
  console.log('⚠️  WARNING: .gitignore not found');
}

console.log('✅ Deployment verification completed');
console.log('💡 To deploy to Vercel, run: npx vercel --prod');