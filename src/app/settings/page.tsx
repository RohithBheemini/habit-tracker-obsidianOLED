import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const [profile, themes] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { theme: true },
    }),
    prisma.theme.findMany({
      where: { isPreset: true },
    }),
  ])

  return (
    <SettingsClient
      profile={profile}
      themes={themes}
      user={{
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || null,
      }}
    />
  )
}
