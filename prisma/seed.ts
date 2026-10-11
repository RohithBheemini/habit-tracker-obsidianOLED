import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const defaultThemes = [
  {
    name: "Indigo",
    colors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#a78bfa",
      background: "#ffffff",
      foreground: "#1f2937",
      card: "#ffffff",
      muted: "#f3f4f6",
    },
    isPreset: true,
  },
  {
    name: "Emerald",
    colors: {
      primary: "#10b981",
      secondary: "#059669",
      accent: "#34d399",
      background: "#ffffff",
      foreground: "#1f2937",
      card: "#ffffff",
      muted: "#ecfdf5",
    },
    isPreset: true,
  },
  {
    name: "Rose",
    colors: {
      primary: "#f43f5e",
      secondary: "#e11d48",
      accent: "#fb7185",
      background: "#ffffff",
      foreground: "#1f2937",
      card: "#ffffff",
      muted: "#fff1f2",
    },
    isPreset: true,
  },
  {
    name: "Dark Indigo",
    colors: {
      primary: "#818cf8",
      secondary: "#6366f1",
      accent: "#a5b4fc",
      background: "#0f172a",
      foreground: "#f8fafc",
      card: "#1e293b",
      muted: "#1e293b",
    },
    isPreset: true,
  },
  {
    name: "Dark Emerald",
    colors: {
      primary: "#34d399",
      secondary: "#10b981",
      accent: "#6ee7b7",
      background: "#0f172a",
      foreground: "#f8fafc",
      card: "#1e293b",
      muted: "#064e3b",
    },
    isPreset: true,
  },
]

const defaultAchievements = [
  { name: "First Step", description: "Complete your first habit", icon: "target", criteriaType: "TOTAL", criteriaValue: 1, xpReward: 10 },
  { name: "Getting Started", description: "Complete 10 habits", icon: "growth", criteriaType: "TOTAL", criteriaValue: 10, xpReward: 25 },
  { name: "Week Warrior", description: "Maintain a 7-day streak", icon: "flame", criteriaType: "STREAK", criteriaValue: 7, xpReward: 50 },
  { name: "Habit Master", description: "Complete 100 habits", icon: "trophy", criteriaType: "TOTAL", criteriaValue: 100, xpReward: 100 },
  { name: "Monthly Maven", description: "Maintain an 80% completion rate for 30 days", icon: "compass", criteriaType: "CONSISTENCY", criteriaValue: 80, xpReward: 150 },
  { name: "Dedicated", description: "Maintain a 30-day streak", icon: "sparkles", criteriaType: "STREAK", criteriaValue: 30, xpReward: 200 },
  { name: "Century Club", description: "Complete 500 habits", icon: "check", criteriaType: "TOTAL", criteriaValue: 500, xpReward: 250 },
  { name: "Legend", description: "Maintain a 100-day streak", icon: "shield", criteriaType: "STREAK", criteriaValue: 100, xpReward: 500 },
]

async function main() {
  console.log("Seeding database...")

  for (const theme of defaultThemes) {
    await prisma.theme.upsert({
      where: { id: theme.name.toLowerCase().replace(" ", "-") },
      update: theme,
      create: {
        id: theme.name.toLowerCase().replace(" ", "-"),
        ...theme,
      },
    })
  }
  console.log(`Created ${defaultThemes.length} themes`)

  for (const achievement of defaultAchievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.name.toLowerCase().replace(" ", "-") },
      update: achievement,
      create: {
        id: achievement.name.toLowerCase().replace(" ", "-"),
        ...achievement,
      },
    })
  }
  console.log(`Created ${defaultAchievements.length} achievements`)

  const demoPassword = await bcrypt.hash("demo1234", 12)
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@habittracker.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@habittracker.app",
      passwordHash: demoPassword,
      profile: {
        create: {
          theme: {
            connect: { id: "indigo" },
          },
        },
      },
      habits: {
        create: [
          { name: "Morning Meditation", icon: "brain", frequencyType: "daily", order: 0 },
          { name: "Read 30 minutes", icon: "book-open", frequencyType: "daily", order: 1 },
          { name: "Exercise", icon: "dumbbell", frequencyType: "weekly", frequencyConfig: { days: [1, 3, 5] }, order: 2 },
          { name: "Weekly Review", icon: "write", frequencyType: "weekly", frequencyConfig: { days: [5] }, order: 3 },
        ],
      },
    },
  })
  console.log(`Created demo user: ${demoUser.email}`)

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
