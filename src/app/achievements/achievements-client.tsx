"use client"

import Link from "next/link"
import { Trophy, Lock, CheckCircle2, ChevronLeft, Sparkles, Shield, Award } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card3D } from "@/components/ui/card-3d"
import { HabitIcon } from "@/components/ui/habit-icon"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  criteriaType: string
  criteriaValue: number
  unlocked: boolean
  unlockedAt: string | null
  progressCurrent: number
  progressTarget: number
}

interface AchievementsClientProps {
  achievements: Achievement[]
}

export function AchievementsClient({ achievements }: AchievementsClientProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length || 1
  const unlockPercentage = Math.round((unlockedCount / totalCount) * 100)

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4 py-4 text-zinc-100">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">System Milestones</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Quantitative milestone shields unlocked through systematic consistency
        </p>
      </div>

      {/* Progress Metric Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card3D className="p-6 glass-panel-glow border-white/[0.1] md:col-span-1">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <span>Milestones Mastered</span>
            <Trophy className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">
            {unlockedCount} <span className="text-sm font-medium text-zinc-500">of {achievements.length}</span>
          </div>
          <Progress value={unlockPercentage} className="mt-3 h-1.5 bg-white/[0.08]" />
          <p className="text-[11px] text-zinc-500 mt-2 font-mono">{unlockPercentage}% Completed</p>
        </Card3D>
      </div>

      {/* Grid of Milestone Shields */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <Card3D
            key={achievement.id}
            className={`p-5 sm:p-6 border-white/[0.08] ${
              achievement.unlocked
                ? "bg-zinc-950/80 border-indigo-500/30 shadow-[0_0_25px_-5px_rgba(99,102,241,0.15)]"
                : "bg-zinc-950/40 opacity-70"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <HabitIcon
                icon={achievement.icon}
                size="lg"
                withBadge
                badgeColor={achievement.unlocked ? "#6366f1" : undefined}
              />
              {achievement.unlocked ? (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="h-3 w-3" />
                  Unlocked
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-500 text-[11px] font-medium flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">{achievement.name}</h3>
            <p className="text-xs text-zinc-400 mt-1 min-h-[36px]">{achievement.description}</p>

            {!achievement.unlocked && achievement.progressTarget > 0 && (
              <div className="mt-4 pt-3 border-t border-white/[0.05]">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5 font-mono">
                  <span>Requirement Progress</span>
                  <span>
                    {achievement.progressCurrent} / {achievement.progressTarget}
                  </span>
                </div>
                <Progress
                  value={(achievement.progressCurrent / achievement.progressTarget) * 100}
                  className="h-1 bg-white/[0.06]"
                />
              </div>
            )}

            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-[11px] text-zinc-500 font-mono mt-4 pt-2 border-t border-white/[0.05]">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </Card3D>
        ))}
      </div>

      {achievements.length === 0 && (
        <Card3D className="p-12 text-center border-white/[0.08] bg-zinc-950/60">
          <Award className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No milestones defined</h3>
          <p className="text-xs text-zinc-500">
            Execute habits regularly to activate automatic system badges.
          </p>
        </Card3D>
      )}
    </div>
  )
}
