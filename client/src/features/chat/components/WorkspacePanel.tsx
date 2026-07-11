import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useChatStore } from "@/store/chatStore";
import { useChannels, useMessages } from "../useChatQueries";
import { format } from "date-fns";

import { MembersManagementModal } from "@/features/workspace/components/MembersManagementModal";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import { useAuthStore } from "@/store/authStore";

export function WorkspacePanel() {
  const { activeWorkspace } = useWorkspaceStore();
  const { activeChannelId, toggleDetailsPanel } = useChatStore();
  const { user } = useAuthStore();
  const { data: channels } = useChannels(activeWorkspace?._id);
  const { data: messages } = useMessages(activeWorkspace?._id, activeChannelId || undefined);

  const [activeTab, setActiveTab] = useState<"overview" | "members" | "files" | "media" | "pins">("overview");
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const channel = channels?.find((c) => c._id === activeChannelId);

  // Deriving data
  const members = activeWorkspace?.members || [];
  
  const flattenedMessages = React.useMemo(() => {
    if (!messages) return [];
    return messages.pages.flatMap(page => page.messages) || [];
  }, [messages]);

  const pinnedMessages = flattenedMessages.filter(m => m.isPinned) || [];
  const files = flattenedMessages.filter(m => m.type === "file" && m.fileDetails && !m.fileDetails.mimeType.startsWith("image/")) || [];
  const media = flattenedMessages.filter(m => m.type === "file" && m.fileDetails && m.fileDetails.mimeType.startsWith("image/")) || [];

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 340, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="h-full bg-[#111116] border-l border-white/5 flex flex-col flex-shrink-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
    >
      {/* Header */}
      <div className="h-[65px] flex items-center justify-between px-5 border-b border-white/5 shrink-0 bg-white/[0.01]">
        <h3 className="text-[15px] font-bold text-white tracking-wide">Space Details</h3>
        <button
          onClick={toggleDetailsPanel}
          className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <Icons.x className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {(["overview", "members", "files", "pins"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === tab 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 relative">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="px-2 py-4 space-y-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-4 shadow-lg">
                  <Icons.hash className="w-10 h-10 text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold text-white mb-1">{channel?.name}</h2>
                <p className="text-sm text-white/40 leading-relaxed max-w-[250px]">
                  {channel?.description || "A beautiful space for collaboration."}
                </p>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/5 p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 font-medium">Created</span>
                  <span className="text-white/90">{format(new Date(channel?.createdAt || Date.now()), "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 font-medium">Members</span>
                  <span className="text-white/90">{members.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 font-medium">Privacy</span>
                  <span className="text-white/90 capitalize">{channel?.type}</span>
                </div>
              </div>

              {media.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider">Recent Media</h4>
                    <button onClick={() => setActiveTab("media")} className="text-xs text-indigo-400 hover:text-indigo-300">View all</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {media.slice(0, 6).map(m => (
                      <div key={m._id} className="aspect-square rounded-lg bg-white/5 border border-white/5 overflow-hidden group cursor-pointer" onClick={() => window.open(m.fileDetails!.url, "_blank")}>
                        <img src={m.fileDetails!.url} alt="media" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-1 py-2"
            >
              <div className="px-2 mb-3">
                <button
                  onClick={() => setIsManageModalOpen(true)}
                  className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-indigo-500/20"
                >
                  Manage Members
                </button>
              </div>

              {members.length === 0 ? (
                <EmptyTab icon="users" text="No members found" />
              ) : (
                members.map((member) => {
                  const currentUserRole = activeWorkspace?.members.find(m => m.user._id === user?.id)?.role;
                  const canManage = currentUserRole === "owner" || currentUserRole === "leader";

                  return (
                  <div key={member.user._id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                          {member.user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#111116]" />
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-white/90 group-hover:text-white transition-colors truncate">
                            {member.user.name}
                          </p>
                          {member.role === "owner" && (
                            <span className="text-[9px] uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded shrink-0">Owner</span>
                          )}
                          {member.role === "leader" && (
                            <span className="text-[9px] uppercase tracking-wider bg-white/10 text-white/50 px-1.5 py-0.5 rounded shrink-0">Admin</span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/30 truncate">{member.user.email}</p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                          <Icons.moreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#18181b]/95 backdrop-blur-xl border-white/10">
                        <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer">
                          <Icons.user className="w-4 h-4 mr-2" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer">
                          <Icons.messageSquare className="w-4 h-4 mr-2" /> Message
                        </DropdownMenuItem>
                        {canManage && member.user._id !== user?.id && (
                          <>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer">
                              <Icons.shield className="w-4 h-4 mr-2" /> {member.role === "leader" ? "Demote Admin" : "Make Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer">
                              <Icons.trash className="w-4 h-4 mr-2" /> Remove Member
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )})
              )}
            </motion.div>
          )}

          {activeTab === "files" && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-2 px-2 py-2"
            >
              {files.length === 0 ? (
                <EmptyTab icon="file" text="No files shared yet" />
              ) : (
                files.map((msg) => (
                  <div 
                    key={msg._id} 
                    onClick={() => window.open(msg.fileDetails!.url, "_blank")}
                    className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all cursor-pointer group hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-all">
                        <Icons.file className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-white/90 truncate group-hover:text-white">{msg.fileDetails?.name}</p>
                        <p className="text-[10px] text-white/40">
                          {((msg.fileDetails?.size || 0) / 1024 / 1024).toFixed(2)} MB • {msg.fileDetails?.mimeType.split('/')[1]?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "media" && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="px-2 py-2"
            >
              {media.length === 0 ? (
                <EmptyTab icon="image" text="No media shared yet" />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {media.map(m => (
                    <div key={m._id} className="aspect-square rounded-xl bg-white/5 border border-white/5 overflow-hidden group cursor-pointer relative" onClick={() => window.open(m.fileDetails!.url, "_blank")}>
                      <img src={m.fileDetails!.url} alt="media" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                        <Icons.externalLink className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "pins" && (
            <motion.div
              key="pins"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-3 px-2 py-2"
            >
              {pinnedMessages.length === 0 ? (
                <EmptyTab icon="pin" text="No pinned messages" />
              ) : (
                pinnedMessages.map((msg) => (
                  <div key={msg._id} className="p-3 rounded-xl bg-amber-500/[0.03] border border-amber-500/20 hover:border-amber-500/40 transition-colors shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-bold">
                        {msg.sender.name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-white/90">{msg.sender.name}</span>
                      <span className="text-[10px] text-white/30 ml-auto">{format(new Date(msg.createdAt), "MMM d")}</span>
                    </div>
                    <p className="text-[13px] text-white/70 line-clamp-4 leading-relaxed">{msg.content}</p>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isManageModalOpen && (
        <MembersManagementModal 
          isOpen={isManageModalOpen} 
          onClose={() => setIsManageModalOpen(false)} 
        />
      )}
    </motion.div>
  );
}

function EmptyTab({ icon, text }: { icon: keyof typeof Icons; text: string }) {
  const Icon = Icons[icon];
  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-10 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-4 border border-white/5 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[13px] text-white/40 font-medium">{text}</p>
    </div>
  );
}
