import React, { useState, useEffect } from "react";
import { FilesSidebar } from "./components/FilesSidebar";
import { FilesMainArea } from "./components/FilesMainArea";
import { FilesRightPanel } from "./components/FilesRightPanel";
import { UploadModal } from "./components/UploadModal";
import { FilePreviewModal } from "./components/FilePreviewModal";
import { NewFolderModal } from "./components/NewFolderModal";
import { useFiles, useFolders, useUploadFiles, useCreateFolder, useDeleteFile, useDeleteFolder, useUpdateFile, useUpdateFolder } from "./useFileQueries";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { File } from "./file.api";
import { AnimatePresence, motion } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { UploadQueue } from "./components/UploadQueue";
import { useFilesSelection } from "./hooks/useFilesSelection";
import { FileDetailsDrawer } from "./components/FileDetailsDrawer";
import { useAuthStore } from "@/store/authStore";

export function FilesHubPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const workspaceId = activeWorkspace?._id;
  const { user } = useAuthStore();

  const [currentView, setCurrentView] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [parentFolderId, setParentFolderId] = useState<string | undefined>(undefined);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const [breadcrumbPath, setBreadcrumbPath] = useState<{ id: string; name: string }[]>([]);

  const isTrashView = currentView === "trash";
  const isGlobalView = currentView !== "all" && currentView !== "trash";
  const effectiveFolderId = isTrashView || isGlobalView ? undefined : (parentFolderId || "root");

  const { data: rawFiles = [], isLoading: filesLoading } = useFiles({ 
    workspaceId, 
    folderId: effectiveFolderId, 
    search: searchQuery,
    isDeleted: isTrashView
  });
  const { data: rawFolders = [], isLoading: foldersLoading } = useFolders({ 
    workspaceId, 
    parentFolderId: effectiveFolderId,
    isDeleted: isTrashView
  });

  const isLoading = filesLoading || foldersLoading;

  // Filter based on sidebar view
  const files = React.useMemo(() => {
    switch (currentView) {
      case "starred": return rawFiles.filter(f => f.isStarred);
      case "images": return rawFiles.filter(f => f.mimeType.includes("image"));
      case "videos": return rawFiles.filter(f => f.mimeType.includes("video"));
      case "documents": return rawFiles.filter(f => f.mimeType.includes("pdf") || f.mimeType.includes("text") || f.mimeType.includes("document"));
      case "shared": return rawFiles.filter(f => f.uploadedBy && typeof f.uploadedBy === 'object' && f.uploadedBy._id !== user?.id);
      case "trash": return rawFiles;
      case "recent": return [...rawFiles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);
      default: return rawFiles;
    }
  }, [rawFiles, currentView, user]);

  const folders = React.useMemo(() => {
    switch (currentView) {
      case "starred": return rawFolders.filter(f => f.isStarred);
      case "trash": return rawFolders;
      case "all":
      case "recent": return rawFolders;
      default: return [];
    }
  }, [rawFolders, currentView]);

  const { selectedIds, toggleSelection, clearSelection, selectAll } = useFilesSelection([...folders, ...files]);

  const selectedFile = selectedIds.size === 1 ? files.find(f => f._id === Array.from(selectedIds)[0]) || null : null;

  const uploadMutation = useUploadFiles(workspaceId!);
  const createFolderMutation = useCreateFolder();
  const deleteFileMutation = useDeleteFile();
  const deleteFolderMutation = useDeleteFolder();
  const updateFileMutation = useUpdateFile();
  const updateFolderMutation = useUpdateFolder();

  const handleToggleStar = async (id: string, isFolder: boolean, currentStarred: boolean) => {
    if (isFolder) {
      await updateFolderMutation.mutateAsync({ id, updates: { isStarred: !currentStarred } });
    } else {
      await updateFileMutation.mutateAsync({ id, updates: { isStarred: !currentStarred } });
    }
  };

  const handleDownload = async (id: string) => {
    const file = files.find(f => f._id === id);
    if (file) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const fullUrl = `${baseUrl}${file.url}`;
      try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = objectUrl;
        a.download = file.name || file.originalName || "download";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(objectUrl);
        a.remove();
      } catch (err) {
        console.error("Download failed, opening in new tab instead", err);
        window.open(fullUrl, "_blank");
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        selectAll();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        document.getElementById("files-search-input")?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
        setIsUploadModalOpen(true);
      }
      if (e.key === "Escape") {
        clearSelection();
        setIsUploadModalOpen(false);
        setIsNewFolderModalOpen(false);
        setPreviewFile(null);
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.size > 0) {
          e.preventDefault();
          const idArray = Array.from(selectedIds);
          // Just trigger first delete for now
          const isFolder = folders.some(f => f._id === idArray[0]);
          if (isFolder) deleteFolderMutation.mutate(idArray[0]); else deleteFileMutation.mutate(idArray[0]);
          clearSelection();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, folders, selectAll, clearSelection, deleteFolderMutation, deleteFileMutation]);

  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);

  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingGlobal(true);
    }
  };

  const handleGlobalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGlobal(false);
  };

  const handleGlobalDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGlobal(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      await handleUpload(filesArray);
    }
  };

  const handleUpload = async (fileList: any) => {
    const formData = new FormData();
    if (workspaceId) formData.append("workspaceId", workspaceId);
    if (parentFolderId) formData.append("folderId", parentFolderId);
    
    for (let i = 0; i < fileList.length; i++) {
      formData.append("files", fileList[i]);
    }
    try {
      await uploadMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Global drop upload failed", error);
      throw error; // Rethrow so UploadModal can catch and display it
    }
  };

  const handleCreateFolder = async (name: string) => {
    if (!workspaceId) return;
    await createFolderMutation.mutateAsync({ name, workspaceId, parentFolderId });
  };

  const handleDeleteFile = async (id: string) => {
    await deleteFileMutation.mutateAsync(id);
  };

  const handleDeleteFolder = async (id: string) => {
    await deleteFolderMutation.mutateAsync(id);
  };

  const handleFolderClick = (id: string) => {
    const folder = folders.find(f => f._id === id);
    if (folder) {
      setBreadcrumbPath(prev => [...prev, { id: folder._id, name: folder.name }]);
    }
    setParentFolderId(id);
  };

  const handleNavigateBreadcrumb = (id: string | undefined) => {
    if (!id) {
      setBreadcrumbPath([]);
      setParentFolderId(undefined);
    } else {
      const index = breadcrumbPath.findIndex(b => b.id === id);
      if (index !== -1) {
        setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
      }
      setParentFolderId(id);
    }
  };

  return (
    <div 
      className="flex h-full w-full overflow-hidden bg-[#050505] relative"
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      <AnimatePresence>
        {isDraggingGlobal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-indigo-500/10 backdrop-blur-sm border-[4px] border-dashed border-indigo-500/50 flex flex-col items-center justify-center m-4 rounded-3xl"
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/50 mb-6"
            >
              <Icons.uploadCloud className="w-10 h-10" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Drop files anywhere</h2>
            <p className="text-lg text-indigo-200">They will be uploaded to {parentFolderId ? "the current folder" : "the workspace root"}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-full w-full bg-[#0a0a0f] overflow-hidden relative text-white">
        <FilesSidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          onUploadClick={() => setIsUploadModalOpen(true)}
          onNewFolderClick={() => setIsNewFolderModalOpen(true)}
        />

      <FilesMainArea 
        files={files}
        folders={folders}
        isLoading={isLoading}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onUploadClick={() => setIsUploadModalOpen(true)}
        onNewFolderClick={() => setIsNewFolderModalOpen(true)}
        onFilePreview={(file) => setPreviewFile(file)}
        onFolderClick={handleFolderClick}
        onDeleteFile={handleDeleteFile}
        onDeleteFolder={handleDeleteFolder}
        onToggleStar={handleToggleStar}
        onDownload={handleDownload}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        parentFolderId={parentFolderId}
        onBackClick={() => handleNavigateBreadcrumb(breadcrumbPath[breadcrumbPath.length - 2]?.id)}
        selectedIds={selectedIds}
        toggleSelection={toggleSelection}
        clearSelection={clearSelection}
        breadcrumbPath={breadcrumbPath}
        onNavigateBreadcrumb={handleNavigateBreadcrumb}
        currentView={currentView}
      />

      <FileDetailsDrawer 
        file={selectedFile} 
        onClose={() => {
          if (selectedFile) toggleSelection(selectedFile._id, false, false);
        }}
        onToggleStar={handleToggleStar}
        onDownload={handleDownload}
      />

      <AnimatePresence>
        {isUploadModalOpen && (
          <UploadModal 
            isOpen={isUploadModalOpen} 
            onClose={() => setIsUploadModalOpen(false)} 
            onUpload={handleUpload} 
          />
        )}
        {isNewFolderModalOpen && (
          <NewFolderModal
            isOpen={isNewFolderModalOpen}
            onClose={() => setIsNewFolderModalOpen(false)}
            onCreate={handleCreateFolder}
          />
        )}
        {previewFile && (
          <FilePreviewModal 
            file={previewFile} 
            onClose={() => setPreviewFile(null)} 
            onDownload={handleDownload}
          />
        )}
      </AnimatePresence>
      <UploadQueue />
      </div>
    </div>
  );
}
