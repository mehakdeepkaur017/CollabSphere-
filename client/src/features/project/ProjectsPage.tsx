import React, { useState, useMemo } from "react";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useProjects } from "./useProjectQueries";
import { useWorkspaceSocket } from "@/hooks/useWorkspaceSocket";
import { CreateProjectModal } from "./CreateProjectModal";
import { Icons } from "@/components/shared/icons";
import { Link, useNavigate } from "react-router";
import { EmptyState } from "@/components/ui/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "./project.api";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import { useUpdateProject, useDeleteProject } from "./useProjectQueries";

export function ProjectsPage() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState("all");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "progress">("newest");
  const [filterBy, setFilterBy] = useState<"all" | "planning" | "active" | "completed">("all");
  
  const { activeWorkspace } = useWorkspaceStore();
  useWorkspaceSocket(activeWorkspace?._id);
  const { data: projects, isLoading } = useProjects(activeWorkspace?._id);
  const updateProject = useUpdateProject(activeWorkspace?._id || "");
  const deleteProject = useDeleteProject(activeWorkspace?._id || "");
  const navigate = useNavigate();

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let result = projects;
    
    if (currentView === "active") result = result.filter(p => p.status !== "completed" && p.status !== "archived");
    if (currentView === "completed") result = result.filter(p => p.status === "completed");
    if (currentView === "archived") result = result.filter(p => p.status === "archived");

    if (filterBy !== "all") {
      result = result.filter(p => p.status === filterBy);
    }

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.description?.toLowerCase().includes(lowerQ)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "progress") return b.progress - a.progress;
      return 0;
    });

    return result;
  }, [projects, searchQuery, currentView, sortBy, filterBy]);

  if (!activeWorkspace) {
    return (
      <MotionWrapper variant="page" className="flex flex-col gap-6 h-full p-6">
        <div className="flex flex-1 items-center justify-center py-10">
          <EmptyState 
            icon="folder"
            title="No Active Workspace"
            description="You need to select or create a workspace first to view projects."
            className="w-full max-w-3xl border-none bg-transparent shadow-none"
            colorClass="bg-indigo-500/10 text-indigo-500"
          />
        </div>
      </MotionWrapper>
    );
  }

  // Analytics Math
  const activeCount = projects?.filter(p => p.status === "active").length || 0;
  const completedCount = projects?.filter(p => p.status === "completed").length || 0;
  const totalProgress = projects?.length ? (projects.reduce((acc, p) => acc + p.progress, 0) / projects.length).toFixed(0) : 0;

  return (
    <MotionWrapper variant="page" className="flex h-full bg-[#0a0a0f] text-white">
      
      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar relative bg-[#0a0710]">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 pb-4 shrink-0 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Projects</h1>
            <p className="text-white/60 text-sm">Plan, organize, and track all your projects in one place.</p>
          </div>

          <div className="relative mt-4 md:mt-0">
            <button 
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-gradient-to-r from-[#b53cff] to-[#4c7dff] text-white border-0 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(168,85,247,0.4)] px-6 py-2.5 rounded-xl font-medium flex items-center"
            >
              <Icons.plus className="h-4 w-4 mr-2" />
              New Project
            </button>
            {/* Sparks decoration */}
            <div className="absolute -top-3 -right-3 text-purple-400 pointer-events-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M14 2l1 3M22 10l-3-1M19 4l-2 2" /> 
              </svg>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-white/5 shrink-0">
          <div className="px-8 flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
              {[
                { id: "all", label: "All Projects", icon: Icons.grid },
                { id: "active", label: "Active", icon: Icons.playCircle },
                { id: "completed", label: "Completed", icon: Icons.checkCircle },
                { id: "archived", label: "Archived", icon: Icons.archive }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all relative ${
                    currentView === tab.id 
                      ? "text-white bg-purple-500/10 shadow-[0_-10px_20px_rgba(168,85,247,0.1)]" 
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${currentView === tab.id ? 'text-purple-400' : ''}`} />
                  {tab.label}
                  {currentView === tab.id && (
                    <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-gradient-to-r from-[#b53cff] to-[#4c7dff]" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-[#13111c] p-1 mb-2">
              <button 
                onClick={() => setViewType("grid")}
                className={`p-2 rounded-lg transition-colors ${viewType === "grid" ? "bg-indigo-500/20 text-indigo-400" : "text-white/40 hover:text-white/70"}`}
              >
                <Icons.grid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewType("list")}
                className={`p-2 rounded-lg transition-colors ${viewType === "list" ? "bg-indigo-500/20 text-indigo-400" : "text-white/40 hover:text-white/70"}`}
              >
                <Icons.list className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 pb-32 max-w-7xl mx-auto w-full relative">

          {/* Projects Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white capitalize">{currentView} Projects</h3>
              <span className="text-sm text-white/40">{filteredProjects.length} items</span>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-white/40">Loading projects...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-28 border border-dashed border-indigo-500/20 rounded-[2.5rem] bg-[#110e16]/50 relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
                  <div className="w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                </div>
                
                <div className="relative mb-8">
                  {/* Decorative plants */}
                  <div className="absolute -left-12 -bottom-2 text-purple-600/80 w-12 h-16 pointer-events-none">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-10 absolute bottom-0 right-0 transform -rotate-12 drop-shadow-md"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c3.47.5 7.64-1.55 9.34-5.06l.32-.66C18 10 17 8 17 8z"/></svg>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-8 absolute bottom-4 right-4 transform -rotate-45 drop-shadow-md"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c3.47.5 7.64-1.55 9.34-5.06l.32-.66C18 10 17 8 17 8z"/></svg>
                  </div>
                  
                  {/* Decorative airplane & trail */}
                  <div className="absolute -right-16 -top-12 text-indigo-400 w-12 h-12 pointer-events-none drop-shadow-lg z-20">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="transform rotate-[30deg]"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </div>
                  <svg className="absolute -right-8 -top-4 w-20 h-20 text-white/20 pointer-events-none z-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"><path d="M0,40 Q20,10 40,30 T80,0" /></svg>
                  
                  {/* Stars/Sparkles */}
                  <Icons.sparkles className="absolute -left-16 top-4 w-4 h-4 text-purple-400 opacity-80" />
                  <Icons.sparkles className="absolute -right-8 bottom-4 w-3 h-3 text-indigo-400 opacity-80" />
                  <Icons.sparkles className="absolute left-8 -top-8 w-2 h-2 text-white opacity-40" />

                  {/* The Folder */}
                  <div className="w-40 h-28 bg-gradient-to-br from-[#7e22ce] to-[#4338ca] rounded-2xl shadow-[0_15px_40px_rgba(126,34,206,0.3)] relative z-10 flex items-end">
                    <div className="absolute -top-4 left-0 w-16 h-8 bg-[#6b21a8] rounded-t-xl rounded-tr-2xl" />
                    <div className="w-full h-[90%] bg-gradient-to-br from-[#9333ea] to-[#4f46e5] rounded-xl border-t border-white/20 shadow-inner flex items-center justify-center transform -skew-x-2 rounded-tl-sm z-20" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">No projects yet</h3>
                <p className="text-muted-foreground mb-8 relative z-10">
                  Create your first project to get started.
                </p>
                
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="bg-gradient-to-r from-[#b53cff] to-[#4c7dff] text-white border-0 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(168,85,247,0.4)] px-6 py-3 rounded-xl font-medium flex items-center relative z-10"
                >
                  <Icons.plus className="h-4 w-4 mr-2" />
                  Create Project
                </button>
              </div>
            ) : viewType === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map(project => (
                  <motion.div 
                    key={project._id}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/app/projects/${project._id}`)}
                    className="group cursor-pointer bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all shadow-lg hover:shadow-indigo-500/10 flex flex-col h-[280px]"
                  >
                    {/* Cover Area */}
                    <div className="h-24 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 relative">
                      {project.coverImage && <img src={project.coverImage} className="w-full h-full object-cover opacity-50 mix-blend-overlay" />}
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1 relative">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors truncate">
                          {project.name}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              onClick={(e) => e.stopPropagation()}
                              className="text-white/40 hover:text-white/80 p-1 -mt-1 -mr-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <Icons.moreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 border-white/10 bg-[#13111c] text-white">
                            {project.status === "completed" ? (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateProject.mutate({ projectId: project._id, payload: { status: "active" }});
                                }}
                                className="cursor-pointer hover:bg-white/10"
                              >
                                <Icons.checkCircle className="w-4 h-4 mr-2 text-white/40" />
                                Mark Incomplete
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateProject.mutate({ projectId: project._id, payload: { status: "completed" }});
                                }}
                                className="cursor-pointer hover:bg-white/10"
                              >
                                <Icons.checkCircle className="w-4 h-4 mr-2 text-emerald-400" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}

                            {project.status === "archived" ? (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateProject.mutate({ projectId: project._id, payload: { status: "active" }});
                                }}
                                className="cursor-pointer hover:bg-white/10"
                              >
                                <Icons.archive className="w-4 h-4 mr-2 text-white/40" />
                                Unarchive
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateProject.mutate({ projectId: project._id, payload: { status: "archived" }});
                                }}
                                className="cursor-pointer hover:bg-white/10"
                              >
                                <Icons.archive className="w-4 h-4 mr-2 text-amber-400" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator className="bg-white/10" />

                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Are you sure you want to delete this project?")) {
                                  deleteProject.mutate(project._id);
                                }
                              }}
                              className="cursor-pointer hover:bg-rose-500/10 text-rose-400 focus:text-rose-400 focus:bg-rose-500/20"
                            >
                              <Icons.trash className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-white/40 line-clamp-2 mb-4 flex-1">
                        {project.description || "No description provided."}
                      </p>

                      <div className="space-y-4 flex-1 flex flex-col justify-end">
                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div className="flex -space-x-2">
                            {project.members.slice(0, 3).map((m, i) => (
                              <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0a0a0f] bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white z-10" style={{ zIndex: 10 - i }}>
                                {m.name.charAt(0)}
                              </div>
                            ))}
                            {project.members.length > 3 && (
                              <div className="w-6 h-6 rounded-full border-2 border-[#0a0a0f] bg-white/10 flex items-center justify-center text-[9px] font-bold text-white/70 z-0">
                                +{project.members.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-white/30 font-medium">
                            <Icons.clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredProjects.map(project => (
                  <motion.div 
                    key={project._id}
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(`/app/projects/${project._id}`)}
                    className="group cursor-pointer bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 rounded-xl overflow-hidden transition-all flex items-center p-4 gap-6"
                  >
                    <div className="w-16 h-16 rounded-lg bg-indigo-500/20 shrink-0 overflow-hidden relative border border-white/5">
                      {project.coverImage ? (
                        <img src={project.coverImage} className="w-full h-full object-cover opacity-70" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-400">
                          <Icons.folder className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-white/90 group-hover:text-white truncate mb-1">{project.name}</h4>
                      <p className="text-sm text-white/40 truncate">{project.description || "No description provided."}</p>
                    </div>

                    <div className="flex items-center justify-end gap-6 shrink-0">
                      <div className="flex items-center -space-x-2">
                        {project.members.slice(0, 3).map((m, i) => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0a0a0f] bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white z-10" style={{ zIndex: 10 - i }}>
                            {m.name.charAt(0)}
                          </div>
                        ))}
                        {project.members.length > 3 && (
                          <div className="w-7 h-7 rounded-full border-2 border-[#0a0a0f] bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/70 z-0">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <Icons.moreHorizontal className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 border-white/10 bg-[#13111c] text-white">
                          {project.status === "completed" ? (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProject.mutate({ projectId: project._id, payload: { status: "active" }});
                              }}
                              className="cursor-pointer hover:bg-white/10"
                            >
                              <Icons.checkCircle className="w-4 h-4 mr-2 text-white/40" />
                              Mark Incomplete
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProject.mutate({ projectId: project._id, payload: { status: "completed" }});
                              }}
                              className="cursor-pointer hover:bg-white/10"
                            >
                              <Icons.checkCircle className="w-4 h-4 mr-2 text-emerald-400" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}

                          {project.status === "archived" ? (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProject.mutate({ projectId: project._id, payload: { status: "active" }});
                              }}
                              className="cursor-pointer hover:bg-white/10"
                            >
                              <Icons.archive className="w-4 h-4 mr-2 text-white/40" />
                              Unarchive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProject.mutate({ projectId: project._id, payload: { status: "archived" }});
                              }}
                              className="cursor-pointer hover:bg-white/10"
                            >
                              <Icons.archive className="w-4 h-4 mr-2 text-amber-400" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator className="bg-white/10" />

                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Are you sure you want to delete this project?")) {
                                deleteProject.mutate(project._id);
                              }
                            }}
                            className="cursor-pointer hover:bg-rose-500/10 text-rose-400 focus:text-rose-400 focus:bg-rose-500/20"
                          >
                            <Icons.trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
      />
    </MotionWrapper>
  );
}
