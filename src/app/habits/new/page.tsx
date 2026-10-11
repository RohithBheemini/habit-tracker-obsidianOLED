import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { HabitForm } from "../habit-form"

export default async function NewHabitPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: session.user.id }, { userId: null }] },
    orderBy: { order: "asc" },
  })

  return <HabitForm categories={categories} />
}
