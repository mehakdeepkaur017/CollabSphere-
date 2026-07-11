import * as React from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import type { DropResult } from "@hello-pangea/dnd"
import { motion, AnimatePresence } from "framer-motion"
import type { Project } from "./project.api"
import { ProjectCard } from "./ProjectCard"
import { ProjectDialog } from "./ProjectDialog"
import { useUpdateProject } from "./useProjectQueries"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { Icons } from "@/components/shared/icons"

interface ProjectBoardProps {
  projects: Project[]
  onProjectClick?: (project: Project) => void
}

const COLUMNS = [
  { id: "planning", title: "Planning", icon: "calendar" as const, color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: "active", title: "Active", icon: "activity" as const, color: "text-purple-400", bg: "bg-purple-400/10" },
  { id: "review", title: "Review", icon: "eye" as const, color: "text-amber-400", bg: "bg-amber-400/10" },
  { id: "completed", title: "Completed", icon: "check" as const, color: "text-emerald-400", bg: "bg-emerald-400/10" },
]

export function ProjectBoard({ projects: initialProjects, onProjectClick }: ProjectBoardProps) {
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null)
  const [localProjects, setLocalProjects] = React.useState<Project[]>(initialProjects)
  const { activeWorkspace } = useWorkspaceStore()
  const { mutate: updateProject } = useUpdateProject(activeWorkspace?._id || "")

  React.useEffect(() => {
    setLocalProjects(initialProjects)
  }, [initialProjects])

  if (!localProjects || localProjects.length === 0) return null

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId as Project["status"]
    
    // Optimistic UI update
    const updatedProjects = [...localProjects]
    const projectIndex = updatedProjects.findIndex(p => p._id === draggableId)
    if (projectIndex === -1) return
    
    updatedProjects[projectIndex] = { ...updatedProjects[projectIndex], status: newStatus }
    setLocalProjects(updatedProjects)

    // Backend update
    updateProject({ projectId: draggableId, payload: { status: newStatus } })
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-4 pt-2 hide-scrollbar">
          {COLUMNS.map(column => {
            const columnProjects = localProjects.filter(p => p.status === column.id)
            const Icon = Icons[column.icon]

            return (
              <div key={column.id} className="flex flex-col min-w-[320px] max-w-[320px] flex-shrink-0">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-md flex items-center justify-center ${column.bg} ${column.color}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <h3 className="font-semibold text-white/90">{column.title}</h3>
                  </div>
                  <span className="text-xs font-medium text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                    {columnProjects.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-2xl transition-colors p-2 ${
                        snapshot.isDraggingOver ? 'bg-white/5 border border-white/10 border-dashed' : 'bg-transparent'
                      }`}
                    >
                      <div className="flex flex-col gap-4">
                        {columnProjects.map((project, index) => (
                          <Draggable key={project._id} draggableId={project._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                }}
                              >
                                <ProjectCard 
                                  project={project} 
                                  onClick={() => {
                                    setSelectedProject(project)
                                    onProjectClick?.(project)
                                  }} 
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      <AnimatePresence>
        {selectedProject && (
          <ProjectDialog 
            key="project-dialog"
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>
    </>
  )
}
