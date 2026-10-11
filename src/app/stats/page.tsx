import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StatsClient } from "./stats-client"

export default async function StatsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const [habits, completions, profile] = await Promise.all([
    prisma.habit.findMany({
      where: { userId: session.user.id, isArchived: false },
      include: { category: true },
    }),
    prisma.completion.findMany({
      where: { userId: session.user.id },
      orderBy: { completedAt: "desc" },
    }),
    prisma.profile.findUnique({
      where: { userId: session.user.id },
    }),
  ])

  const stats = {
    totalCompletions: completions.length,
    totalHabits: habits.length,
    currentStreak: calculateCurrentStreak(completions),
    longestStreak: calculateLongestStreak(completions),
    completionRate: calculateOverallCompletionRate(habits, completions),
  }

  const completionByDay = getCompletionsByDay(completions)
  const completionByHabit = getCompletionsByHabit(habits, completions)
  const habitsAtRisk = getHabitsAtRisk(habits, completions)
  const yearlyHeatmap = getYearlyHeatmap(completions)

  return (
    <StatsClient
      stats={stats}
      completionByDay={completionByDay}
      completionByHabit={completionByHabit}
      habits={habits}
      habitsAtRisk={habitsAtRisk}
      yearlyHeatmap={yearlyHeatmap}
    />
  )
}

function calculateCurrentStreak(completions: { completedAt: Date }[]): number {
  if (completions.length === 0) return 0

  const sortedDates = [...new Set(
    completions.map(c => {
      const d = new Date(c.completedAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )].sort((a, b) => b - a)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (sortedDates[0] !== today.getTime()) {
    const yesterday = today.getTime() - 86400000
    if (sortedDates[0] !== yesterday) return 0
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

function calculateLongestStreak(completions: { completedAt: Date }[]): number {
  if (completions.length === 0) return 0

  const sortedDates = [...new Set(
    completions.map(c => {
      const d = new Date(c.completedAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )].sort((a, b) => a - b)

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

function calculateOverallCompletionRate(
  habits: { id: string; frequencyType: string }[],
  completions: { habitId: string; completedAt: Date }[]
): number {
  if (habits.length === 0 || completions.length === 0) return 0

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const recentCompletions = completions.filter(
    c => new Date(c.completedAt) >= thirtyDaysAgo
  )

  const dailyHabits = habits.filter(h => h.frequencyType === "daily")
  const expectedCompletions = dailyHabits.length * 30

  if (expectedCompletions === 0) return 0

  return Math.round((recentCompletions.length / expectedCompletions) * 100)
}

function getCompletionsByDay(completions: { completedAt: Date }[]) {
  const last30Days: { date: string; count: number }[] = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const count = completions.filter(c => {
      const d = new Date(c.completedAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === date.getTime()
    }).length

    last30Days.push({
      date: date.toISOString().split("T")[0],
      count,
    })
  }

  return last30Days
}

function getCompletionsByHabit(
  habits: { id: string; name: string; icon: string }[],
  completions: { habitId: string }[]
) {
  return habits.map(habit => ({
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    count: completions.filter(c => c.habitId === habit.id).length,
  }))
}

function getHabitsAtRisk(
  habits: { id: string; name: string; icon: string; frequencyType: string }[],
  completions: { habitId: string; completedAt: Date }[]
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  return habits
    .filter(habit => {
      const habitCompletions = completions
        .filter(c => c.habitId === habit.id)
        .map(c => {
          const d = new Date(c.completedAt)
          d.setHours(0, 0, 0, 0)
          return d.getTime()
        })
        .sort((a, b) => b - a)

      if (habitCompletions.length === 0) return false

      const lastCompletion = habitCompletions[0]
      const daysSinceLast = Math.floor((today.getTime() - lastCompletion) / 86400000)

      if (habit.frequencyType === "daily" && daysSinceLast >= 1) {
        return true
      }
      if (habit.frequencyType === "weekly" && daysSinceLast >= 3) {
        return true
      }

      return false
    })
    .map(habit => ({
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
    }))
}

function getYearlyHeatmap(completions: { completedAt: Date }[]) {
  const dataMap = new Map<string, number>()

  completions.forEach(c => {
    const d = new Date(c.completedAt)
    d.setHours(0, 0, 0, 0)
    const dateStr = d.toISOString().split("T")[0]
    dataMap.set(dateStr, (dataMap.get(dateStr) || 0) + 1)
  })

  const result: { date: string; count: number }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    result.push({
      date: dateStr,
      count: dataMap.get(dateStr) || 0,
    })
  }

  return result
}
