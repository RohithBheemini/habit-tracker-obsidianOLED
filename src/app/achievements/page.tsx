import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AchievementsClient } from "./achievements-client"

export default async function AchievementsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const [allAchievements, userAchievements, profile, habitData] = await Promise.all([
    prisma.achievement.findMany({
      where: { isCustom: false },
      orderBy: [{ criteriaType: "asc" }, { criteriaValue: "asc" }],
    }),
    prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
    }),
    prisma.profile.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.habit.findMany({
      where: { userId: session.user.id },
      select: { _count: { select: { completions: true } } },
    }),
  ])

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId))

  const achievements = allAchievements.map(achievement => {
    const userAch = userAchievements.find(ua => ua.achievementId === achievement.id)
    return {
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAch?.unlockedAt?.toISOString() || null,
      progressCurrent: userAch?.progressCurrent || 0,
      progressTarget: userAch?.progressTarget || achievement.criteriaValue,
    }
  })

  return (
    <AchievementsClient
      achievements={achievements}
    />
  )
}
