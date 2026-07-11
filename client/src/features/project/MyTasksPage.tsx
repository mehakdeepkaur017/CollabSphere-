import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useMyTasks } from "./useProjectQueries";
import { Link } from "react-router";
import { TaskDrawer } from "./components/TaskDrawer";
import type { ProjectTask } from "./project.api";

export function MyTasksPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: tasks = [], isLoading } = useMyTasks(activeWorkspace?._id);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("all");
  
  const selectedTask = tasks.find((t: any) => t._id === selectedTaskId) || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0710] text-white/40">
        <Icons.spinner className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const upcomingTasks = tasks.filter((t: any) => t.status !== "completed" && (!t.dueDate || new Date(t.dueDate) >= new Date()));
  const overdueTasks = tasks.filter((t: any) => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < new Date());
  const completedTasks = tasks.filter((t: any) => t.status === "completed");

  const totalTasks = tasks.length;
  const completionRate = totalTasks ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const EmptyState = ({ type, title, subtitle }: any) => {
    return (
      <div className="p-8 py-16 rounded-2xl bg-[#0f0e17]/80 flex flex-col items-center justify-center text-center">
        <div className="relative w-48 h-40 flex items-center justify-center mb-6">
          
          {type === 'overdue' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-rose-500/20 blur-[40px] rounded-full" />
              
              {/* Leaves */}
              <div className="absolute bottom-6 left-6 w-8 h-8 rounded-tl-full rounded-br-full bg-[#201c36] transform -rotate-12" />
              <div className="absolute bottom-4 left-2 w-6 h-6 rounded-tl-full rounded-br-full bg-[#1b172e] transform -rotate-45" />
              <div className="absolute bottom-6 right-6 w-8 h-8 rounded-tr-full rounded-bl-full bg-[#201c36] transform rotate-12" />
              <div className="absolute bottom-4 right-2 w-6 h-6 rounded-tr-full rounded-bl-full bg-[#1b172e] transform rotate-45" />

              {/* Calendar Body */}
              <div className="relative w-28 h-24 bg-gradient-to-b from-[#31253e] to-[#1e172a] rounded-xl shadow-2xl flex items-center justify-center border border-white/5">
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-[#251b30] rounded-t-xl border-b border-white/5" />
                
                {/* Binder Rings */}
                <div className="absolute -top-2 left-6 w-2 h-5 bg-[#140e1b] rounded-full border border-white/10" />
                <div className="absolute -top-2 right-6 w-2 h-5 bg-[#140e1b] rounded-full border border-white/10" />

                {/* Glowing Icon */}
                <div className="relative z-10 w-12 h-12 rounded-full border-2 border-rose-500 flex items-center justify-center bg-[#251520] shadow-[0_0_30px_rgba(244,63,94,0.6)]">
                  <div className="absolute top-1/2 left-[-12px] right-[-12px] h-0.5 bg-rose-500 z-0" />
                  <div className="w-9 h-9 rounded-full bg-[#251520] z-10 flex items-center justify-center">
                    <span className="text-rose-500 font-bold text-xl">!</span>
                  </div>
                </div>
              </div>

              {/* Sparkles */}
              <Icons.sparkles className="absolute top-6 left-6 w-3 h-3 text-purple-400" />
              <Icons.star className="absolute bottom-10 right-4 w-2 h-2 text-purple-400" />
            </div>
          )}

          {type === 'upcoming' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-blue-500/20 blur-[40px] rounded-full" />
              
              {/* Leaves */}
              <div className="absolute bottom-6 left-6 w-8 h-8 rounded-tl-full rounded-br-full bg-[#18203b] transform -rotate-12" />
              <div className="absolute bottom-4 left-2 w-6 h-6 rounded-tl-full rounded-br-full bg-[#12162e] transform -rotate-45" />
              <div className="absolute bottom-6 right-8 w-8 h-8 rounded-tr-full rounded-bl-full bg-[#18203b] transform rotate-12" />
              <div className="absolute bottom-4 right-4 w-6 h-6 rounded-tr-full rounded-bl-full bg-[#12162e] transform rotate-45" />

              {/* Calendar Body */}
              <div className="relative w-32 h-24 bg-gradient-to-b from-[#21386e] to-[#121b38] rounded-xl shadow-2xl border border-blue-400/20 z-10">
                {/* Back leg effect */}
                <div className="absolute right-[-10px] top-2 bottom-0 w-8 bg-[#0f152b] rounded-r-xl transform skew-y-[15deg] -z-10" />
                
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-[#1b2b52] rounded-t-xl border-b border-blue-400/20" />
                
                {/* Binder Rings */}
                <div className="absolute -top-2 left-6 w-2 h-5 bg-[#0a1024] rounded-full border border-blue-400/30" />
                <div className="absolute -top-2 right-10 w-2 h-5 bg-[#0a1024] rounded-full border border-blue-400/30" />

                {/* Grid lines */}
                <div className="absolute top-10 left-4 right-10 flex flex-col gap-2.5 opacity-20">
                  <div className="w-full h-1 bg-white rounded-full" />
                  <div className="w-3/4 h-1 bg-white rounded-full" />
                  <div className="w-1/2 h-1 bg-white rounded-full" />
                </div>

                {/* Glowing Clock */}
                <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-full bg-[#3b82f6] shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center border-[3px] border-[#0a0a0f] z-20">
                  <div className="relative w-5 h-5 flex">
                    <div className="absolute bottom-1/2 left-1/2 w-0.5 h-3 bg-white rounded-full -translate-x-1/2 origin-bottom transform rotate-0" />
                    <div className="absolute top-1/2 left-1/2 w-2.5 h-0.5 bg-white rounded-full -translate-y-1/2 origin-left transform rotate-45" />
                  </div>
                </div>
              </div>

              <Icons.star className="absolute top-8 left-6 w-2 h-2 text-blue-400" />
              <Icons.sparkles className="absolute top-10 right-4 w-3 h-3 text-blue-400" />
            </div>
          )}

          {type === 'completed' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-emerald-500/20 blur-[40px] rounded-full" />
              
              {/* Leaves */}
              <div className="absolute bottom-4 left-10 w-8 h-8 rounded-tl-full rounded-br-full bg-[#122b22] transform -rotate-12" />
              <div className="absolute bottom-2 left-6 w-6 h-6 rounded-tl-full rounded-br-full bg-[#0a1f17] transform -rotate-45" />
              <div className="absolute bottom-4 right-10 w-8 h-8 rounded-tr-full rounded-bl-full bg-[#122b22] transform rotate-12" />
              <div className="absolute bottom-2 right-6 w-6 h-6 rounded-tr-full rounded-bl-full bg-[#0a1f17] transform rotate-45" />

              {/* Clipboard Body */}
              <div className="relative w-24 h-32 bg-gradient-to-b from-[#22c55e] to-[#047857] rounded-xl shadow-[0_0_40px_rgba(34,197,94,0.3)] flex items-center justify-center border border-emerald-400/30 z-10">
                {/* Top Clip */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-[#064e3b] rounded-md border border-emerald-500/30 flex justify-center">
                  <div className="w-6 h-1.5 bg-emerald-700 rounded-full mt-1.5" />
                </div>

                {/* Checkmark */}
                <Icons.check className="w-12 h-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" strokeWidth={3} />
              </div>

              <Icons.sparkles className="absolute top-10 left-6 w-3 h-3 text-emerald-400" />
              <Icons.star className="absolute bottom-12 right-6 w-2 h-2 text-emerald-400" />
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-white/40 text-sm">{subtitle}</p>
      </div>
    );
  };

  const TaskList = ({ title, items, icon: Icon, colorClass, emptyStateProps }: any) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 bg-[#0f0e17]/80 p-4 rounded-xl border border-white/5">
        <h3 className="text-base font-semibold text-white flex items-center gap-3">
          <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 ${colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          {title}
        </h3>
        <span className="text-[11px] font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          {items.length} {items.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      
      <div className="flex-1 space-y-3">
        <AnimatePresence>
          {items.length === 0 ? (
            <EmptyState {...emptyStateProps} />
          ) : (
            items.map((task: any, index: number) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => setSelectedTaskId(task._id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-[#0f0e17]/80 border border-white/5 hover:border-white/20 cursor-pointer transition-all shadow-sm hover:shadow-xl hover:shadow-black/20 group relative overflow-hidden"
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
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-y-auto custom-scrollbar relative">
      <div className="w-full p-8 md:p-12 pb-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 relative">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-4 mb-2">
              <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-white/10">
                <Icons.checkSquare className="w-6 h-6" />
              </div>
              My Tasks
            </h1>
            <p className="text-white/50 text-base mt-2 ml-1">Here's your personal task breakdown across all projects.</p>
          </div>

          <div className="flex items-center gap-6 mt-6 md:mt-0 relative">
            
            {/* The decorative illustration behind the header */}
            <div className="hidden lg:flex absolute right-48 items-center justify-center pointer-events-none opacity-60">
              <div className="relative w-24 h-28 bg-[#1e1c2e] rounded-xl shadow-2xl border border-white/5 flex flex-col p-4 transform -rotate-12">
                <div className="w-6 h-2 bg-indigo-500 rounded-full absolute -top-1 left-1/2 -translate-x-1/2" />
                <div className="w-12 h-1.5 bg-white/20 rounded-full mb-3" />
                <div className="flex items-center gap-2 mb-2"><Icons.check className="w-3 h-3 text-indigo-400" /><div className="w-10 h-1 bg-white/10 rounded-full" /></div>
                <div className="flex items-center gap-2 mb-2"><Icons.check className="w-3 h-3 text-indigo-400" /><div className="w-10 h-1 bg-white/10 rounded-full" /></div>
                <div className="flex items-center gap-2 mb-2"><Icons.check className="w-3 h-3 text-indigo-400" /><div className="w-10 h-1 bg-white/10 rounded-full" /></div>
                <div className="absolute -bottom-2 -right-4 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] border-2 border-[#0a0710]">
                  <Icons.clock className="w-5 h-5 text-white" />
                </div>
                <Icons.star className="w-3 h-3 text-indigo-400 absolute -top-4 -left-6 animate-pulse" />
                <Icons.sparkles className="w-4 h-4 text-purple-400 absolute top-4 -right-8 animate-pulse delay-75" />
              </div>
            </div>

            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border border-white/10 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(99,102,241,0.4)] px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 relative z-10">
              <Icons.plus className="w-4 h-4" />
              New Task
            </button>
            <Icons.sparkles className="w-4 h-4 text-purple-400 absolute -top-3 -right-4 animate-pulse" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Icons.target className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-white/50 mb-1">Completion</p>
                <h3 className="text-2xl font-bold text-white">{completionRate}%</h3>
              </div>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-6">
              <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Icons.checkCircle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-white/50 mb-1">Completed</p>
                <h3 className="text-2xl font-bold text-emerald-400">{completedTasks.length}</h3>
              </div>
            </div>
            <p className="text-[11px] text-white/30 text-right mt-2">Tasks done</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Icons.clock className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-white/50 mb-1">Upcoming</p>
                <h3 className="text-2xl font-bold text-blue-400">{upcomingTasks.length}</h3>
              </div>
            </div>
            <p className="text-[11px] text-white/30 text-right mt-2">Tasks scheduled</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                <Icons.alertCircle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-white/50 mb-1">Overdue</p>
                <h3 className="text-2xl font-bold text-rose-400">{overdueTasks.length}</h3>
              </div>
            </div>
            <p className="text-[11px] text-white/30 text-right mt-2">Tasks pending</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[#0f0e17]/80 p-2 px-4 rounded-xl border border-white/5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "All Tasks" },
              { id: "upcoming", label: "Upcoming" },
              { id: "completed", label: "Completed" },
              { id: "overdue", label: "Overdue" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-all relative rounded-lg ${
                  currentTab === tab.id 
                    ? "text-white bg-white/5" 
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.02]"
                }`}
              >
                {tab.label}
                {currentTab === tab.id && (
                  <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-transparent text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              <Icons.filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-transparent text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              Sort: Due Date <Icons.chevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Lists Layout based on selected tab */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {(currentTab === "all" || currentTab === "overdue") && (
            <div className={currentTab === "overdue" ? "xl:col-span-2" : ""}>
              <TaskList 
                title="Overdue Tasks" 
                items={overdueTasks} 
                icon={Icons.alertCircle} 
                colorClass="text-rose-400" 
                emptyStateProps={{
                  type: 'overdue',
                  title: "You're all caught up!",
                  subtitle: "Great job! You have no overdue tasks.",
                }}
              />
            </div>
          )}
          
          {(currentTab === "all" || currentTab === "upcoming") && (
            <div className={currentTab === "upcoming" ? "xl:col-span-2" : ""}>
              <TaskList 
                title="Upcoming & Ongoing" 
                items={upcomingTasks} 
                icon={Icons.clock} 
                colorClass="text-blue-400" 
                emptyStateProps={{
                  type: 'upcoming',
                  title: "You don't have any upcoming tasks right now.",
                  subtitle: "Great things ahead! Your tasks will show up here.",
                }}
              />
            </div>
          )}

          {(currentTab === "all" || currentTab === "completed") && (
            <div className={currentTab === "completed" ? "xl:col-span-2" : ""}>
              <TaskList 
                title="Recently Completed" 
                items={completedTasks.slice(0, 10)} 
                icon={Icons.checkCircle} 
                colorClass="text-emerald-400" 
                emptyStateProps={{
                  type: 'completed',
                  title: "No completed tasks yet",
                  subtitle: "Completed tasks will appear here.",
                }}
              />
            </div>
          )}
        </div>
      </div>

      <TaskDrawer 
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
