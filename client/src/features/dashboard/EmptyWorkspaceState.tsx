import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Icons } from "@/components/shared/icons"
import { fadeSlideUpVariants } from "@/lib/motion"

export interface EmptyWorkspaceStateProps {
  onCreate: () => void
  onJoin: () => void
}

export function EmptyWorkspaceState({ onCreate, onJoin }: EmptyWorkspaceStateProps) {
  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center p-6 text-center">
      <motion.div
        variants={fadeSlideUpVariants}
        initial="initial"
        animate="animate"
        className="relative flex max-w-lg flex-col items-center gap-6 overflow-hidden rounded-[2rem] border border-white/5 bg-black/40 p-12 shadow-2xl backdrop-blur-xl"
      >
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute -left-1/4 -top-1/4 h-[300px] w-[300px] animate-pulse rounded-full bg-purple-600/30 blur-[80px]" style={{ animationDuration: '4s' }} />
          <div className="absolute -right-1/4 -bottom-1/4 h-[250px] w-[250px] animate-pulse rounded-full bg-blue-600/30 blur-[80px]" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-inner">
          <Icons.folder className="h-10 w-10 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
        </div>
        
        <div className="relative z-10 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Create your first workspace
          </h2>
          <p className="text-base font-light text-white/60">
            A workspace is your team's collaborative operating system. Organize projects, brainstorm on whiteboards, and track your semester goals.
          </p>
        </div>

        <div className="relative z-10 mt-4 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" className="w-full sm:w-auto text-base rounded-full px-8 bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.15)]" onClick={onCreate}>
            Create Workspace
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto text-base rounded-full px-8 border-white/10 bg-white/5 hover:bg-white/10" onClick={onJoin}>
            Join Workspace
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
