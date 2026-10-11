import React from "react"
import {
  Flame,
  Dumbbell,
  Brain,
  BookOpen,
  Code,
  Target,
  Heart,
  Coffee,
  Sparkles,
  Compass,
  Activity,
  Zap,
  Clock,
  Droplets,
  Moon,
  Sun,
  Shield,
  Apple,
  Trophy,
  CheckCircle2,
  Smile,
  LucideIcon,
  HelpCircle,
  Footprints,
  Music,
  PenTool,
  Leaf,
  BicepsFlexed,
  Bike,
  Sparkle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Precision curated icon registry
export const ICON_MAP: Record<string, LucideIcon> = {
  // Direct icon names
  flame: Flame,
  dumbbell: Dumbbell,
  fitness: Dumbbell,
  brain: Brain,
  mind: Brain,
  book: BookOpen,
  "book-open": BookOpen,
  read: BookOpen,
  code: Code,
  dev: Code,
  target: Target,
  goal: Target,
  heart: Heart,
  health: Heart,
  coffee: Coffee,
  sparkles: Sparkles,
  compass: Compass,
  activity: Activity,
  run: Activity,
  zap: Zap,
  energy: Zap,
  clock: Clock,
  droplets: Droplets,
  water: Droplets,
  moon: Moon,
  sleep: Moon,
  sun: Sun,
  shield: Shield,
  apple: Apple,
  nutrition: Apple,
  trophy: Trophy,
  check: CheckCircle2,
  smile: Smile,
  walk: Footprints,
  music: Music,
  write: PenTool,
  growth: Leaf,
  bike: Bike,

  // Legacy emoji fallbacks mapped seamlessly to precision vector icons
  "📚": BookOpen,
  "💪": Dumbbell,
  "🧘": Brain,
  "🏃": Activity,
  "💧": Droplets,
  "🍎": Apple,
  "😴": Moon,
  "✍️": PenTool,
  "🎯": Target,
  "🧠": Brain,
  "💻": Code,
  "🎨": Sparkles,
  "🎵": Music,
  "🌱": Leaf,
  "⏰": Clock,
  "📝": PenTool,
  "🏋️": Dumbbell,
  "🚴": Bike,
  "🧹": Sparkles,
  "📞": Compass,
  "🏆": Trophy,
  "⭐": Sparkle,
  "💯": CheckCircle2,
  "👑": Trophy,
  "🔥": Flame,
  "🥦": Apple,
  "✅": CheckCircle2,
  "🔐": Shield,
}

export interface CuratedIcon {
  id: string
  label: string
  category: "Mind" | "Fitness" | "Health" | "Productivity" | "Lifestyle"
  icon: LucideIcon
}

export const CURATED_HABIT_ICONS: CuratedIcon[] = [
  { id: "brain", label: "Mindfulness", category: "Mind", icon: Brain },
  { id: "book-open", label: "Reading", category: "Mind", icon: BookOpen },
  { id: "sparkles", label: "Creativity", category: "Mind", icon: Sparkles },
  { id: "compass", label: "Focus", category: "Mind", icon: Compass },

  { id: "dumbbell", label: "Strength", category: "Fitness", icon: Dumbbell },
  { id: "activity", label: "Running", category: "Fitness", icon: Activity },
  { id: "walk", label: "Walking", category: "Fitness", icon: Footprints },
  { id: "bike", label: "Cycling", category: "Fitness", icon: Bike },

  { id: "droplets", label: "Hydration", category: "Health", icon: Droplets },
  { id: "apple", label: "Nutrition", category: "Health", icon: Apple },
  { id: "moon", label: "Sleep", category: "Health", icon: Moon },
  { id: "heart", label: "Cardio", category: "Health", icon: Heart },

  { id: "code", label: "Programming", category: "Productivity", icon: Code },
  { id: "target", label: "Deep Work", category: "Productivity", icon: Target },
  { id: "write", label: "Journaling", category: "Productivity", icon: PenTool },
  { id: "clock", label: "Routine", category: "Productivity", icon: Clock },

  { id: "coffee", label: "Break", category: "Lifestyle", icon: Coffee },
  { id: "flame", label: "Discipline", category: "Lifestyle", icon: Flame },
  { id: "music", label: "Music", category: "Lifestyle", icon: Music },
  { id: "growth", label: "Growth", category: "Lifestyle", icon: Leaf },
  { id: "shield", label: "Sobriety", category: "Lifestyle", icon: Shield },
  { id: "zap", label: "Energy", category: "Lifestyle", icon: Zap },
]

interface HabitIconProps {
  icon?: string | null
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  withBadge?: boolean
  badgeColor?: string
}

export function HabitIcon({
  icon,
  className,
  size = "md",
  withBadge = false,
  badgeColor,
}: HabitIconProps) {
  const IconComponent = (icon && ICON_MAP[icon.toLowerCase()]) || (icon && ICON_MAP[icon]) || Target

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  }

  const badgeSizeClasses = {
    sm: "h-7 w-7 rounded-lg",
    md: "h-9 w-9 rounded-xl",
    lg: "h-11 w-11 rounded-xl",
    xl: "h-14 w-14 rounded-2xl",
  }

  if (withBadge) {
    const accentStyle = badgeColor
      ? {
          backgroundColor: `${badgeColor}18`,
          borderColor: `${badgeColor}35`,
          color: badgeColor,
        }
      : undefined

    return (
      <div
        className={cn(
          "flex items-center justify-center flex-shrink-0 border transition-transform duration-300 group-hover:scale-105",
          badgeSizeClasses[size],
          !badgeColor && "bg-white/[0.04] border-white/10 text-white/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
        )}
        style={accentStyle}
      >
        <IconComponent className={cn(sizeClasses[size], className)} />
      </div>
    )
  }

  return <IconComponent className={cn(sizeClasses[size], className)} />
}
