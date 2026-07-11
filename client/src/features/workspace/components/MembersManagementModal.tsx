import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

interface MembersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MembersManagementModal({ isOpen, onClose }: MembersManagementModalProps) {
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!activeWorkspace || !user) return null;

  const currentUserRole = activeWorkspace.members?.find(m => m.user._id === user.id)?.role;
  const isOwner = currentUserRole === "owner";
  const canManage = isOwner;

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!canManage) return;
    setLoadingId(memberId);
    try {
      const { data } = await api.put(`/workspaces/${activeWorkspace._id}/members/${memberId}`, { role: newRole });
      setActiveWorkspace(data);
    } catch (error) {
      console.error("Failed to update role", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!canManage) return;
    if (confirm("Are you sure you want to remove this member? They will instantly lose access to the workspace and chat.")) {
      setLoadingId(memberId);
      try {
        const { data } = await api.delete(`/workspaces/${activeWorkspace._id}/members/${memberId}`);
        setActiveWorkspace(data);
      } catch (error) {
        console.error("Failed to remove member", error);
      } finally {
        setLoadingId(null);
      }
    }
  };

  const filteredMembers = (activeWorkspace.members || []).filter(m => 
    m.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#0c0c0e] border-white/10 text-white p-0 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />
        
        <div className="relative p-6 flex flex-col h-[70vh] max-h-[600px]">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Icons.settings className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Manage Members</h2>
              <p className="text-sm text-white/50">{(activeWorkspace.members || []).length} members in workspace</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4 shrink-0">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
            {filteredMembers.map((member) => (
              <div key={member.user._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                    {member.user.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white/90">
                        {member.user.name}
                        {member.user._id === user.id && <span className="ml-2 text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50">You</span>}
                      </p>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Online" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-white/50">{member.user.email}</p>
                      <span className="text-[10px] text-white/30 px-1.5 py-0.5 bg-white/5 rounded border border-white/5">Joined recently</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {loadingId === member.user._id ? (
                    <Icons.spinner className="w-5 h-5 text-indigo-400 animate-spin" />
                  ) : (
                    <>
                      {/* Role Selector */}
                      <select
                        disabled={!canManage || (member.role === "owner" && !isOwner) || (member.user._id === user.id && member.role === "owner")}
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg text-xs text-white/80 px-2 py-1.5 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        <option value="member">Member</option>
                        <option value="leader">Admin</option>
                        {isOwner && <option value="owner">Owner (Transfer)</option>}
                      </select>

                      {/* Remove Button */}
                      {canManage && member.role !== "owner" && member.user._id !== user.id && (
                        <button
                          onClick={() => handleRemoveMember(member.user._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                          title="Remove Member"
                        >
                          <Icons.trash className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {filteredMembers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-white/40 text-sm">No members found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
