import { PrismaClient } from '../generated/prisma/index';
import bcrypt from 'bcryptjs';

async function setupFullFlow() {
  const prisma = new PrismaClient();
  const email = 'tester_full_flow@example.com';
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Cleaning up old test user...');
  await prisma.user.deleteMany({ where: { email } });

  console.log('Creating User...');
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

  console.log('Creating Habit...');
  const habit = await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'E2E Stability Run',
      icon: '✅',
      frequencyType: 'daily',
      frequencyConfig: {},
      order: 0,
    }
  });

  console.log('Creating Completion...');
  await prisma.completion.create({
    data: {
      userId: user.id,
      habitId: habit.id,
      completedAt: new Date(),
    }
  });

  console.log('Unlocking Achievement...');
  const achievement = await prisma.achievement.findFirst({
    where: { criteriaType: 'TOTAL', criteriaValue: 1 }
  });

  if (achievement) {
    await prisma.userAchievement.create({
      data: {
        userId: user.id,
        achievementId: achievement.id,
        progressCurrent: 1,
        progressTarget: 1,
      }
    });
  }

  console.log('Setup Complete for tester_full_flow@example.com');
  await prisma.$disconnect();
}

setupFullFlow().catch(console.error);
