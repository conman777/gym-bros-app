#!/usr/bin/env node
const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Detect platform
const platform = os.platform();
const isWSL = platform === 'linux' && fs.existsSync('/proc/version') &&
              fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft');

console.log('🏋️ Gym Bros App Setup');
console.log('======================\n');

// Platform detection
let platformName = 'Unknown';
if (platform === 'win32') {
  platformName = 'Windows (native)';
} else if (isWSL) {
  platformName = 'Windows (WSL)';
} else if (platform === 'darwin') {
  platformName = 'macOS';
} else if (platform === 'linux') {
  platformName = 'Linux';
}

console.log(`📍 Platform detected: ${platformName}`);
console.log(`📂 Working directory: ${process.cwd()}\n`);

// Helper to run commands
function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} complete`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Setup environment
console.log('🔐 Setting up environment...');
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('⚠️  No .env file found. Creating one...');
  fs.writeFileSync(envPath, 'DATABASE_URL="file:./prisma/dev.db"\n');
  console.log('✅ Created .env file');
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('prisma/dev.db')) {
    console.log('⚠️  Updating DATABASE_URL in .env to use prisma/dev.db');
    const updatedContent = envContent.replace(
      /DATABASE_URL=.*/,
      'DATABASE_URL="file:./prisma/dev.db"'
    );
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ Updated .env file');
  } else {
    console.log('✅ .env file already configured correctly');
  }
}

// Ensure prisma directory exists
const prismaDir = path.join(process.cwd(), 'prisma');
if (!fs.existsSync(prismaDir)) {
  console.log('📁 Creating prisma directory...');
  fs.mkdirSync(prismaDir, { recursive: true });
  console.log('✅ Created prisma directory');
}

// Run setup steps
const steps = [
  { cmd: 'npm install', desc: 'Installing dependencies' },
  { cmd: 'npx prisma generate', desc: 'Generating Prisma client' },
  { cmd: 'npx prisma db push', desc: 'Setting up database' }
];

let allSuccessful = true;
for (const step of steps) {
  if (!runCommand(step.cmd, step.desc)) {
    allSuccessful = false;
    break;
  }
}

if (allSuccessful) {
  console.log('\n✨ Setup complete! ✨\n');
  console.log('To start the development server, run:');
  console.log('  npm run dev\n');
  console.log('The app will be available at:');
  console.log('  http://localhost:8885\n');
} else {
  console.log('\n❌ Setup failed. Please check the errors above.\n');
  process.exit(1);
}
