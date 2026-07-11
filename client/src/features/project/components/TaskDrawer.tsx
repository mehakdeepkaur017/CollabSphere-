import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import type { ProjectTask } from "../project.api";
import { formatDistanceToNow } from "date-fns";
import { useProjectTasks, useUpdateProjectTask, useProject, useTaskComments, useAddTaskComment, useDeleteTaskComment } from "../useProjectQueries";
import { Button } from "@/components/ui/Button";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface TaskDrawerProps {
  task: ProjectTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDrawer({ task, isOpen, onClose }: TaskDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "comments" | "time" | "dependencies" | "activity">("overview");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  
  // Use task.projectId safely
  const projectId = task?.projectId?.toString();
  const updateTask = useUpdateProjectTask(projectId || "");
  const { data: allTasks = [] } = useProjectTasks(projectId);
  const { activeWorkspace } = useWorkspaceStore();
  const { data: project } = useProject(activeWorkspace?._id, projectId);

  const { data: comments = [] } = useTaskComments(task?._id);
  const addComment = useAddTaskComment(task?._id || "");
  const deleteComment = useDeleteTaskComment(task?._id || "");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && task) {
      interval = setInterval(() => {
        updateTask.mutate({ 
          taskId: task._id, 
          payload: { timeSpent: (task.timeSpent || 0) + 0.01 } 
        });
      }, 60000); // update every minute (simulated logic)
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, task, updateTask]);

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[40rem] bg-[#0c0c0e] border-l border-white/5 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-white/5 shrink-0 bg-[#0c0c0e] z-10 sticky top-0">
              <div className="flex-1 pr-6">
                <div className="flex items-center gap-3 mb-3">
                  <select
                    value={task.status}
                    onChange={(e) => updateTask.mutate({ taskId: task._id, payload: { status: e.target.value } })}
                    className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 cursor-pointer focus:outline-none appearance-none hover:bg-indigo-500/20 transition-colors`}
                  >
                    <option value="todo" className="bg-[#0c0c0e]">To Do</option>
                    <option value="in-progress" className="bg-[#0c0c0e]">In Progress</option>
                    <option value="review" className="bg-[#0c0c0e]">Review</option>
                    <option value="blocked" className="bg-[#0c0c0e]">Blocked</option>
                    <option value="completed" className="bg-[#0c0c0e]">Completed</option>
                  </select>
                  <span className="text-xs text-white/30 flex items-center gap-1 font-mono">
                    <Icons.hash className="w-3 h-3" />
                    {task._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">{task.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  <Icons.x className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Properties */}
            <div className="flex flex-wrap gap-x-12 gap-y-8 p-6 border-b border-white/5 shrink-0 bg-white/[0.01] overflow-visible">
              
              <div className="space-y-2 w-48">
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Assignee</span>
                <select
                  value={(typeof task.assignee === 'string' ? task.assignee : task.assignee?._id) || ""}
                  onChange={(e) => updateTask.mutate({ taskId: task._id, payload: { assignee: e.target.value || null } })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0c0c0e]">Unassigned</option>
                  {project?.members?.map((m: any) => (
                    <option key={m._id} value={m._id} className="bg-[#0c0c0e]">
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 w-48">
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Progress</span>
                <div className="flex items-center gap-3 h-9">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={task.progress || 0}
                    onChange={(e) => updateTask.mutate({ taskId: task._id, payload: { progress: parseInt(e.target.value) } })}
                    className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-sm font-bold text-white/90 w-10 text-right">{task.progress || 0}%</span>
                </div>
              </div>

              <div className="space-y-2 w-40">
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Due Date</span>
                <div className="flex items-center gap-2 text-sm font-medium text-white/70 h-9 bg-white/5 px-3 rounded-lg border border-white/10">
                  <Icons.calendar className="w-4 h-4 text-white/40" />
                  <input 
                    type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => updateTask.mutate({ taskId: task._id, payload: { dueDate: e.target.value || null } })}
                    className="bg-transparent border-none text-white/90 focus:outline-none cursor-pointer w-full text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 w-32">
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Priority</span>
                <div className="flex items-center gap-2 text-sm font-medium text-white/90 capitalize h-9 px-3 bg-white/5 rounded-lg border border-white/10 relative">
                  {task.priority === "urgent" && <Icons.alertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  {task.priority === "high" && <Icons.arrowUpCircle className="w-4 h-4 text-orange-400 shrink-0" />}
                  {task.priority === "medium" && <Icons.minus className="w-4 h-4 text-blue-400 shrink-0" />}
                  {task.priority === "low" && <Icons.arrowDownCircle className="w-4 h-4 text-white/30 shrink-0" />}
                  <select
                    value={task.priority}
                    onChange={(e) => updateTask.mutate({ taskId: task._id, payload: { priority: e.target.value } })}
                    className="bg-transparent border-none text-white/90 focus:outline-none cursor-pointer capitalize w-full appearance-none absolute inset-0 opacity-0"
                  >
                    <option value="low" className="bg-[#12121a]">Low</option>
                    <option value="medium" className="bg-[#12121a]">Medium</option>
                    <option value="high" className="bg-[#12121a]">High</option>
                    <option value="urgent" className="bg-[#12121a]">Urgent</option>
                  </select>
                  <span className="pointer-events-none">{task.priority}</span>
                </div>
              </div>

              <div className="space-y-2 min-w-40">
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Reporter</span>
                <div className="flex items-center gap-3 text-sm font-medium text-white/90 h-9">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                    {task.reporter?.name?.charAt(0) || "U"}
                  </div>
                  <span className="truncate">{task.reporter?.name || "Unknown"}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 px-6 shrink-0 bg-white/[0.01]">
              {["overview", "comments", "activity"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 capitalize transition-colors relative ${
                    activeTab === tab ? "border-indigo-500 text-indigo-400" : "border-transparent text-white/40 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
              
              {activeTab === "overview" && (
                <div className="space-y-10">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white/90">Description</h3>
                    <textarea 
                      className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-white/70 leading-relaxed min-h-[100px] group hover:border-white/20 focus:border-indigo-500 focus:bg-white/5 transition-colors cursor-text resize-none focus:outline-none"
                      placeholder="No description provided. Click to add one."
                      defaultValue={task.description || ""}
                      onBlur={(e) => {
                        if (e.target.value !== task.description) {
                          updateTask.mutate({ taskId: task._id, payload: { description: e.target.value } });
                        }
                      }}
                    />
                  </div>

                  {/* Subtasks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white/90">Subtasks</h3>
                      <button 
                        onClick={() => setIsAddingSubtask(true)}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Add Subtask
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {task.subtasks?.map((st: any, i) => (
                        <div 
                          key={i} 
                          onClick={() => {
                            const updatedSubtasks = [...(task.subtasks || [])];
                            updatedSubtasks[i] = { ...st, isCompleted: !st.isCompleted };
                            updateTask.mutate({ taskId: task._id, payload: { subtasks: updatedSubtasks } });
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 group cursor-pointer transition-colors"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${st.isCompleted ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 group-hover:border-white/40'}`}>
                            {st.isCompleted && <Icons.check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm flex-1 transition-all ${st.isCompleted ? 'text-white/30 line-through' : 'text-white/70'}`}>{st.title}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedSubtasks = task.subtasks.filter((_, idx) => idx !== i);
                              updateTask.mutate({ taskId: task._id, payload: { subtasks: updatedSubtasks } });
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-rose-400 transition-all"
                          >
                            <Icons.x className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      
                      {isAddingSubtask && (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (newSubtaskTitle.trim()) {
                              const updatedSubtasks = [...(task.subtasks || []), { title: newSubtaskTitle, isCompleted: false, order: (task.subtasks?.length || 0) }];
                              updateTask.mutate({ taskId: task._id, payload: { subtasks: updatedSubtasks } });
                              setNewSubtaskTitle("");
                              setIsAddingSubtask(false);
                            }
                          }}
                          className="flex items-center gap-2 mt-2"
                        >
                          <input
                            autoFocus
                            type="text"
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            onBlur={() => {
                              if (!newSubtaskTitle.trim()) setIsAddingSubtask(false);
                            }}
                            placeholder="What needs to be done?"
                            className="flex-1 bg-white/5 border border-indigo-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none placeholder:text-white/30"
                          />
                        </form>
                      )}
                      
                      {(!task.subtasks || task.subtasks.length === 0) && !isAddingSubtask && (
                        <div 
                          onClick={() => setIsAddingSubtask(true)}
                          className="p-6 rounded-xl border border-dashed border-white/10 text-center text-sm text-white/30 cursor-pointer hover:border-white/30 hover:text-white/50 transition-colors"
                        >
                          Break down this task into smaller chunks.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-6 flex flex-col h-full">
                  <div className="flex-1 space-y-4 overflow-y-auto">
                    {comments.length === 0 ? (
                      <div className="text-center text-sm text-white/30 py-8">No comments yet.</div>
                    ) : (
                      comments.map((comment: any) => (
                        <div key={comment._id} className="flex gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                          <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                            {comment.userId?.name?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-white/90">{comment.userId?.name}</span>
                              <span className="text-xs text-white/30">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-white/70 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                          {comment.userId?._id === activeWorkspace?.members?.find((m: any) => m.role)?.user && (
                            <button 
                              onClick={() => deleteComment.mutate(comment._id)}
                              className="text-white/20 hover:text-rose-400 transition-colors self-start"
                            >
                              <Icons.x className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newComment.trim()) {
                        addComment.mutate(newComment);
                        setNewComment("");
                      }
                    }}
                    className="flex gap-2 sticky bottom-0 bg-[#0c0c0e] pt-4 border-t border-white/5"
                  >
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <Button type="submit" disabled={!newComment.trim() || addComment.isPending} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6">
                      Send
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === "time" && (
                <div className="space-y-8">
                  {/* Timer Control */}
                  <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col items-center justify-center space-y-4">
                    <div className="text-5xl font-mono font-light text-white tracking-widest">
                      {Math.floor(task.timeSpent || 0)}h {Math.floor(((task.timeSpent || 0) % 1) * 60)}m
                    </div>
                    <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase">Time Tracked</p>
                    
                    <button 
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg ${
                        isTimerRunning 
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/50 hover:bg-rose-500/20" 
                          : "bg-indigo-500 text-white hover:bg-indigo-400 shadow-indigo-500/25 hover:shadow-indigo-500/40"
                      }`}
                    >
                      {isTimerRunning ? (
                        <>
                          <Icons.x className="w-4 h-4 fill-current" /> Stop Timer
                        </>
                      ) : (
                        <>
                          <Icons.video className="w-4 h-4 fill-current" /> Start Timer
                        </>
                      )}
                    </button>
                  </div>

                  {/* Manual Entry */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Estimated Hours</label>
                      <input 
                        type="number" 
                        defaultValue={task.estimatedTime}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Actual Hours</label>
                      <input 
                        type="number" 
                        defaultValue={task.timeSpent}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                        placeholder="e.g. 3.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "dependencies" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/90">Blocked By</h3>
                    <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300">Add Dependency</button>
                  </div>
                  
                  {task.dependencies && task.dependencies.length > 0 ? (
                    <div className="space-y-3">
                      {task.dependencies.map((depId: any) => {
                        const blockedTask = allTasks.find(t => t._id === depId);
                        if (!blockedTask) return null;
                        return (
                          <div key={depId} className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                            <Icons.lock className="w-4 h-4 text-rose-400" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-white">{blockedTask.title}</h4>
                              <p className="text-xs text-rose-400/70 capitalize">{blockedTask.status}</p>
                            </div>
                            <button className="p-1.5 text-white/30 hover:text-white/70 rounded hover:bg-white/10 transition-colors">
                              <Icons.x className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-white/10 text-center space-y-2">
                      <Icons.link className="w-6 h-6 text-white/20 mx-auto" />
                      <p className="text-sm text-white/50">This task has no dependencies.</p>
                      <p className="text-xs text-white/30">Link tasks that must be completed first.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-6">
                  <div className="relative pl-6 border-l border-white/10 space-y-6 before:absolute before:inset-0 before:-left-[1px]">
                    <div className="relative">
                      <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[29px] top-1.5 ring-4 ring-[#0c0c0e]" />
                      <p className="text-sm font-medium text-white">Task created</p>
                      <p className="text-xs text-white/40">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
