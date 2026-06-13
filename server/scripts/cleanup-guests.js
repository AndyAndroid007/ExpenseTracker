import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
}

const prisma = new PrismaClient();

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  console.log('DATABASE_URL connection target:', dbUrl.replace(/:[^:@/]+@/, ':****@'));
  console.log('Finding guest accounts (email is NULL)...');
  const countBefore = await prisma.user.count({
    where: {
      email: null,
    },
  });
  console.log(`Found ${countBefore} guest accounts.`);

  if (countBefore > 0) {
    const deleted = await prisma.user.deleteMany({
      where: {
        email: null,
      },
    });
    console.log(`Successfully deleted ${deleted.count} guest accounts.`);
  } else {
    console.log('No guest accounts to delete.');
  }
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
