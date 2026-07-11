import React, { useState } from "react";
import { format, addDays, startOfWeek, eachDayOfInterval, differenceInDays, isSameDay } from "date-fns";
import { Icons } from "@/components/shared/icons";
import { useProjectTasks } from "../useProjectQueries";
import type { ProjectTask } from "../project.api";

export function ProjectTimeline({ projectId }: { projectId: string }) {
  const { data: tasks = [], isLoading } = useProjectTasks(projectId);
  const [startDate, setStartDate] = useState(startOfWeek(new Date()));

  if (isLoading) {
    return <div className="p-8 text-white/40 text-center flex items-center justify-center h-full">Loading timeline...</div>;
  }

  const timelineDays = 30; // Show 30 days
  const endDate = addDays(startDate, timelineDays - 1);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextPeriod = () => setStartDate(addDays(startDate, 7));
  const prevPeriod = () => setStartDate(addDays(startDate, -7));

  // Sort tasks by due date or created date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const today = new Date();
  const todayIndex = days.findIndex(d => isSameDay(d, today));
  const todayOffset = todayIndex !== -1 ? todayIndex * 48 + 24 : -1;

  // Pre-calculate task layouts for dependencies
  const taskLayouts = sortedTasks.map((task, index) => {
    const taskStart = new Date(task.createdAt);
    const taskEnd = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
    
    let leftOffset = differenceInDays(taskStart, startDate) * 48; 
    let durationDays = differenceInDays(taskEnd, taskStart) + 1;
    if (durationDays < 1) durationDays = 1;
    
    let width = durationDays * 48;
    return {
      task,
      index,
      leftOffset,
      width,
      rightOffset: leftOffset + width,
      y: index * 48 + 24
    };
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">Timeline</h2>
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
            <button onClick={prevPeriod} className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors">
              <Icons.chevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setStartDate(startOfWeek(new Date()))} className="px-3 py-1.5 hover:bg-white/10 rounded-md text-sm font-medium text-white/70 hover:text-white transition-colors">
              Today
            </button>
            <button onClick={nextPeriod} className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors">
              <Icons.chevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" /> Done
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className="w-3 h-3 rounded-full bg-indigo-500/20 border border-indigo-500/40" /> In Progress
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20" /> To Do
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="flex-1 bg-[#0c0c0e] border border-white/5 rounded-2xl flex flex-col min-h-0 overflow-hidden relative shadow-2xl">
        
        {/* Timeline Header */}
        <div className="flex border-b border-white/5 bg-[#0c0c0e] shrink-0 sticky top-0 z-30">
          <div className="w-72 shrink-0 border-r border-white/5 p-4 font-semibold text-sm text-white/70 bg-[#0c0c0e] z-40 sticky left-0 shadow-[4px_0_10px_rgba(0,0,0,0.2)]">
            Task
          </div>
          <div className="flex-1 flex min-w-max">
            {days.map((day, i) => (
              <div key={i} className={`w-12 shrink-0 border-r border-white/5 flex flex-col items-center justify-center py-2 ${isSameDay(day, today) ? 'bg-indigo-500/10 text-indigo-400' : 'text-white/50'}`}>
                <span className="text-[10px] font-medium uppercase tracking-widest">{format(day, "EEE")}</span>
                <span className={`text-sm font-semibold ${isSameDay(day, today) ? 'text-indigo-400' : ''}`}>{format(day, "d")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-auto custom-scrollbar flex min-w-max relative bg-[#0a0a0f]">
          
          {/* Left fixed column: Task Names */}
          <div className="w-72 shrink-0 border-r border-white/5 bg-[#0c0c0e] z-30 sticky left-0 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
            {sortedTasks.map((task, index) => (
              <div key={task._id} className="h-12 border-b border-white/5 px-4 flex flex-col justify-center bg-[#0c0c0e] hover:bg-white/[0.03] transition-colors cursor-pointer group">
                <span className="text-sm font-medium text-white/90 group-hover:text-white truncate" title={task.title}>{task.title}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{task.status}</span>
              </div>
            ))}
          </div>

          {/* Right scrolling area: Bars */}
          <div className="flex-1 flex flex-col relative bg-[#0a0a0f]">
            {/* Grid lines */}
            <div className="absolute inset-0 flex pointer-events-none z-0">
              {days.map((_, i) => (
                <div key={i} className="w-12 shrink-0 border-r border-white/[0.02] h-full" />
              ))}
            </div>

            {/* Today Marker */}
            {todayOffset !== -1 && (
              <div className="absolute top-0 bottom-0 w-[1px] bg-rose-500/50 z-10 pointer-events-none" style={{ left: todayOffset }}>
                <div className="absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              </div>
            )}

            {/* Dependency Lines (SVG) */}
            <svg className="absolute inset-0 pointer-events-none z-10" style={{ width: timelineDays * 48, height: sortedTasks.length * 48 }}>
              {taskLayouts.map(layout => {
                if (!layout.task.dependencies || layout.task.dependencies.length === 0) return null;
                
                return layout.task.dependencies.map((depId: any) => {
                  const depLayout = taskLayouts.find(l => l.task._id === depId);
                  if (!depLayout) return null;

                  // Line from depLayout right to layout left
                  const x1 = Math.max(0, depLayout.rightOffset);
                  const y1 = depLayout.y;
                  const x2 = Math.max(0, layout.leftOffset);
                  const y2 = layout.y;

                  // Simple path
                  const path = `M ${x1} ${y1} C ${x1 + 20} ${y1}, ${x2 - 20} ${y2}, ${x2} ${y2}`;

                  return (
                    <g key={`${depLayout.task._id}-${layout.task._id}`}>
                      <path d={path} fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
                      <circle cx={x2} cy={y2} r="3" fill="rgba(99,102,241,0.5)" />
                    </g>
                  );
                });
              })}
            </svg>

            {/* Task rows */}
            {taskLayouts.map((layout) => {
              const { task, leftOffset, width, y } = layout;
              
              let isVisible = true;
              if (leftOffset + width < 0 || leftOffset > timelineDays * 48) {
                isVisible = false;
              }

              return (
                <div key={task._id} className="h-12 border-b border-white/[0.02] relative flex items-center group hover:bg-white/[0.01]">
                  {isVisible && (
                    <div 
                      className={`absolute h-8 rounded-lg ml-1 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.01] shadow-lg z-20 overflow-hidden ${
                        task.status === 'completed' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/10' :
                        task.status === 'in-progress' ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shadow-indigo-500/10' :
                        'bg-white/10 border border-white/20 text-white/70 shadow-black/20'
                      }`}
                      style={{ left: Math.max(0, leftOffset), width: Math.min(timelineDays * 48 - Math.max(0, leftOffset), leftOffset < 0 ? width + leftOffset : width) - 8 }}
                      title={`${task.title}`}
                    >
                      {/* Left Resize Handle */}
                      <div className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/20 cursor-col-resize rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <span className="text-[10px] font-semibold truncate mix-blend-plus-lighter w-full text-center pointer-events-none">{task.title}</span>
                      
                      {/* Right Resize Handle */}
                      <div className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/20 cursor-col-resize rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
