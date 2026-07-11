import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { useAddProjectTask } from "../useProjectQueries";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useProject } from "../useProjectQueries";
import { Button } from "@/components/ui/Button";

interface CreateTaskModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: string;
}

export function CreateTaskModal({ projectId, isOpen, onClose, defaultStatus = "todo" }: CreateTaskModalProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: project } = useProject(activeWorkspace?._id, projectId);
  const addTask = useAddProjectTask(projectId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState<string>("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask.mutate({
      title,
      description,
      status,
      priority,
      assignee: assignee || undefined,
      dueDate: dueDate || undefined,
    });
    
    setTitle("");
    setDescription("");
    setAssignee("");
    setDueDate("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#12121a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-10"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Icons.plus className="w-5 h-5 text-indigo-400" />
              Create Task
            </h2>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <Icons.x className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <input
                autoFocus
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <textarea
                placeholder="Add a more detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                  <option value="todo" className="bg-[#12121a]">To Do</option>
                  <option value="in-progress" className="bg-[#12121a]">In Progress</option>
                  <option value="review" className="bg-[#12121a]">Review</option>
                  <option value="blocked" className="bg-[#12121a]">Blocked</option>
                  <option value="completed" className="bg-[#12121a]">Completed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none capitalize"
                >
                  <option value="low" className="bg-[#12121a]">Low</option>
                  <option value="medium" className="bg-[#12121a]">Medium</option>
                  <option value="high" className="bg-[#12121a]">High</option>
                  <option value="urgent" className="bg-[#12121a]">Urgent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Assignee</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                  <option value="" className="bg-[#12121a]">Unassigned</option>
                  {project?.members?.map((m: any) => (
                    <option key={m._id} value={m._id} className="bg-[#12121a]">
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!title.trim()} className="bg-indigo-500 hover:bg-indigo-600 text-white">
                Create Task
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
