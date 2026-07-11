import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useChatStore } from "@/store/chatStore";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useChannels, useMessages, useSendMessage, useUpdateMessage, useDeleteMessage, useToggleReaction } from "../useChatQueries";
import { MessageItem } from "./MessageItem";
import { MessageComposer } from "./MessageComposer";
import { TypingIndicator } from "./TypingIndicator";

export function ChatArea() {
  const { activeWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { activeChannelId, toggleDetailsPanel, openCall, setGlobalSearchOpen } = useChatStore();
  const { data: channels } = useChannels(activeWorkspace?._id);
  const { 
    data: messagesData, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useMessages(activeWorkspace?._id, activeChannelId || undefined);
  
  const { mutate: sendMessage, isPending } = useSendMessage(activeWorkspace?._id || "", activeChannelId || "");
  const { mutate: updateMessage } = useUpdateMessage(activeWorkspace?._id || "", activeChannelId || "");
  const { mutate: deleteMessage } = useDeleteMessage(activeWorkspace?._id || "", activeChannelId || "");
  const { mutate: toggleReaction } = useToggleReaction(activeWorkspace?._id || "", activeChannelId || "");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topObserverRef = useRef<HTMLDivElement>(null);
  
  const [showNewMessageBadge, setShowNewMessageBadge] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [messagesLength, setMessagesLength] = useState(0);
  const previousScrollHeightRef = useRef<number>(0);
  const isFetchingOlderRef = useRef(false);

  const channel = channels?.find((c) => c._id === activeChannelId);

  // Flatten messages: reverse pages so older pages are at the top
  const messages = React.useMemo(() => {
    if (!messagesData) return [];
    return messagesData.pages.slice().reverse().flatMap(page => page.messages) || [];
  }, [messagesData]);

  // Handle scroll events to detect if at bottom
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setIsAtBottom(isBottom);
    if (isBottom) setShowNewMessageBadge(false);
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
    setShowNewMessageBadge(false);
  };

  // Auto scroll logic for new messages
  useEffect(() => {
    if (messages.length > messagesLength) {
      if (!isFetchingOlderRef.current) {
        // This is a NEW message (not older history)
        if (isAtBottom) {
          scrollToBottom();
        } else {
          setShowNewMessageBadge(true);
        }
      }
      setMessagesLength(messages.length);
    }
  }, [messages.length, isAtBottom, messagesLength]);

  // Initial scroll to bottom
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
           scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [activeChannelId, isLoading]);

  // Preserve scroll position when loading older messages
  useEffect(() => {
    if (isFetchingOlderRef.current && !isFetchingNextPage) {
      const el = scrollContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight - previousScrollHeightRef.current;
      }
      isFetchingOlderRef.current = false;
    }
  }, [messagesData, isFetchingNextPage]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          if (scrollContainerRef.current) {
            previousScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
          }
          isFetchingOlderRef.current = true;
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (topObserverRef.current) observer.observe(topObserverRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSend = (content: string, fileDetails?: any) => {
    if (!activeWorkspace || !activeChannelId) return;
    sendMessage({
      content,
      type: fileDetails ? "file" : "text",
      fileDetails
    });
    // Force scroll to bottom when sending a message
    setTimeout(scrollToBottom, 100);
  };

  if (!activeChannelId || !channel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black text-center relative overflow-hidden">
        {/* Ambient Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative flex flex-col items-center max-w-md"
        >
          <div className="w-24 h-24 mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl rotate-12 opacity-50 blur-xl" />
            <div className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md shadow-2xl">
              <Icons.messageSquare className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Collaboration Hub</h2>
          <p className="text-white/40 leading-relaxed text-[15px] max-w-[320px]">
            Select a space from the sidebar or create a new one to start connecting with your team.
          </p>
        </motion.div>
      </div>
    );
  }

  const isProject = channel.type === "project";
  const ChannelIcon = channel.icon ? (Icons as any)[channel.icon] || Icons.hash : Icons.hash;

  return (
    <div className="flex-1 flex flex-col bg-[#0c0c0e] relative h-full min-h-0 min-w-0">
      {/* Premium Header */}
      <div className="h-[65px] flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.01] backdrop-blur-xl shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${isProject ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
            <ChannelIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">{channel.name}</h3>
            <div className="flex items-center gap-3 text-[12px] text-white/40 mt-0.5">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {activeWorkspace?.members?.length || 1} online
              </span>
              <span>•</span>
              <span className="truncate max-w-[300px]">{channel.description || "Welcome to the space."}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <HeaderAction icon={Icons.phone} title="Start Voice Call" onClick={() => openCall(channel.name, false)} />
          <HeaderAction icon={Icons.video} title="Start Video Call" onClick={() => openCall(channel.name, true)} />
          <div className="w-px h-5 bg-white/10 mx-1.5" />
          <HeaderAction icon={Icons.search} title="Search in Space" onClick={() => setGlobalSearchOpen(true)} />
          <HeaderAction icon={Icons.users} title="Space Details" onClick={toggleDetailsPanel} />
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollContainerRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 relative min-h-0 scroll-smooth"
      >
        {isLoading && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Icons.spinner className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : messages?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Subtle Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-indigo-500/20"
                  initial={{ 
                    x: Math.random() * 400 - 200, 
                    y: Math.random() * 400 - 200,
                    opacity: Math.random() * 0.5 + 0.2 
                  }}
                  animate={{ 
                    y: [null, Math.random() * -100 - 50],
                    opacity: [null, 0]
                  }}
                  transition={{ 
                    duration: Math.random() * 3 + 2, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: Math.random() * 2 
                  }}
                />
              ))}
            </div>

            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(99,102,241,0.1)] border border-white/5 relative backdrop-blur-xl"
            >
              <ChannelIcon className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            </motion.div>
            
            <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Start collaborating</h3>
            <p className="text-[15px] text-white/40 max-w-sm text-center leading-relaxed">
              Messages, files, updates and discussions for this space will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4 max-w-5xl mx-auto w-full pb-8">
            <div ref={topObserverRef} className="h-4 flex items-center justify-center">
              {isFetchingNextPage && <Icons.spinner className="w-4 h-4 text-indigo-500 animate-spin" />}
            </div>
              {messages?.map((msg, idx) => {
                const prev = messages[idx - 1];
                const isGrouped = prev && prev.sender._id === msg.sender._id && 
                  (new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000);
                
                return (
                  <div key={msg._id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <MessageItem
                      message={msg}
                      isGrouped={!!isGrouped}
                      onReaction={(emoji) => toggleReaction({ messageId: msg._id, emoji })}
                      onPin={() => updateMessage({ messageId: msg._id, payload: { isPinned: !msg.isPinned } })}
                      onDelete={() => deleteMessage(msg._id)}
                      onReply={() => toast.info("Threads are coming in the next update! 🚀")}
                      onEdit={(content) => updateMessage({ messageId: msg._id, payload: { content } })}
                    />
                  </div>
                );
              })}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* New Message Badge */}
      <AnimatePresence>
        {showNewMessageBadge && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-20"
          >
            <span>↓ New Messages</span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="shrink-0 bg-[#0c0c0e] z-10">
        <TypingIndicator channelId={activeChannelId} />
        <MessageComposer
          channelId={activeChannelId}
          onSend={handleSend}
          isPending={isPending}
          placeholder={`Message ${isProject ? 'project' : 'space'} ${channel.name}...`}
        />
      </div>
    </div>
  );
}

function HeaderAction({ icon: Icon, title, onClick }: { icon: any, title: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors shadow-sm"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
