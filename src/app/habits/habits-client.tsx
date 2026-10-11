"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Archive, Edit, Trash2, MoreHorizontal, Target, ArchiveRestore, ChevronLeft, Layers } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card3D } from "@/components/ui/card-3d"
import { HabitIcon } from "@/components/ui/habit-icon"

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface Habit {
  id: string
  name: string
  icon: string
  frequencyType: string
  frequencyConfig: unknown
  category: Category | null
  isArchived: boolean
  order: number
  _count: {
    completions: number
  }
}

interface HabitsClientProps {
  habits: Habit[]
  categories: Category[]
}

export function HabitsClient({ habits, categories }: HabitsClientProps) {
  const [showArchived, setShowArchived] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)

  const visibleHabits = showArchived
    ? habits
    : habits.filter((h) => !h.isArchived)

  const filteredHabits = selectedCategory === "all"
    ? visibleHabits
    : visibleHabits.filter((h) => h.category?.id === selectedCategory)

  const activeHabits = filteredHabits.filter((h) => !h.isArchived)
  const archivedHabits = filteredHabits.filter((h) => h.isArchived)

  const handleDelete = async () => {
    if (!habitToDelete) return

    await fetch(`/api/habits/${habitToDelete}`, {
      method: "DELETE",
    })

    setDeleteDialogOpen(false)
    setHabitToDelete(null)
    window.location.reload()
  }

  const handleArchive = async (habitId: string, archive: boolean) => {
    await fetch(`/api/habits/${habitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: archive }),
    })

    window.location.reload()
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4 py-4 text-zinc-100">
      {/* Header & Primary Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-3 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Habit Registry</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure, manage, and inspect all deployed habit protocols
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 px-3.5 text-xs font-semibold rounded-xl border-white/10 transition-colors",
              showArchived ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white bg-white/[0.02]"
            )}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>

          <Link href="/habits/new">
            <Button
              size="sm"
              className="h-9 px-4 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Habit
            </Button>
          </Link>
        </div>
      </div>

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              selectedCategory === "all"
                ? "bg-white text-zinc-950 font-bold shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            All Protocols ({habits.length})
          </button>
          {categories.map((cat) => {
            const count = habits.filter((h) => h.category?.id === cat.id).length
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-white text-zinc-950 font-bold shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {activeHabits.length === 0 && archivedHabits.length === 0 ? (
        <Card3D className="p-14 text-center border-white/[0.08] bg-zinc-950/60">
          <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 mx-auto mb-4">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No habits registered</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-5">
            Initialize your first habit to begin building systematic streaks.
          </p>
          <Link href="/habits/new">
            <Button size="sm" className="h-9 px-4 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Deploy First Habit
            </Button>
          </Link>
        </Card3D>
      ) : (
        <div className="space-y-6">
          {activeHabits.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Active Protocols ({activeHabits.length})
              </h2>
              <div className="grid gap-3">
                {activeHabits.map((habit) => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    onArchive={() => handleArchive(habit.id, true)}
                    onDelete={() => {
                      setHabitToDelete(habit.id)
                      setDeleteDialogOpen(true)
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {archivedHabits.length > 0 && showArchived && (
            <div className="space-y-3 pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Archived Protocols ({archivedHabits.length})
              </h2>
              <div className="grid gap-3">
                {archivedHabits.map((habit) => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    onUnarchive={() => handleArchive(habit.id, false)}
                    onDelete={() => {
                      setHabitToDelete(habit.id)
                      setDeleteDialogOpen(true)
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="glass-panel-glow border-white/[0.1] rounded-2xl text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">Delete Habit Protocol</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Are you sure you want to permanently delete this habit? All recorded completions and streak history will be wiped. This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-xs text-zinc-300 rounded-xl"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs bg-rose-600 hover:bg-rose-500 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.4)]"
              onClick={handleDelete}
            >
              Delete Protocol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HabitRow({
  habit,
  onArchive,
  onUnarchive,
  onDelete,
}: {
  habit: Habit
  onArchive?: () => void
  onUnarchive?: () => void
  onDelete: () => void
}) {
  const categoryColor = habit.category?.color || "#6366f1"

  return (
    <Card3D
      className={`p-4 sm:p-5 border-white/[0.08] ${
        habit.isArchived ? "opacity-60 bg-zinc-950/40" : "bg-zinc-950/80"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <Link href={`/habits/${habit.id}`} className="flex items-center gap-3.5 flex-1 min-w-0 group">
          <HabitIcon
            icon={habit.icon}
            size="lg"
            withBadge
            badgeColor={categoryColor}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm sm:text-base text-white group-hover:text-indigo-300 transition-colors truncate">
                {habit.name}
              </p>
              {habit.category && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 rounded-md border-white/10"
                  style={{
                    color: categoryColor,
                    backgroundColor: `${categoryColor}15`,
                  }}
                >
                  {habit.category.name}
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {habit.frequencyType === "weekly"
                ? `Weekly (${(habit.frequencyConfig as { days?: number[] })?.days?.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ") || "Custom"})`
                : habit.frequencyType === "monthly"
                ? `Monthly (${(habit.frequencyConfig as { days?: number[] })?.days?.join(", ") || "Custom"})`
                : "Daily Ritual"}
              {" • "}
              <span className="text-zinc-400 font-mono">{habit._count.completions} completions</span>
            </p>
          </div>
        </Link>

        {/* Dropdown Action Trigger directly styled without nested button */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]"
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-panel-glow border-white/[0.1] rounded-xl text-zinc-200">
            <DropdownMenuItem className="text-xs cursor-pointer focus:bg-white/[0.08] focus:text-white rounded-lg">
              <Link href={`/habits/${habit.id}/edit`} className="flex items-center w-full">
                <Edit className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                Edit Protocol
              </Link>
            </DropdownMenuItem>
            {onArchive && (
              <DropdownMenuItem onClick={onArchive} className="text-xs cursor-pointer focus:bg-white/[0.08] focus:text-white rounded-lg">
                <Archive className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                Archive
              </DropdownMenuItem>
            )}
            {onUnarchive && (
              <DropdownMenuItem onClick={onUnarchive} className="text-xs cursor-pointer focus:bg-white/[0.08] focus:text-white rounded-lg">
                <ArchiveRestore className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                Restore
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-xs cursor-pointer text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 rounded-lg"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete Protocol
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card3D>
  )
}
