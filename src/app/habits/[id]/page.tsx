import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { HabitDetailClient } from "./habit-detail-client"

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ category?: string }>
}

export default async function HabitDetailPage({ params, searchParams }: Props) {
  const session = await auth()
  const { id } = await params
  const { category } = await searchParams

  if (!session?.user) {
    redirect("/login")
  }

  const habit = await prisma.habit.findUnique({
    where: { id },
    include: {
      category: true,
      completions: {
        orderBy: { completedAt: "desc" },
        take: 100,
      },
    },
  })

  if (!habit || habit.userId !== session.user.id) {
    notFound()
  }

  const allHabits = await prisma.habit.findMany({
    where: { userId: session.user.id, isArchived: false },
  })

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: session.user.id }, { userId: null }] },
  })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const heatmapData = Array.from({ length: 365 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toISOString().split("T")[0]
    const count = habit.completions.filter(c => {
      const cDate = new Date(c.completedAt)
      cDate.setHours(0, 0, 0, 0)
      return cDate.getTime() === date.getTime()
    }).length
    return { date: dateStr, count }
  }).reverse()

  const streak = calculateStreak(habit.completions.map(c => new Date(c.completedAt)))
  const longestStreak = calculateLongestStreak(habit.completions.map(c => new Date(c.completedAt)))
  const totalCompletions = habit.completions.length
  const recentCompletions = habit.completions.filter(c => new Date(c.completedAt) >= thirtyDaysAgo)
  const completionRate = recentCompletions.length > 0 ? Math.round((recentCompletions.length / 30) * 100) : 0

  return (
    <HabitDetailClient
      habit={{
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        frequencyType: habit.frequencyType,
        frequencyConfig: habit.frequencyConfig as unknown,
        category: habit.category,
        isArchived: habit.isArchived,
      }}
      categories={categories}
      heatmapData={heatmapData}
      streak={streak}
      longestStreak={longestStreak}
      totalCompletions={totalCompletions}
      completionRate={completionRate}
      completions={habit.completions.map(c => ({
        id: c.id,
        completedAt: c.completedAt.toISOString(),
        note: c.note,
        rating: c.rating,
      }))}
    />
  )
}

function calculateStreak(completionDates: Date[]): number {
  if (completionDates.length === 0) return 0

  const sortedDates = [...new Set(completionDates.map(d => {
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  }))].sort((a, b) => b - a)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (sortedDates[0] !== today.getTime() && sortedDates[0] !== yesterday.getTime()) {
    return 0
  }

  let streak = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = sortedDates[i - 1] - sortedDates[i]
    if (diff === 86400000) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function calculateLongestStreak(completionDates: Date[]): number {
  if (completionDates.length === 0) return 0

  const sortedDates = [...new Set(completionDates.map(d => {
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  }))].sort((a, b) => a - b)

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const diff = sortedDates[i] - sortedDates[i - 1]
    if (diff === 86400000) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return longestStreak
}
