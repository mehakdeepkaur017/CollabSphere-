import React from "react";
import { motion } from "framer-motion";
import type { Project } from "../project.api";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface ProjectsHeaderProps {
  projects: Project[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateClick: () => void;
}

export function ProjectsHeader({ projects, searchQuery, setSearchQuery, onCreateClick }: ProjectsHeaderProps) {
  const { activeWorkspace } = useWorkspaceStore();

  const activeProjects = projects.filter(p => p.status === "active" || p.status === "planning" || p.status === "review").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  
  // Find upcoming deadlines within the next 7 days
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = projects.filter(p => p.dueDate && new Date(p.dueDate) >= now && new Date(p.dueDate) <= nextWeek).length;

  const stats = [
    { label: "Total Projects", value: projects.length, icon: Icons.folder, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Active", value: activeProjects, icon: Icons.activity, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Completed", value: completedProjects, icon: Icons.success, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Upcoming Deadlines", value: upcomingDeadlines, icon: Icons.calendar, color: "text-orange-400", bg: "bg-orange-400/10" },
  ];

  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 tracking-tight"
          >
            {activeWorkspace?.name || "Workspace"} Projects
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-sm mt-1"
          >
            Manage and collaborate on all your workspace initiatives.
          </motion.p>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="relative group">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white">
            <Icons.filter className="w-4 h-4" />
          </Button>
          <Button 
            onClick={onCreateClick}
            className="rounded-full shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
          >
            <Icons.plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/50 uppercase tracking-wider font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
