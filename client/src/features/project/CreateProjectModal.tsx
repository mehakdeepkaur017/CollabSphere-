import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useCreateProject } from "./useProjectQueries"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog"

const createProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  tags: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["planning", "active", "review", "completed"]),
})

type CreateProjectValues = z.infer<typeof createProjectSchema>

export function CreateProjectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { activeWorkspace } = useWorkspaceStore()
  const { mutate: createProject, isPending, isSuccess } = useCreateProject(activeWorkspace?._id || "")

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      tags: "",
      priority: "medium",
      status: "planning",
    },
  })

  const name = watch("name")
  const description = watch("description")
  const priority = watch("priority")
  const status = watch("status")
  const tagsStr = watch("tags")
  const tagsList = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []

  React.useEffect(() => {
    if (isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const onSubmit = (data: CreateProjectValues) => {
    const parsedTags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    
    createProject(
      { 
        name: data.name, 
        description: data.description, 
        priority: data.priority,
        status: data.status,
        tags: parsedTags 
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            onClose()
            reset()
          }, 800)
        }
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-background border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
          
          {/* Left Form Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-semibold tracking-tight text-white">Create Project</DialogTitle>
              <DialogDescription className="text-white/60">
                Set up a new initiative for your workspace.
              </DialogDescription>
            </DialogHeader>

            {!activeWorkspace ? (
               <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-8 text-center shadow-sm">
                 <Icons.info className="mx-auto mb-2 h-8 w-8 text-purple-400" />
                 <p className="text-sm font-medium text-white">No Workspace Selected</p>
                 <p className="mt-1 text-xs text-white/60">You must join a workspace before creating projects.</p>
               </div>
            ) : (
              <form id="create-project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Project Name <span className="text-purple-400">*</span></label>
                  <Input 
                    {...register("name")}
                    placeholder="e.g. Website Redesign" 
                    autoFocus
                    className="bg-black/20 border-white/10 focus-visible:ring-purple-500/30 text-white"
                  />
                  {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Description</label>
                  <Textarea 
                    {...register("description")}
                    placeholder="Briefly describe the goal..." 
                    rows={3}
                    className="bg-black/20 border-white/10 focus-visible:ring-purple-500/30 text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Priority</label>
                    <select 
                      {...register("priority")}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Initial Status</label>
                    <select 
                      {...register("status")}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Tags</label>
                  <Input 
                    {...register("tags")}
                    placeholder="e.g. frontend, v1.0, urgent (comma separated)" 
                    className="bg-black/20 border-white/10 focus-visible:ring-purple-500/30 text-white"
                  />
                </div>
              </form>
            )}

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending} className="text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button form="create-project-form" type="submit" isLoading={isPending} isSuccess={isSuccess} className="bg-purple-600 hover:bg-purple-500 text-white" disabled={!activeWorkspace}>
                Create Project
              </Button>
            </div>
          </div>

          {/* Right Preview Panel */}
          <div className="hidden md:flex w-[320px] bg-[#0c0c0e] border-l border-white/5 flex-col p-6 items-center justify-center relative overflow-hidden">
            
            {/* Background decorative blob */}
            <motion.div 
              className="absolute w-64 h-64 rounded-full bg-emerald-500 opacity-10 blur-[80px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="w-full relative z-10">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4 text-center">Live Preview</p>
              
              {/* Premium ProjectCard Preview */}
              <motion.div 
                layout
                className="group relative flex flex-col rounded-2xl bg-[#111116] border border-white/5 p-4 shadow-xl"
              >
                {/* Header: Priority & Status */}
                <div className="flex justify-between items-start mb-3">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border bg-gradient-to-br ${status === 'planning' ? 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20' : status === 'active' ? 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20' : status === 'review' ? 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20' : 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20'}`}>
                    {status}
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/60">
                    <span className="capitalize">{priority}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-semibold text-white/90 text-sm leading-tight mb-1.5 group-hover:text-white transition-colors">
                  {name || "Project Name"}
                </h3>
                <p className="text-xs text-white/40 line-clamp-2 mb-4 flex-1 font-light">
                  {description || "No description provided."}
                </p>

                {/* Tags */}
                {tagsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tagsList.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/50 border border-white/5">
                        {tag}
                      </span>
                    ))}
                    {tagsList.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/50 border border-white/5">
                        +{tagsList.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Progress Ring & Stats */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                  {/* Members */}
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-white/10 border border-[#111116] flex items-center justify-center text-[9px] font-bold text-white/80 relative z-10">
                      U
                    </div>
                  </div>

                  {/* Due Date & Progress */}
                  <div className="flex items-center gap-3">
                    {/* Circular Progress Ring */}
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-white/10"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-white/80">
                        0
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
