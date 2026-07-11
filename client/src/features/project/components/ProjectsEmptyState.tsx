import React from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";

interface ProjectsEmptyStateProps {
  onCreateClick: () => void;
  hasFilters: boolean;
  clearFilters: () => void;
}

export function ProjectsEmptyState({ onCreateClick, hasFilters, clearFilters }: ProjectsEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30"
        >
          <Icons.search className="w-10 h-10" />
        </motion.div>
        <h3 className="text-xl font-medium text-white mb-2">No projects found</h3>
        <p className="text-white/50 max-w-sm mb-6">
          We couldn't find any projects matching your search or filter criteria.
        </p>
        <Button onClick={clearFilters} variant="outline" className="border-white/10 bg-white/5 text-white">
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
        <div className="relative w-32 h-32 mb-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-sm">
          <Icons.folder className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
        </div>
      </motion.div>
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-3"
      >
        No projects yet
      </motion.h3>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-white/60 max-w-sm mb-8 text-lg"
      >
        Create your first collaborative project and start building with your team.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          onClick={onCreateClick} 
          size="lg"
          className="rounded-full px-8 py-6 text-base font-medium shadow-[0_0_40px_-10px_rgba(52,211,153,0.5)] bg-emerald-600 hover:bg-emerald-500 text-white border-0 transition-all hover:scale-105"
        >
          <Icons.plus className="w-5 h-5 mr-2" />
          Create Project
        </Button>
      </motion.div>
    </div>
  );
}
