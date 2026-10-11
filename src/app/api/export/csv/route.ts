import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const habitIds = searchParams.get("habits")?.split(",").filter(Boolean)
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (habitIds && habitIds.length > 0) {
      where.habitId = { in: habitIds }
    }

    if (startDate) {
      where.completedAt = { ...(where.completedAt as object || {}), gte: new Date(startDate) }
    }

    if (endDate) {
      where.completedAt = { ...(where.completedAt as object || {}), lte: new Date(endDate) }
    }

    const completions = await prisma.completion.findMany({
      where,
      include: {
        habit: {
          select: {
            name: true,
            icon: true,
            frequencyType: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
    })

    const csvRows = [
      "Date,Habit,Icon,Frequency,Note,Rating",
      ...completions.map(c =>
        [
          c.completedAt.toISOString().split("T")[0],
          `"${c.habit.name}"`,
          c.habit.icon,
          c.habit.frequencyType,
          `"${c.note?.replace(/"/g, '""') || ""}"`,
          c.rating || "",
        ].join(",")
      ),
    ]

    const csv = csvRows.join("\n")

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="habits-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("GET /api/export/csv error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
