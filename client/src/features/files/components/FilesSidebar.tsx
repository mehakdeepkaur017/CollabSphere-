import React from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { useStorageStats } from "../useFileQueries";
import { useWorkspaceStore } from "@/store/workspaceStore";

export function FilesSidebar({ currentView, setCurrentView, onUploadClick, onNewFolderClick }: { currentView: string; setCurrentView: (view: string) => void; onUploadClick: () => void; onNewFolderClick: () => void; }) {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: stats } = useStorageStats(activeWorkspace?._id);

  const navItems = [
    { id: "all", label: "All Files", icon: Icons.hardDrive },
    { id: "recent", label: "Recent", icon: Icons.clock },
    { id: "starred", label: "Starred", icon: Icons.star },
    { id: "shared", label: "Shared With Me", icon: Icons.users },
    { id: "images", label: "Images", icon: Icons.image },
    { id: "videos", label: "Videos", icon: Icons.video },
    { id: "documents", label: "Documents", icon: Icons.fileText },
    { id: "trash", label: "Trash", icon: Icons.trash },
  ];

  const [isNewMenuOpen, setIsNewMenuOpen] = React.useState(false);

  return (
    <div className="w-64 bg-[#0a0a0f] border-r border-white/5 flex flex-col h-full flex-shrink-0 relative overflow-visible z-20">
      {/* Header */}
      <div className="pt-8 pb-4 px-6 shrink-0 flex flex-col">
        <h2 className="font-bold text-white text-lg tracking-wide mb-1">Files Hub</h2>
        <div className="w-6 h-1 bg-purple-500 rounded-full" />
      </div>

      {/* New Button Area */}
      <div className="px-4 pb-4 shrink-0 relative mt-2">
        <button 
          onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
          className="w-full h-11 bg-gradient-to-r from-purple-500 to-[#9d4edd] hover:from-purple-400 hover:to-[#7b2cbf] text-white rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-between px-4 transition-all"
        >
          <div className="flex items-center gap-2 font-medium text-sm">
            <Icons.plus className="w-4 h-4" />
            New
          </div>
          <Icons.chevronDown className={`w-4 h-4 transition-transform ${isNewMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isNewMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsNewMenuOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-[68px] left-4 right-4 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl z-50 p-2 overflow-hidden flex flex-col gap-1"
            >
              <button 
                onClick={() => { onUploadClick(); setIsNewMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors w-full text-left"
              >
                <Icons.uploadCloud className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">File Upload</span>
              </button>
              <div className="h-px w-full bg-white/5 my-1" />
              <button 
                onClick={() => { onNewFolderClick(); setIsNewMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors w-full text-left"
              >
                <Icons.folderPlus className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium">New Folder</span>
              </button>
            </motion.div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group relative ${
                isActive ? "bg-[#1f1936] text-white" : "text-white/50 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500 rounded-r-full" />
              )}
              <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-white/40 group-hover:text-white/60"}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
