import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useChatStore } from "@/store/chatStore";
import { useChannels } from "../useChatQueries";
import { useNavigate } from "react-router";

interface ChatSidebarProps {
  onCreateChannel: () => void;
  onInviteMembers: () => void;
}

export function ChatSidebar({ onCreateChannel, onInviteMembers }: ChatSidebarProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { activeChannelId, setActiveChannel, setGlobalSearchOpen } = useChatStore();
  const { data: channels = [] } = useChannels(activeWorkspace?._id);
  const navigate = useNavigate();

  // Group spaces
  const communicationSpaces = channels.filter(c => c.type === "public" || c.type === "private");
  const projectSpaces = channels.filter(c => c.type === "project");
  
  // Real workspace online members (dummy online status for now)
  const onlineMembers = activeWorkspace?.members || [];

  return (
    <div className="w-[280px] bg-[#111116] border-r border-white/5 flex flex-col h-full flex-shrink-0 relative overflow-hidden min-h-0">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 shrink-0 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-400 font-bold shadow-inner">
            {activeWorkspace?.name?.charAt(0) || "W"}
          </div>
          <h2 className="font-semibold text-white/90 text-sm tracking-wide truncate max-w-[150px]">
            {activeWorkspace?.name || "Workspace"}
          </h2>
        </div>
        <button className="text-white/30 hover:text-white transition-colors">
          <Icons.chevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-3 space-y-1 border-b border-white/5">
        <QuickActionButton icon={Icons.users} label="Invite Members" onClick={onInviteMembers} />
        <QuickActionButton icon={Icons.plus} label="Create Space" onClick={onCreateChannel} />
        <QuickActionButton icon={Icons.folder} label="Create Project" onClick={() => navigate("/app/projects")} />
        <QuickActionButton icon={Icons.search} label="Search" onClick={() => setGlobalSearchOpen(true)} shortcut="⌘K" />
      </div>

      {/* Content Scroll */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
        
        <SidebarSection title="Communication Spaces">
          {communicationSpaces.length === 0 && (
            <EmptyState icon={Icons.hash} text="No spaces yet" />
          )}
          {communicationSpaces.map((channel) => (
            <SpaceItem
              key={channel._id}
              icon={channel.icon ? (Icons as any)[channel.icon] || Icons.messageSquare : Icons.messageSquare}
              name={channel.name}
              isActive={activeChannelId === channel._id}
              onClick={() => setActiveChannel(channel._id)}
            />
          ))}
        </SidebarSection>


        <SidebarSection title="Online Members">
          {onlineMembers.length === 0 && (
            <EmptyState icon={Icons.users} text="No members online" />
          )}
          {onlineMembers.map((member, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
              <div className="relative">
                <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-[10px] text-white/60 font-bold group-hover:bg-white/20 transition-colors">
                  {member.user?.name?.charAt(0) || "?"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#111116]" />
              </div>
              <span className="text-[13px] text-white/50 group-hover:text-white/80 transition-colors truncate">
                {member.user?.name || "Unknown"}
              </span>
            </div>
          ))}
        </SidebarSection>

      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick, shortcut }: { icon: any, label: string, onClick?: () => void, shortcut?: string }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all group">
      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
      <span className="text-[13px] font-medium">{label}</span>
      {shortcut && <kbd className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/40">{shortcut}</kbd>}
    </button>
  );
}

function SidebarSection({ title, children }: { title: string, children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-1">
      <div 
        className="flex items-center justify-between px-2 py-1 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-[11px] font-bold text-white/30 uppercase tracking-wider group-hover:text-white/50 transition-colors">
          {title}
        </span>
        <Icons.chevronDown className={`w-3.5 h-3.5 text-white/20 transition-transform duration-300 ${!isExpanded ? "-rotate-90" : ""}`} />
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden space-y-0.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpaceItem({ icon: Icon, name, isActive, onClick, unreadCount = 0, color = "text-indigo-400" }: { icon: any, name: string, isActive: boolean, onClick: () => void, unreadCount?: number, color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative ${
        isActive 
          ? "bg-indigo-500/10 text-white" 
          : "text-white/50 hover:bg-white/5 hover:text-white/90"
      }`}
    >
      {isActive && (
        <motion.div 
          layoutId="activeSpaceIndicator"
          className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
        />
      )}
      <Icon className={`w-4 h-4 ${isActive ? color : "text-white/30 group-hover:text-white/50"} transition-colors`} />
      <span className="text-[14px] font-medium truncate">{name}</span>
      
      {unreadCount > 0 && !isActive && (
        <span className="ml-auto w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

function EmptyState({ icon: Icon, text, action }: { icon: any, text: string, action?: { label: string, onClick: () => void } }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-4 px-3 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]"
    >
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-2">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[12px] text-white/40 mb-3">{text}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
