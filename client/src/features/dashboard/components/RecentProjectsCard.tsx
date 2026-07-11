import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useProjects } from "@/features/project/useProjectQueries"

export function RecentProjectsCard() {
  const navigate = useNavigate()
  const { activeWorkspace } = useWorkspaceStore()
  const { data: projects, isLoading } = useProjects(activeWorkspace?._id)

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(168,85,247,0.2)" }}
      className="group flex flex-col rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl p-6 transition-all hover:border-purple-500/30"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
            <Icons.projects className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
        </div>
        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white" onClick={() => navigate('/app/projects')}>
          <Icons.arrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Icons.spinner className="h-6 w-6 animate-spin text-purple-400/50" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="flex flex-col gap-3">
            {projects.slice(0, 3).map(project => (
              <div 
                key={project._id}
                onClick={() => navigate('/app/projects')}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${project.status === 'completed' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                  <span className="font-medium text-white/90 text-sm">{project.name}</span>
                </div>

              </div>
            ))}
            <Button 
              onClick={() => navigate('/app/projects')}
              className="mt-2 w-full rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/5"
            >
              <Icons.plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/40 mb-3">
              <Icons.projects className="h-5 w-5" />
            </div>
            <p className="text-sm text-white/50 mb-4">No projects yet. Start building!</p>
            <Button onClick={() => navigate('/app/projects')} className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 rounded-full px-6">
              Create Project
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
