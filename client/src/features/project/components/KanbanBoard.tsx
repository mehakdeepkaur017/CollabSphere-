import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useProjectTasks, useReorderTasks, useUpdateProjectTask, useAddProjectTask } from "../useProjectQueries";
import { Icons } from "@/components/shared/icons";
import type { ProjectTask } from "../project.api";
import { motion, AnimatePresence } from "framer-motion";
import { TaskDrawer } from "./TaskDrawer";
import { CreateTaskModal } from "./CreateTaskModal";

const COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "in-progress", title: "In Progress", color: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { id: "completed", title: "Completed", color: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { data: tasks = [], isLoading } = useProjectTasks(projectId);
  const reorderTasks = useReorderTasks(projectId);
  const addTask = useAddProjectTask(projectId);
  
  const [localTasks, setLocalTasks] = useState<ProjectTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = localTasks.find(t => t._id === selectedTaskId) || null;
  const [createModalStatus, setCreateModalStatus] = useState<string | null>(null);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    const newTasks = Array.from(localTasks);
    const draggedTaskIndex = newTasks.findIndex(t => t._id === draggableId);
    if (draggedTaskIndex === -1) return;

    const draggedTask = newTasks[draggedTaskIndex];

    // Remove from old array
    newTasks.splice(draggedTaskIndex, 1);

    // Filter tasks for the destination column to find insertion point
    const destTasks = newTasks.filter(t => t.status === destCol).sort((a, b) => a.order - b.order);
    
    // Determine new order
    draggedTask.status = destCol as any;
    
    // Insert into destination at correct index
    destTasks.splice(destination.index, 0, draggedTask);

    // Recompute order for all tasks in destination column
    destTasks.forEach((t, i) => {
      t.order = i;
    });

    // Merge back
    const finalTasks = newTasks.filter(t => t.status !== destCol).concat(destTasks);
    
    setLocalTasks(finalTasks);

    // Sync to backend
    const tasksToUpdate = destTasks.map(t => ({ _id: t._id, status: t.status, order: t.order }));
    reorderTasks.mutate(tasksToUpdate);
  };



  if (isLoading) {
    return <div className="p-8 text-white/40">Loading board...</div>;
  }

  return (
    <div className="flex-1 h-full overflow-x-auto overflow-y-hidden custom-scrollbar p-6">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full gap-6 items-start pb-4">
          {COLUMNS.map(col => {
            const columnTasks = localTasks.filter(t => t.status === col.id).sort((a, b) => a.order - b.order);

            return (
              <div key={col.id} className="flex flex-col w-80 shrink-0 h-full max-h-full">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${col.color} border ${col.border}`} />
                    <h3 className="font-semibold text-white/90">{col.title}</h3>
                    <span className="text-xs font-medium text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => setCreateModalStatus(col.id)}
                    className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors"
                  >
                    <Icons.plus className="w-4 h-4" />
                  </button>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 overflow-y-auto custom-scrollbar p-2 -mx-2 space-y-3 rounded-xl transition-colors ${
                        snapshot.isDraggingOver ? "bg-white/5" : ""
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => {
                            const originalStyle = provided.draggableProps.style || {};
                            // Enhance drag with rotation and scale
                            const style = {
                              ...originalStyle,
                              transform: snapshot.isDragging 
                                ? `${originalStyle.transform || ''} rotate(3deg) scale(1.02)` 
                                : originalStyle.transform,
                              boxShadow: snapshot.isDragging 
                                ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)" 
                                : "none",
                              zIndex: snapshot.isDragging ? 999 : 1,
                            };

                            const priorityColors = {
                              urgent: "bg-rose-500",
                              high: "bg-orange-500",
                              medium: "bg-blue-500",
                              low: "bg-white/20"
                            };

                            return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTaskId(task._id)}
                              className={`relative overflow-hidden bg-[#12121a] border ${snapshot.isDragging ? 'border-indigo-500/50' : 'border-white/5 hover:border-white/10'} rounded-xl p-4 cursor-pointer group transition-[border-color] duration-200`}
                              style={style}
                            >
                              {/* Priority Stripe */}
                              <div className={`absolute top-0 left-0 w-1 h-full ${priorityColors[task.priority] || priorityColors.medium}`} />

                              {/* Labels */}
                              {task.labels && task.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {task.labels.map((label: any, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/10 text-white/70">
                                      {label.name || "Label"}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <h4 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors leading-snug">
                                {task.title}
                              </h4>
                              
                              {task.description && (
                                <p className="text-xs text-white/40 mt-1.5 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* Footer */}
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-3">
                                  {task.priority === "urgent" && <Icons.alertCircle className="w-3.5 h-3.5 text-rose-400" />}
                                  {task.priority === "high" && <Icons.arrowUpCircle className="w-3.5 h-3.5 text-orange-400" />}
                                  {task.priority === "medium" && <Icons.minus className="w-3.5 h-3.5 text-blue-400" />}
                                  {task.priority === "low" && <Icons.arrowDownCircle className="w-3.5 h-3.5 text-white/30" />}

                                  {task.subtasks && task.subtasks.length > 0 && (
                                    <div className={`flex items-center gap-1 text-[11px] font-medium ${
                                      task.subtasks.filter((s: any) => s.isCompleted).length === task.subtasks.length 
                                      ? "text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded" 
                                      : "text-white/40"
                                    }`}>
                                      <Icons.checkSquare className="w-3.5 h-3.5" />
                                      {task.subtasks.filter((s: any) => s.isCompleted).length}/{task.subtasks.length}
                                    </div>
                                  )}
                                  
                                  {task.attachments && task.attachments.length > 0 && (
                                    <div className="flex items-center gap-1 text-[11px] font-medium text-white/40">
                                      <Icons.paperclip className="w-3.5 h-3.5" />
                                      {task.attachments.length}
                                    </div>
                                  )}
                                  
                                  {task.dueDate && (
                                    <div className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                                      new Date(task.dueDate) < new Date() ? "text-rose-400 bg-rose-400/10" : "text-white/40"
                                    }`}>
                                      <Icons.calendar className="w-3 h-3" />
                                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                  )}
                                </div>

                                  <div className="flex -space-x-1.5 ml-2">
                                    {task.assignee && (
                                      <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[#12121a] flex items-center justify-center text-[9px] font-bold text-white z-10 hover:z-20 transition-transform hover:scale-110" title={task.assignee.name}>
                                        {task.assignee.name?.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                              </div>
                            </div>
                          )}}
                        </Draggable>
                      ))}

                      <button
                        onClick={() => setCreateModalStatus(col.id)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-white/30 hover:text-white/70 hover:bg-white/5 rounded-xl transition-colors mt-2"
                      >
                        <Icons.plus className="w-4 h-4" />
                        Add Task
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
      
      <TaskDrawer 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTaskId(null)} 
      />

      <CreateTaskModal
        projectId={projectId}
        isOpen={!!createModalStatus}
        onClose={() => setCreateModalStatus(null)}
        defaultStatus={createModalStatus || "todo"}
      />
    </div>
  );
}
