import * as React from "react"
import { Icons } from "@/components/shared/icons"
import { useNavigate } from "react-router"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useActivities } from "@/features/workspace/useActivityQueries"
import { formatDistanceToNow } from "date-fns"

export function ActivityPulseWidget() {
  const navigate = useNavigate()
  const { activeWorkspace } = useWorkspaceStore()
  const { data: activities, isLoading } = useActivities(activeWorkspace?._id)

  const colors = ["bg-purple-500", "bg-green-500", "bg-orange-500", "bg-blue-500"]

  return (
    <div className="flex flex-col rounded-[24px] border border-white/5 bg-[#12121a] p-6 shadow-sm h-full w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icons.activity className="h-5 w-5 text-[#8b8b9d]" />
          <h2 className="text-[15px] font-bold text-white">Workspace Activity</h2>
        </div>
        <button onClick={() => navigate('/app/activity')} className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">
          View All
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto pr-3 custom-scrollbar relative">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Icons.spinner className="h-6 w-6 animate-spin text-[#55556a]" />
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="flex flex-col gap-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-white/10 pt-1 pb-4">
            {activities.slice(0, 5).map((activity: any, i: number) => {
              const colorClass = colors[i % colors.length]
              return (
                <div key={activity._id || i} className="relative flex gap-4">
                  <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#12121a] border-2 border-white/5">
                    <div className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
                  </div>
                  <div className="flex flex-col flex-1 pb-1 -mt-1">
                    <p className="text-[14px] text-white/80 leading-snug">
                      <span className="text-white/90">{activity.user?.name}</span> <span className="text-white/50">{activity.message}</span>
                    </p>
                    <span className="text-[12px] font-medium text-white/40 mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-[14px] font-medium text-[#8b8b9d]">No activity yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
