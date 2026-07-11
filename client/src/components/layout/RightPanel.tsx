import * as React from "react"
import { Icons } from "@/components/shared/icons"
import { motion } from "framer-motion"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/motion"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useProjects } from "@/features/project/useProjectQueries"
import { useAuthStore } from "@/store/authStore"

export function RightPanel() {
  const { activeWorkspace } = useWorkspaceStore()
  const { data: projects } = useProjects(activeWorkspace?._id)
  const { user } = useAuthStore()

  const memberCount = activeWorkspace?.members?.length || 0;
  const projectCount = projects?.length || 0;
  
  const currentUserMember = activeWorkspace?.members?.find(m => m.user._id === user?.id);
  const userRole = currentUserMember?.role || 'Guest';

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto border-l bg-background/50 px-4 py-6 xl:flex">
      <motion.div 
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Workspace Context */}
        <motion.section variants={staggerItemVariants} className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace Stats</h4>
          {!activeWorkspace ? (
             <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-center shadow-sm">
               <Icons.info className="mx-auto mb-2 h-5 w-5 text-muted-foreground/50" />
               <p className="text-xs text-muted-foreground">Select a workspace to view statistics.</p>
             </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border bg-card p-3 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Icons.profile className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Members</span>
                </div>
                <span className="text-lg font-bold text-foreground">{memberCount}</span>
              </div>
              
              <div className="flex items-center justify-between rounded-xl border bg-card p-3 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Icons.projects className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Projects</span>
                </div>
                <span className="text-lg font-bold text-foreground">{projectCount}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border bg-card p-3 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <Icons.check className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Your Role</span>
                </div>
                <span className="text-sm font-bold text-foreground capitalize">{userRole}</span>
              </div>
            </div>
          )}
        </motion.section>

        {/* Keyboard Shortcuts */}
        <motion.section variants={staggerItemVariants} className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shortcuts</h4>
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b p-3">
              <span className="text-sm text-muted-foreground">Search</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">⌘ K</kbd>
            </div>
            <div className="flex items-center justify-between border-b p-3">
              <span className="text-sm text-muted-foreground">New Project</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">C</kbd>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-muted-foreground">Toggle Theme</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">⇧ T</kbd>
            </div>
          </div>
        </motion.section>

      </motion.div>
    </aside>
  )
}
