import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import type { File } from "../file.api";
import { formatDistanceToNow } from "date-fns";
import { useFileComments, useCreateFileComment, useUpdateFileComment, useDeleteFileComment } from "../useFileQueries";

interface FileDetailsDrawerProps {
  file: File | null;
  onClose?: () => void;
  onToggleStar?: (id: string, isFolder: boolean, currentStarred: boolean) => void;
  onDownload?: (id: string) => void;
}

export function FileDetailsDrawer({ file, onClose, onToggleStar, onDownload }: FileDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "versions">("details");
  const [newComment, setNewComment] = useState("");

  const { data: comments = [] } = useFileComments(file?._id);
  const createComment = useCreateFileComment();
  const updateComment = useUpdateFileComment();
  const deleteComment = useDeleteFileComment();

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !newComment.trim()) return;
    createComment.mutate({ fileId: file._id, payload: { content: newComment } });
    setNewComment("");
  };

  if (!file) {
    return (
      <div className="w-80 shrink-0 border-l border-white/5 bg-[#0a0a0f] hidden lg:flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-white/20 mb-6 bg-white/[0.02]">
          <Icons.fileText className="w-6 h-6" />
        </div>
        <p className="text-white/50 text-sm font-medium">Select a file to view its details</p>
      </div>
    );
  }

  const isImage = file.mimeType.includes("image");

  return (
    <div className="w-80 shrink-0 border-l border-white/5 bg-[#0a0a0f] flex flex-col h-full hidden lg:flex">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
        <h3 className="text-sm font-semibold text-white truncate max-w-[150px]" title={file.name}>{file.name}</h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onToggleStar && onToggleStar(file._id, false, file.isStarred)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors ${file.isStarred ? "text-yellow-400" : "text-white/50 hover:text-white"}`}
            title={file.isStarred ? "Unstar" : "Star"}
          >
            <Icons.star className={`w-4 h-4 ${file.isStarred ? "fill-current" : ""}`} />
          </button>
          <button 
            onClick={() => {
              // Trigger preview via global event or we can just open the URL
              const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
              window.open(`${baseUrl}${file.url}`, "_blank");
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            title="Open in new tab"
          >
            <Icons.externalLink className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDownload && onDownload(file._id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            title="Download"
          >
            <Icons.download className="w-4 h-4" />
          </button>
          {onClose && (
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
              title="Close"
            >
              <Icons.x className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-2 border-b border-white/5 shrink-0 gap-1">
        {["details", "comments", "versions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
              activeTab === tab ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 space-y-6"
            >
              {isImage ? (
                <div className="w-full aspect-video rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full aspect-video rounded-xl bg-indigo-500/10 border border-indigo-500/20 overflow-hidden flex items-center justify-center text-indigo-400">
                  <Icons.file className="w-12 h-12 opacity-50" />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/40 mb-1">Type</p>
                  <p className="text-sm text-white font-medium">{file.mimeType}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Size</p>
                  <p className="text-sm text-white font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Created</p>
                  <p className="text-sm text-white font-medium">{new Date(file.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Last Modified</p>
                  <p className="text-sm text-white font-medium">{formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Uploaded By</p>
                  <p className="text-sm text-white font-medium">{file.uploadedBy?.name || "Unknown"}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "comments" && (
            <motion.div
              key="comments"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <Icons.messageSquare className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    <p className="text-sm text-white/40">No comments yet</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {comment.userId?.name?.charAt(0) || "U"}
                        </div>
                        <span className="text-xs font-medium text-white">{comment.userId?.name}</span>
                        <span className="text-[10px] text-white/30 ml-auto">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-sm text-white/80">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-white/5 shrink-0">
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || createComment.isPending}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white transition-colors"
                  >
                    <Icons.send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === "versions" && (
            <motion.div
              key="versions"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 space-y-4"
            >
              <div className="relative pl-4 border-l border-white/10 space-y-6 before:absolute before:inset-0 before:-left-[1px]">
                {/* Simulated Version History Timeline */}
                <div className="relative">
                  <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[21px] top-1.5 ring-4 ring-[#0a0a0f]" />
                  <p className="text-sm font-medium text-white">Current Version</p>
                  <p className="text-xs text-white/40">{formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}</p>
                </div>
                <div className="relative">
                  <div className="absolute w-2 h-2 bg-white/20 rounded-full -left-[21px] top-1.5 ring-4 ring-[#0a0a0f]" />
                  <p className="text-sm font-medium text-white/70 hover:text-white cursor-pointer transition-colors">Version 1</p>
                  <p className="text-xs text-white/40">{new Date(file.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
