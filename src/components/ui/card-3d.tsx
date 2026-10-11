"use client"

import React, { useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  intensity?: number
  glowColor?: string
  className?: string
}

export function Card3D({
  children,
  intensity = 10,
  glowColor = "rgba(99, 102, 241, 0.15)",
  className,
  ...props
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const normX = (x - centerX) / centerX
    const normY = (y - centerY) / centerY

    setRotateX(-normY * intensity)
    setRotateY(normX * intensity)
    setSpotlightPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1,
    })
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setSpotlightPos(prev => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.15s ease-out, border-color 0.2s ease, box-shadow 0.2s ease",
      }}
      className={cn(
        "relative rounded-2xl glass-panel overflow-hidden transition-all duration-300 preserve-3d group",
        className
      )}
      {...props}
    >
      {/* Specular cursor glow spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 z-10"
        style={{
          opacity: spotlightPos.opacity,
          background: `radial-gradient(circle 280px at ${spotlightPos.x}% ${spotlightPos.y}%, ${glowColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  )
}
