import { PrismaClient } from '../generated/prisma/index';
import bcrypt from 'bcryptjs';

async function setupRound3() {
  const prisma = new PrismaClient();
  const email = 'tester_r3@example.com';
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Cleaning up old test user...');
  await prisma.user.deleteMany({ where: { email } });

  console.log('Creating User Round 3...');
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      profile: {
        create: {
          timezone: 'UTC',
        }
      }
    }
  });

  console.log('Creating Specific Habit (Monthly 1, 15, 16, 28)...');
  await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Round 3 Final Audit',
      icon: '🔐',
      frequencyType: 'monthly',
      frequencyConfig: { days: [1, 15, 16, 28] },
      order: 0,
    }
  });

  console.log('Round 3 Setup Complete');
  await prisma.$disconnect();
}

setupRound3().catch(console.error);
