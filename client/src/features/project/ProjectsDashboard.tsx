import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useMyTasks } from "./useProjectQueries";
import { Link } from "react-router";
import { TaskDrawer } from "./components/TaskDrawer";
import type { ProjectTask } from "./project.api";
import { formatDistanceToNow } from "date-fns";

export function MyTasksPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: tasks = [], isLoading } = useMyTasks(activeWorkspace?._id);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a0f] text-white/40">
        <Icons.spinner className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const upcomingTasks = tasks.filter((t: any) => t.status !== "completed" && (!t.dueDate || new Date(t.dueDate) >= new Date()));
  const overdueTasks = tasks.filter((t: any) => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < new Date());
  const completedTasks = tasks.filter((t: any) => t.status === "completed");

  const totalTasks = tasks.length;
  const completionRate = totalTasks ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const TaskList = ({ title, items, icon: Icon, colorClass, emptyMessage }: any) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          {title}
        </h3>
        <span className="text-xs font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          {items.length} {items.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center group transition-colors hover:bg-white/[0.04]"
            >
              <div className={`p-4 rounded-full bg-white/5 mb-4 group-hover:scale-110 transition-transform ${colorClass}`}>
                <Icon className="w-6 h-6 opacity-50" />
              </div>
              <p className="text-sm font-medium text-white/60">{emptyMessage}</p>
            </motion.div>
          ) : (
            items.map((task: any, index: number) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => setSelectedTask(task)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 cursor-pointer transition-all shadow-sm hover:shadow-xl hover:shadow-black/20 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-4 flex-1 relative z-10">
                  <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${
                    task.priority === "urgent" ? "bg-rose-500 shadow-rose-500/50" :
                    task.priority === "high" ? "bg-orange-500 shadow-orange-500/50" :
                    task.priority === "medium" ? "bg-blue-500 shadow-blue-500/50" : "bg-white/20"
                  }`} />
                  <div>
                    <h4 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors flex items-center gap-2">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/40 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
                        <Icons.folder className="w-3 h-3" />
                        {task.projectId?.name || "Unknown Project"}
                      </span>
                      {task.dueDate && (
                        <span className={`text-[11px] font-medium flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
                          new Date(task.dueDate) < new Date() && task.status !== "completed" 
                            ? "text-rose-400 bg-rose-500/10" 
                            : "text-white/40 bg-white/5"
                        }`}>
                          <Icons.calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-4 sm:mt-0 relative z-10 pl-6 sm:pl-0">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                    task.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    task.status === "in-progress" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    task.status === "review" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    task.status === "blocked" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    "bg-white/5 text-white/60 border-white/10"
                  }`}>
                    {task.status.replace("-", " ")}
                  </span>
                  <Link
                    to={`/app/projects/${task.projectId?._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2.5 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm"
                    title="Go to Project"
                  >
                    <Icons.arrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[50%] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="shrink-0 p-8 lg:px-12 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0a0f]/60 backdrop-blur-xl z-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Icons.checkSquare className="w-6 h-6" />
            </div>
            My Tasks
          </h1>
          <p className="text-sm text-white/50 mt-2 ml-1">Here's your personal task breakdown across all projects.</p>
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:px-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12 pb-24">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Icons.target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/50">Completion</p>
                  <h3 className="text-2xl font-bold text-white">{completionRate}%</h3>
                </div>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-indigo-500" />
              </div>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Icons.checkCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/50">Completed</p>
                  <h3 className="text-2xl font-bold text-white">{completedTasks.length}</h3>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Icons.clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/50">Upcoming</p>
                  <h3 className="text-2xl font-bold text-white">{upcomingTasks.length}</h3>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Icons.alertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/50">Overdue</p>
                  <h3 className="text-2xl font-bold text-white">{overdueTasks.length}</h3>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Task Lists Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-12">
              <TaskList 
                title="Overdue Tasks" 
                items={overdueTasks} 
                icon={Icons.alertCircle} 
                colorClass="text-rose-400" 
                emptyMessage="Great job! You have no overdue tasks."
              />
              <TaskList 
                title="Upcoming & Ongoing" 
                items={upcomingTasks} 
                icon={Icons.clock} 
                colorClass="text-blue-400" 
                emptyMessage="You don't have any upcoming tasks right now."
              />
            </div>
            
            <div className="xl:col-span-1">
              <div className="sticky top-8">
                <TaskList 
                  title="Recently Completed" 
                  items={completedTasks.slice(0, 10)} 
                  icon={Icons.checkCircle} 
                  colorClass="text-emerald-400" 
                  emptyMessage="Completed tasks will appear here."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskDrawer 
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
