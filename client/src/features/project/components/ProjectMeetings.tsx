import * as React from "react";
import { useMeetings } from "@/features/meetings/useMeetingQueries";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Icons } from "@/components/shared/icons";
import { format, isToday, isPast, isFuture } from "date-fns";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";

export function ProjectMeetings({ projectId }: { projectId: string }) {
  const { data: meetings = [], isLoading } = useMeetings();
  const navigate = useNavigate();
  
  const projectMeetings = meetings.filter(m => m.projectId === projectId);
  
  const upcomingMeetings = projectMeetings.filter(
    (m) => m.status === "scheduled" && isFuture(new Date(`${m.date.split("T")[0]}T${m.startTime}`))
  );
  
  const pastMeetings = projectMeetings.filter(
    (m) => m.status === "completed" || m.status === "cancelled" || (m.status === "scheduled" && isPast(new Date(`${m.date.split("T")[0]}T${m.endTime}`)))
  );

  if (isLoading) return <div className="p-8 text-center text-white/40">Loading meetings...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Project Meetings</h2>
        <Button onClick={() => navigate("/app/meetings")} variant="outline">Go to Meetings Dashboard</Button>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-emerald-400 mb-4 flex items-center gap-2">
            <Icons.calendar className="h-5 w-5" /> Upcoming Meetings
          </h3>
          {upcomingMeetings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming meetings for this project.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMeetings.map(m => (
                <MeetingCard key={m._id} meeting={m} onJoin={() => navigate(`/app/meetings/${m._id}/live`)} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-white/60 mb-4 flex items-center gap-2">
            <Icons.clock className="h-5 w-5" /> Past Meetings
          </h3>
          {pastMeetings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No past meetings for this project.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastMeetings.map(m => (
                <MeetingCard key={m._id} meeting={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MeetingCard({ meeting, onJoin }: { meeting: any, onJoin?: () => void }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-white font-medium">{meeting.title}</h4>
        {onJoin && (
          <Button onClick={onJoin} size="sm" className="h-7 text-xs bg-primary/20 text-primary hover:bg-primary/30">
            Join
          </Button>
        )}
      </div>
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <Icons.calendar className="h-3 w-3" />
        {isToday(new Date(meeting.date)) ? "Today" : format(new Date(meeting.date), "MMM d, yyyy")}
        <span>•</span>
        <Icons.clock className="h-3 w-3" />
        {meeting.startTime}
      </div>
    </div>
  );
}
