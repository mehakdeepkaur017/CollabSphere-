import * as React from "react";
import { useState } from "react";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { useMeetings, useDeleteMeeting } from "./useMeetingQueries";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/shared/icons";
import { CreateMeetingModal } from "./components/CreateMeetingModal";
import { format, isToday, isPast, isFuture } from "date-fns";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function MeetingsDashboard() {
  const { data: meetings = [], isLoading } = useMeetings();
  const deleteMeetingMutation = useDeleteMeeting();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "live" | "past">("upcoming");

  const myMeetings = meetings.filter(
    (m) => m.createdBy?._id === user?.id || m.participants.some((p) => p._id === user?.id)
  );

  const isMeetingPast = (m: any) => {
    if (m.status === "completed" || m.status === "cancelled") return true;
    try {
      const datePart = m.date.split("T")[0];
      return isPast(new Date(`${datePart}T${m.endTime}`));
    } catch {
      return false;
    }
  };

  const isMeetingUpcoming = (m: any) => {
    if (m.status === "completed" || m.status === "cancelled") return false;
    try {
      const datePart = m.date.split("T")[0];
      return isFuture(new Date(`${datePart}T${m.startTime}`));
    } catch {
      return false;
    }
  };

  const isMeetingLive = (m: any) => {
    if (m.status === "completed" || m.status === "cancelled") return false;
    return !isMeetingPast(m) && !isMeetingUpcoming(m);
  };

  const pastMeetings = myMeetings.filter(isMeetingPast);
  const upcomingMeetings = myMeetings.filter(isMeetingUpcoming);
  const liveMeetings = myMeetings.filter(isMeetingLive);

  const displayedMeetings = 
    activeTab === "live" ? liveMeetings : 
    activeTab === "upcoming" ? upcomingMeetings : 
    pastMeetings;

  const getDisplayStatus = (meeting: any) => {
    if (meeting.status === "cancelled") return "cancelled";
    if (isMeetingPast(meeting)) return "completed";
    if (isMeetingLive(meeting)) return "live";
    return "scheduled";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "text-rose-400 bg-rose-400/10 border-rose-400/20";
      case "scheduled": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "completed": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "cancelled": return "text-gray-400 bg-gray-400/10 border-gray-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="min-h-full flex flex-col p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full relative">
      {/* Header Container with custom background */}
      <div className="relative w-full h-32 shrink-0 mb-8 rounded-2xl overflow-hidden bg-[#0a0710] border border-white/5 flex items-center px-8 z-10">
        
        {/* Center Graphic Scene */}
        <div className="absolute inset-0 flex justify-center items-end pointer-events-none overflow-hidden">
          {/* Main Background Glow */}
          <div className="absolute top-[-50px] w-full max-w-[800px] h-[300px] bg-purple-600/20 blur-[80px] rounded-full" />
          
          {/* Stars */}
          <div className="absolute top-4 left-1/3 h-1 w-1 bg-white rounded-full opacity-50 blur-[1px]" />
          <div className="absolute top-10 left-1/4 h-1.5 w-1.5 bg-white rounded-full opacity-70 blur-[1px]" />
          <div className="absolute top-8 right-1/3 h-1 w-1 bg-white rounded-full opacity-40 blur-[1px]" />
          
          {/* Clouds */}
          <svg className="absolute bottom-6 left-[35%] w-16 h-10 opacity-30 text-purple-900" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5 19c-2.5 0-4.5-2-4.5-4.5 0-.25.02-.5.06-.75C12.33 13.9 11.5 14 10.5 14 7.5 14 5 11.5 5 8.5 5 7.15 5.5 5.92 6.32 5A5.5 5.5 0 0 1 11.5 1c3.04 0 5.5 2.46 5.5 5.5 0 .15-.02.3-.06.44C17.67 6.78 18.3 6.5 19 6.5c2.5 0 4.5 2 4.5 4.5S21.5 15.5 19 15.5H17.5V19z" />
          </svg>
          <svg className="absolute bottom-12 right-[32%] w-20 h-12 opacity-20 text-purple-800" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5 19c-2.5 0-4.5-2-4.5-4.5 0-.25.02-.5.06-.75C12.33 13.9 11.5 14 10.5 14 7.5 14 5 11.5 5 8.5 5 7.15 5.5 5.92 6.32 5A5.5 5.5 0 0 1 11.5 1c3.04 0 5.5 2.46 5.5 5.5 0 .15-.02.3-.06.44C17.67 6.78 18.3 6.5 19 6.5c2.5 0 4.5 2 4.5 4.5S21.5 15.5 19 15.5H17.5V19z" />
          </svg>

          {/* Concentric Circles */}
          <div className="absolute bottom-[-20px] flex items-center justify-center">
            <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-500/10" />
            <div className="absolute w-[200px] h-[200px] rounded-full bg-purple-500/20" />
            <div className="absolute w-[120px] h-[120px] rounded-full bg-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.5)] flex items-center justify-center">
              <Icons.video className="h-10 w-10 text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
          
          {/* Foreground Hills */}
          <div className="absolute bottom-[-60px] left-[-10%] w-[60%] h-[100px] rounded-[50%] bg-[#0B0910] shadow-[0_-10px_40px_rgba(0,0,0,0.6)]" />
          <div className="absolute bottom-[-70px] right-[-10%] w-[70%] h-[120px] rounded-[50%] bg-[#0B0910]" />
          <div className="absolute bottom-[-40px] left-[20%] w-[60%] h-[60px] rounded-[50%] bg-[#110e16]" />
        </div>

        {/* Content */}
        <div className="flex w-full items-center justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-start">
              Meetings 
              <Icons.sparkles className="h-5 w-5 text-purple-400 ml-1 mt-0.5" />
            </h1>
            <p className="text-white/60 text-sm">Schedule, join, and collaborate in real-time rooms.</p>
          </div>

          <div className="relative">
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-[#b53cff] to-[#4c7dff] text-white border-0 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(168,85,247,0.4)] px-6 py-5 rounded-xl font-medium">
              <Icons.plus className="h-4 w-4 mr-2" />
              New Meeting
            </Button>
            {/* Sparks decoration */}
            <div className="absolute -top-3 -right-3 text-purple-400 pointer-events-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M14 2l1 3M22 10l-3-1M19 4l-2 2" /> 
              </svg>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10"
      >
        <StatsCard title="Live Now" value={liveMeetings.length} icon="video" color="text-rose-400" graphData={[1, 3, 2, 5, 4, 7, 9]} />
        <StatsCard title="Upcoming" value={upcomingMeetings.length} icon="calendar" color="text-emerald-400" graphData={[2, 4, 3, 6, 8, 7, 10]} />
        <StatsCard title="Total Meetings" value={myMeetings.length} icon="activity" color="text-indigo-400" graphData={[3, 5, 2, 7, 4, 8, 6, 9, 7]} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 relative z-10"
      >
        <div className="flex items-center gap-1 rounded-2xl border border-white/5 bg-[#13111c] p-1.5">
          <TabButton active={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")}>
            Upcoming ({upcomingMeetings.length})
          </TabButton>
          <TabButton active={activeTab === "live"} onClick={() => setActiveTab("live")}>
            Live Now {liveMeetings.length > 0 && <span className="ml-2 flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
          </TabButton>
          <TabButton active={activeTab === "past"} onClick={() => setActiveTab("past")}>
            Past ({pastMeetings.length})
          </TabButton>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-[#13111c] text-sm font-medium text-white/70 hover:text-white transition-colors">
            <Icons.filter className="h-4 w-4" />
            All Meetings
            <Icons.chevronDown className="h-4 w-4 ml-1 opacity-50" />
          </button>
          <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-[#13111c] p-1">
            <button className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Icons.list className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-lg text-white/40 hover:text-white/70 transition-colors">
              <Icons.grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : displayedMeetings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-80 text-center border border-dashed border-indigo-500/20 rounded-3xl bg-[#13111c]/30 relative overflow-hidden mt-2"
          >
            {/* Sparkles background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
              <Icons.sparkles className="absolute top-1/4 left-1/3 h-4 w-4 text-indigo-400" />
              <Icons.sparkles className="absolute top-1/3 right-1/4 h-3 w-3 text-purple-400" />
              <Icons.sparkles className="absolute bottom-1/3 left-1/4 h-3 w-3 text-rose-400" />
            </div>
            
            <div className="relative mb-6">
              <div className="h-28 w-36 rounded-3xl bg-[#1a1625] flex items-center justify-center border border-indigo-500/10 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
                <Icons.calendar className="h-14 w-14 text-indigo-300 opacity-80" />
              </div>
              <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/40 border-4 border-[#13111c]">
                <Icons.video className="h-7 w-7 text-white" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">No {activeTab} meetings</h3>
            <p className="text-muted-foreground max-w-sm mb-6 relative z-10">
              {activeTab === "upcoming" ? "Schedule a new meeting to collaborate with your team." : 
               activeTab === "live" ? "There are no active meetings right now." : 
               "You have no past meetings yet."}
            </p>
            
            {activeTab === "upcoming" && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 hover:opacity-90 shadow-lg shadow-purple-500/25 relative z-10">
                <Icons.plus className="h-4 w-4 mr-2" />
                Schedule a Meeting
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayedMeetings.map((meeting) => (
              <MotionWrapper key={meeting._id} className="relative group rounded-2xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl hover:bg-black/60 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${meeting.color}20`, color: meeting.color }}>
                      <Icons.video className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white line-clamp-1">{meeting.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <span>{isToday(new Date(meeting.date)) ? "Today" : format(new Date(meeting.date), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span>{meeting.startTime} - {meeting.endTime}</span>
                      </div>
                    </div>
                  </div>
                  <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border", getStatusColor(getDisplayStatus(meeting)))}>
                    {getDisplayStatus(meeting).charAt(0).toUpperCase() + getDisplayStatus(meeting).slice(1)}
                  </span>
                </div>
                
                {meeting.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{meeting.description}</p>
                )}

                <div className="flex items-center justify-end mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {meeting.createdBy?._id === user?.id && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => {
                          if(confirm("Are you sure you want to delete this meeting?")) {
                            deleteMeetingMutation.mutate(meeting._id);
                          }
                        }}
                        disabled={deleteMeetingMutation.isPending}
                        title="Delete Meeting"
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {getDisplayStatus(meeting) === "live" ? (
                      <Button onClick={() => navigate(`/app/meetings/${meeting._id}/live`)} className="bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25">
                        Join Now
                      </Button>
                    ) : getDisplayStatus(meeting) === "scheduled" ? (
                      <Button onClick={() => navigate(`/app/meetings/${meeting._id}/live`)} variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary">
                        Enter Waiting Room
                      </Button>
                    ) : (
                      <Button variant="ghost" className="text-muted-foreground hover:text-white" disabled>
                        Meeting Ended
                      </Button>
                    )}
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>
        )}
      </div>

      <CreateMeetingModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}

function StatsCard({ title, value, icon, color, graphData }: { title: string, value: number, icon: keyof typeof Icons, color: string, graphData: number[] }) {
  const Icon = Icons[icon];
  const max = Math.max(...graphData, 1);
  const min = Math.min(...graphData, 0);
  const range = max - min || 1;
  const step = 100 / (graphData.length - 1 || 1);
  
  const isBar = icon === "activity";
  const points = graphData.map((val, i) => `${i * step},${40 - ((val - min) / range) * 40}`).join(" ");
  
  return (
    <div className="rounded-2xl border border-white/5 bg-[#13111c] p-5 flex items-center justify-between shadow-lg relative overflow-hidden group">
      <div className="flex gap-4">
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border", color.includes('rose') ? 'bg-rose-500/10 border-rose-500/20' : color.includes('emerald') ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-indigo-500/10 border-indigo-500/20', color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-medium text-white/70">{title}</p>
          <p className="text-2xl font-bold text-white leading-none mt-1">{value}</p>
          <p className="text-[10px] text-white/40 mt-1">{icon === 'video' ? 'Meetings happening now' : icon === 'calendar' ? 'Scheduled meetings' : 'All time meetings'}</p>
        </div>
      </div>
      <div className="w-24 h-10 ml-4 relative opacity-80 group-hover:opacity-100 transition-opacity">
        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
          {isBar ? (
            graphData.map((val, i) => (
              <rect key={i} x={i * (100 / graphData.length) + 2} y={40 - ((val - min) / range) * 40} width={(100 / graphData.length) - 4} height={((val - min) / range) * 40} rx={2} className="fill-indigo-500/80" />
            ))
          ) : (
            <>
              <defs>
                <linearGradient id={`grad-${icon}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color.includes('rose') ? '#f43f5e' : '#10b981'} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={color.includes('rose') ? '#f43f5e' : '#10b981'} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`M 0,40 L ${points} L 100,40 Z`} fill={`url(#grad-${icon})`} />
              <polyline points={points} fill="none" stroke={color.includes('rose') ? '#f43f5e' : '#10b981'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center relative",
        active ? "text-indigo-400" : "text-muted-foreground hover:text-white"
      )}
    >
      {children}
      {active && (
        <span className="absolute bottom-[-6px] left-2 right-2 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
      )}
    </button>
  );
}
