import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { HabitForm } from "../../habit-form"

export default async function EditHabitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect("/login")
  }

  const habit = await prisma.habit.findUnique({
    where: { id },
  })

  if (!habit || habit.userId !== session.user.id) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: session.user.id }, { userId: null }] },
    orderBy: { order: "asc" },
  })

  return (
    <HabitForm
      categories={categories}
      initialData={{
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        frequencyType: habit.frequencyType,
        frequencyConfig: habit.frequencyConfig as Record<string, unknown>,
        categoryId: habit.categoryId,
      }}
    />
  )
}
