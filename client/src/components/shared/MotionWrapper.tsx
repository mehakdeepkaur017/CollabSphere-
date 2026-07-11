import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { pageTransitionVariants, fadeSlideUpVariants, scaleFadeVariants } from "@/lib/motion"

export interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  variant?: "fade" | "slideUp" | "scale" | "page"
}

const variantsMap: Record<string, any> = {
  page: pageTransitionVariants,
  slideUp: fadeSlideUpVariants,
  scale: scaleFadeVariants,
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: "easeInOut" }
  },
}

export function MotionWrapper({ children, variant = "fade", className, ...props }: MotionWrapperProps) {
  const selectedVariant = variantsMap[variant]
  
  return (
    <motion.div
      variants={selectedVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
