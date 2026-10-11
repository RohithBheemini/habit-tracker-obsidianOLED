"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Target,
  BarChart3,
  Trophy,
  Settings,
  Moon,
  Sun,
  Menu,
  LogOut,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: Target },
  { href: "/stats", label: "Analytics", icon: BarChart3 },
  { href: "/achievements", label: "Milestones", icon: Trophy },
]

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() || "U"

  return (
    <header className="sticky top-2 z-50 w-full px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-14 items-center justify-between px-4 rounded-2xl glass-panel shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] border border-white/[0.08]">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.45)] group-hover:scale-105 transition-transform duration-200">
                <Zap className="h-4 w-4 fill-white" />
              </div>
              <span className="font-semibold tracking-tight text-white/90 text-sm hidden sm:inline-block">
                Habit<span className="text-indigo-400">Tracker</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-2 h-8 px-3 text-xs font-medium rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-white/[0.1] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/[0.08]"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5", isActive ? "text-indigo-400" : "text-zinc-400")} />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06]"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {!mounted ? (
                <div className="h-3.5 w-3.5" />
              ) : theme === "dark" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>

            {status === "loading" ? (
              <div className="h-8 w-8 rounded-xl bg-white/[0.05] animate-pulse border border-white/[0.08]" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 p-0.5">
                  <Avatar className="h-8 w-8 cursor-pointer rounded-xl border border-white/[0.12] hover:border-indigo-400/50 transition-colors">
                    <AvatarFallback className="bg-indigo-500/15 text-indigo-300 font-medium text-xs rounded-xl">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-panel-glow border-white/[0.12] rounded-xl text-zinc-200" align="end">
                  <div className="flex flex-col space-y-1 p-2">
                    {session.user?.name && (
                      <p className="font-medium text-xs text-white">{session.user.name}</p>
                    )}
                    {session.user?.email && (
                      <p className="text-[11px] text-zinc-400 truncate">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-white/[0.08]" />
                  <DropdownMenuItem className="cursor-pointer focus:bg-white/[0.08] focus:text-white text-xs rounded-lg">
                    <Link href="/settings" className="flex items-center w-full">
                      <Settings className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.08]" />
                  <DropdownMenuItem
                    className="cursor-pointer text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 text-xs rounded-lg"
                    onClick={async () => {
                      await signOut({ redirect: false })
                      window.location.href = "/signup"
                    }}
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-zinc-300 hover:text-white rounded-xl">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="md:hidden p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.05]">
                <Menu className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 glass-panel border-white/[0.1] text-zinc-200">
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2.5 h-10 rounded-xl text-sm font-medium",
                            isActive ? "bg-white/[0.1] text-white border border-white/[0.1]" : "text-zinc-400 hover:text-white"
                          )}
                        >
                          <Icon className={cn("h-4 w-4", isActive ? "text-indigo-400" : "text-zinc-400")} />
                          {item.label}
                        </Button>
                      </Link>
                    )
                  })}
                  <Link href="/settings" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2.5 h-10 rounded-xl text-sm font-medium text-zinc-400 hover:text-white">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
