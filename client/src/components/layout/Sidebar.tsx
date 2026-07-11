import * as React from "react"
import { NavLink, useNavigate } from "react-router"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/shared/icons"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"

import { motion } from "framer-motion"
import { useAuthStore } from "@/store/authStore"

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex h-full w-[88px] shrink-0 flex-col items-center py-6 transition-all duration-300 ease-in-out bg-transparent",
          className
        )}
        {...props}
      >
        <div className="flex h-12 w-full items-center justify-center mb-4">
          <NavLink to="/app" className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary text-primary-foreground shadow-sm transition-all hover:scale-105 hover:shadow-md hover:shadow-primary/25">
            <Icons.logo className="h-6 w-6" />
          </NavLink>
        </div>
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <nav className="flex w-full flex-col items-center gap-2 px-2">
            <SidebarItem to="/app" end icon="dashboard" label="Dashboard" />
            <SidebarItem to="/app/projects" icon="projects" label="Projects" />
            <SidebarItem to="/app/tasks" icon="checkSquare" label="My Tasks" />
            <SidebarItem to="/app/planner" icon="calendar" label="Planner" />
            <SidebarItem to="/app/files" icon="folder" label="Files" />
            <SidebarItem to="/app/chat" icon="messageSquare" label="Chat" />
            <SidebarItem to="/app/meetings" icon="video" label="Meetings" />
            <SidebarItem to="/app/activity" icon="activity" label="Activity" />

            <SidebarItem to="/app/settings" icon="settings" label="Settings" />
          </nav>
        </div>
        <div className="flex w-full flex-col items-center gap-2 pt-4 px-2">
          <SidebarItem icon="logout" label="Logout" onClick={handleLogout} />
        </div>
      </aside>
    </TooltipProvider>
  )
}

export interface SidebarItemProps {
  icon: keyof typeof Icons
  label: string
  to?: string
  end?: boolean
  onClick?: () => void
}

export function SidebarItem({ icon, label, to, end, onClick }: SidebarItemProps) {
  const Icon = Icons[icon]

  const commonClasses = "group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"

  const content = (isActive?: boolean) => (
    <>
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0 rounded-2xl bg-card shadow-sm border border-white/5"
          initial={false}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        />
      )}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        />
      )}
      <Icon className={cn("relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive && "text-primary")} />
      <span className="sr-only">{label}</span>
    </>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {to ? (
          <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                !isActive && "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
              )
            }
          >
            {({ isActive }) => content(isActive)}
          </NavLink>
        ) : (
          <button onClick={onClick} className={commonClasses}>
            {content(false)}
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={12} className="font-semibold px-3 py-1.5 rounded-lg border-none shadow-[var(--shadow-layered-lg)] bg-foreground text-background animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 duration-200">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
