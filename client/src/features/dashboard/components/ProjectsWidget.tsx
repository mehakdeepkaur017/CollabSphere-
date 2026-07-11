import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useProjects } from "@/features/project/useProjectQueries"

export function ProjectsWidget() {
  const navigate = useNavigate()
  const { activeWorkspace } = useWorkspaceStore()
  const { data: projects, isLoading } = useProjects(activeWorkspace?._id)

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(96,165,250,0.15)" }}
      className="group flex flex-col rounded-[24px] border border-[#1a1a24] bg-[#0e0e12] p-6 shadow-xl transition-all hover:border-[#233876]"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#60a5fa]/20 to-[#3b82f6]/20 text-[#60a5fa] group-hover:bg-[#60a5fa]/30 transition-colors shadow-inner border border-white/5">
            <Icons.projects className="h-5 w-5" />
          </div>
          <h2 className="text-[17px] font-bold text-[#f8f8f8]">Recent Projects</h2>
        </div>
        <Button variant="ghost" size="icon" className="text-[#8b8b9d] hover:text-white" onClick={() => navigate('/app/projects')}>
          <Icons.arrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Icons.spinner className="h-6 w-6 animate-spin text-[#55556a]" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="flex flex-col gap-3">
            {projects.slice(0, 4).map((project: any) => (
              <div 
                key={project._id}
                onClick={() => navigate('/app/projects')}
                className="group/item flex items-center justify-between rounded-[16px] border border-[#1f1f2e] bg-[#14151b] p-3.5 hover:bg-[#1a1c23] hover:border-[#2a2a35] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`h-2.5 w-2.5 rounded-full shadow-sm ${project.status === 'completed' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-[#60a5fa] shadow-[0_0_8px_rgba(96,165,250,0.6)]'}`} />
                  <span className="font-semibold text-white/90 text-[14.5px] group-hover/item:text-white transition-colors">{project.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  {project.progress !== undefined && (
                    <div className="flex items-center gap-2">
                       <span className="text-[12px] font-bold text-[#8b8b9d]">{project.progress}%</span>
                       <div className="w-16 h-1.5 bg-[#050505] rounded-full overflow-hidden border border-[#2a2a35]">
                         <div 
                           className={`h-full rounded-full ${project.status === 'completed' ? 'bg-emerald-400' : 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]'}`} 
                           style={{ width: `${project.progress}%` }} 
                         />
                       </div>
                    </div>
                  )}
                  <Icons.chevronRight className="h-4 w-4 text-[#55556a] group-hover/item:text-[#8b8b9d] transition-colors" />
                </div>
              </div>
            ))}
            {projects.length < 4 && (
              <Button 
                onClick={() => navigate('/app/projects')}
                className="mt-2 w-full rounded-[14px] bg-transparent text-[#8b8b9d] hover:bg-white/5 hover:text-white border border-dashed border-[#2a2a35] py-5 font-semibold transition-all"
              >
                <Icons.plus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#14151b] border border-[#2a2a35] text-[#55556a] mb-3 shadow-inner">
              <Icons.projects className="h-5 w-5" />
            </div>
            <p className="text-[14px] font-medium text-[#8b8b9d] mb-4">No projects yet. Start building!</p>
            <Button onClick={() => navigate('/app/projects')} className="bg-[#101935] text-[#60a5fa] hover:bg-[#1a2754] border border-[#233876] rounded-xl px-6 font-semibold shadow-[0_4px_15px_-5px_rgba(96,165,250,0.2)]">
              Create Project
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
