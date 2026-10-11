"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronLeft, Loader2, Sparkles, Target, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card3D } from "@/components/ui/card-3d"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { CURATED_HABIT_ICONS, HabitIcon } from "@/components/ui/habit-icon"

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface HabitFormProps {
  categories: Category[]
  initialData?: {
    id: string
    name: string
    icon: string
    frequencyType: string
    frequencyConfig: Record<string, unknown>
    categoryId: string | null
  }
}

const habitSchema = z.object({
  name: z.string().min(1, "Habit name is required").max(50, "Name too long"),
  icon: z.string().min(1, "Icon is required").max(50),
  frequencyType: z.enum(["daily", "weekly", "monthly", "yearly"]),
  frequencyConfig: z.record(z.string(), z.unknown()),
  categoryId: z.string().optional(),
})

type HabitFormData = z.infer<typeof habitSchema>

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function HabitForm({ categories, initialData }: HabitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || "target")
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("All")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: initialData?.name || "",
      icon: initialData?.icon || "target",
      frequencyType: (initialData?.frequencyType as "daily" | "weekly" | "monthly" | "yearly") || "daily",
      frequencyConfig: initialData?.frequencyConfig || {},
      categoryId: initialData?.categoryId || undefined,
    },
  })

  const frequencyType = watch("frequencyType")
  const frequencyConfig = (watch("frequencyConfig") || {}) as { days?: number[] }

  const onSubmit = async (data: HabitFormData) => {
    setIsSubmitting(true)

    try {
      const url = initialData
        ? `/api/habits/${initialData.id}`
        : "/api/habits"

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          icon: selectedIcon,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save habit")
      }

      toast.success(initialData ? "Habit protocol updated!" : "Habit protocol initialized!")
      setTimeout(() => { window.location.href = "/habits" }, 400)
    } catch {
      toast.error("Failed to save habit protocol")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleDay = (dayIndex: number) => {
    const currentDays = frequencyConfig.days || []
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter(d => d !== dayIndex)
      : [...currentDays, dayIndex].sort()
    setValue("frequencyConfig", { days: newDays })
  }

  const filteredIcons = selectedCategoryTab === "All"
    ? CURATED_HABIT_ICONS
    : CURATED_HABIT_ICONS.filter(i => i.category === selectedCategoryTab)

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-zinc-100 px-2 sm:px-4 py-4">
      <div>
        <Link
          href="/habits"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Habits
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          {initialData ? "Edit Habit Protocol" : "Architect New Habit"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {initialData ? "Refine schedule parameters and identity" : "Define the standard and execution frequency"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card3D className="p-6 sm:p-7 glass-panel border-white/[0.08]">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white tracking-tight">Identity & Nomenclature</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Define name, precision glyph, and category classification</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-zinc-300">
                Habit Title
              </Label>
              <Input
                id="name"
                placeholder="e.g. Deep Work Protocol, Morning Hydration, 5km Run"
                className="h-10 text-xs bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-indigo-500/50 focus:ring-indigo-500/30"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-rose-400">{errors.name.message}</p>
              )}
            </div>

            {/* Precision Vector Icon Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-zinc-300">
                  Precision Icon Glyph
                </Label>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
                  <span>Selected:</span>
                  <HabitIcon icon={selectedIcon} size="sm" withBadge />
                </div>
              </div>

              {/* Category filter pills for icons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {["All", "Mind", "Fitness", "Health", "Productivity", "Lifestyle"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryTab(cat)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                      selectedCategoryTab === cat
                        ? "bg-white/[0.12] text-white shadow-sm"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of Precision Vector Icons */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] max-h-48 overflow-y-auto">
                {filteredIcons.map((item) => {
                  const IconComp = item.icon
                  const isSelected = selectedIcon.toLowerCase() === item.id.toLowerCase()
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedIcon(item.id)
                        setValue("icon", item.id)
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                        isSelected
                          ? "bg-indigo-600/20 border border-indigo-400/60 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)] scale-105"
                          : "border border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <IconComp className="h-5 w-5 mb-1" />
                      <span className="text-[10px] font-medium truncate w-full">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <Label htmlFor="categoryId" className="text-xs font-semibold text-zinc-300">
                Category Grouping (Optional)
              </Label>
              <Select
                value={watch("categoryId") || ""}
                onValueChange={(value) => setValue("categoryId", value || undefined)}
              >
                <SelectTrigger className="h-10 text-xs bg-white/[0.03] border-white/10 text-white rounded-xl">
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent className="glass-panel-glow border-white/10 text-zinc-200">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card3D>

        {/* Cadence & Frequency */}
        <Card3D className="p-6 sm:p-7 glass-panel border-white/[0.08]">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white tracking-tight">Execution Cadence</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Determine the cadence schedule and recurrence triggers</p>
          </div>

          <div className="space-y-5">
            {/* Segmented Frequency Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-300">Frequency Cadence</Label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                {[
                  { id: "daily", label: "Daily" },
                  { id: "weekly", label: "Weekly" },
                  { id: "monthly", label: "Monthly" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setValue("frequencyType", type.id as "daily" | "weekly" | "monthly")}
                    className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                      frequencyType === type.id
                        ? "bg-white text-zinc-950 shadow-md font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Days Selector */}
            {frequencyType === "weekly" && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold text-zinc-300">Active Days of Week</Label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAY_NAMES.map((day, index) => {
                    const isSelected = frequencyConfig.days?.includes(index)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`h-11 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)] border border-indigo-400/50"
                            : "bg-white/[0.02] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-semibold opacity-70">
                          {day.slice(0, 1)}
                        </span>
                        <span className="text-[11px]">{day.slice(0, 3)}</span>
                      </button>
                    )
                  })}
                </div>
                {(!frequencyConfig.days || frequencyConfig.days.length === 0) && (
                  <p className="text-xs text-amber-400">Please select at least one active day</p>
                )}
              </div>
            )}

            {/* Monthly Date Selector */}
            {frequencyType === "monthly" && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold text-zinc-300">Specific Calendar Dates</Label>
                <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                    const isSelected = frequencyConfig.days?.includes(date)
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          const currentDays = frequencyConfig.days || []
                          const newDays = currentDays.includes(date)
                            ? currentDays.filter(d => d !== date)
                            : [...currentDays, date].sort((a, b) => a - b)
                          setValue("frequencyConfig", { days: newDays })
                        }}
                        className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.35)] font-bold"
                            : "bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        {date}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </Card3D>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/habits">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-5 text-xs border-white/10 bg-white/[0.02] text-zinc-300 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="h-10 px-6 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Saving Protocol...
              </>
            ) : initialData ? (
              "Update Protocol"
            ) : (
              "Deploy Habit"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
