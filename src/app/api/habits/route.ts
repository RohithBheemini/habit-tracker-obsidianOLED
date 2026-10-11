import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const createHabitSchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string(),
  frequencyType: z.enum(["daily", "weekly", "monthly", "yearly"]),
  frequencyConfig: z.record(z.string(), z.unknown()).optional().default({}),
  categoryId: z.string().optional(),
})

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isArchived: "asc" }, { order: "asc" }],
      include: {
        category: true,
        _count: { select: { completions: true } },
      },
    })

    return NextResponse.json({ habits })
  } catch (error) {
    console.error("GET /api/habits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createHabitSchema.parse(body)

    const maxOrder = await prisma.habit.findFirst({
      where: { userId: session.user.id, isArchived: false },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const habit = await prisma.habit.create({
      data: {
        userId: session.user.id,
        name: data.name,
        icon: data.icon,
        frequencyType: data.frequencyType,
        frequencyConfig: JSON.parse(JSON.stringify(data.frequencyConfig)),
        categoryId: data.categoryId,
        order: (maxOrder?.order ?? -1) + 1,
      } as Parameters<typeof prisma.habit.create>[0]["data"],
    })

    return NextResponse.json({ habit }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
      return NextResponse.json({ error: issues[0]?.message || "Validation error" }, { status: 400 })
    }
    console.error("POST /api/habits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
