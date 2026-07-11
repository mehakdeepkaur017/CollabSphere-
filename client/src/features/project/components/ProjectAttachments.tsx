import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { useProjectAttachments, useAddProjectAttachment, useDeleteProjectAttachment } from "../useProjectQueries";

interface ProjectAttachmentsProps {
  projectId: string;
  workspaceId: string;
}

export function ProjectAttachments({ projectId, workspaceId }: ProjectAttachmentsProps) {
  const { data: attachments, isLoading } = useProjectAttachments(workspaceId, projectId);
  const { mutate: addAttachment, isPending } = useAddProjectAttachment(workspaceId, projectId);
  const { mutate: deleteAttachment } = useDeleteProjectAttachment(workspaceId, projectId);
  
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !name.trim()) return;
    
    // Fake size and type for this simple implementation
    addAttachment({
      name,
      url,
      size: Math.floor(Math.random() * 5000) + 100, // 100KB to 5MB
      type: url.endsWith(".pdf") ? "application/pdf" : url.endsWith(".png") ? "image/png" : "text/plain"
    });
    
    setUrl("");
    setName("");
  };

  const formatSize = (kb: number) => {
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const getFileUrl = (url?: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${baseUrl}${url}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 mb-6 custom-scrollbar pr-2">
        {isLoading ? (
          <div className="text-center text-white/30 text-sm py-4">Loading attachments...</div>
        ) : attachments?.length === 0 ? (
          <div className="text-center text-white/30 text-sm py-8 border border-dashed border-white/10 rounded-xl bg-white/5 flex flex-col items-center gap-3">
            <Icons.fileText className="w-8 h-8 text-white/20" />
            <p>No files attached yet. Add links or resources.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments?.map((file: any) => (
              <div key={file._id} className="group relative flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0">
                  <Icons.fileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <a href={getFileUrl(file.url)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white/90 truncate block hover:underline hover:text-emerald-400 transition-colors">
                    {file.name}
                  </a>
                  <div className="flex items-center gap-2 text-[10px] text-white/40 mt-0.5">
                    <span>{formatSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.uploader?.name || "Unknown"}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteAttachment(file._id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-white/40 hover:text-red-400 bg-black/40 hover:bg-black/60 rounded-lg transition-all absolute right-2"
                >
                  <Icons.trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAdd} className="mt-auto bg-white/5 p-4 rounded-xl border border-white/10">
        <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Add Resource Link</h4>
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="File name or title"
            className="w-full bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
            <Button 
              type="submit" 
              disabled={!url.trim() || !name.trim() || isPending}
              className="rounded-lg bg-white/10 hover:bg-white/20 text-white border-0"
            >
              Add
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
