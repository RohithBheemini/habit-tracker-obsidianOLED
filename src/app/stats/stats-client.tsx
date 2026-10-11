"use client"

import Link from "next/link"
import { AlertTriangle, BarChart3, Flame, TrendingUp, Trophy, ChevronLeft, Calendar, ArrowUpRight } from "lucide-react"
import { Card3D } from "@/components/ui/card-3d"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { Heatmap } from "@/components/habit/heatmap"
import { HabitIcon } from "@/components/ui/habit-icon"

interface Stats {
  totalCompletions: number
  totalHabits: number
  currentStreak: number
  longestStreak: number
  completionRate: number
}

interface CompletionByDay {
  date: string
  count: number
}

interface CompletionByHabit {
  id: string
  name: string
  icon: string
  count: number
}

interface Habit {
  id: string
  name: string
  icon: string
}

interface StatsClientProps {
  stats: Stats
  completionByDay: CompletionByDay[]
  completionByHabit: CompletionByHabit[]
  habits: Habit[]
  habitsAtRisk?: { id: string; name: string; icon: string }[]
  yearlyHeatmap?: { date: string; count: number }[]
}

export function StatsClient({
  stats,
  completionByDay,
  completionByHabit,
  habits,
  habitsAtRisk = [],
  yearlyHeatmap = [],
}: StatsClientProps) {
  const chartData = completionByDay.map(d => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    completions: d.count,
  }))

  const habitData = completionByHabit
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

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
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Performance Telemetry</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Quantitative metrics, density patterns, and trajectory analytics
        </p>
      </div>

      {habitsAtRisk.length > 0 && (
        <Card3D className="p-4 sm:p-5 border-amber-500/30 bg-amber-500/5 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
            <AlertTriangle className="h-4 w-4" />
            <span>Chains at Immediate Risk</span>
          </div>
          <p className="text-xs text-zinc-400 mb-3">
            The following protocols require completion before midnight to avoid streak breakage:
          </p>
          <div className="flex flex-wrap gap-2">
            {habitsAtRisk.map(habit => (
              <Link key={habit.id} href={`/habits/${habit.id}`}>
                <Button variant="outline" size="sm" className="h-8 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 rounded-xl gap-2">
                  <HabitIcon icon={habit.icon} size="sm" />
                  <span>{habit.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </Card3D>
      )}

      {/* KPI Highlight Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card3D className="p-6 glass-panel border-white/[0.08]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <span>Active Momentum</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-4xl font-extrabold text-white mt-2 tracking-tight">
            {stats.currentStreak} <span className="text-sm font-medium text-zinc-500">days</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Continuous unbroken chain</p>
        </Card3D>

        <Card3D className="p-6 glass-panel border-white/[0.08]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <span>Peak Record</span>
            <Trophy className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-4xl font-extrabold text-white mt-2 tracking-tight">
            {stats.longestStreak} <span className="text-sm font-medium text-zinc-500">days</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">All-time record endurance</p>
        </Card3D>

        <Card3D className="p-6 glass-panel border-white/[0.08]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <span>Success Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-4xl font-extrabold text-white mt-2 tracking-tight">
            {stats.completionRate}%
          </div>
          <Progress value={stats.completionRate} className="mt-2.5 h-1.5 bg-white/[0.08]" />
        </Card3D>
      </div>

      {/* Yearly Activity Heatmap */}
      {yearlyHeatmap.length > 0 && (
        <Card3D className="p-6 glass-panel-glow border-white/[0.1] rounded-3xl">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Yearly Density Heatmap
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">365-day macro consistency distribution</p>
          </div>
          <Heatmap data={yearlyHeatmap} />
        </Card3D>
      )}

      {/* Recharts Analytics: Daily Completions & Trend */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card3D className="p-6 glass-panel border-white/[0.08]">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Daily Execution Volume (Past 30 Days)
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(13, 14, 20, 0.95)",
                    borderColor: "rgba(255, 255, 255, 0.12)",
                    borderRadius: "12px",
                    color: "#f4f4f5",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="completions" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card3D>

        <Card3D className="p-6 glass-panel border-white/[0.08]">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Execution Velocity Curve
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(13, 14, 20, 0.95)",
                    borderColor: "rgba(255, 255, 255, 0.12)",
                    borderRadius: "12px",
                    color: "#f4f4f5",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#emeraldGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card3D>
      </div>

      {/* Top Performing Habits */}
      <Card3D className="p-6 glass-panel border-white/[0.08]">
        <div className="mb-4">
          <h2 className="text-base font-bold text-white tracking-tight">Top Habits by Volume</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Highest verified execution frequency</p>
        </div>

        {habitData.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">
            No telemetry records logged yet. Begin checking off habits to populate rankings.
          </p>
        ) : (
          <div className="space-y-3.5">
            {habitData.map((habit) => (
              <div key={habit.id} className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <HabitIcon icon={habit.icon} size="md" withBadge />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                    <p className="truncate">{habit.name}</p>
                    <span className="font-mono text-zinc-400">{habit.count} completions</span>
                  </div>
                  <Progress
                    value={(habit.count / (habitData[0]?.count || 1)) * 100}
                    className="h-1.5 bg-white/[0.06]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card3D>
    </div>
  )
}
