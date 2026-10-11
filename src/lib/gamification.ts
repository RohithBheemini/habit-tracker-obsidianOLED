import { prisma } from "@/lib/prisma"

export interface AchievementCheckResult {
  unlocked: boolean
  achievementId?: string
  achievementName?: string
}

export async function checkAndUnlockAchievements(
  userId: string,
  context: {
    totalCompletions?: number
    currentStreak?: number
    completionRate?: number
  }
): Promise<AchievementCheckResult[]> {
  const results: AchievementCheckResult[] = []

  const allAchievements = await prisma.achievement.findMany({
    where: { isCustom: false },
  })

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
  })

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId))

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue

    let progress = 0
    let shouldUnlock = false

    switch (achievement.criteriaType) {
      case "TOTAL":
        progress = context.totalCompletions || 0
        shouldUnlock = progress >= achievement.criteriaValue
        break

      case "STREAK":
        progress = context.currentStreak || 0
        shouldUnlock = progress >= achievement.criteriaValue
        break

      case "CONSISTENCY":
        shouldUnlock = (context.completionRate || 0) >= achievement.criteriaValue
        progress = context.completionRate || 0
        break
    }

    if (shouldUnlock) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progressCurrent: progress,
          progressTarget: achievement.criteriaValue,
        },
      })



      results.push({
        unlocked: true,
        achievementId: achievement.id,
        achievementName: achievement.name,
      })
    }
  }

  return results
}


