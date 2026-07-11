import * as React from "react"
import { Icons } from "@/components/shared/icons"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { staggerContainerVariants, staggerItemVariants, fadeSlideUpVariants } from "@/lib/motion"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: keyof typeof Icons
  title: string
  description?: string
  action?: React.ReactNode
  colorClass?: string
}

export function EmptyState({
  className,
  icon = "fileText",
  title,
  description,
  action,
  colorClass = "bg-muted text-muted-foreground",
  ...props
}: EmptyStateProps) {
  const Icon = Icons[icon]

  return (
    <motion.div
      variants={fadeSlideUpVariants}
      initial="initial"
      animate="animate"
      className={cn(
        "relative flex min-h-[440px] w-full flex-col items-center justify-center rounded-[2rem] border border-dashed border-border/60 bg-muted/5 p-12 text-center overflow-hidden",
        className
      )}
      {...props as any}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20 pointer-events-none" />
      <motion.div 
        variants={staggerContainerVariants}
        className="relative z-10 mx-auto flex max-w-[420px] flex-col items-center justify-center text-center"
      >
        <motion.div 
          variants={staggerItemVariants} 
          className={cn("relative mb-10 flex h-36 w-36 items-center justify-center rounded-[2.5rem] bg-background shadow-2xl border border-white/5", colorClass.includes('bg-') ? '' : 'bg-background')}
        >
          {/* Animated background glow */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className={cn("absolute inset-0 rounded-[2rem] blur-xl opacity-30", colorClass)}
          />
          {/* Floating icon container */}
          <motion.div 
            animate={{ y: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className={cn("relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl", colorClass)}
          >
            <Icon className="h-10 w-10 drop-shadow-md" />
          </motion.div>
        </motion.div>
        <motion.h2 variants={staggerItemVariants} className="text-2xl font-bold tracking-tight">{title}</motion.h2>
        {description && (
          <motion.p variants={staggerItemVariants} className="mt-3 text-center text-base font-normal leading-relaxed text-muted-foreground">
            {description}
          </motion.p>
        )}
        {action && <motion.div variants={staggerItemVariants} className="mt-8">{action}</motion.div>}
      </motion.div>
    </motion.div>
  )
}
