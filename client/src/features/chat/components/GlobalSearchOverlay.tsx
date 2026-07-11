import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useChannels } from "../useChatQueries";
import { useChatStore } from "@/store/chatStore";
import { useNavigate } from "react-router";

interface GlobalSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchOverlay({ isOpen, onClose }: GlobalSearchOverlayProps) {
  const [query, setQuery] = useState("");
  const { activeWorkspace } = useWorkspaceStore();
  const { data: channels = [] } = useChannels(activeWorkspace?._id);
  const { setActiveChannel } = useChatStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"all" | "spaces" | "members" | "messages" | "files">("all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveTab("all");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const searchQuery = query.toLowerCase().trim();
  
  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(searchQuery));
  const filteredMembers = activeWorkspace?.members.filter(m => 
    m.user.name.toLowerCase().includes(searchQuery) || 
    m.user.email.toLowerCase().includes(searchQuery)
  ) || [];

  const handleChannelClick = (channelId: string) => {
    setActiveChannel(channelId);
    navigate("/app/chat");
    onClose();
  };

  const renderResults = () => {
    if (!query) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <Icons.search className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-white/40 font-medium">Type anything to start searching</p>
          <p className="text-[11px] text-white/20 mt-2 max-w-[250px]">Search spaces, members, messages, and files instantly.</p>
        </div>
      );
    }

    const showChannels = activeTab === "all" || activeTab === "spaces";
    const showMembers = activeTab === "all" || activeTab === "members";
    const showEmpty = activeTab === "messages" || activeTab === "files";

    const hasResults = (showChannels && filteredChannels.length > 0) || (showMembers && filteredMembers.length > 0);

    if (showEmpty || !hasResults) {
      return (
        <div className="p-8 flex flex-col items-center justify-center text-center opacity-70">
          <Icons.inbox className="w-8 h-8 text-white/30 mb-3" />
          <p className="text-sm text-white/60">No results found for "{query}"</p>
          {showEmpty && <p className="text-xs text-white/30 mt-1">Global search for this category is coming soon.</p>}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {showChannels && filteredChannels.length > 0 && (
          <div>
            <div className="px-3 py-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Spaces</div>
            <div className="flex flex-col gap-1">
              {filteredChannels.map(channel => (
                <button
                  key={channel._id}
                  onClick={() => handleChannelClick(channel._id)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left w-full group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    {channel.type === "private" ? <Icons.lock className="w-4 h-4" /> : <Icons.hash className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white/90">{channel.name}</span>
                    {channel.description && <span className="text-xs text-white/40 truncate max-w-[400px]">{channel.description}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {showMembers && filteredMembers.length > 0 && (
          <div>
            <div className="px-3 py-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Members</div>
            <div className="flex flex-col gap-1">
              {filteredMembers.map(member => (
                <button
                  key={member.user._id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left w-full group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 overflow-hidden">
                    {member.user.avatar ? (
                      <img src={member.user.avatar} alt={member.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold uppercase">{member.user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white/90">{member.user.name}</span>
                    <span className="text-xs text-white/40">{member.user.email}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#18181b]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
        >
          {/* Search Input */}
          <div className="flex items-center px-4 h-16 border-b border-white/10 relative shrink-0">
            <Icons.search className="w-5 h-5 text-white/40 absolute left-5" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across your workspace..."
              className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 pl-10 pr-4 text-white placeholder:text-white/30 text-[15px]"
            />
            <button onClick={onClose} className="px-2 py-1 bg-[#27272a] rounded-md text-[11px] font-bold text-white/70 hover:text-white hover:bg-[#3f3f46] transition-colors border border-white/10 shadow-sm uppercase">
              ESC
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.01] shrink-0">
            {["all", "spaces", "members", "messages", "files"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium capitalize transition-all ${
                  activeTab === tab 
                    ? "bg-[#2d284f] text-[#a87ffb]" 
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Results Area */}
          <div className="h-[400px] overflow-y-auto custom-scrollbar p-2">
            {renderResults()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
