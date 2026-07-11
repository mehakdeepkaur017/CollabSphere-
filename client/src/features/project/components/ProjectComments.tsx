import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { useProjectComments, useAddProjectComment } from "../useProjectQueries";

interface ProjectCommentsProps {
  projectId: string;
  workspaceId: string;
}

export function ProjectComments({ projectId, workspaceId }: ProjectCommentsProps) {
  const { data: comments, isLoading } = useProjectComments(workspaceId, projectId);
  const { mutate: addComment, isPending } = useAddProjectComment(workspaceId, projectId);
  const [newComment, setNewComment] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(newComment);
    setNewComment("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-6 mb-6 custom-scrollbar pr-2">
        {isLoading ? (
          <div className="text-center text-white/30 text-sm py-4">Loading comments...</div>
        ) : comments?.length === 0 ? (
          <div className="text-center text-white/30 text-sm py-8 border border-dashed border-white/10 rounded-xl bg-white/5 flex flex-col items-center gap-3">
            <Icons.messageSquare className="w-8 h-8 text-white/20" />
            <p>No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments?.map((comment: any) => (
            <div key={comment._id} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 border border-indigo-500/20">
                {comment.author?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/90">{comment.author?.name || "Unknown"}</span>
                  <span className="text-[10px] text-white/30">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                </div>
                <div className="text-sm text-white/70 bg-white/5 border border-white/5 p-3 rounded-tr-xl rounded-b-xl leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </div>
                {/* Emoji reactions could go here */}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-auto">
        <div className="relative rounded-xl bg-white/5 border border-white/10 focus-within:border-indigo-500/50 focus-within:bg-white/[0.07] transition-all p-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment... (markdown supported)"
            className="w-full bg-transparent border-none resize-none text-sm text-white placeholder:text-white/30 focus:outline-none min-h-[80px] custom-scrollbar p-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex justify-between items-center mt-2 px-2 border-t border-white/5 pt-2">
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded-md text-white/40 hover:text-white hover:bg-white/10">
                <Icons.smile className="w-4 h-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded-md text-white/40 hover:text-white hover:bg-white/10">
                <Icons.atSign className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              type="submit" 
              disabled={!newComment.trim() || isPending}
              size="sm" 
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
            >
              <Icons.send className="w-3.5 h-3.5 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
