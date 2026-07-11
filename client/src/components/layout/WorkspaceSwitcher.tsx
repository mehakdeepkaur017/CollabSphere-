import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useWorkspaces } from "@/features/workspace/useWorkspaceQueries"
import { Button } from "@/components/ui/Button"
import { CreateWorkspaceModal } from "@/features/workspace/CreateWorkspaceModal"
import { JoinWorkspaceModal } from "@/features/workspace/JoinWorkspaceModal"

export function WorkspaceSwitcher() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isJoinOpen, setIsJoinOpen] = React.useState(false)
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore()
  const { data: workspaces } = useWorkspaces()

  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/5 px-3 py-2 text-sm font-medium transition-all hover:bg-white/5 cursor-pointer backdrop-blur-md"
        >
          <div className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Icons.folder className="h-3 w-3" />
          </div>
          <span className="truncate max-w-[120px] text-white">
            {(workspaces && workspaces.length === 0) ? "Select Workspace" : (activeWorkspace?.name || "Select Workspace")}
          </span>
          <Icons.chevronDown className="h-4 w-4 text-white/40 ml-1" />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-2 shadow-2xl z-50 overflow-hidden"
            >
              <div className="mb-2 px-2 pt-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Your Workspaces</p>
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
                {workspaces?.map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => {
                      setActiveWorkspace(ws)
                      setIsOpen(false)
                      window.location.reload()
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      activeWorkspace?._id === ws._id ? 'bg-purple-500/10 text-purple-400' : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${activeWorkspace?._id === ws._id ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/40'}`}>
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-medium">{ws.name}</div>
                        <div className="text-[10px] opacity-60">
                          {ws.members.length} members
                        </div>
                      </div>
                    </div>
                    {activeWorkspace?._id === ws._id && <Icons.check className="h-4 w-4" />}
                  </button>
                ))}
              </div>

              <div className="mt-2 border-t border-white/10 pt-2 space-y-1">
                <button 
                  onClick={() => { setIsOpen(false); setIsCreateOpen(true); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Icons.plus className="h-4 w-4" />
                  </div>
                  Create Workspace
                </button>
                <button 
                  onClick={() => { setIsOpen(false); setIsJoinOpen(true); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Icons.globe className="h-4 w-4" />
                  </div>
                  Join Workspace
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateWorkspaceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinWorkspaceModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </>
  )
}
