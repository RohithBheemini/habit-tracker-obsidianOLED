import { PrismaClient } from '../generated/prisma/index';

async function testFlow() {
  const email = 'tester_r1@example.com';
  console.log(`Starting backend verification for ${email}...`);

  const prisma = new PrismaClient();

  const user = await prisma.user.findUnique({
    where: { email: 'tester_r1@example.com' },
    include: { 
      habits: { include: { _count: { select: { completions: true } } } },
      completions: true 
    }
  });

  if (!user) {
    console.error('User tester_r1@example.com not found. Signup might have failed or DB is disconnected.');
    process.exit(1);
  }

  console.log('User found in DB. Signup verified.');
  console.log(`User has ${user.habits.length} habits.`);
  
  const habit = user.habits.find(h => h.name === 'Monthly Deep Work');
  if (habit) {
    console.log('Habit "Monthly Deep Work" exists in DB. Creation verified.');
    console.log(`Habit has ${habit._count.completions} completions.`);
  } else {
    console.error('Habit "Monthly Deep Work" not found.');
  }

  await prisma.$disconnect();
}

testFlow().catch(console.error);
