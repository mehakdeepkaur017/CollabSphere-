import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import type { File } from "../file.api";

interface FilePreviewModalProps {
  file: File | null;
  onClose: () => void;
  onDownload: (id: string) => void;
}

export function FilePreviewModal({ file, onClose, onDownload }: FilePreviewModalProps) {
  if (!file) return null;

  const isImage = file.mimeType.includes("image");
  const isVideo = file.mimeType.includes("video");

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const getFileUrl = (url: string) => url.startsWith('http') ? url : `${baseUrl}${url}`;
  const fileUrl = getFileUrl(file.url);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl h-full max-h-[90vh] bg-[#111116] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111116]/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Icons.file className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{file.name}</h3>
              <p className="text-xs text-white/40">{(file.size / (1024 * 1024)).toFixed(2)} MB • Uploaded by {file.uploadedBy?.name || "Unknown"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onDownload(file._id)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Icons.download className="w-4 h-4" />
              Download
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <Icons.x className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-black/40 flex items-center justify-center pt-16">
          {isImage ? (
            <img src={fileUrl} alt={file.name} className="max-w-full max-h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300" />
          ) : isVideo ? (
            <video src={fileUrl} controls className="max-w-full max-h-full rounded-lg shadow-2xl bg-black" />
          ) : file.mimeType.includes("audio") ? (
            <div className="w-full max-w-md p-8 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Icons.music className="w-10 h-10" />
              </div>
              <h4 className="text-white font-medium">{file.name}</h4>
              <audio src={fileUrl} controls className="w-full" />
            </div>
          ) : file.mimeType.includes("pdf") ? (
            <iframe src={fileUrl} className="w-full h-full rounded-lg bg-white" title={file.name} />
          ) : (
            <div className="flex flex-col items-center justify-center text-white/40 space-y-4">
              <Icons.file className="w-24 h-24 opacity-20" />
              <p className="text-lg">No preview available for this file type</p>
              <button 
                onClick={() => onDownload(file._id)}
                className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-500/25"
              >
                Download File
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
