import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsPDF } from "jspdf"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const habitId = searchParams.get("habit_id")

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    const habits = habitId
      ? await prisma.habit.findMany({
          where: { id: habitId, userId: session.user.id },
        })
      : await prisma.habit.findMany({
          where: { userId: session.user.id, isArchived: false },
        })

    const completions = await prisma.completion.findMany({
      where: {
        userId: session.user.id,
        habitId: { in: habits.map(h => h.id) },
      },
      orderBy: { completedAt: "desc" },
    })

    const doc = new jsPDF()

    doc.setFontSize(24)
    doc.text("Habit Tracker Report", 20, 20)

    doc.setFontSize(12)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30)
    doc.text(`User: ${session.user.email}`, 20, 38)

    doc.setFontSize(14)
    doc.text("Summary", 20, 55)

    doc.setFontSize(11)
    doc.text(`Total Habits: ${habits.length}`, 20, 65)
    doc.text(`Total Completions: ${completions.length}`, 20, 72)

    let yPos = 100

    doc.setFontSize(14)
    doc.text("Habits", 20, yPos)
    yPos += 10

    for (const habit of habits) {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }

      const habitCompletions = completions.filter(c => c.habitId === habit.id)
      doc.setFontSize(11)
      doc.text(`${habit.icon} ${habit.name}`, 25, yPos)
      doc.text(`${habitCompletions.length} completions`, 150, yPos)
      yPos += 8

      doc.setFontSize(9)
      doc.setTextColor(100)
      doc.text(`Frequency: ${habit.frequencyType}`, 30, yPos)
      yPos += 6
      doc.setTextColor(0)
    }

    doc.setFontSize(14)
    yPos += 10
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    doc.text("Recent Completions", 20, yPos)
    yPos += 10

    const recentCompletions = completions.slice(0, 30)
    for (const completion of recentCompletions) {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }

      const habit = habits.find(h => h.id === completion.habitId)
      doc.setFontSize(10)
      doc.text(
        `${completion.completedAt.toISOString().split("T")[0]} - ${habit?.icon || ""} ${habit?.name || "Unknown"}`,
        25,
        yPos
      )
      if (completion.rating) {
        doc.text(`Rating: ${completion.rating}/5`, 150, yPos)
      }
      yPos += 7
    }

    const pdfBuffer = doc.output("arraybuffer")

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="habits-report-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("GET /api/export/pdf error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
