import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().optional(),
  weekStartDay: z.number().optional(),
  quotesEnabled: z.boolean().optional(),
  themeId: z.string().nullable().optional(),
})

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { theme: true },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("GET /api/profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    let profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: session.user.id,
          ...data,
        },
      })
    } else {
      profile = await prisma.profile.update({
        where: { userId: session.user.id },
        data,
        include: { theme: true },
      })
    }

    if (data.name !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: data.name },
      })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
      return NextResponse.json({ error: issues[0]?.message || "Validation error" }, { status: 400 })
    }
    console.error("PUT /api/profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
