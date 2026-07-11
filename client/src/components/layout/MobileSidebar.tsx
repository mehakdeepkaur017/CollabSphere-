import * as React from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet"
import { Button } from "@/components/ui/Button"
import { Icons } from "@/components/shared/icons"
import { NavLink, useNavigate } from "react-router"

import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false)
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate("/login")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white/80 hover:bg-white/10 hover:text-white transition-colors">
          <Icons.moreHorizontal className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] border-r border-white/10 bg-black/95 backdrop-blur-xl p-0 flex flex-col">
        <div className="flex h-16 items-center px-6 border-b border-white/5">
          <Icons.logo className="h-6 w-6 text-purple-400 mr-2" />
          <span className="font-bold text-white tracking-tight">CollabSphere</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          <MobileSidebarItem to="/app" icon="dashboard" label="Dashboard" end onClick={() => setOpen(false)} />
          <MobileSidebarItem to="/app/projects" icon="projects" label="Projects" onClick={() => setOpen(false)} />
          <MobileSidebarItem to="/app/planner" icon="calendar" label="Planner" onClick={() => setOpen(false)} />
          <MobileSidebarItem to="/app/files" icon="folder" label="Files" onClick={() => setOpen(false)} />
          <MobileSidebarItem to="/app/chat" icon="messageSquare" label="Chat" onClick={() => setOpen(false)} />
          <MobileSidebarItem to="/app/meetings" icon="video" label="Meetings" onClick={() => setOpen(false)} />
          <MobileSidebarItem to="/app/activity" icon="activity" label="Activity" onClick={() => setOpen(false)} />

        </div>

        <div className="p-4 border-t border-white/5 space-y-1">
          <MobileSidebarItem to="/app/settings" icon="settings" label="Settings" onClick={() => setOpen(false)} />

          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 mt-2 text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Icons.logout className="h-5 w-5" />
            Logout
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MobileSidebarItem({ to, icon, label, end, onClick }: { to: string, icon: keyof typeof Icons, label: string, end?: boolean, onClick: () => void }) {
  const Icon = Icons[icon]
  
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        isActive 
          ? "bg-purple-500/10 text-purple-400" 
          : "text-white/60 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  )
}
