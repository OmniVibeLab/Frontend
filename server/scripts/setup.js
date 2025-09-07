#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serverDir = join(__dirname, '..');

console.log('🔧 Setting up OmniVibe Backend...\n');

// Check if node_modules exists
const nodeModulesPath = join(serverDir, 'node_modules');
if (!existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  
  const install = spawn('npm', ['install'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true
  });

  install.on('error', (err) => {
    console.error('❌ Failed to install dependencies:', err.message);
    process.exit(1);
  });

  install.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Dependencies installed successfully!\n');
      startSetupComplete();
    } else {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Dependencies already installed\n');
  startSetupComplete();
}

function startSetupComplete() {
  console.log('🎉 Setup complete!\n');
  console.log('📋 Available commands:');
  console.log('  npm run dev     - Start development server');
  console.log('  npm start       - Start production server');
  console.log('  npm run setup   - Run this setup again');
  console.log('\n🚀 To start the server, run: npm run dev');
}