import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { useSocket } from "@/providers/SocketProvider";
import { useAuthStore } from "@/store/authStore";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
import { uploadApi } from "../fileUpload.api";

interface MessageComposerProps {
  channelId: string;
  onSend: (content: string, fileDetails?: any) => void;
  isPending: boolean;
  placeholder?: string;
}

export function MessageComposer({ channelId, onSend, isPending, placeholder }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string; size: number; mimeType: string } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { socket } = useSocket();
  const user = useAuthStore((s) => s.user);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Auto-resize textarea smoothly
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 250) + "px";
    }
  }, [content]);

  const startTyping = useCallback(() => {
    if (!isTypingRef.current && socket) {
      isTypingRef.current = true;
      socket.emit("chat:typing_start", { channelId, userName: user?.name });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit("chat:typing_stop", { channelId });
      }
      isTypingRef.current = false;
    }, 2000);
  }, [channelId, socket, user?.name]);

  const handleSend = () => {
    if (uploading) return;
    const trimmed = content.trim();
    if (!trimmed && !attachedFile) return;
    
    onSend(trimmed, attachedFile || undefined);
    
    setContent("");
    setAttachedFile(null);
    setShowEmoji(false);
    
    if (socket) {
      socket.emit("chat:typing_stop", { channelId });
    }
    isTypingRef.current = false;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const processFile = async (file: File) => {
    try {
      setUploading(true);
      const data = await uploadApi.uploadFile(file);
      setAttachedFile(data);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Keyboard shortcut formatting helpers
  const insertFormat = (prefix: string, suffix: string = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    const newContent = content.slice(0, start) + prefix + selected + suffix + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div 
      className="relative px-6 py-4 bg-[#0c0c0e] border-t border-white/5" 
      onDragOver={handleDragOver} 
      onDragLeave={handleDragLeave} 
      onDrop={handleDrop}
    >
      {/* Dropzone Overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center border-t border-indigo-500/50"
          >
            <div className="flex flex-col items-center text-indigo-400">
              <Icons.upload className="w-8 h-8 mb-2 animate-bounce" />
              <p className="font-bold text-sm">Drop file to attach</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmoji && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-[calc(100%+5px)] left-6 z-50 shadow-2xl rounded-[24px] overflow-hidden border border-white/10"
          >
            <EmojiPicker theme={Theme.DARK} onEmojiClick={handleEmojiClick} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col max-w-5xl mx-auto w-full">
        {/* Toolbar ABOVE input */}
        <div className="flex items-center gap-1 mb-2">
          <ToolButton icon={Icons.bold} title="Bold (**text**)" onClick={() => insertFormat('**')} />
          <ToolButton icon={Icons.italic} title="Italic (*text*)" onClick={() => insertFormat('*')} />
          <ToolButton icon={Icons.code} title="Code (`text`)" onClick={() => insertFormat('`')} />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolButton icon={Icons.smile} title="Emoji" onClick={() => setShowEmoji(!showEmoji)} active={showEmoji} />
          <ToolButton icon={Icons.atSign} title="Mention" onClick={() => insertFormat('@', '')} />
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <ToolButton icon={Icons.paperclip} title="Attach File" onClick={() => fileInputRef.current?.click()} loading={uploading} />
        </div>

        {/* Attached File Preview */}
        <AnimatePresence>
          {attachedFile && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pb-3"
            >
              <div className="relative inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2 pr-4 group">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  {attachedFile.mimeType.startsWith("image/") ? (
                    <img src={attachedFile.url} alt="preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Icons.file className="w-5 h-5" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white max-w-[200px] truncate">{attachedFile.name}</span>
                  <span className="text-xs text-white/40">{(attachedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button 
                  onClick={() => setAttachedFile(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg scale-90 hover:scale-100"
                >
                  <Icons.x className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Area and Send Button container */}
        <div className="flex items-end gap-3 relative group">
          <textarea
            id="message-composer-input"
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              startTyping();
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Type a message..."}
            rows={1}
            className="flex-1 bg-transparent border-none resize-none text-[15px] text-white/90 placeholder:text-white/30 focus:outline-none py-1 min-h-[40px] max-h-[300px] custom-scrollbar leading-relaxed"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={(!content.trim() && !attachedFile) || isPending || uploading}
            className={`w-[36px] h-[36px] rounded-lg flex items-center justify-center shrink-0 transition-all ${
              content.trim() || attachedFile 
                ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)]" 
                : "bg-white/5 text-white/20"
            }`}
          >
            {isPending ? (
              <Icons.spinner className="w-4 h-4 animate-spin" />
            ) : (
              <Icons.send className="w-4 h-4 ml-0.5" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon: Icon, title, onClick, active, loading }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.12, backgroundColor: "rgba(99,102,241,0.15)", boxShadow: "0 0 15px rgba(99,102,241,0.3)" }}
      whileTap={{ scale: 0.95 }}
      title={title}
      onClick={onClick}
      disabled={loading}
      className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-colors ${
        active ? "bg-indigo-500/20 text-indigo-400" : "text-white/40 hover:text-indigo-300"
      }`}
    >
      {loading ? <Icons.spinner className="w-4 h-4 animate-spin text-indigo-400" /> : <Icon className="w-4 h-4" />}
    </motion.button>
  );
}
