import * as React from "react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { fadeSlideUpVariants, staggerContainerVariants, staggerItemVariants } from "@/lib/motion"
import { PresenceBar } from "./PresenceBar"

export interface WorkspaceHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  showGreeting?: boolean
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

const QUOTES = [
  "Let's build something meaningful today.",
  "Consistency creates great teams.",
  "One task completed is one step forward.",
  "Great things are done by a series of small things brought together.",
  "Collaboration multiplies success."
]

export function WorkspaceHeader({
  className,
  title,
  subtitle,
  action,
  showGreeting = false,
  ...props
}: WorkspaceHeaderProps) {
  const [quoteIndex, setQuoteIndex] = React.useState(0)
  
  React.useEffect(() => {
    // Generate a consistent but pseudo-random quote based on the day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
    setQuoteIndex(dayOfYear % QUOTES.length)
  }, [])

  const displayTitle = showGreeting ? `${getGreeting()}, Mehakdeep.` : title
  const displaySubtitle = showGreeting ? QUOTES[quoteIndex] : subtitle
  const today = new Date()

  return (
    <motion.div 
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className={cn("flex flex-col gap-6 pb-8 pt-4 md:flex-row md:items-end md:justify-between", className)} 
      {...(props as any)}
    >
      <div className="space-y-3">
        {showGreeting ? (
          <motion.div variants={staggerItemVariants} className="flex items-center gap-2 text-sm font-medium tracking-wide text-indigo-500 uppercase">
            <span>{format(today, "EEEE")}</span>
            <span className="h-1 w-1 rounded-full bg-indigo-500/50" />
            <span className="text-muted-foreground">{format(today, "MMMM do")}</span>
          </motion.div>
        ) : (
          <motion.div variants={staggerItemVariants}>
            <PresenceBar />
          </motion.div>
        )}
        <motion.h1 variants={staggerItemVariants} className="text-3xl font-bold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.1]">
          {displayTitle}
        </motion.h1>
        {displaySubtitle && (
          <motion.p variants={staggerItemVariants} className="text-lg text-muted-foreground/80 max-w-2xl font-light">
            {displaySubtitle}
          </motion.p>
        )}
      </div>
      {action && (
        <motion.div variants={staggerItemVariants} className="flex items-center gap-3">
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
