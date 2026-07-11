import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "./project.api";
import { Icons } from "@/components/shared/icons";
import { useProjectSocket } from "@/hooks/useProjectSocket";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { LiveEditIndicator } from "./LiveEditIndicator";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import { Progress } from "@/components/ui/Progress";
import { usePresence } from "@/hooks/usePresence";

import { useDeleteProject } from "./useProjectQueries";

interface ProjectDialogProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectDialog({ project, onClose }: ProjectDialogProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject(activeWorkspace?._id || "");
  const { user } = useAuthStore();
  const { isUserOnline } = usePresence();
  
  // Custom hook for project-specific socket
  const { typingUsers, emitTypingStart, emitTypingStop, viewingUsers } = useProjectSocket(project?._id);

  if (!project) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        <motion.div
          layoutId={`project-${project._id}`}
          className="relative z-50 w-full max-w-3xl overflow-hidden rounded-3xl border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icons.projects className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{project.name}</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="uppercase">{project.status}</span>
                  <span>•</span>
                  <span>{format(new Date(project.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Currently Viewing Avatars */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">👀</span>
                <div className="flex -space-x-2">
                  <AnimatePresence>
                    {viewingUsers.map(u => (
                      <motion.div
                        key={u.userId}
                        initial={{ opacity: 0, scale: 0.5, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5, x: -20 }}
                        className="h-6 w-6 rounded-full border-2 border-background bg-secondary text-[10px] font-bold flex items-center justify-center"
                        title="Viewing this project"
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <Icons.close className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-6 h-[400px] overflow-y-auto relative">
            {/* Live Editing Indicator */}
            <div className="absolute top-6 right-6 z-10">
               <LiveEditIndicator typingUsers={typingUsers} />
            </div>

            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <textarea 
                  className="w-full bg-transparent resize-none border-none focus:ring-0 text-foreground text-sm p-0 placeholder:text-muted-foreground/50"
                  defaultValue={project.description}
                  placeholder="Add a description..."
                  onFocus={emitTypingStart}
                  onBlur={emitTypingStop}
                  rows={4}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Progress</h3>
                <div className="flex items-center gap-4">
                  <Progress value={project.progress} className="h-2 flex-1" indicatorClassName="bg-primary" />
                  <span className="text-sm font-bold">{project.progress}%</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Team Members</h3>
                <div className="flex flex-wrap gap-3">
                  {project.members?.map(m => (
                    <div key={m._id} className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-secondary/30">
                      <div className="relative h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                        {m._id && isUserOnline(m._id) && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-background" />
                        )}
                      </div>
                      <span className="text-xs font-medium">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t bg-muted/10 px-6 py-4">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this project?")) {
                  deleteProject(project._id, {
                    onSuccess: () => {
                      onClose()
                    }
                  })
                }
              }}
              disabled={isDeleting}
              className="flex items-center gap-2 text-sm font-medium text-destructive transition-colors hover:text-destructive/80 disabled:opacity-50"
            >
              <Icons.trash className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Project"}
            </button>
            <button
              onClick={onClose}
              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
  );
}
