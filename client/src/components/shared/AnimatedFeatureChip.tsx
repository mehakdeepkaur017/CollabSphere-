import * as React from "react"
import { motion, useTransform, MotionValue } from "framer-motion"
import { Icons } from "@/components/shared/icons"

interface AnimatedFeatureChipProps {
  icon: keyof typeof Icons
  label: string
  delay?: number
  colorClass?: string
  parallaxX?: MotionValue<number>
  parallaxY?: MotionValue<number>
  parallaxFactor?: number
  initialX?: number
  initialY?: number
}

export function AnimatedFeatureChip({
  icon,
  label,
  delay = 0,
  colorClass = "text-indigo-400 bg-indigo-500/20",
  parallaxX,
  parallaxY,
  parallaxFactor = 0,
  initialX = 0,
  initialY = 0,
}: AnimatedFeatureChipProps) {
  const Icon = Icons[icon]
  
  const defaultParallax = { get: () => 0 } as MotionValue<number>
  const x = useTransform(parallaxX || defaultParallax, (v) => v * parallaxFactor + initialX)
  const y = useTransform(parallaxY || defaultParallax, (v) => v * parallaxFactor + initialY)

  return (
    <motion.div
      initial={{ opacity: 0, y: initialY + 15, x: initialX }}
      animate={{ opacity: 1, y: initialY, x: initialX }}
      whileHover={{ scale: 1.05 }}
      style={parallaxFactor ? { x, y } : undefined}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay,
      }}
      className="flex cursor-default items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 shadow-md backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/10"
    >
      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${colorClass}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      {label}
    </motion.div>
  )
}
