import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { useProjectTasks, useAddProjectTask, useUpdateProjectTask, useDeleteProjectTask } from "../useProjectQueries";

interface ProjectChecklistProps {
  projectId: string;
  workspaceId: string;
}

export function ProjectChecklist({ projectId, workspaceId }: ProjectChecklistProps) {
  const { data: tasks, isLoading } = useProjectTasks(projectId);
  const { mutate: addTask, isPending: isAdding } = useAddProjectTask(projectId);
  const { mutate: updateTask } = useUpdateProjectTask(projectId);
  const { mutate: deleteTask } = useDeleteProjectTask(projectId);
  
  const [newTask, setNewTask] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask({ title: newTask });
    setNewTask("");
  };

  const completedCount = tasks?.filter((t: any) => t.status === "done").length || 0;
  const totalCount = tasks?.length || 0;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Progress</h3>
          <span className="text-sm font-medium text-white">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-emerald-500 rounded-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 mb-4 custom-scrollbar">
        {isLoading ? (
          <div className="text-center text-white/30 text-sm py-4">Loading tasks...</div>
        ) : tasks?.length === 0 ? (
          <div className="text-center text-white/30 text-sm py-8 border border-dashed border-white/10 rounded-xl bg-white/5">
            No tasks added yet. Create a task to break down your work.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tasks?.map((task: any) => {
              const isCompleted = task.status === "done";
              return (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors"
              >
                <button
                  onClick={() => updateTask({ taskId: task._id, payload: { status: isCompleted ? "todo" : "done" } })}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "border-white/20 hover:border-white/50 text-transparent"
                  }`}
                >
                  <Icons.check className="w-3 h-3" />
                </button>
                <span className={`flex-1 text-sm transition-all ${isCompleted ? "text-white/30 line-through" : "text-white/80"}`}>
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-md transition-all"
                >
                  <Icons.trash className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )})}
          </AnimatePresence>
        )}
      </div>

      <form onSubmit={handleAdd} className="mt-auto relative">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
        />
        <Button 
          type="submit" 
          disabled={!newTask.trim() || isAdding}
          size="icon" 
          className="absolute right-1.5 top-1.5 bottom-1.5 w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          <Icons.plus className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
