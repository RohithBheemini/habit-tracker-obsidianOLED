import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = signupSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const presetTheme = await prisma.theme.findFirst({ where: { isPreset: true } })

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        profile: {
          create: {
            ...(presetTheme ? { themeId: presetTheme.id } : {}),
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
      return NextResponse.json(
        { error: issues[0]?.message || "Validation error" },
        { status: 400 }
      )
    }
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
