import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: any) => Promise<void>;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await processUpload(filesArray);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to a static Array immediately so it survives input clearing!
      const filesArray = Array.from(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      await processUpload(filesArray);
    }
  };

  const [uploadError, setUploadError] = useState<string | null>(null);

  const processUpload = async (files: any) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      await onUpload(files);
      onClose();
    } catch (error: any) {
      console.error(error);
      const serverError = error.response?.data?.error || error.message;
      setUploadError(serverError || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-[#111116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Upload Files</h3>
          <button onClick={onClose} disabled={isUploading} className="text-white/40 hover:text-white transition-colors disabled:opacity-50">
            <Icons.x className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/5"
            } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />
            
            <motion.div
              animate={{ y: isDragging ? -5 : 0 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 mb-4"
            >
              <Icons.uploadCloud className="w-8 h-8" />
            </motion.div>
            
            <h4 className="text-base font-semibold text-white mb-1">
              Click or drag files to upload
            </h4>
            <p className="text-sm text-white/40">
              Support for a single or bulk upload. Maximum file size 50MB.
            </p>
          </div>

          {uploadError && (
            <div className="mt-6 flex items-center justify-center gap-3 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              <Icons.alertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{uploadError}</span>
            </div>
          )}
          {isUploading && (
            <div className="mt-6 flex items-center justify-center gap-3 text-indigo-400">
              <Icons.spinner className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Uploading securely...</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
