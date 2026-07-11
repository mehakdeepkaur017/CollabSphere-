import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useWhiteboardList } from "@/features/workspace/useWhiteboardQueries"
import { useNavigate } from "react-router"

export function WhiteboardsCard() {
  const { activeWorkspace } = useWorkspaceStore()
  const { data: whiteboards, isLoading } = useWhiteboardList(activeWorkspace?._id)
  const navigate = useNavigate()

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(16,185,129,0.2)" }}
      className="group flex flex-col rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl p-6 transition-all hover:border-emerald-500/30"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            <Icons.pencil className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Whiteboards</h2>
        </div>
        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white" onClick={() => navigate('/app/whiteboard')}>
          <Icons.arrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Icons.spinner className="h-6 w-6 animate-spin text-emerald-400/50" />
          </div>
        ) : whiteboards && whiteboards.length > 0 ? (
          <div className="flex flex-col gap-3">
            {whiteboards.map(wb => (
              <div 
                key={wb.id} 
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => navigate('/app/whiteboard')}
              >
                <div className="flex items-center gap-3">
                  <Icons.pencil className="h-4 w-4 text-emerald-400/70" />
                  <span className="font-medium text-white/90 text-sm">{wb.name}</span>
                </div>
              </div>
            ))}
            <Button onClick={() => navigate('/app/whiteboard')} className="mt-auto w-full rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/5">
              Open Workspace Board
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/40 mb-3">
              <Icons.pencil className="h-5 w-5" />
            </div>
            <p className="text-sm text-white/50 mb-4">No whiteboards created.</p>
            <Button onClick={() => navigate('/app/whiteboard')} className="bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 rounded-full px-6">
              Create Whiteboard
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
