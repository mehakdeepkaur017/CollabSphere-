import React from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import type { File } from "../file.api";
import { formatDistanceToNow } from "date-fns";

interface FileCardProps {
  file: File;
  onPreview: (file: File) => void;
  onDelete: (id: string) => void;
  viewMode: "grid" | "list";
  isSelected?: boolean;
  onSelect?: (multi: boolean, range: boolean) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function FileCard({ file, onPreview, onDelete, viewMode, isSelected, onSelect, onContextMenu }: FileCardProps) {
  const getFileIcon = () => {
    if (file.mimeType.includes("image")) return Icons.image;
    if (file.mimeType.includes("video")) return Icons.video;
    if (file.mimeType.includes("pdf")) return Icons.fileText;
    if (file.mimeType.includes("audio")) return Icons.mic; // Use available icon
    return Icons.file;
  };

  const Icon = getFileIcon();
  const isImage = file.mimeType.includes("image");
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(e.ctrlKey || e.metaKey, e.shiftKey);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(file);
  };

  const formattedSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
  const timeAgo = formatDistanceToNow(new Date(file.createdAt), { addSuffix: true });

  if (viewMode === "list") {
    return (
      <motion.div
        layoutId={`file-${file._id}`}
        whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={onContextMenu}
        className={`flex items-center gap-4 p-3 rounded-xl border border-white/5 transition-all group cursor-pointer ${
          isSelected ? "bg-indigo-500/20 border-indigo-500/50" : "bg-black/20 hover:border-white/10"
        }`}
      >
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
            {file.name}
          </h4>
          <p className="text-xs text-white/40 truncate">
            {formattedSize} • Uploaded by {file.uploadedBy?.name || "Unknown"}
          </p>
        </div>
        <div className="text-xs text-white/30 hidden sm:block w-32 truncate text-right">
          {timeAgo}
        </div>
        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); onPreview(file); }}
            title="View"
          >
            <Icons.eye className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 rounded-md hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
            onClick={(e) => { e.stopPropagation(); onDelete(file._id); }}
            title="Delete"
          >
            <Icons.trash className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={`file-${file._id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu}
      className={`group flex flex-col rounded-2xl border transition-all cursor-pointer overflow-hidden ${
        isSelected ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "bg-[#111116] border-white/5 hover:bg-[#16161c] hover:border-white/10"
      }`}
    >
      <div className="h-32 w-full bg-white/[0.02] relative border-b border-white/5 overflow-hidden flex items-center justify-center">
        {isImage ? (
          <img src={file.url.startsWith('http') ? file.url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${file.url}`} alt={file.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <Icon className="w-12 h-12 text-white/20 group-hover:scale-110 group-hover:text-indigo-400 transition-all duration-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-white/90 truncate group-hover:text-white transition-colors" title={file.name}>
          {file.name}
        </h4>
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-white/40 font-medium">{formattedSize}</p>
            <p className="text-[11px] text-white/30">{file.extension?.toUpperCase()}</p>
          </div>
          <p className="text-[10px] text-white/30 truncate">
            By {file.uploadedBy?.name || "Unknown"}
          </p>
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <button 
          className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/80 transition-all"
          onClick={(e) => { e.stopPropagation(); onPreview(file); }}
          title="View"
        >
          <Icons.eye className="w-3.5 h-3.5" />
        </button>
        <button 
          className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white/70 hover:text-red-400 hover:bg-black/80 transition-all"
          onClick={(e) => { e.stopPropagation(); onDelete(file._id); }}
          title="Delete"
        >
          <Icons.trash className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
