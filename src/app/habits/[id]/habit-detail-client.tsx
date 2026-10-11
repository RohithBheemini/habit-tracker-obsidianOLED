"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ChevronLeft, Flame, Trophy, Target, Star, Calendar, Edit, Activity, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heatmap } from "@/components/habit/heatmap"
import { Card3D } from "@/components/ui/card-3d"
import { HabitIcon } from "@/components/ui/habit-icon"

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface Completion {
  id: string
  completedAt: string
  note: string | null
  rating: number | null
}

interface HabitDetailClientProps {
  habit: {
    id: string
    name: string
    icon: string
    frequencyType: string
    frequencyConfig: unknown
    category: Category | null
    isArchived: boolean
  }
  categories: Category[]
  heatmapData: { date: string; count: number }[]
  streak: number
  longestStreak: number
  totalCompletions: number
  completionRate: number
  completions: Completion[]
}

export function HabitDetailClient({
  habit,
  heatmapData,
  streak,
  longestStreak,
  totalCompletions,
  completionRate,
  completions,
}: HabitDetailClientProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const selectedCompletion = selectedDay
    ? completions.find(c => c.completedAt.startsWith(selectedDay))
    : null

  const categoryColor = habit.category?.color || "#6366f1"
  const config = (habit.frequencyConfig || {}) as { days?: number[] }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-2 sm:px-4 py-4 text-zinc-100">
      <div className="flex items-center justify-between">
        <Link
          href="/habits"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Habits
        </Link>
        <Link href={`/habits/${habit.id}/edit`}>
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-white/10 text-zinc-300 hover:text-white rounded-xl gap-1.5">
            <Edit className="h-3.5 w-3.5" />
            Edit Protocol
          </Button>
        </Link>
      </div>

      {/* Header Profile with Vector Icon */}
      <Card3D className="p-6 sm:p-7 glass-panel-glow border-white/[0.1] rounded-3xl">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <HabitIcon
              icon={habit.icon}
              size="xl"
              withBadge
              badgeColor={categoryColor}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{habit.name}</h1>
                {habit.category && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2.5 py-0.5 rounded-lg border-white/10"
                    style={{
                      backgroundColor: `${categoryColor}15`,
                      color: categoryColor,
                    }}
                  >
                    {habit.category.name}
                  </Badge>
                )}
                {habit.isArchived && (
                  <Badge variant="outline" className="text-xs border-zinc-700 bg-zinc-800 text-zinc-400">
                    Archived
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 capitalize">
                {habit.frequencyType === "weekly"
                  ? `Weekly Cadence (${config.days?.map(d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ") || "Custom"})`
                  : habit.frequencyType === "monthly"
                  ? `Monthly Cadence (Dates: ${config.days?.join(", ") || "Custom"})`
                  : "Daily Ritual Protocol"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/habits/${habit.id}/complete`}>
              <Button size="sm" className="h-9 px-4 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Log Completion
              </Button>
            </Link>
          </div>
        </div>
      </Card3D>

      {/* 3D Telemetry Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card3D className="p-5 glass-panel border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Current Streak</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">
            {streak} <span className="text-xs text-zinc-500 font-medium">days</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Unbroken execution chain</p>
        </Card3D>

        <Card3D className="p-5 glass-panel border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Peak Streak</span>
            <Trophy className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">
            {longestStreak} <span className="text-xs text-zinc-500 font-medium">days</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">All-time record</p>
        </Card3D>

        <Card3D className="p-5 glass-panel border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Total Completions</span>
            <Target className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">
            {totalCompletions}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Logged sessions</p>
        </Card3D>

        <Card3D className="p-5 glass-panel border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Consistency Rate</span>
            <Activity className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">
            {completionRate}%
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Last 30 days window</p>
        </Card3D>
      </div>

      {/* Tabs: Heatmap vs History */}
      <Tabs defaultValue="heatmap" className="w-full">
        <TabsList className="p-1 rounded-xl glass-panel border-white/[0.08] grid grid-cols-2 max-w-sm mb-4">
          <TabsTrigger value="heatmap" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-950">
            Heatmap Activity
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-950">
            Session History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-4">
          <Card3D className="p-6 glass-panel border-white/[0.08]">
            <div className="mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">Consistency Matrix</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Execution density over the past 365 days</p>
            </div>

            <Heatmap
              data={heatmapData}
              onDayClick={(date) => setSelectedDay(date)}
            />

            {selectedDay && (
              <div className="mt-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-white">
                    {format(new Date(selectedDay), "EEEE, MMMM d, yyyy")}
                  </p>
                  {selectedCompletion ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold text-[11px] border border-emerald-500/25">
                      Completed
                    </span>
                  ) : (
                    <span className="text-zinc-500">No session logged</span>
                  )}
                </div>

                {selectedCompletion && (
                  <div className="space-y-1.5 pt-1">
                    {selectedCompletion.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500 mr-1">Focus Rating:</span>
                        {Array.from({ length: selectedCompletion.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}
                    {selectedCompletion.note && (
                      <p className="text-zinc-300 italic">&ldquo;{selectedCompletion.note}&rdquo;</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card3D>
        </TabsContent>

        <TabsContent value="history">
          <Card3D className="p-6 glass-panel border-white/[0.08]">
            <div className="mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">Recent Sessions</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Chronological record of verified executions</p>
            </div>

            {completions.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">
                No completion logs recorded yet. Begin your streak today!
              </p>
            ) : (
              <div className="grid gap-2.5">
                {completions.slice(0, 20).map((completion) => (
                  <div
                    key={completion.id}
                    className="flex items-start justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {format(new Date(completion.completedAt), "EEEE, MMMM d, yyyy")}
                        </p>
                        {completion.note && (
                          <p className="text-[11px] text-zinc-400 mt-0.5 max-w-md line-clamp-1">
                            {completion.note}
                          </p>
                        )}
                      </div>
                    </div>
                    {completion.rating && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {Array.from({ length: completion.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card3D>
        </TabsContent>
      </Tabs>
    </div>
  )
}
