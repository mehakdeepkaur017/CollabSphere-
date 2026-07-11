import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { useChatStore } from "@/store/chatStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useChannels, useMessages } from "../useChatQueries";
import { usePresence } from "@/hooks/usePresence";
import type { Message } from "../chat.api";
import { format } from "date-fns";

export function ChatDetailsPanel() {
  const { activeChannelId, isDetailsPanelOpen, setDetailsPanel, activeThreadId, closeThread } = useChatStore();
  const { activeWorkspace } = useWorkspaceStore();
  const { data: channels } = useChannels(activeWorkspace?._id);
  const { data: messages } = useMessages(activeWorkspace?._id, activeChannelId || undefined);
  const { isUserOnline } = usePresence();
  const [activeTab, setActiveTab] = useState<"about" | "pins" | "files">("about");

  const channel = channels?.find((c) => c._id === activeChannelId);

  const flattenedMessages = React.useMemo(() => {
    if (!messages) return [];
    return messages.pages.flatMap(page => page.messages) || [];
  }, [messages]);

  const pinnedMessages = flattenedMessages.filter((m) => m.isPinned) || [];
  const fileMessages = flattenedMessages.filter((m) => m.type === "file" && m.fileDetails) || [];

  if (!isDetailsPanelOpen || !channel) return null;

  const tabs = [
    { id: "about" as const, label: "About" },
    { id: "pins" as const, label: "Pins", count: pinnedMessages.length },
    { id: "files" as const, label: "Files", count: fileMessages.length },
  ];

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="h-full border-l border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl flex flex-col overflow-hidden flex-shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02] flex-shrink-0">
        <h3 className="text-sm font-semibold text-white">Channel Details</h3>
        <button
          onClick={() => setDetailsPanel(false)}
          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Icons.close className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-white/10 text-white/50 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {activeTab === "about" && (
          <div className="space-y-6">
            {/* Channel Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                  <Icons.hash className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{channel.name}</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{channel.type} channel</p>
                </div>
              </div>
              {channel.description && (
                <p className="text-xs text-white/50 leading-relaxed bg-white/5 border border-white/5 rounded-xl p-3">
                  {channel.description}
                </p>
              )}
            </div>

            {/* Members */}
            <div>
              <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-3">
                Members · {channel.members.length}
              </h4>
              <div className="space-y-1">
                {channel.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-white/5">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      {isUserOnline(member._id) && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0c]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">{member.name}</p>
                      <p className="text-[10px] text-white/30 truncate">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Created */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] text-white/30">
                Created {format(new Date(channel.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        )}

        {activeTab === "pins" && (
          <div className="space-y-3">
            {pinnedMessages.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-3">
                  <Icons.pin className="w-5 h-5 text-white/20" />
                </div>
                <p className="text-xs text-white/40">No pinned messages yet.</p>
                <p className="text-[10px] text-white/25 mt-1">Pin important messages to find them later.</p>
              </div>
            ) : (
              pinnedMessages.map((msg) => (
                <PinnedMessageCard key={msg._id} message={msg} />
              ))
            )}
          </div>
        )}

        {activeTab === "files" && (
          <div className="space-y-3">
            {fileMessages.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-3">
                  <Icons.fileText className="w-5 h-5 text-white/20" />
                </div>
                <p className="text-xs text-white/40">No files shared yet.</p>
              </div>
            ) : (
              fileMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0">
                    <Icons.fileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/80 truncate">
                      {msg.fileDetails?.name}
                    </p>
                    <p className="text-[10px] text-white/30">
                      {msg.sender.name} · {format(new Date(msg.createdAt), "MMM d")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PinnedMessageCard({ message }: { message: Message }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[9px] font-bold">
          {message.sender.name?.charAt(0).toUpperCase()}
        </div>
        <span className="text-[11px] font-medium text-white/80">{message.sender.name}</span>
        <span className="text-[9px] text-white/25">{format(new Date(message.createdAt), "MMM d, h:mm a")}</span>
      </div>
      <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">{message.content}</p>
    </div>
  );
}
