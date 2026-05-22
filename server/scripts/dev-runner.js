import { spawn, execSync } from 'child_process';

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
  process.exit(0);
};

// Listen for termination signals to run the database cleanup
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
