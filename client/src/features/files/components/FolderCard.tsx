import React from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import type { Folder } from "../file.api";
import { formatDistanceToNow } from "date-fns";

interface FolderCardProps {
  folder: Folder;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  viewMode: "grid" | "list";
  isSelected?: boolean;
  onSelect?: (multi: boolean, range: boolean) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function FolderCard({ folder, onClick, onDelete, viewMode, isSelected, onSelect, onContextMenu }: FolderCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(e.ctrlKey || e.metaKey, e.shiftKey);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(folder._id);
  };
  const timeAgo = formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true });

  if (viewMode === "list") {
    return (
      <motion.div
        layoutId={`folder-${folder._id}`}
        whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={onContextMenu}
        className={`flex items-center justify-between p-3 rounded-xl border border-white/5 transition-all group cursor-pointer ${
          isSelected ? "bg-indigo-500/20 border-indigo-500/50" : "bg-black/20 hover:border-white/10"
        }`}
      >
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
          <Icons.folder className="w-5 h-5 fill-current opacity-20" />
          <Icons.folder className="w-5 h-5 absolute" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
            {folder.name}
          </h4>
          <p className="text-xs text-white/40 truncate">
            {folder.fileCount || 0} items
          </p>
        </div>
        <div className="text-xs text-white/30 hidden sm:block w-32 truncate text-right">
          {timeAgo}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            className="p-1.5 rounded-md hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
            onClick={(e) => { e.stopPropagation(); onDelete(folder._id); }}
          >
            <Icons.trash className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={`folder-${folder._id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu}
      className={`group flex flex-col p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
        isSelected ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "bg-[#111116] border-white/5 hover:bg-[#16161c] hover:border-white/10"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
          <Icons.folder className="w-6 h-6 fill-current opacity-40" />
          <Icons.folder className="w-6 h-6 absolute" />
        </div>
        <button 
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-black/40 text-white/50 hover:text-red-400 hover:bg-black/60 transition-all"
          onClick={(e) => { e.stopPropagation(); onDelete(folder._id); }}
        >
          <Icons.trash className="w-3.5 h-3.5" />
        </button>
      </div>

      <h4 className="text-sm font-semibold text-white/90 truncate group-hover:text-emerald-300 transition-colors mb-1" title={folder.name}>
        {folder.name}
      </h4>
      
      <p className="text-[11px] text-emerald-400/50 font-medium">{folder.fileCount || 0} items</p>
    </motion.div>
  );
}
