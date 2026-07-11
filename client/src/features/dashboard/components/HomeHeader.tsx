import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useNavigate } from "react-router"
import { useAuthStore } from "@/store/authStore"

interface HomeHeaderProps {
  onInvite: () => void
  onNewProject?: () => void
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function HomeHeader({ onInvite, onNewProject }: HomeHeaderProps) {
  const { activeWorkspace } = useWorkspaceStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  if (!activeWorkspace) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-4"
    >
      {/* Left Text Side */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-white/80 text-[15px] font-medium">
          <span>👋</span>
          <span>{getGreeting()},</span>
        </div>
        <h1 className="text-[32px] sm:text-[40px] font-bold text-white tracking-tight leading-tight">
          {user?.name || "User"}
        </h1>
        <p className="text-[14px] text-white/50 mt-1">
          You're working in <span className="text-purple-400 font-semibold">{activeWorkspace.name}</span> workspace.
        </p>
      </div>

      {/* Right Buttons Side */}
      <div className="flex items-center gap-3">
        <Button 
          onClick={onNewProject}
          className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-5 h-auto shadow-lg shadow-indigo-500/20 font-medium transition-all"
        >
          <Icons.plus className="h-4 w-4 mr-2 stroke-[3]" />
          New Project
        </Button>
        <Button 
          onClick={onInvite}
          className="rounded-xl bg-transparent text-white/80 hover:bg-white/5 hover:text-white border border-white/10 px-5 py-5 h-auto transition-all"
        >
          <Icons.userPlus className="h-4 w-4 mr-2" />
          Invite Members
        </Button>
        <Button 
          onClick={() => navigate('/app/settings')}
          className="rounded-xl bg-transparent text-white/80 hover:bg-white/5 hover:text-white border border-white/10 px-5 py-5 h-auto transition-all"
        >
          <Icons.settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </motion.div>
  )
}
