import * as React from "react"
import { MotionWrapper } from "@/components/shared/MotionWrapper"
import { Icons } from "@/components/shared/icons"
import { CreateWorkspaceModal } from "@/features/workspace/CreateWorkspaceModal"
import { JoinWorkspaceModal } from "@/features/workspace/JoinWorkspaceModal"
import { InviteMembersModal } from "@/features/workspace/InviteMembersModal"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useWorkspaces } from "@/features/workspace/useWorkspaceQueries"
import { useProjects, useMyTasks } from "@/features/project/useProjectQueries"
import { useMeetings } from "@/features/meetings/useMeetingQueries"
import { usePresence } from "@/hooks/usePresence"
import { useNavigate } from "react-router"
import { EmptyWorkspaceState } from "./EmptyWorkspaceState"

// Dashboard Components
import { HomeHeader } from "./components/HomeHeader"
import { DashboardMetrics } from "./components/DashboardMetrics"
import { ActivityPulseWidget } from "./components/ActivityPulseWidget"
import { UpcomingMeetingsWidget } from "./components/UpcomingMeetingsWidget"
import { TeamPresenceWidget } from "./components/TeamPresenceWidget"

export function HomePage() {
  const navigate = useNavigate()
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isJoinOpen, setIsJoinOpen] = React.useState(false)
  const [isInviteOpen, setIsInviteOpen] = React.useState(false)
  
  const { activeWorkspace } = useWorkspaceStore()
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces()
  const { data: projects } = useProjects(activeWorkspace?._id)
  const { data: meetings = [] } = useMeetings()
  const { isUserOnline } = usePresence()
  
  const hasWorkspaces = workspaces && workspaces.length > 0

  if (workspacesLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!hasWorkspaces) {
    return (
      <>
        <EmptyWorkspaceState onCreate={() => setIsCreateOpen(true)} onJoin={() => setIsJoinOpen(true)} />
        <CreateWorkspaceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        <JoinWorkspaceModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
      </>
    )
  }

  if (!activeWorkspace) return null;

  const onlineMembersCount = activeWorkspace.members.filter(m => isUserOnline(m.user._id)).length
  const projectsCount = projects?.length || 0
  const meetingsCount = meetings.length
  
  const projectsThisWeekCount = projects?.filter(p => new Date(p.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0;
  const meetingsTodayCount = meetings.filter(m => new Date(m.startTime).toDateString() === new Date().toDateString()).length;

  return (
    <>
      <MotionWrapper variant="page" className="flex flex-col gap-6 pb-12 w-full max-w-[1400px] mx-auto px-6">
        
        {/* Header */}
        <HomeHeader 
          onInvite={() => setIsInviteOpen(true)} 
          onNewProject={() => navigate('/app/projects')}
        />

        {/* 4 Metrics Cards */}
        <DashboardMetrics 
          projectsCount={projectsCount}
          projectsThisWeekCount={projectsThisWeekCount}
          membersCount={activeWorkspace.members.length}
          onlineMembersCount={onlineMembersCount}
          meetingsCount={meetingsCount} 
          meetingsTodayCount={meetingsTodayCount}
          tasksCount={0} 
          pendingTasksCount={0} 
        />

        {/* 3 Column Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ActivityPulseWidget />
          <UpcomingMeetingsWidget />
          <TeamPresenceWidget />
        </div>

        {/* Quick Actions Footer */}
        <div className="flex flex-col rounded-[24px] border border-white/5 bg-[#12121a] p-6 shadow-sm mt-2">
          <div className="flex items-center gap-3 mb-6">
            <Icons.zap className="h-5 w-5 text-white/50" />
            <h3 className="text-[15px] font-bold text-white">Quick Actions</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/app/projects')}
              className="flex flex-col items-center justify-center gap-3 p-4 rounded-[16px] bg-[#1a1a24] border border-white/5 hover:bg-[#2a2a35] transition-colors"
            >
              <Icons.plus className="w-5 h-5 text-[#a87ffb]" />
              <span className="text-[13px] font-semibold text-white/90">New Project</span>
            </button>
            <button 
              onClick={() => setIsInviteOpen(true)}
              className="flex flex-col items-center justify-center gap-3 p-4 rounded-[16px] bg-[#1a1a24] border border-white/5 hover:bg-[#2a2a35] transition-colors"
            >
              <Icons.userPlus className="w-5 h-5 text-[#4ade80]" />
              <span className="text-[13px] font-semibold text-white/90">Invite Member</span>
            </button>
            <button 
              onClick={() => navigate('/app/meetings')}
              className="flex flex-col items-center justify-center gap-3 p-4 rounded-[16px] bg-[#1a1a24] border border-white/5 hover:bg-[#2a2a35] transition-colors"
            >
              <Icons.calendar className="w-5 h-5 text-[#fb923c]" />
              <span className="text-[13px] font-semibold text-white/90">Schedule Meeting</span>
            </button>
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="flex flex-col items-center justify-center gap-3 p-4 rounded-[16px] bg-[#1a1a24] border border-white/5 hover:bg-[#2a2a35] transition-colors"
            >
              <Icons.folder className="w-5 h-5 text-[#60a5fa]" />
              <span className="text-[13px] font-semibold text-white/90">New Folder</span>
            </button>
          </div>
        </div>

      </MotionWrapper>

      {/* Modals */}
      <CreateWorkspaceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <InviteMembersModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </>
  )
}

