"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Moon, Sun, Monitor, ChevronLeft, Download, FileText, Table } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card3D } from "@/components/ui/card-3d"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Theme {
  id: string
  name: string
  colors: unknown
}

interface Profile {
  timezone: string
  weekStartDay: number
  quotesEnabled: boolean
  theme: Theme | null
}

interface SettingsClientProps {
  profile: Profile | null
  themes: Theme[]
  user: {
    name: string
    email: string
    image: string | null
  }
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  timezone: z.string(),
  weekStartDay: z.number(),
  quotesEnabled: z.boolean(),
})

type ProfileForm = z.infer<typeof profileSchema>

export function SettingsClient({ profile, themes, user }: SettingsClientProps) {
  const { theme, setTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      timezone: profile?.timezone || "UTC",
      weekStartDay: profile?.weekStartDay || 0,
      quotesEnabled: profile?.quotesEnabled ?? true,
    },
  })

  const timezone = watch("timezone")
  const weekStartDay = watch("weekStartDay")
  const quotesEnabled = watch("quotesEnabled")

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true)

    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      toast.success("Preferences updated successfully!")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-zinc-100 px-2 sm:px-4 py-4">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">System Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Profile configuration, environment appearance, and data export
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Details */}
        <Card3D className="p-6 glass-panel border-white/[0.08]">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white tracking-tight">Identity Profile</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Account identity credentials</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-zinc-300">Name</Label>
              <Input
                id="name"
                className="h-10 text-xs bg-white/[0.03] border-white/10 text-white rounded-xl focus:border-indigo-500/50"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-rose-400">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Account Email</Label>
              <Input
                value={user.email}
                disabled
                className="h-10 text-xs bg-white/[0.02] border-white/5 text-zinc-500 rounded-xl cursor-not-allowed"
              />
            </div>
          </div>
        </Card3D>

        {/* Visual Environment */}
        <Card3D className="p-6 glass-panel border-white/[0.08]">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white tracking-tight">Atmosphere & Visual Style</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Toggle display theme preferences</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTheme("dark")}
              className={`h-9 px-4 text-xs font-semibold rounded-xl border-white/10 gap-2 transition-all ${
                theme === "dark"
                  ? "bg-white text-zinc-950 font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "bg-white/[0.02] text-zinc-400 hover:text-white"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              Obsidian Dark
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTheme("light")}
              className={`h-9 px-4 text-xs font-semibold rounded-xl border-white/10 gap-2 transition-all ${
                theme === "light"
                  ? "bg-white text-zinc-950 font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "bg-white/[0.02] text-zinc-400 hover:text-white"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              Studio Light
            </Button>
          </div>
        </Card3D>

        {/* Timezone & Regional */}
        <Card3D className="p-6 glass-panel border-white/[0.08]">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white tracking-tight">Regional Telemetry</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Timezone localization and week start definition</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="text-xs font-semibold text-zinc-300">Timezone</Label>
              <Select
                value={timezone}
                onValueChange={(value) => value && setValue("timezone", value)}
              >
                <SelectTrigger className="h-10 text-xs bg-white/[0.03] border-white/10 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel-glow border-white/10 text-zinc-200">
                  <SelectItem value="America/New_York" className="text-xs">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago" className="text-xs">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver" className="text-xs">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles" className="text-xs">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London" className="text-xs">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris" className="text-xs">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo" className="text-xs">Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Singapore" className="text-xs">Singapore (SGT)</SelectItem>
                  <SelectItem value="UTC" className="text-xs">Universal Time Coordinated (UTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weekStartDay" className="text-xs font-semibold text-zinc-300">Week Cycle Initiation</Label>
              <Select
                value={String(weekStartDay)}
                onValueChange={(value) => value && setValue("weekStartDay", parseInt(value))}
              >
                <SelectTrigger className="h-10 text-xs bg-white/[0.03] border-white/10 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel-glow border-white/10 text-zinc-200">
                  <SelectItem value="0" className="text-xs">Sunday</SelectItem>
                  <SelectItem value="1" className="text-xs">Monday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card3D>

        {/* Dashboard Focus Toggles */}
        <Card3D className="p-6 glass-panel border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Daily Focus Anchors</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Display curated philosophical quotes on the primary dashboard
              </p>
            </div>
            <Switch
              checked={quotesEnabled}
              onCheckedChange={(checked) => setValue("quotesEnabled", checked)}
            />
          </div>
        </Card3D>

        {/* Data Export Center */}
        <Card3D className="p-6 glass-panel border-white/[0.08]">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white tracking-tight">Data Portability</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Download personal telemetry snapshots</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/api/export/csv" download>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border-white/10 bg-white/[0.02] text-zinc-300 hover:text-white gap-2"
              >
                <Table className="h-3.5 w-3.5 text-indigo-400" />
                Export CSV Dataset
              </Button>
            </a>
            <a href="/api/export/pdf" download>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border-white/10 bg-white/[0.02] text-zinc-300 hover:text-white gap-2"
              >
                <FileText className="h-3.5 w-3.5 text-rose-400" />
                Export PDF Telemetry
              </Button>
            </a>
          </div>
        </Card3D>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="h-10 px-6 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
