import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { HabitsClient } from "./habits-client"

export default async function HabitsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isArchived: "asc" }, { order: "asc" }],
    include: {
      category: true,
      _count: {
        select: { completions: true },
      },
    },
  })

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: session.user.id }, { userId: null }] },
    orderBy: { order: "asc" },
  })

  return <HabitsClient habits={habits} categories={categories} />
}
