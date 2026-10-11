import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'tester_r1@example.com' },
  });

  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  const habit = await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Monthly Deep Work',
      icon: '🧠',
      frequencyType: 'monthly',
      frequencyConfig: { days: [1, 15, 16, 28] },
      order: 0,
    },
  });

  console.log('Habit created:', habit.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
