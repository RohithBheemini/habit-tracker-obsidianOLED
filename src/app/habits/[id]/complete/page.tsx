"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Loader2, Star, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card3D } from "@/components/ui/card-3d"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Props {
  params: Promise<{ id: string }>
}

export default function CompleteHabitPage({ params }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const date = searchParams.get("date")
  const [note, setNote] = useState("")
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [habitId, setHabitId] = useState<string>("")

  useEffect(() => {
    params.then(p => setHabitId(p.id))
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!habitId) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedAt: date,
          note: note || undefined,
          rating: rating > 0 ? rating : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to complete habit")
      }

      toast.success("Habit completion verified!")
      setTimeout(() => { window.location.href = "/dashboard" }, 400)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!habitId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6 text-zinc-100 px-4 py-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Log Habit Execution</h1>
        <p className="text-xs text-zinc-400 mt-1">
          {date ? `Session Date: ${new Date(date).toLocaleDateString()}` : "Session: Today"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card3D className="p-6 glass-panel-glow border-white/[0.1] rounded-2xl">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-300">Execution Rating (Optional)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value === rating ? 0 : value)}
                    className="p-1.5 rounded-xl transition-all hover:scale-110 active:scale-95 hover:bg-white/[0.05]"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        value <= rating
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                          : "text-zinc-600 hover:text-zinc-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-xs font-semibold text-zinc-300">
                Session Reflection & Notes (Optional)
              </Label>
              <Textarea
                id="note"
                placeholder="Key insights, focus level, or obstacles encountered..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="text-xs bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-indigo-500/50 focus:ring-indigo-500/30"
              />
            </div>
          </div>
        </Card3D>

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4 text-xs border-white/10 text-zinc-300 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="h-10 px-5 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] gap-1.5"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Logging...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirm Session
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
