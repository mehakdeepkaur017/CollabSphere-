import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useProject } from "./useProjectQueries";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { Icons } from "@/components/shared/icons";
import { KanbanBoard } from "./components/KanbanBoard";
import { useProjectKeyboardShortcuts } from "./useProjectKeyboardShortcuts";

export function ProjectDetailView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspaceStore();
  const { data: project, isLoading } = useProject(activeWorkspace?._id, projectId);

  useProjectKeyboardShortcuts({
    onNewTask: () => {
      // Keep shortcut logic minimal or open a generic modal here
    },
    onSearch: () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    }
  });

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-white/40 h-full">Loading project...</div>;
  }

  if (!project) {
    return <div className="flex-1 flex items-center justify-center text-white/40 h-full">Project not found</div>;
  }

  return (
    <MotionWrapper variant="page" className="flex flex-col h-full bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="shrink-0 bg-white/[0.01] border-b border-white/5 relative overflow-hidden">
        {/* Subtle premium background glow */}
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        
        <div className="px-8 py-8 flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/app/projects")}
              className="p-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <Icons.arrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">
                {project.name}
              </h1>
              <p className="text-base text-white/40 font-medium mt-1.5 flex items-center gap-2">
                <Icons.folder className="w-4 h-4 opacity-50" />
                {project.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0a0a0f] to-[#0a0a0f]">
        <KanbanBoard projectId={project._id} />
      </div>
    </MotionWrapper>
  );
}
