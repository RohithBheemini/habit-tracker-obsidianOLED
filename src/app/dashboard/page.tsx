import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./dashboard-client"
import { getQuoteOfTheDay } from "@/lib/quotes"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: {
          theme: true,
        },
      },
      habits: {
        where: {
          isArchived: false,
        },
        orderBy: {
          order: "asc",
        },
        include: {
          category: true,
          completions: {
            where: {
              completedAt: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  const quote = getQuoteOfTheDay()
  const showQuote = user.profile?.quotesEnabled ?? true

  return <DashboardClient user={user} quote={showQuote ? quote : null} />
}
