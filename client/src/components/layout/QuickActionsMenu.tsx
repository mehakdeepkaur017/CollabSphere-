import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { useNavigate } from "react-router"
import { CreateProjectModal } from "@/features/project/CreateProjectModal"
import { InviteMembersModal } from "@/features/workspace/InviteMembersModal"

export function QuickActionsMenu() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isProjectOpen, setIsProjectOpen] = React.useState(false)
  const [isInviteOpen, setIsInviteOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const actions = [
    { icon: "projects" as const, label: "Create Project", onClick: () => setIsProjectOpen(true), color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: "pencil" as const, label: "New Whiteboard", onClick: () => navigate("/app/whiteboard"), color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: "users" as const, label: "Invite Members", onClick: () => setIsInviteOpen(true), color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { icon: "calendar" as const, label: "Planner Event", onClick: () => navigate("/app/planner"), color: "text-orange-400", bg: "bg-orange-400/10" },
    { icon: "check" as const, label: "New Task", onClick: () => navigate("/app/projects"), color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { icon: "folder" as const, label: "Upload File", onClick: () => navigate("/app/files"), color: "text-rose-400", bg: "bg-rose-400/10" },
  ]

  return (
    <>
      <div className="relative z-50" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Icons.plus className="h-5 w-5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, transformOrigin: "top right" }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-2 shadow-2xl"
            >
              <div className="mb-2 px-3 pt-2">
                <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Quick Actions</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {actions.map((action, idx) => {
                  const Icon = Icons[action.icon]
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsOpen(false)
                        action.onClick()
                      }}
                      className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-center transition-colors hover:bg-white/10 hover:border-white/10"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-medium text-white/80">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateProjectModal isOpen={isProjectOpen} onClose={() => setIsProjectOpen(false)} />
      <InviteMembersModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </>
  )
}
