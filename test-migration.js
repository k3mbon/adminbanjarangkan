// Test Migration Setup Script
// This script tests the migration setup without requiring Firebase credentials

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
      
      return envVars;
    }
  } catch (error) {
    console.warn('Could not load .env file:', error.message);
  }
  return {};
}

const envVars = loadEnvFile();

console.log('🔍 Testing Migration Setup...');
console.log('================================');

// Check if required files exist
const requiredFiles = [
  'firebase-export.js',
  'sanity-import.js',
  'MIGRATION_GUIDE.md',
  'SERVICE_ACCOUNT_SETUP.md',
  '.env'
];

let allFilesExist = true;

console.log('\n📁 Checking required files:');
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
}

// Check environment variables
console.log('\n🔧 Checking environment variables:');
const requiredEnvVars = [
  'VITE_SANITY_PROJECT_ID',
  'VITE_SANITY_DATASET', 
  'VITE_SANITY_TOKEN',
  'SANITY_AUTH_TOKEN'
];

let allEnvVarsSet = true;
for (const envVar of requiredEnvVars) {
  const isSet = (process.env[envVar] || envVars[envVar]) ? true : false;
  const value = process.env[envVar] || envVars[envVar] || '';
  const hasValue = value.length > 0;
  console.log(`   ${hasValue ? '✅' : '❌'} ${envVar} ${hasValue ? '(set)' : '(empty or missing)'}`);
  if (!hasValue) allEnvVarsSet = false;
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['migrate:export', 'migrate:import', 'migrate:full'];
  
  for (const script of requiredScripts) {
    const exists = packageJson.scripts && packageJson.scripts[script];
    console.log(`   ${exists ? '✅' : '❌'} ${script}`);
  }
} catch (error) {
  console.log('   ❌ Error reading package.json');
}

// Check dependencies
console.log('\n📚 Checking required dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['firebase', 'firebase-admin', '@sanity/client'];
  
  for (const dep of requiredDeps) {
    const exists = (packageJson.dependencies && packageJson.dependencies[dep]) ||
                  (packageJson.devDependencies && packageJson.devDependencies[dep]);
    console.log(`   ${exists ? '✅' : '❌'} ${dep}`);
  }
} catch (error) {
  console.log('   ❌ Error reading package.json');
}

// Check service account key
console.log('\n🔑 Checking Firebase service account:');
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccountExists = fs.existsSync(serviceAccountPath);
console.log(`   ${serviceAccountExists ? '✅' : '⚠️ '} serviceAccountKey.json ${serviceAccountExists ? '' : '(optional - see SERVICE_ACCOUNT_SETUP.md)'}`);

// Create export directories
console.log('\n📂 Creating export directories:');
const exportDir = path.join(__dirname, 'firebase-export');
const dataDir = path.join(exportDir, 'data');
const assetsDir = path.join(exportDir, 'assets');

try {
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);
  console.log('   ✅ Export directories created');
} catch (error) {
  console.log('   ❌ Error creating directories:', error.message);
}

// Summary
console.log('\n📋 Migration Setup Summary:');
console.log('================================');

if (allFilesExist && allEnvVarsSet) {
  console.log('🎉 Setup Complete! You can now run the migration.');
  console.log('\nNext steps:');
  console.log('1. Follow SERVICE_ACCOUNT_SETUP.md to get Firebase credentials');
  console.log('2. Run: npm run migrate:export');
  console.log('3. Run: npm run migrate:import');
  console.log('\nOr run both at once: npm run migrate:full');
} else {
  console.log('⚠️  Setup Incomplete. Please address the missing items above.');
  
  if (!allFilesExist) {
    console.log('\n📖 Missing files can be found in the project repository.');
  }
  
  if (!allEnvVarsSet) {
    console.log('\n🔧 Set missing environment variables in your .env file.');
    console.log('   See MIGRATION_GUIDE.md for details.');
  }
}

console.log('\n📚 For detailed instructions, see:');
console.log('   - MIGRATION_GUIDE.md');
console.log('   - SERVICE_ACCOUNT_SETUP.md');