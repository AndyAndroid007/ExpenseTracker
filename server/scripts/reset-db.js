/**
 * reset-db.js
 *
 * Cascade-clears ALL records from every table in dependency order:
 *   ChatMessage → DailyLog → Streak → Entry → User → Category
 *
 * ONLY runs when NODE_ENV=test. Any other env is rejected immediately.
 * This prevents accidental data loss in development or production.
 *
 * Usage:
 *   NODE_ENV=test node scripts/reset-db.js
 *   npm run db:reset              (sets NODE_ENV=test automatically via the script)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

if (process.env.NODE_ENV !== 'test') {
  console.error(`
❌  reset-db.js only runs in NODE_ENV=test.
    Current env: ${process.env.NODE_ENV || '(not set)'}

    To protect your dev data, this script refuses to run outside of a test environment.
    Cypress sets NODE_ENV=test automatically when invoking this via cy.task('resetDb').
    If running manually: NODE_ENV=test node scripts/reset-db.js
`);
  process.exit(1);
}

// Fix localhost → 127.0.0.1 for Node IPv6 resolution quirk
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
}

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Starting cascade database reset...\n');

  const tables = [
    { name: 'ChatMessage', fn: () => prisma.chatMessage.deleteMany() },
    { name: 'DailyLog',    fn: () => prisma.dailyLog.deleteMany()    },
    { name: 'Streak',      fn: () => prisma.streak.deleteMany()      },
    { name: 'Entry',       fn: () => prisma.entry.deleteMany()       },
    { name: 'User',        fn: () => prisma.user.deleteMany()        },
    { name: 'Category',    fn: () => prisma.category.deleteMany()    },
  ];

  for (const table of tables) {
    const result = await table.fn();
    console.log(`  ✓ ${table.name.padEnd(14)} — deleted ${result.count} record(s)`);
  }

  console.log('\n✅  All tables cleared. Database is ready for fresh testing.\n');
}

main()
  .catch((err) => {
    console.error('\n❌  Reset failed:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
