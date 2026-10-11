"use client"

import { useState } from "react"
import Link from "next/link"
import { format, addDays, subDays, isSameDay } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  CheckCircle2,
  Calendar as CalendarIcon,
  Sparkles,
  Target,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card3D } from "@/components/ui/card-3d"
import { HabitIcon } from "@/components/ui/habit-icon"
import { toast } from "sonner"

interface Habit {
  id: string
  name: string
  icon: string
  frequencyType: string
  frequencyConfig: unknown
  category: { name: string; color: string } | null
  completions: { id: string }[]
}

interface User {
  id: string
  name: string | null
  profile: {
    theme: { colors: unknown } | null
  } | null
  habits: Habit[]
}

interface DashboardClientProps {
  user: User
  quote?: { text: string; author: string } | null
}

export function DashboardClient({ user, quote }: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Generate 7-day scrubber carousel centered on selectedDate or today
  const scrubberDays = Array.from({ length: 7 }, (_, i) => {
    return addDays(subDays(selectedDate, 3), i)
  })

  const habitsDueToday = user.habits.filter((habit) => {
    const config = (habit.frequencyConfig || {}) as { days?: number[] }
    const dayOfWeek = selectedDate.getDay()
    const dayOfMonth = selectedDate.getDate()
    const dayOfYear = Math.floor(
      (selectedDate.getTime() - new Date(selectedDate.getFullYear(), 0, 0).getTime()) / 86400000
    )

    switch (habit.frequencyType) {
      case "daily":
        return true
      case "weekly":
        return config.days?.includes(dayOfWeek)
      case "monthly":
        return config.days?.includes(dayOfMonth)
      case "yearly":
        return config.days?.includes(dayOfYear)
      default:
        return true
    }
  })

  const completedCount = habitsDueToday.filter((h) => h.completions.length > 0).length
  const totalDueCount = habitsDueToday.length
  const completionRate = totalDueCount > 0 ? Math.round((completedCount / totalDueCount) * 100) : 0

  const isToday = isSameDay(selectedDate, today)

  // SVG circular dial parameters
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completionRate / 100) * circumference

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-2 sm:px-4 py-4 text-zinc-100">
      {/* Top Greeting & Date Nav Scrubber */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {isToday ? "Active Session" : "Historical Inspection"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {isToday ? "Daily Execution" : format(selectedDate, "EEEE, MMMM d")}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {isToday
              ? "Lock in your primary standards for today."
              : `Reviewing habit completion for ${format(selectedDate, "MMMM d, yyyy")}.`}
          </p>
        </div>

        {/* 7-Day Date Carousel Scrubber */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel border-white/[0.08] shadow-lg overflow-x-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] flex-shrink-0"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {scrubberDays.map((day, idx) => {
              const isSelected = isSameDay(day, selectedDate)
              const isActualToday = isSameDay(day, today)
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center justify-center min-w-[42px] sm:min-w-[48px] h-14 rounded-xl text-xs transition-all duration-200 ${
                    isSelected
                      ? "bg-white text-zinc-950 font-bold shadow-[0_0_15px_rgba(255,255,255,0.25)] scale-105"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <span className={`text-[10px] uppercase font-semibold ${isSelected ? "text-zinc-700" : "text-zinc-500"}`}>
                    {format(day, "EEE")}
                  </span>
                  <span className="text-sm font-extrabold mt-0.5">
                    {format(day, "d")}
                  </span>
                  {isActualToday && (
                    <span className={`h-1 w-1 rounded-full mt-0.5 ${isSelected ? "bg-indigo-600" : "bg-indigo-400"}`} />
                  )}
                </button>
              )
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] flex-shrink-0"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="h-8 px-2.5 text-[11px] font-semibold border-white/10 text-zinc-300 hover:text-white rounded-xl ml-1"
            >
              Today
            </Button>
          )}
        </div>
      </div>

      {/* Progress Metric & Quote Overview */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* 3D Circular Progress Dial Card */}
        <Card3D className="p-6 glass-panel-glow border-white/[0.1] md:col-span-1 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Protocol Score
            </span>
            <div className="text-4xl font-extrabold tracking-tight text-white mt-1">
              {completionRate}%
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {completedCount} of {totalDueCount} habits locked
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-medium text-indigo-300">
              <TrendingUp className="h-3 w-3" />
              {completionRate === 100
                ? "Perfect Consistency"
                : completionRate >= 50
                ? "Strong Momentum"
                : "Active Sprint"}
            </div>
          </div>

          {/* Glowing Circular SVG Meter */}
          <div className="relative flex items-center justify-center h-28 w-28 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-white/[0.06]"
                strokeWidth="9"
                fill="transparent"
              />
              {/* Animated Progress ring */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-indigo-500 transition-all duration-700 ease-out"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(99,102,241,0.6))",
                }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">{completedCount}</span>
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Done</span>
            </div>
          </div>
        </Card3D>

        {/* Ambient Motivation or Focus Strip */}
        <Card3D className="p-6 glass-panel border-white/[0.08] md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Discipline Anchor
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                {format(selectedDate, "yyyy.MM.dd")}
              </span>
            </div>
            <blockquote className="text-sm sm:text-base font-medium text-zinc-200 leading-relaxed italic">
              &ldquo;{quote?.text || "We are what we repeatedly do. Excellence, then, is not an act, but a habit."}&rdquo;
            </blockquote>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-4">
            <p className="text-xs text-zinc-400 font-medium">— {quote?.author || "Aristotle"}</p>
            <Link href="/habits/new">
              <Button size="sm" className="h-8 px-3 text-xs bg-white text-zinc-950 hover:bg-zinc-200 font-medium rounded-xl gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <Plus className="h-3.5 w-3.5" />
                Add Habit
              </Button>
            </Link>
          </div>
        </Card3D>
      </div>

      {/* Habits List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Scheduled Habits</span>
            <Badge variant="outline" className="text-xs border-white/10 bg-white/[0.03] text-zinc-400">
              {habitsDueToday.length}
            </Badge>
          </h2>
          <Link href="/habits">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-400 hover:text-white gap-1">
              Manage All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {habitsDueToday.length === 0 ? (
          <Card3D className="p-12 text-center border-white/[0.08] bg-zinc-950/60">
            <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 mx-auto mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No habits scheduled for this day</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-5">
              Create a new daily, weekly, or monthly routine to build continuous momentum.
            </p>
            <Link href="/habits/new">
              <Button size="sm" className="h-9 px-4 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create First Habit
              </Button>
            </Link>
          </Card3D>
        ) : (
          <div className="grid gap-3.5">
            {habitsDueToday.map((habit) => {
              const isCompleted = habit.completions.length > 0
              const dateString = selectedDate.toISOString().slice(0, 10)

              return (
                <Card3D
                  key={habit.id}
                  className={`p-4 sm:p-5 border-white/[0.08] transition-all ${
                    isCompleted ? "bg-zinc-950/40 opacity-80" : "bg-zinc-950/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <HabitIcon
                        icon={habit.icon}
                        size="lg"
                        withBadge
                        badgeColor={habit.category?.color || "#6366f1"}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/habits/${habit.id}`} className="hover:underline">
                            <p className={`font-semibold text-sm sm:text-base truncate ${isCompleted ? "line-through text-zinc-400" : "text-white"}`}>
                              {habit.name}
                            </p>
                          </Link>
                          {habit.category && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-2 py-0.5 rounded-md border-white/10"
                              style={{
                                color: habit.category.color,
                                backgroundColor: `${habit.category.color}15`,
                              }}
                            >
                              {habit.category.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 capitalize mt-0.5">
                          {habit.frequencyType === "weekly"
                            ? `Weekly (${(habit.frequencyConfig as { days?: number[] })?.days?.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ") || "Custom"})`
                            : habit.frequencyType === "monthly"
                            ? `Monthly (${(habit.frequencyConfig as { days?: number[] })?.days?.join(", ") || "Custom"})`
                            : "Daily Ritual"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Locked
                          </span>
                        </div>
                      ) : isToday ? (
                        <Link href={`/habits/${habit.id}/complete?date=${dateString}`}>
                          <Button
                            size="sm"
                            className="h-8 px-3.5 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                          >
                            Complete
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-500 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </Card3D>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
