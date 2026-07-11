import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { FileCard } from "./FileCard";
import { FolderCard } from "./FolderCard";
import { FileCardSkeleton, FolderCardSkeleton } from "./CardSkeletons";
import { EmptyState } from "./EmptyState";
import type { File, Folder } from "../file.api";
import { FileContextMenu } from "./FileContextMenu";
import { FilesBreadcrumbs } from "./FilesBreadcrumbs";

interface FilesMainAreaProps {
  files: File[];
  folders: Folder[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onUploadClick: () => void;
  onNewFolderClick: () => void;
  onFilePreview: (file: File) => void;
  onFolderClick: (id: string) => void;
  onDeleteFile: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleStar: (id: string, isFolder: boolean, currentStarred: boolean) => void;
  onDownload: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  parentFolderId?: string;
  onBackClick: () => void;
  selectedIds: Set<string>;
  toggleSelection: (id: string, multi: boolean, range: boolean) => void;
  clearSelection: () => void;
  breadcrumbPath: { id: string; name: string }[];
  onNavigateBreadcrumb: (id: string | undefined) => void;
  currentView: string;
}

export function FilesMainArea({
  files, folders, isLoading, viewMode, setViewMode, onUploadClick, onNewFolderClick,
  onFilePreview, onFolderClick, onDeleteFile, onDeleteFolder, onToggleStar, onDownload,
  searchQuery, setSearchQuery, parentFolderId, onBackClick,
  selectedIds, toggleSelection, clearSelection, breadcrumbPath, onNavigateBreadcrumb, currentView
}: FilesMainAreaProps) {
  
  const hasContent = files.length > 0 || folders.length > 0;

  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; id: string; isFolder: boolean } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, id: string, isFolder: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, id, isFolder });
  };

  let emptyTitle = "Your workspace is empty";
  let emptySubtitle = "Upload documents, designs, notes and project resources to keep everything organized.";
  let emptyIcon = Icons.hardDrive;
  let showUploadActions = true;

  if (currentView === "recent") {
    emptyTitle = "No recent files";
    emptySubtitle = "Files you upload or modify will appear here for quick access.";
    emptyIcon = Icons.clock;
  } else if (currentView === "starred") {
    emptyTitle = "No starred files";
    emptySubtitle = "Star important files to keep them easily accessible here.";
    emptyIcon = Icons.star;
  } else if (currentView === "shared") {
    emptyTitle = "No shared files";
    emptySubtitle = "Files shared with you by other workspace members will appear here.";
    emptyIcon = Icons.users;
    showUploadActions = false;
  } else if (currentView === "trash") {
    emptyTitle = "Trash is empty";
    emptySubtitle = "Items you delete will be moved here before permanent removal.";
    emptyIcon = Icons.trash;
    showUploadActions = false;
  } else if (currentView === "images") {
    emptyTitle = "No images found";
    emptySubtitle = "Upload photos, illustrations, or graphics to your workspace.";
    emptyIcon = Icons.image;
  } else if (currentView === "videos") {
    emptyTitle = "No videos found";
    emptySubtitle = "Upload video recordings or animations to your workspace.";
    emptyIcon = Icons.video;
  } else if (currentView === "documents") {
    emptyTitle = "No documents found";
    emptySubtitle = "Upload PDFs, text files, or other documents to your workspace.";
    emptyIcon = Icons.fileText;
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-[#0a0a0f] relative overflow-hidden">
      {/* Header */}
      <div className="min-h-[4rem] h-auto flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-b border-white/5 shrink-0 bg-[#0a0a0f]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <FilesBreadcrumbs path={breadcrumbPath} onNavigate={onNavigateBreadcrumb} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 shrink-0">
          <div className="relative hidden sm:block flex-shrink">
            <Icons.search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search files... (Ctrl+F)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 md:w-48 lg:w-64 h-9 bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
              id="files-search-input"
            />
          </div>

          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"}`}
            >
              <Icons.grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"}`}
            >
              <Icons.list className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative" onClick={() => clearSelection()}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-sm font-medium text-white/50 mb-4 flex items-center gap-2">
                  <Icons.folder className="w-4 h-4" /> Folders
                </h3>
                <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "flex flex-col gap-2"}>
                  {Array.from({ length: 4 }).map((_, i) => <FolderCardSkeleton key={i} viewMode={viewMode} />)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/50 mb-4 flex items-center gap-2">
                  <Icons.file className="w-4 h-4" /> Files
                </h3>
                <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "flex flex-col gap-2"}>
                  {Array.from({ length: 8 }).map((_, i) => <FileCardSkeleton key={i} viewMode={viewMode} />)}
                </div>
              </div>
            </motion.div>
          ) : !hasContent ? (
            <EmptyState
              key="empty"
              icon={emptyIcon}
              title={emptyTitle}
              subtitle={emptySubtitle}
              primaryAction={showUploadActions ? { label: "Upload Files", onClick: onUploadClick } : undefined}
              secondaryAction={showUploadActions ? { label: "Create Folder", onClick: onNewFolderClick } : undefined}
            />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Folders Section */}
              {folders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-4 flex items-center gap-2">
                    <Icons.folder className="w-4 h-4" /> Folders
                  </h3>
                  <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "flex flex-col gap-2"}>
                    {folders.map(folder => (
                      <FolderCard 
                        key={folder._id} 
                        folder={folder} 
                        onClick={onFolderClick} 
                        onDelete={onDeleteFolder} 
                        viewMode={viewMode}
                        isSelected={selectedIds.has(folder._id)}
                        onSelect={(multi, range) => toggleSelection(folder._id, multi, range)}
                        onContextMenu={(e) => handleContextMenu(e, folder._id, true)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Files Section */}
              {files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-4 flex items-center gap-2">
                    <Icons.file className="w-4 h-4" /> Files
                  </h3>
                  <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "flex flex-col gap-2"}>
                    {files.map(file => (
                      <FileCard 
                        key={file._id} 
                        file={file} 
                        onPreview={onFilePreview} 
                        onDelete={onDeleteFile} 
                        viewMode={viewMode}
                        isSelected={selectedIds.has(file._id)}
                        onSelect={(multi, range) => toggleSelection(file._id, multi, range)}
                        onContextMenu={(e) => handleContextMenu(e, file._id, false)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <FileContextMenu
          x={contextMenu?.x || 0}
          y={contextMenu?.y || 0}
          isOpen={!!contextMenu}
          onClose={() => setContextMenu(null)}
          items={[
            { icon: Icons.star, label: contextMenu?.isFolder ? folders.find(f => f._id === contextMenu?.id)?.isStarred ? "Unstar" : "Star" : files.find(f => f._id === contextMenu?.id)?.isStarred ? "Unstar" : "Star", onClick: () => {
              if (contextMenu) {
                const isStarred = contextMenu.isFolder 
                  ? folders.find(f => f._id === contextMenu.id)?.isStarred 
                  : files.find(f => f._id === contextMenu.id)?.isStarred;
                onToggleStar(contextMenu.id, contextMenu.isFolder, !!isStarred);
              }
            } },
            { icon: Icons.pencil, label: "Rename", onClick: () => console.log("Rename", contextMenu?.id) },
            { icon: Icons.eye, label: "View", onClick: () => { 
              if (contextMenu && !contextMenu.isFolder) { 
                const file = files.find(f => f._id === contextMenu.id); 
                if (file) onFilePreview(file); 
              } 
            } },
            { icon: Icons.download, label: "Download", onClick: () => { if (contextMenu && !contextMenu.isFolder) onDownload(contextMenu.id); } },
            { icon: Icons.folderPlus, label: "Move to...", onClick: () => console.log("Move", contextMenu?.id) },
            { icon: Icons.link, label: "Copy Link", divider: true, onClick: () => console.log("Copy Link", contextMenu?.id) },
            { icon: Icons.trash, label: "Delete", color: "text-red-400 hover:text-red-300 hover:bg-red-500/10", onClick: () => {
              if (contextMenu?.isFolder) onDeleteFolder(contextMenu.id);
              else onDeleteFile(contextMenu!.id);
            }}
          ]}
        />

        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-2 pl-4 rounded-full shadow-2xl shadow-black/50"
            >
              <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {selectedIds.size}
                </span>
                <span className="text-sm font-medium text-white">Selected</span>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    const idArray = Array.from(selectedIds);
                    idArray.forEach(id => {
                      const isFolder = folders.some(f => f._id === id);
                      if (!isFolder) onDownload(id);
                    });
                    clearSelection();
                  }}
                  className="px-3 py-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Icons.download className="w-4 h-4" /> Download
                </button>
                <button 
                  onClick={clearSelection}
                  className="px-3 py-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                  <Icons.x className="w-4 h-4" /> Cancel
                </button>
                <button 
                  onClick={() => {
                    const idArray = Array.from(selectedIds);
                    // Just triggering delete for the first one for now, bulk delete needs API
                    const isFolder = folders.some(f => f._id === idArray[0]);
                    if (isFolder) onDeleteFolder(idArray[0]); else onDeleteFile(idArray[0]);
                    clearSelection();
                  }}
                  className="px-3 py-1.5 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Icons.trash className="w-4 h-4" /> Delete
                </button>
              </div>

              <button onClick={clearSelection} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ml-2">
                <Icons.x className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
