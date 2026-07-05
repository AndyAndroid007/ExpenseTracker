import { spawn, execSync } from 'child_process';

console.log('🐳 Checking if Docker daemon is running...');
let dockerReady = false;
try {
  execSync('docker info', { stdio: 'ignore' });
  dockerReady = true;
  console.log('✅ Docker daemon is active.');
} catch (e) {
  console.log('🐳 Docker daemon is not active. Launching Docker Desktop application...');
  try {
    execSync('open -a Docker');
    // Poll docker info until daemon is ready (up to 30 seconds)
    for (let i = 0; i < 15; i++) {
      console.log(`⏳ Waiting for Docker daemon to initialize (attempt ${i + 1}/15)...`);
      try {
        execSync('sleep 2');
      } catch (err) {}
      try {
        execSync('docker info', { stdio: 'ignore' });
        dockerReady = true;
        console.log('✅ Docker daemon initialized successfully.');
        break;
      } catch (err) {
        // Continue polling
      }
    }
  } catch (err) {
    console.error('❌ Failed to auto-launch Docker Desktop:', err.message);
  }
}

if (dockerReady) {
  console.log('🐳 Starting Redis container (expensetrack-redis)...');
  try {
    execSync('docker start expensetrack-redis', { stdio: 'inherit' });
    console.log('✅ Redis container started.');
    console.log('⏳ Waiting 2s for Redis to initialize...');
    try {
      execSync('sleep 2');
    } catch (e) {}
  } catch (error) {
    console.error('❌ Failed to start Redis container (expensetrack-redis):', error.message);
  }
} else {
  console.warn('⚠️  Warning: Proceeding without Docker/Redis. (Redis fallback active.)');
}

console.log('🔄 Starting Prisma Dev database...');
try {
  // Start the Prisma Postgres dev server in the background
  execSync('npx prisma dev -d', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start Prisma Dev server:', error.message);
}

console.log('🚀 Starting Express application dev server...');
// Spawn nodemon to run the Express app in the foreground
const child = spawn('npx', ['nodemon', 'src/server.js'], { stdio: 'inherit' });

const shutdown = () => {
  console.log('\n🛑 Terminating dev runner...');
  console.log('🔌 Stopping Prisma Dev database...');
  try {
    // Gracefully spin down the Prisma Dev postgres instance
    execSync('npx prisma dev stop default', { stdio: 'inherit' });
    console.log('✅ Database stopped successfully.');
  } catch (error) {
    console.error('❌ Failed to stop database:', error.message);
  }

  console.log('🐳 Stopping Redis container (expensetrack-redis)...');
  try {
    execSync('docker stop expensetrack-redis', { stdio: 'inherit' });
    console.log('✅ Redis container stopped.');
  } catch (error) {
    console.error('❌ Failed to stop Redis container:', error.message);
  }

  console.log('🔌 Quitting Docker Desktop application...');
  try {
    execSync("osascript -e 'quit app \"Docker\"'", { stdio: 'ignore' });
    console.log('✅ Docker Desktop quit successfully.');
  } catch (error) {
    // Keep it silent if AppleScript fails
  }
  
  process.exit(0);
};

// Listen for termination signals to run the database cleanup
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
