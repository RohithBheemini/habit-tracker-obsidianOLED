import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Flame,
  BarChart3,
  Shield,
  Zap,
  Target,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  Clock,
  Compass,
} from "lucide-react"
import { Card3D } from "@/components/ui/card-3d"
import { HabitIcon } from "@/components/ui/habit-icon"

export default async function HomePage() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-obsidian-mesh text-zinc-100 selection:bg-indigo-500/30">
      {/* Top Navigation Capsule */}
      <header className="sticky top-3 z-50 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex h-14 items-center justify-between px-5 rounded-2xl glass-panel border border-white/[0.08] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <Zap className="h-4 w-4 fill-white" />
              </div>
              <span className="font-semibold tracking-tight text-white text-sm">
                Habit<span className="text-indigo-400">Tracker</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-zinc-300 hover:text-white rounded-xl">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="h-8 px-4 text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 pt-16 pb-24">
        {/* Hero Section */}
        <section className="text-center pt-8 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-zinc-300 text-xs font-medium mb-8 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Next-Generation Habit Architecture</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-500 leading-[1.08] mb-6">
            Architect discipline. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
              Own your consistency.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            A high-performance system designed for personal mastery. Fluid 3D tracking, precision streak mechanics, and zero friction.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-7 text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.25)] gap-2 group">
                Begin Transformation
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-medium border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.04] rounded-2xl glass-panel-subtle">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </section>

        {/* 3D Floating Dashboard Interactive Preview */}
        <section className="py-6 mb-20">
          <div className="relative mx-auto max-w-4xl">
            {/* Background atmospheric ambient aura */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/15 to-emerald-500/20 rounded-3xl blur-3xl opacity-60 -z-10" />

            <Card3D className="p-6 sm:p-8 border border-white/[0.12] bg-zinc-950/70 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
                <div>
                  <div className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" />
                    Live Protocol Status
                  </div>
                  <h3 className="text-xl font-bold text-white">Daily Execution Matrix</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    84% On Track
                  </div>
                </div>
              </div>

              {/* Sample Habit Rows with 3D Depth & Zero Emojis */}
              <div className="grid gap-3.5">
                {[
                  { name: "Deep Work Protocol", icon: "target", freq: "Daily", streak: 18, color: "#6366f1", done: true },
                  { name: "Strength & Conditioning", icon: "dumbbell", freq: "Weekly (4 days)", streak: 12, color: "#10b981", done: true },
                  { name: "Technical Literature", icon: "book-open", freq: "Daily", streak: 9, color: "#a855f7", done: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-200"
                  >
                    <div className="flex items-center gap-3.5">
                      <HabitIcon icon={item.icon} size="md" withBadge badgeColor={item.color} />
                      <div>
                        <p className={`font-semibold text-sm ${item.done ? "text-zinc-200" : "text-white"}`}>{item.name}</p>
                        <p className="text-xs text-zinc-500">{item.freq}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-medium text-amber-400/90 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                        <Flame className="h-3 w-3 fill-amber-400" />
                        {item.streak}d
                      </div>
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center border text-xs font-bold ${
                          item.done
                            ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                            : "bg-white/[0.04] text-zinc-500 border-white/10"
                        }`}
                      >
                        {item.done ? <CheckCircle2 className="h-4 w-4" /> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card3D>
          </div>
        </section>

        {/* Feature Grid with Precision Vector Icons */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Engineered for High Output
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
              Clean telemetry, fluid interaction layers, and focused habit tracking designed without distraction.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Card3D className="p-6 border-white/[0.08] bg-zinc-950/60">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Unbroken Momentum</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Algorithmic streak calculation and status notifications keep your primary rituals locked in day after day.
              </p>
            </Card3D>

            <Card3D className="p-6 border-white/[0.08] bg-zinc-950/60">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Dark Surface Analytics</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Yearly consistency heatmaps, completion trends, and telemetry breakdowns visualized with precision.
              </p>
            </Card3D>

            <Card3D className="p-6 border-white/[0.08] bg-zinc-950/60">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Zero-Friction Engine</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Instant one-tap completion logs with optional reflections, notes, and PDF/CSV data exports.
              </p>
            </Card3D>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="py-20 text-center relative">
          <div className="absolute inset-0 max-w-xl mx-auto bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Transform your daily standard.
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-8 text-sm sm:text-base">
            Join disciplined creators, builders, and athletes locking in daily consistency.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8 text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Get Started Free
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-8 mt-12 bg-black/40">
        <div className="container max-w-6xl mx-auto px-4 text-center text-xs text-zinc-500">
          <p>&copy; {new Date().getFullYear()} HabitTracker. Crafted for precision consistency.</p>
        </div>
      </footer>
    </div>
  )
}
