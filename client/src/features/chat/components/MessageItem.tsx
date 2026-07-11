import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { Icons } from "@/components/shared/icons";
import type { Message } from "../chat.api";
import { useAuthStore } from "@/store/authStore";

interface MessageItemProps {
  message: Message;
  isGrouped: boolean;
  onReaction: (emoji: string) => void;
  onPin: () => void;
  onDelete: () => void;
  onReply: () => void;
  onEdit: (content: string) => void;
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];

export function MessageItem({ message, isGrouped, onReaction, onPin, onDelete, onReply, onEdit }: MessageItemProps) {
  const user = useAuthStore((s) => s.user);
  const isOwn = user?.id === message.sender._id;
  const [showActions, setShowActions] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const getFileUrl = (url?: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${baseUrl}${url}`;
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(editContent);
    }
    setIsEditing(false);
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday " + format(date, "h:mm a");
    return format(date, "MMM d, h:mm a");
  };

  // Basic markdown & mention parser
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      let parts = line.split(/(\*\*.*?\*\*)/g);
      let renderedParts = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-bold text-white/90">{part.slice(2, -2)}</strong>;
        }
        let subParts = part.split(/(\*[^*]+\*)/g);
        return subParts.map((sp, k) => {
          if (sp.startsWith('*') && sp.endsWith('*')) {
            return <em key={k} className="italic text-white/80">{sp.slice(1, -1)}</em>;
          }
          let codeParts = sp.split(/(`[^`]+`)/g);
          return codeParts.map((cp, l) => {
            if (cp.startsWith('`') && cp.endsWith('`')) {
              return <code key={l} className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[11px] text-indigo-300">{cp.slice(1, -1)}</code>;
            }
            let mentionParts = cp.split(/(@\w+)/g);
            return mentionParts.map((mp, m) => {
              if (mp.startsWith('@')) {
                return <span key={m} className="text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded cursor-pointer hover:underline">{mp}</span>;
              }
              return mp;
            });
          });
        });
      });
      return <React.Fragment key={i}>{renderedParts}{i < lines.length - 1 && <br />}</React.Fragment>;
    });
  };

  if (message.type === "system") {
    return (
      <div className="flex items-center justify-center py-3 px-4 my-2">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
          <Icons.info className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11.5px] text-indigo-200/70 font-medium">{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowContextMenu(false);
      }}
      className={`group relative flex gap-3 px-3 py-1.5 rounded-xl transition-all duration-300 ${isGrouped ? "mt-0.5" : "mt-5"} ${showActions ? "bg-white/[0.04]" : "bg-transparent"} ${message.isPinned ? "bg-amber-500/[0.03] border-l-2 border-amber-500/50" : ""}`}
    >
      {/* Avatar */}
      {!isGrouped ? (
        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-[15px] font-bold text-indigo-200 flex-shrink-0 mt-0.5 shadow-[0_4px_15px_rgba(0,0,0,0.3)] select-none group-hover:scale-105 transition-transform">
          {message.sender.name?.charAt(0).toUpperCase() || "?"}
        </div>
      ) : (
        <div className="w-10 flex-shrink-0 flex items-start justify-center pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] text-white/30 font-medium tracking-wide">
            {format(new Date(message.createdAt), "HH:mm")}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 pr-12">
        {!isGrouped && (
          <div className="flex items-baseline gap-2.5 mb-1">
            <span className="text-[14px] font-semibold text-white/95 hover:underline cursor-pointer tracking-tight">
              {message.sender.name}
            </span>
            <span className="text-[11px] text-white/30 font-medium">{formatTimestamp(message.createdAt)}</span>
            {message.isPinned && (
              <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-semibold ml-1">
                <Icons.pin className="w-3 h-3" /> Pinned
              </span>
            )}
          </div>
        )}

        {/* Message Body */}
        {isEditing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 space-y-2 max-w-3xl">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEditSubmit();
                }
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="w-full bg-black/50 border border-indigo-500/50 rounded-xl py-2.5 px-3 text-[14px] text-white focus:outline-none focus:ring-2 ring-indigo-500/30 resize-none shadow-inner"
              rows={3}
              autoFocus
            />
            <div className="flex items-center gap-2 text-[11px] text-white/40 font-medium">
              <span>escape to <button onClick={() => setIsEditing(false)} className="text-white/60 hover:text-white transition-colors">cancel</button></span>
              <span>·</span>
              <span>enter to <button onClick={handleEditSubmit} className="text-indigo-400 hover:text-indigo-300 transition-colors">save</button></span>
            </div>
          </motion.div>
        ) : (
          <>
            <div className={`text-[14px] leading-[1.6] whitespace-pre-wrap break-words ${isOwn ? "text-white/90" : "text-white/80"}`}>
              {renderContent(message.content)}
              {message.isEdited && <span className="text-[10px] text-white/30 ml-2 italic font-medium">(edited)</span>}
            </div>

            {/* File Preview */}
            {message.fileDetails && (
              <div className="mt-3 max-w-md">
                {message.fileDetails.mimeType?.startsWith("image/") ? (
                  <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl overflow-hidden border border-white/10 shadow-lg cursor-pointer relative group inline-block">
                    <img src={getFileUrl(message.fileDetails.url)} alt="attachment" className="max-h-[300px] object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button onClick={() => window.open(getFileUrl(message.fileDetails!.url), "_blank")} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                        <Icons.externalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    onClick={() => window.open(getFileUrl(message.fileDetails!.url), "_blank")}
                    className="inline-flex items-center gap-3 p-3 pr-5 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/30 transition-all">
                      <Icons.file className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white/90 truncate">{message.fileDetails.name}</p>
                      <p className="text-[11px] text-white/40 font-medium">
                        {(message.fileDetails.size / 1024 / 1024).toFixed(2)} MB • {message.fileDetails.mimeType}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}

        {/* Reactions */}
        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {message.reactions.map((r) => {
              const hasReacted = r.users?.includes(user?.id || "");
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={r.emoji}
                  onClick={() => onReaction(r.emoji)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs transition-all ${
                    hasReacted
                      ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-[12px]">{r.emoji}</span>
                  <span className="text-[10px] font-bold">{r.users?.length || 0}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hover Actions & Context Menu */}
      <AnimatePresence>
        {showActions && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-3 right-4 flex items-center gap-0.5 bg-[#18181b] border border-white/10 rounded-lg p-1 shadow-[0_5px_30px_rgba(0,0,0,0.5)] z-10 backdrop-blur-xl"
          >
            <div className="relative">
              <ActionButton
                icon={Icons.smile}
                title="React"
                onClick={() => setShowContextMenu(!showContextMenu)}
                active={showContextMenu}
              />
              <AnimatePresence>
                {showContextMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-[#18181b]/95 backdrop-blur-3xl border border-white/10 rounded-xl p-1.5 shadow-2xl z-20"
                  >
                    <div className="flex justify-between px-2 py-2 border-b border-white/5 mb-1">
                      {QUICK_EMOJIS.map(emoji => (
                        <button key={emoji} onClick={() => { onReaction(emoji); setShowContextMenu(false); }} className="hover:scale-125 transition-transform">{emoji}</button>
                      ))}
                    </div>
                    <ContextMenuItem icon={Icons.reply} label="Reply in thread" onClick={() => { onReply(); setShowContextMenu(false); }} />
                    <ContextMenuItem icon={Icons.copy} label="Copy text" onClick={() => { navigator.clipboard.writeText(message.content); setShowContextMenu(false); }} />
                    <ContextMenuItem icon={Icons.pin} label={message.isPinned ? "Unpin message" : "Pin message"} onClick={() => { onPin(); setShowContextMenu(false); }} />
                    {isOwn && (
                      <>
                        <div className="w-full h-px bg-white/5 my-1" />
                        <ContextMenuItem icon={Icons.edit} label="Edit message" onClick={() => { setIsEditing(true); setShowContextMenu(false); }} />
                        <ContextMenuItem icon={Icons.trash} label="Delete message" onClick={() => { onDelete(); setShowContextMenu(false); }} danger />
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, title, onClick, className = "", active = false }: any) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-all flex items-center justify-center ${active ? "bg-white/10 text-white" : "text-white/50 hover:text-white/90 hover:bg-white/10"} ${className}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function ContextMenuItem({ icon: Icon, label, onClick, danger = false }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        danger ? "text-red-400 hover:bg-red-500/10" : "text-white/70 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
