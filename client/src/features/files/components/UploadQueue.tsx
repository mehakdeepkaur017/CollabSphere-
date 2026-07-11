import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "completed" | "error";
}

// In a real app, this would be tied to a global upload store/context
// For this UI phase, we'll simulate the state management internally or via props if we had them.
// We'll export a dummy version that can be connected later.

export function UploadQueue() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Icons.uploadCloud className="w-4 h-4 text-indigo-400" />
            Uploading {uploads.length} items
          </h4>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              {isMinimized ? <Icons.chevronUp className="w-4 h-4" /> : <Icons.chevronDown className="w-4 h-4" />}
            </button>
            <button onClick={() => setUploads([])} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <Icons.x className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="max-h-60 overflow-y-auto custom-scrollbar"
            >
              <div className="p-2 space-y-1">
                {uploads.map((upload) => (
                  <div key={upload.id} className="p-2 rounded-lg hover:bg-white/5 transition-colors group relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white/80 truncate pr-4">{upload.name}</span>
                      {upload.status === "completed" ? (
                        <Icons.check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : upload.status === "error" ? (
                        <Icons.alertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-white/40 font-mono shrink-0">{upload.progress}%</span>
                      )}
                    </div>
                    {upload.status === "uploading" && (
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
