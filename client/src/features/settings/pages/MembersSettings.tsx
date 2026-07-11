import * as React from "react";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Search, LayoutGrid, List as ListIcon, MoreVertical, Mail, Calendar, Activity } from "lucide-react";
import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { useWorkspaceMembers } from "../hooks/useWorkspaceSettings";
import { useAuthStore } from "@/store/authStore";

export function MembersSettings() {
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);
  const user = useAuthStore((state) => state.user);
  const currentUserRole = workspace?.members?.find((m: any) => m.user?._id === (user as any)?._id || m.user === (user as any)?._id || m.user?._id === user?.id || m.user === user?.id)?.role;
  const isPrivileged = currentUserRole === 'owner' || currentUserRole === 'leader';
  
  const { removeMember, updateMemberRole } = useWorkspaceMembers();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredMembers = useMemo(() => {
    if (!workspace?.members) return [];
    
    // Filter out duplicates (often caused by database race conditions during invites)
    const uniqueMembersMap = new Map();
    workspace.members.forEach((m: any) => {
      const userId = m.user?._id || m.user;
      if (!uniqueMembersMap.has(userId)) {
        uniqueMembersMap.set(userId, m);
      } else {
        // If we already have this user, keep the entry with the highest role precedence
        const existing = uniqueMembersMap.get(userId);
        if (m.role === 'owner' || (m.role === 'admin' && existing.role !== 'owner')) {
          uniqueMembersMap.set(userId, m);
        }
      }
    });

    const uniqueMembers = Array.from(uniqueMembersMap.values());

    return uniqueMembers.filter((m: any) => {
      const matchSearch = m.user.name?.toLowerCase().includes(search.toLowerCase()) || m.user.email?.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || m.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [workspace, search, roleFilter]);

  return (
    <div className="space-y-6 max-w-6xl pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Members</h2>
          <p className="text-muted-foreground">Manage people in your workspace.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 hover:bg-white/10 text-white">
            Export CSV
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Invite Members
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-black/20 p-4 rounded-xl border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-9 bg-white/5 border-white/10 text-white w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            className="flex h-10 w-full md:w-[150px] rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <div className="flex bg-black/40 rounded-md border border-white/10 overflow-hidden">
            <button 
              className={`p-2 transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
              onClick={() => setView('list')}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button 
              className={`p-2 transition-colors ${view === 'grid' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {view === "list" ? (
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs text-white uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m: any) => (
                  <tr key={m._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={m.user.avatar} />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {m.user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          {/* Mock online status */}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                        </div>
                        <div>
                          <div className="text-white font-medium">{m.user.name}</div>
                          <div className="text-xs">{m.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        m.role === 'owner' ? 'bg-purple-500/20 text-purple-400' :
                        m.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-white/10 text-white'
                      }`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-green-400">
                        <Activity className="w-3 h-3" /> Active
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {formatDistanceToNow(new Date(m.joinedAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isPrivileged && m.role !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-white/10">
                            <DropdownMenuItem 
                              className="text-white hover:bg-white/10 cursor-pointer"
                              onClick={() => updateMemberRole.mutate({ memberId: m.user._id, role: m.role === 'admin' ? 'member' : 'admin' })}
                              disabled={updateMemberRole.isPending}
                            >
                              {m.role === 'admin' ? 'Make Member' : 'Make Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive hover:bg-destructive/20 cursor-pointer"
                              onClick={() => removeMember.mutate(m.user._id)}
                              disabled={removeMember.isPending}
                            >
                              Remove from Workspace
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m: any) => (
            <Card key={m._id} className="border-white/5 bg-black/40 backdrop-blur-xl hover:bg-black/60 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={m.user.avatar} />
                      <AvatarFallback className="bg-primary/20 text-primary text-lg">
                        {m.user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                  </div>
                  {isPrivileged && m.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-muted-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-white/10">
                        <DropdownMenuItem 
                          className="text-white hover:bg-white/10 cursor-pointer"
                          onClick={() => updateMemberRole.mutate({ memberId: m.user._id, role: m.role === 'admin' ? 'member' : 'admin' })}
                          disabled={updateMemberRole.isPending}
                        >
                          {m.role === 'admin' ? 'Make Member' : 'Make Admin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive hover:bg-destructive/20 cursor-pointer"
                          onClick={() => removeMember.mutate(m.user._id)}
                          disabled={removeMember.isPending}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">{m.user.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{m.user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      m.role === 'owner' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
                      m.role === 'admin' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                      'bg-white/10 text-white border border-white/10'
                    }`}>
                      {m.role}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
