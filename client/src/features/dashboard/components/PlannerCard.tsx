import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { usePlannerEvents } from "@/features/workspace/usePlannerQueries"

export function PlannerCard() {
  const { activeWorkspace } = useWorkspaceStore()
  const { data: events, isLoading } = usePlannerEvents(activeWorkspace?._id)

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(59,130,246,0.2)" }}
      className="group flex flex-col rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl p-6 transition-all hover:border-blue-500/30"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
            <Icons.calendar className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Planner</h2>
        </div>
        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
          <Icons.arrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Icons.spinner className="h-6 w-6 animate-spin text-blue-400/50" />
          </div>
        ) : events && events.length > 0 ? (
          <div className="flex flex-col gap-3">
            {events.map(event => (
              <div key={event.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
                <span className="font-medium text-white/90 text-sm">{event.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/40 mb-3">
              <Icons.calendar className="h-5 w-5" />
            </div>
            <p className="text-sm text-white/50 mb-4">No upcoming events.</p>
            <Button className="bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-full px-6">
              Open Planner
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
