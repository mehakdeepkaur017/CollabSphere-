import * as React from "react"
import { motion, useTransform, MotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

export interface FloatingWidgetProps {
  className?: string
  children: React.ReactNode
  initialX: number
  initialY: number
  parallaxX?: MotionValue<number>
  parallaxY?: MotionValue<number>
  parallaxFactor?: number
  delay?: number
}

export function FloatingWidget({
  className,
  children,
  initialX,
  initialY,
  parallaxX,
  parallaxY,
  parallaxFactor = 1,
  delay = 0,
}: FloatingWidgetProps) {
  // If parallax values are provided, transform them; otherwise use a fallback of 0
  const defaultParallax = { get: () => 0 } as MotionValue<number>
  const xMovement = useTransform(parallaxX || defaultParallax, (val) => val * parallaxFactor + initialX)
  const yMovement = useTransform(parallaxY || defaultParallax, (val) => val * parallaxFactor + initialY)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: initialY + 20, x: initialX }}
      animate={{ opacity: 1, scale: 1, y: initialY, x: initialX }}
      style={{
        x: xMovement,
        y: yMovement,
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay,
      }}
      className={cn(
        "absolute flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md",
        className
      )}
    >
      {children}
    </motion.div>
  )
}
