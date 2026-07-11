import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useActivities } from "@/features/workspace/useActivityQueries"
import { formatDistanceToNow } from "date-fns"

export function RecentActivityCard() {
  const { activeWorkspace } = useWorkspaceStore()
  const { data: activities, isLoading } = useActivities(activeWorkspace?._id)

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(249,115,22,0.2)" }}
      className="group flex flex-col rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl p-6 transition-all hover:border-orange-500/30"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors">
            <Icons.activity className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-[240px] max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Icons.spinner className="h-6 w-6 animate-spin text-orange-400/50" />
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="flex flex-col gap-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-white/5">
            {activities.map((activity, i) => (
              <div key={activity._id || i} className="relative flex gap-4">
                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B0C10] border-2 border-orange-500/30 text-orange-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                </div>
                <div className="flex flex-col pb-4">
                  <p className="text-sm text-white/90">
                    <span className="font-semibold text-white">{activity.user?.name}</span> <span className="font-medium text-white/70">{activity.message}</span>
                  </p>
                  <span className="text-xs text-white/40 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/40 mb-3">
              <Icons.bell className="h-5 w-5" />
            </div>
            <p className="text-sm text-white/50">Quiet in here.</p>
            <p className="text-xs text-white/40 mt-1">Activity will show up when your team starts working.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
