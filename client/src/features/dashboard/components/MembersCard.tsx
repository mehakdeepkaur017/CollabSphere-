import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useAuthStore } from "@/store/authStore"
import { usePresence } from "@/hooks/usePresence"

export function MembersCard() {
  const { activeWorkspace } = useWorkspaceStore()
  const { isUserOnline } = usePresence()
  const { user } = useAuthStore()

  if (!activeWorkspace) return null

  const currentUserRole = activeWorkspace.members.find(m => m.user._id === user?.id)?.role
  const isOwner = currentUserRole === "owner"

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(168,85,247,0.2)" }}
      className="group flex flex-col rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl p-6 transition-all hover:border-purple-500/30"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
            <Icons.users className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Members</h2>
        </div>
        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
          <Icons.arrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-h-[240px] max-h-[240px] overflow-y-auto pr-2 custom-scrollbar gap-3">
        {activeWorkspace.members.map(member => {
          const isOnline = isUserOnline(member.user._id)
          return (
            <div key={member.user._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10">
                    <span className="font-bold text-white text-sm">{(member.user?.name || "U").charAt(0).toUpperCase()}</span>
                  </div>
                  {isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#1a1b1e]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white/90 text-sm leading-tight">{member.user?.name || "Unknown User"}</span>
                  <span className="text-xs text-white/40 mt-0.5 capitalize">{member.role}</span>
                </div>
              </div>
              {isOwner && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                  <Icons.moreHorizontal className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
