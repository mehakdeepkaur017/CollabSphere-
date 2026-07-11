import * as React from "react"

import { Sidebar, SidebarItem } from "./Sidebar"
import { TopHeader } from "./TopHeader"
import { CommandPalette } from "@/components/shared/CommandPalette"
import { cn } from "@/lib/utils"
import { Outlet, useLocation } from "react-router"
import { AnimatePresence, LayoutGroup } from "framer-motion"
import { AnimatedBackground } from "@/components/shared/AnimatedBackground"
import { CursorGlow } from "@/components/shared/CursorGlow"

import { useWorkspaces } from "@/features/workspace/useWorkspaceQueries"

export interface WorkspaceLayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

export function WorkspaceLayout({ className, ...props }: WorkspaceLayoutProps) {
  const location = useLocation()
  const isChatPage = location.pathname.includes("/chat")
  
  // Call useWorkspaces here so it globally fetches workspaces and syncs activeWorkspace on all routes
  useWorkspaces()

  return (
    <LayoutGroup>
      <div className={cn("flex h-screen w-full overflow-hidden bg-transparent text-foreground relative", className)} {...props}>
        <AnimatedBackground />
        <CursorGlow />
        <CommandPalette />
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden relative z-0 m-2 rounded-2xl border bg-background shadow-sm sm:my-3 sm:mr-3 sm:ml-0">
        {!isChatPage && <TopHeader />}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {isChatPage ? (
            /* Chat page gets full-bleed layout without padding */
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <AnimatePresence mode="wait">
                <Outlet key={location.pathname} />
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-6 md:p-8 lg:p-10 min-h-0">
              <div className="mx-auto flex w-full h-full max-w-5xl flex-1 flex-col gap-8">
                <AnimatePresence mode="wait">
                  <Outlet key={location.pathname} />
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </main>
      </div>
    </LayoutGroup>
  )
}

