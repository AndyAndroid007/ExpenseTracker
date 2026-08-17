import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Fix localhost -> 127.0.0.1 for Node IPv6 resolution quirk
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
}

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@expensetrack.app';

function getUtcDateOnly(daysAgo = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function getIsoDateString(daysAgo = 0) {
  return getUtcDateOnly(daysAgo).toISOString().split('T')[0];
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // 1. Clean existing demo user (cascades to entries, streaks, daily logs, chat messages)
  const existingUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL }
  });

  if (existingUser) {
    console.log(`🧹 Cleaning existing demo user (${existingUser.id})...`);
    await prisma.user.delete({
      where: { id: existingUser.id }
    });
    console.log('   ✓ Existing demo user data removed');
  }

  // 2. Seed default categories if not populated
  const defaultCategories = [
    { name: 'Food', icon: '🍔' },
    { name: 'Transport', icon: '🚗' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Bills', icon: '📄' },
    { name: 'Utilities', icon: '💡' },
    { name: 'Health', icon: '💊' },
    { name: 'General', icon: '📦' }
  ];

  console.log('📂 Seeding categories...');
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name, icon: cat.icon }
    });
  }
  console.log(`   ✓ ${defaultCategories.length} categories verified`);

  // 3. Create Demo User
  console.log('👤 Creating demo user...');
  const hashedPassword = await bcrypt.hash('password123', 12);
  const demoUser = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: 'Demo User',
      password: hashedPassword
    }
  });
  console.log(`   ✓ Demo user created (id: ${demoUser.id}, email: ${DEMO_EMAIL})`);

  // 4. Create Historical Entries (~3 weeks / 21 days)
  console.log('📊 Creating historical entries...');
  const entryTemplates = [
    // Older entries (2-3 weeks ago)
    { daysAgo: 20, rawText: 'Metro card recharge 200', amount: 200, category: 'Transport', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 19, rawText: 'Groceries supermarket 850', amount: 850, category: 'Food', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 18, rawText: 'Starbucks coffee 280', amount: 280, category: 'Food', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 17, rawText: 'Electricity bill 1450', amount: 1450, category: 'Bills', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 16, rawText: 'Uber ride 220', amount: 220, category: 'Transport', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 15, rawText: 'No spend today', amount: null, category: null, type: 'save_day', confidenceLevel: 'high' },
    { daysAgo: 14, rawText: 'Team dinner 1200', amount: 1200, category: 'Food', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 13, rawText: 'Amazon shopping 2499', amount: 2499, category: 'Shopping', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 12, rawText: 'Pharmacy medicines 350', amount: 350, category: 'Health', type: 'expense', confidenceLevel: 'medium' },
    { daysAgo: 11, rawText: 'Cinema movie tickets 450', amount: 450, category: 'Entertainment', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 10, rawText: 'Saved 500 today', amount: 500, category: null, type: 'save_day', confidenceLevel: 'high' },
    { daysAgo: 9,  rawText: 'WiFi broadband bill 799', amount: 799, category: 'Bills', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 8,  rawText: 'Auto fare 90', amount: 90, category: 'Transport', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 7,  rawText: 'Water utility bill 300', amount: 300, category: 'Utilities', type: 'expense', confidenceLevel: 'medium' },

    // Active streak window (last 7 consecutive days)
    { daysAgo: 6,  rawText: 'Swiggy lunch bowl 340', amount: 340, category: 'Food', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 5,  rawText: 'Uber to office 310', amount: 310, category: 'Transport', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 4,  rawText: 'Netflix 4K plan 649', amount: 649, category: 'Entertainment', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 3,  rawText: 'No spend day', amount: null, category: null, type: 'save_day', confidenceLevel: 'high' },
    { daysAgo: 2,  rawText: 'Weekend groceries 1150', amount: 1150, category: 'Food', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 1,  rawText: 'Zomato pizza dinner 480', amount: 480, category: 'Food', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 0,  rawText: 'Morning coffee & sandwich 220', amount: 220, category: 'Food', type: 'expense', confidenceLevel: 'high' },
    { daysAgo: 0,  rawText: 'Uber ride 180', amount: 180, category: 'Transport', type: 'expense', confidenceLevel: 'high' }
  ];

  const createdEntries = [];
  for (const item of entryTemplates) {
    const expenseDate = getUtcDateOnly(item.daysAgo);
    const createdAt = new Date(Date.now() - item.daysAgo * 86400000);
    const entry = await prisma.entry.create({
      data: {
        userId: demoUser.id,
        rawText: item.rawText,
        amount: item.amount,
        category: item.category,
        type: item.type,
        expenseDate,
        createdAt,
        confidenceLevel: item.confidenceLevel,
        isUserConfirmedDate: true,
        isDeleted: false
      }
    });
    createdEntries.push({ ...entry, daysAgo: item.daysAgo });
  }
  console.log(`   ✓ Created ${createdEntries.length} entries across 21 days`);

  // 5. Create DailyLog entries for all active days
  console.log('📅 Logging active days...');
  const distinctDays = [...new Set(entryTemplates.map((item) => item.daysAgo))];
  for (const daysAgo of distinctDays) {
    const logDate = getUtcDateOnly(daysAgo);
    await prisma.dailyLog.create({
      data: {
        userId: demoUser.id,
        logDate
      }
    });
  }
  console.log(`   ✓ Created ${distinctDays.length} DailyLog records`);

  // 6. Create Active Streak Record
  console.log('🔥 Initializing streak record...');
  const todayDate = getUtcDateOnly(0);
  const lastFreezeDate = getUtcDateOnly(10);
  await prisma.streak.create({
    data: {
      userId: demoUser.id,
      currentStreak: 7,
      longestStreak: 12,
      lastLoggedDate: todayDate,
      freezesAvailable: 1,
      lastFreezeUsedAt: lastFreezeDate
    }
  });
  console.log('   ✓ Streak record created (current: 7, longest: 12, freezes: 1)');

  // 7. Seed Chat Messages for recent interactions (last 3 days + today)
  console.log('💬 Creating chat history matching recent entries...');
  const recentEntries = createdEntries.filter((e) => e.daysAgo <= 3);

  // Welcome message
  await prisma.chatMessage.create({
    data: {
      userId: demoUser.id,
      sender: 'system',
      text: 'Welcome to ExpenseTrack! Type any expense or "no spend" to track your streak.',
      type: 'text',
      createdAt: new Date(Date.now() - 4 * 86400000)
    }
  });

  for (const entry of recentEntries) {
    const msgTime = new Date(Date.now() - entry.daysAgo * 86400000);
    const dateStr = getIsoDateString(entry.daysAgo);

    // User message
    await prisma.chatMessage.create({
      data: {
        userId: demoUser.id,
        sender: 'user',
        text: entry.rawText,
        type: 'text',
        createdAt: msgTime
      }
    });

    // System response message
    if (entry.type === 'expense') {
      await prisma.chatMessage.create({
        data: {
          userId: demoUser.id,
          sender: 'system',
          text: `₹${Number(entry.amount)} added under ${entry.category} for ${entry.daysAgo === 0 ? 'today' : dateStr}.`,
          type: 'confirm_card',
          isConfirmed: true,
          payload: {
            id: entry.id,
            type: entry.type,
            amount: Number(entry.amount),
            category: entry.category,
            confidence: entry.confidenceLevel,
            expenseDate: dateStr,
            streak: {
              current_streak: 7 - entry.daysAgo,
              updated: true
            }
          },
          createdAt: new Date(msgTime.getTime() + 1000)
        }
      });
    } else {
      await prisma.chatMessage.create({
        data: {
          userId: demoUser.id,
          sender: 'system',
          text: 'Great job staying on budget! No-spend logged.',
          type: 'text',
          createdAt: new Date(msgTime.getTime() + 1000)
        }
      });
    }
  }

  // Final celebration streak message for today
  await prisma.chatMessage.create({
    data: {
      userId: demoUser.id,
      sender: 'system',
      text: '',
      type: 'streak',
      payload: { days: 7 },
      createdAt: new Date()
    }
  });

  console.log('   ✓ Chat history populated with user logs, confirm cards, and streak badge\n');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((err) => {
    console.error('\n❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
