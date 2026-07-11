import React, { useState } from "react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, startOfWeek, endOfWeek, addWeeks, subWeeks, 
  addDays, subDays 
} from "date-fns";
import { Icons } from "@/components/shared/icons";
import { useProjectTasks, useUpdateProjectTask } from "../useProjectQueries";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export function ProjectCalendar({ projectId }: { projectId: string }) {
  const { data: tasks = [], isLoading } = useProjectTasks(projectId);
  const updateTask = useUpdateProjectTask(projectId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  if (isLoading) {
    return <div className="p-8 text-white/40 text-center flex items-center justify-center h-full">Loading calendar...</div>;
  }

  // Determine the date range based on view
  let startDate, endDate;
  if (view === "month") {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    startDate = startOfWeek(monthStart);
    endDate = endOfWeek(monthEnd);
  } else if (view === "week") {
    startDate = startOfWeek(currentDate);
    endDate = endOfWeek(currentDate);
  } else {
    startDate = currentDate;
    endDate = currentDate;
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextPeriod = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prevPeriod = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    // The droppableId is the date string 'yyyy-MM-dd'
    const newDate = new Date(destination.droppableId);
    updateTask.mutate({ taskId: draggableId, payload: { dueDate: newDate.toISOString() } });
  };

  const renderCells = () => {
    return days.map((day, i) => {
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isToday = isSameDay(day, new Date());
      const dayTasks = tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day));
      const dateKey = format(day, "yyyy-MM-dd");

      return (
        <Droppable key={dateKey} droppableId={dateKey}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[120px] p-2 border-r border-b border-white/5 relative group transition-colors ${
                !isCurrentMonth && view === "month" ? "bg-[#0c0c0e] text-white/20" : "bg-[#0a0a0f] text-white/80 hover:bg-white/[0.02]"
              } ${snapshot.isDraggingOver ? "bg-white/[0.05]" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday ? "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]" : ""
                }`}>
                  {format(day, "d")}
                </span>
                {view === "day" && <span className="text-sm text-white/40">{format(day, "EEEE")}</span>}
              </div>

              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                {dayTasks.map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`text-[11px] px-2 py-1.5 rounded-lg font-medium truncate cursor-grab active:cursor-grabbing transition-colors shadow-sm ${
                          snapshot.isDragging ? "opacity-90 scale-105 z-50 ring-2 ring-indigo-500" : ""
                        } ${
                          task.priority === 'urgent' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20' :
                          task.priority === 'high' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20' :
                          task.priority === 'medium' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20' :
                          'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white w-48">
            {view === "month" && format(currentDate, "MMMM yyyy")}
            {view === "week" && `Week of ${format(startOfWeek(currentDate), "MMM d")}`}
            {view === "day" && format(currentDate, "MMMM d, yyyy")}
          </h2>
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
            <button onClick={prevPeriod} className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors">
              <Icons.chevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 hover:bg-white/10 rounded-md text-sm font-medium text-white/70 hover:text-white transition-colors">
              Today
            </button>
            <button onClick={nextPeriod} className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors">
              <Icons.chevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
          {(["month", "week", "day"] as const).map(v => (
            <button 
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                view === v ? "bg-indigo-500 text-white shadow-lg" : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          {/* Days Header (Only for Month/Week views) */}
          {view !== "day" && (
            <div className={`grid ${view === "week" ? "grid-cols-7" : "grid-cols-7"} border-b border-white/5 bg-[#0c0c0e]`}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-white/40 uppercase tracking-wider border-r border-white/5 last:border-0">
                  {day}
                </div>
              ))}
            </div>
          )}
          
          {/* Days Grid */}
          <div className={`flex-1 grid ${view === "day" ? "grid-cols-1" : "grid-cols-7"} ${view === "month" ? "grid-rows-5" : "grid-rows-1"} border-l border-t border-white/5 -mt-px -ml-px bg-[#0a0a0f]`}>
            {renderCells()}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
