import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkAndUnlockAchievements } from "@/lib/gamification"

const completeHabitSchema = z.object({
  completedAt: z.string().optional(),
  note: z.string().max(500).optional(),
  rating: z.number().min(1).max(5).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const habit = await prisma.habit.findUnique({
      where: { id },
    })

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    if (habit.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const data = completeHabitSchema.parse(body)

    const completedAt = data.completedAt
      ? new Date(data.completedAt)
      : new Date()

    completedAt.setHours(0, 0, 0, 0)

    const existingCompletion = await prisma.completion.findFirst({
      where: {
        habitId: id,
        completedAt: {
          gte: completedAt,
          lt: new Date(completedAt.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    if (existingCompletion) {
      return NextResponse.json(
        { error: "Already completed today" },
        { status: 400 }
      )
    }

    const completion = await prisma.completion.create({
      data: {
        habitId: id,
        userId: session.user.id,
        completedAt,
        note: data.note,
        rating: data.rating,
      },
    })

    const streak = await calculateStreak(id, completedAt)

    const totalCompletions = await prisma.completion.count({
      where: { userId: session.user.id },
    })

    const achievements = await checkAndUnlockAchievements(session.user.id, {
      totalCompletions,
      currentStreak: streak,
    })

    return NextResponse.json({ completion, achievements }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
      return NextResponse.json({ error: issues[0]?.message || "Validation error" }, { status: 400 })
    }
    console.error("POST /api/habits/[id]/complete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const completionId = searchParams.get("completionId")

    if (completionId) {
      const completion = await prisma.completion.findUnique({
        where: { id: completionId },
      })

      if (!completion || completion.userId !== session.user.id) {
        return NextResponse.json({ error: "Completion not found" }, { status: 404 })
      }

      await prisma.completion.delete({
        where: { id: completionId },
      })
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await prisma.completion.deleteMany({
        where: {
          habitId: id,
          userId: session.user.id,
          completedAt: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/habits/[id]/complete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function calculateStreak(habitId: string, date: Date): Promise<number> {
  const completions = await prisma.completion.findMany({
    where: { habitId },
    orderBy: { completedAt: "desc" },
    take: 365,
  })

  if (completions.length === 0) return 0

  let streak = 0
  let currentDate = new Date(date)

  for (let i = 0; i < completions.length; i++) {
    const completionDate = new Date(completions[i].completedAt)
    completionDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(currentDate)
    expectedDate.setDate(expectedDate.getDate() - i)

    if (completionDate.getTime() === expectedDate.getTime()) {
      streak++
    } else if (i === 0 && completionDate.getTime() === new Date(currentDate.getTime() - 86400000).getTime()) {
      streak++
      currentDate = completionDate
    } else {
      break
    }
  }

  return streak
}

