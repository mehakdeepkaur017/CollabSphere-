import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { useNavigate } from "react-router";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center px-4 border-b border-white/5">
            <Icons.search className="w-5 h-5 text-white/40" />
            <input
              autoFocus
              className="flex-1 bg-transparent border-none text-white px-4 py-5 focus:outline-none placeholder:text-white/30 text-lg"
              placeholder="Search tasks, projects, or type a command..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex items-center gap-1">
              <kbd className="bg-white/10 text-white/50 px-2 py-1 rounded text-xs font-mono">ESC</kbd>
            </div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
            <div className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Quick Actions</div>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-left text-white/70 hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Icons.plus className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Create Task</div>
                <div className="text-xs text-white/30">Add a new task to current project</div>
              </div>
              <kbd className="hidden sm:inline-block bg-white/10 text-white/50 px-2 py-1 rounded text-xs font-mono">N</kbd>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-left text-white/70 hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Icons.folder className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Create Project</div>
                <div className="text-xs text-white/30">Start a new project in this workspace</div>
              </div>
              <kbd className="hidden sm:inline-block bg-white/10 text-white/50 px-2 py-1 rounded text-xs font-mono">P</kbd>
            </button>
            
            <div className="px-3 py-2 mt-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Navigation</div>
            <button onClick={() => { navigate("/app/projects"); onClose(); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-left text-white/70 hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white/5 text-white/40 flex items-center justify-center">
                <Icons.layoutTemplate className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Projects Hub</div>
              </div>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
