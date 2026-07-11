import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import type { Project } from "../project.api";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { ProjectComments } from "./ProjectComments";
import { ProjectChecklist } from "./ProjectChecklist";
import { ProjectAttachments } from "./ProjectAttachments";

interface ProjectSidePanelProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidePanel({ project, isOpen, onClose }: ProjectSidePanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "comments" | "attachments">("overview");

  if (!project) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: Icons.activity },
    { id: "tasks", label: "Checklist", icon: Icons.checkSquare },
    { id: "comments", label: "Comments", icon: Icons.messageSquare },
    { id: "attachments", label: "Files", icon: Icons.fileText },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%", boxShadow: "-20px 0 50px rgba(0,0,0,0)" }}
            animate={{ x: 0, boxShadow: "-20px 0 50px rgba(0,0,0,0.5)" }}
            exit={{ x: "100%", boxShadow: "-20px 0 50px rgba(0,0,0,0)" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[800px] bg-[#0c0c0e] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                  <Icons.folder className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">{project.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-white/50 mt-1 uppercase tracking-wider font-medium">
                    <span>{project.status}</span>
                    <span>•</span>
                    <span className={project.priority === "urgent" ? "text-red-400" : ""}>{project.priority} priority</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                  <Icons.link className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                  <Icons.moreHorizontal className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/60 hover:text-white hover:bg-white/5">
                  <Icons.close className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex px-6 border-b border-white/5 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? "border-emerald-500 text-emerald-400" 
                      : "border-transparent text-white/50 hover:text-white/80"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Description */}
                  <section>
                    <h3 className="text-sm font-medium text-white/40 mb-2 uppercase tracking-wider">Description</h3>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                      {project.description || <span className="text-white/30 italic">No description provided.</span>}
                    </div>
                  </section>

                  {/* Properties Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Status</div>
                      <div className="text-sm font-medium text-white capitalize">{project.status}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Priority</div>
                      <div className="text-sm font-medium text-white capitalize">{project.priority}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Due Date</div>
                      <div className="text-sm font-medium text-white">
                        {project.dueDate ? format(new Date(project.dueDate), "MMM d, yyyy") : "-"}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Progress</div>
                      <div className="text-sm font-medium text-white">{project.progress}%</div>
                    </div>
                  </div>

                  {/* Members & Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section>
                      <h3 className="text-sm font-medium text-white/40 mb-3 uppercase tracking-wider">Team Members</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.members && project.members.length > 0 ? (
                          project.members.map((m) => (
                            <div key={m._id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs text-white/80">{m.name}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-white/30 italic">No members assigned</span>
                        )}
                      </div>
                    </section>
                    <section>
                      <h3 className="text-sm font-medium text-white/40 mb-3 uppercase tracking-wider">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags && project.tags.length > 0 ? (
                          project.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-white/30 italic">No tags</span>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === "tasks" && <ProjectChecklist projectId={project._id} workspaceId={project.workspaceId} />}
              {activeTab === "comments" && <ProjectComments projectId={project._id} workspaceId={project.workspaceId} />}
              {activeTab === "attachments" && <ProjectAttachments projectId={project._id} workspaceId={project.workspaceId} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
