import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const updateHabitSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().optional(),
  frequencyType: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  frequencyConfig: z.record(z.string(), z.unknown()).optional(),
  categoryId: z.string().optional(),
  isArchived: z.boolean().optional(),
  order: z.number().optional(),
})

export async function GET(
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
      include: {
        category: true,
        completions: {
          orderBy: { completedAt: "desc" },
          take: 10,
        },
      },
    })

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    if (habit.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ habit })
  } catch (error) {
    console.error("GET /api/habits/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
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
    const data = updateHabitSchema.parse(body)

    const updateData: Record<string, unknown> = { ...data }
    if (!("categoryId" in body)) {
      delete updateData.categoryId
    }
    if (updateData.frequencyConfig) {
      updateData.frequencyConfig = JSON.parse(JSON.stringify(updateData.frequencyConfig))
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: updateData as Parameters<typeof prisma.habit.update>[0]["data"],
      include: {
        category: true,
      },
    })

    return NextResponse.json({ habit: updatedHabit })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
      return NextResponse.json({ error: issues[0]?.message || "Validation error" }, { status: 400 })
    }
    console.error("PUT /api/habits/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params })
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

    const habit = await prisma.habit.findUnique({
      where: { id },
    })

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    if (habit.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.habit.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/habits/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
