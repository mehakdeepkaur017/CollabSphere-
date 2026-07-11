import * as React from "react"
import { Icons } from "@/components/shared/icons"
import { useNavigate } from "react-router"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { usePresence } from "@/hooks/usePresence"

export function TeamPresenceWidget() {
  const navigate = useNavigate()
  const { activeWorkspace } = useWorkspaceStore()
  const { isUserOnline } = usePresence()

  if (!activeWorkspace) return null

  const sortedMembers = [...activeWorkspace.members].sort((a, b) => {
    const aOnline = isUserOnline(a.user._id)
    const bOnline = isUserOnline(b.user._id)
    if (aOnline === bOnline) return 0
    return aOnline ? -1 : 1
  })

  const avatarColors = ["bg-[#7445f1]", "bg-[#10b981]", "bg-[#f97316]", "bg-[#3b82f6]"]

  return (
    <div className="flex flex-col rounded-[24px] border border-white/5 bg-[#12121a] p-6 shadow-sm h-full w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icons.users className="h-5 w-5 text-[#4ade80]" />
          <h2 className="text-[15px] font-bold text-white">Members</h2>
        </div>
        <button onClick={() => navigate('/app/settings/members')} className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">
          View All
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col gap-4">
          {sortedMembers.map((member, idx) => {
            const isOnline = isUserOnline(member.user._id)
            const colorClass = avatarColors[idx % avatarColors.length]
            
            return (
              <div 
                key={member.user._id} 
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full ${colorClass} flex items-center justify-center shrink-0`}>
                    {member.user.avatar ? (
                      <img src={member.user.avatar} alt={member.user.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-[14px] font-bold text-white">
                        {(member.user.name || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-white/90">
                      {member.user.name}
                    </span>
                    {member.role === "owner" && (
                      <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-400">
                        Owner
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#4ade80]' : 'bg-white/20'}`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
