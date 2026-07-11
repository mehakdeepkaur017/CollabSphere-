import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import type { Project } from "./project.api";
import { Icons } from "@/components/shared/icons";
import { usePresence } from "@/hooks/usePresence";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  isDragging?: boolean;
}

const statusColors: Record<string, string> = {
  planning: "from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20",
  active: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
  review: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20",
  completed: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20",
};

const priorityIcons: Record<string, React.ReactNode> = {
  low: <Icons.arrowDown className="w-3.5 h-3.5 text-slate-400" />,
  medium: <Icons.arrowRight className="w-3.5 h-3.5 text-blue-400" />,
  high: <Icons.arrowUp className="w-3.5 h-3.5 text-amber-400" />,
  urgent: <Icons.alertCircle className="w-3.5 h-3.5 text-red-400" />,
};

export function ProjectCard({ project, onClick, isDragging }: ProjectCardProps) {
  const { isUserOnline } = usePresence();

  return (
    <motion.div
      layoutId={`project-${project._id}`}
      onClick={onClick}
      className={`group relative flex flex-col rounded-2xl bg-[#111116] border border-white/5 p-4 cursor-pointer transition-all duration-300 ${
        isDragging ? "shadow-2xl shadow-emerald-500/10 scale-105 border-white/20 rotate-1 z-50" : "hover:border-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
      }`}
    >
      {/* Premium Glow on Hover */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

      {/* Header: Priority & Status */}
      <div className="flex justify-between items-start mb-3">
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border bg-gradient-to-br ${statusColors[project.status]}`}>
          {project.status}
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/60">
          {priorityIcons[project.priority]}
          <span className="capitalize">{project.priority}</span>
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="font-semibold text-white/90 text-sm leading-tight mb-1.5 group-hover:text-white transition-colors">
        {project.name}
      </h3>
      <p className="text-xs text-white/40 line-clamp-2 mb-4 flex-1 font-light">
        {project.description || "No description provided."}
      </p>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/50 border border-white/5">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/50 border border-white/5">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Progress Ring & Stats */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        
        {/* Members */}
        <div className="flex -space-x-1.5">
          {project.members?.slice(0, 3).map((member, i) => (
            <div 
              key={member._id || i} 
              className="w-6 h-6 rounded-full bg-white/10 border border-[#111116] flex items-center justify-center text-[9px] font-bold text-white/80 relative z-10"
            >
              {member.name ? member.name.charAt(0).toUpperCase() : '?'}
              {member._id && isUserOnline(member._id) && (
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-[#111116]" />
              )}
            </div>
          ))}
          {project.members && project.members.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-white/5 border border-[#111116] flex items-center justify-center text-[9px] font-medium text-white/40 relative z-0">
              +{project.members.length - 3}
            </div>
          )}
          {(!project.members || project.members.length === 0) && (
            <span className="text-[10px] text-white/30 italic">Unassigned</span>
          )}
        </div>

        {/* Due Date & Progress */}
        <div className="flex items-center gap-3">
          {project.dueDate && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-white/40">
              <Icons.calendar className="w-3 h-3" />
              {format(new Date(project.dueDate), "MMM d")}
            </div>
          )}
          {/* Circular Progress Ring */}
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.8)] transition-all duration-500 ease-out"
                strokeDasharray={`${project.progress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-white/80">
              {project.progress}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
