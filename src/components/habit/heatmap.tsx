"use client"

import { useMemo } from "react"
import { format, subDays, startOfWeek, addDays } from "date-fns"

interface HeatmapProps {
  data: { date: string; count: number }[]
  weeks?: number
  onDayClick?: (date: string) => void
  showLabels?: boolean
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function getColorClass(count: number, max: number): string {
  if (count === 0) return "bg-white/[0.03] border border-white/[0.05]"
  const intensity = Math.min(Math.ceil((count / (max || 1)) * 4), 4)
  switch (intensity) {
    case 1:
      return "bg-indigo-950/70 border border-indigo-700/40"
    case 2:
      return "bg-indigo-700/80 border border-indigo-500/50 shadow-[0_0_6px_rgba(99,102,241,0.25)]"
    case 3:
      return "bg-indigo-500 border border-indigo-300/80 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
    case 4:
    default:
      return "bg-emerald-400 border border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.7)]"
  }
}

export function Heatmap({ data, weeks = 52, onDayClick, showLabels = true }: HeatmapProps) {
  const { grid, monthLabels, maxCount } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = startOfWeek(subDays(today, weeks * 7))
    const dataMap = new Map(data.map(d => [d.date, d.count]))
    let max = 0

    const cells: { date: Date; count: number; dateStr: string }[][] = []
    let currentWeek: { date: Date; count: number; dateStr: string }[] = []
    let currentDate = startDate

    while (currentDate <= today) {
      const dateStr = format(currentDate, "yyyy-MM-dd")
      const count = dataMap.get(dateStr) || 0
      max = Math.max(max, count)

      if (currentDate.getDay() === 0 && currentWeek.length > 0) {
        cells.push(currentWeek)
        currentWeek = []
      }

      currentWeek.push({ date: new Date(currentDate), count, dateStr })
      currentDate = addDays(currentDate, 1)
    }

    if (currentWeek.length > 0) {
      cells.push(currentWeek)
    }

    const months: { label: string; weekIndex: number }[] = []
    let lastMonth = -1
    cells.forEach((week, weekIndex) => {
      const firstDay = week[0]
      if (firstDay && firstDay.date.getMonth() !== lastMonth) {
        months.push({ label: MONTHS[firstDay.date.getMonth()], weekIndex })
        lastMonth = firstDay.date.getMonth()
      }
    })

    return { grid: cells, monthLabels: months, maxCount: max }
  }, [data, weeks])

  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block min-w-full">
        {showLabels && (
          <div className="flex mb-1.5 ml-8">
            {monthLabels.map((month, i) => (
              <div
                key={i}
                className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider"
                style={{ marginLeft: i === 0 ? 0 : `${(month.weekIndex - (monthLabels[i - 1]?.weekIndex || 0) - 1) * 14}px` }}
              >
                {month.label}
              </div>
            ))}
          </div>
        )}
        <div className="flex">
          {showLabels && (
            <div className="flex flex-col gap-1 mr-2 text-[10px] font-mono text-zinc-500">
              <div className="h-3" />
              {DAYS.filter((_, i) => i % 2 === 1).map((day) => (
                <div key={day} className="h-3 flex items-center">
                  {day.slice(0, 1)}
                </div>
              ))}
              <div className="h-3" />
            </div>
          )}
          <div className="flex gap-1">
            {grid.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <button
                    type="button"
                    key={day.dateStr}
                    onClick={() => onDayClick?.(day.dateStr)}
                    className={`w-3 h-3 rounded-[3px] cursor-pointer transition-transform hover:scale-125 focus:outline-none ${getColorClass(day.count, maxCount)}`}
                    title={`${format(day.date, "MMM d, yyyy")}: ${day.count} sessions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 justify-end text-[10px] font-mono text-zinc-500">
          <span>Void</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-2.5 h-2.5 rounded-[2px] ${getColorClass(level, 4)}`}
            />
          ))}
          <span>Peak</span>
        </div>
      </div>
    </div>
  )
}
