import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useMeeting, useUpdateMeetingStatus } from "./useMeetingQueries";
import { useAuthStore } from "@/store/authStore";
import { useMeetingStore } from "@/store/meetingStore";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { MeetingRightPanel } from "./components/MeetingRightPanel";

export function LiveMeetingRoom() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { data: meeting, isLoading, isError } = useMeeting(meetingId || "");
  const updateStatus = useUpdateMeetingStatus();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activePanel, setActivePanel, setJitsiApi, setMeetingId, isHost, setIsHost } = useMeetingStore();
  const [jitsiLoading, setJitsiLoading] = useState(true);

  useEffect(() => {
    if (meetingId) {
      setMeetingId(meetingId);
    }
    return () => setMeetingId(null);
  }, [meetingId, setMeetingId]);

  const hasStartedRef = React.useRef(false);

  useEffect(() => {
    if (meeting && meeting.createdBy?._id === user?.id) {
      setIsHost(true);
      if (meeting.status === "scheduled" && !hasStartedRef.current) {
        hasStartedRef.current = true;
        updateStatus.mutate({ id: meeting._id, status: "live" });
      }
    }
  }, [meeting?.status, meeting?.createdBy?._id, user?.id, setIsHost]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1c1d22]">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Icons.video className="h-8 w-8 text-primary" />
          </div>
          <p className="text-white font-medium">Preparing Meeting Room...</p>
        </div>
      </div>
    );
  }

  if (isError || !meeting) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1c1d22]">
        <p className="text-red-400">Error loading meeting.</p>
        <Button onClick={() => navigate("/app/meetings")} className="ml-4">Go Back</Button>
      </div>
    );
  }

  const handleJitsiReady = (api: any) => {
    setJitsiLoading(false);
    setJitsiApi(api);
    api.addListener('videoConferenceLeft', () => {
      // User left the call voluntarily
      if (isHost) {
        updateStatus.mutate({ id: meeting._id, status: "completed" });
      }
      navigate("/app/meetings");
    });
  };

  const leaveMeeting = () => {
    if (isHost) {
      updateStatus.mutate({ id: meeting._id, status: "completed" });
    }
    navigate("/app/meetings");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#1c1d22] overflow-hidden fixed inset-0 z-50">
      {/* Premium Top Bar */}
      <div className="h-16 shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
            <Icons.video className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight leading-tight">{meeting.title}</h1>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Now
              {meeting.projectId && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground hover:text-white cursor-pointer transition-colors">Attached to Project</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PanelToggleBtn icon="messageSquare" label="Chat" active={activePanel === "chat"} onClick={() => setActivePanel(activePanel === "chat" ? null : "chat")} />
          <PanelToggleBtn icon="fileText" label="Notes" active={activePanel === "notes"} onClick={() => setActivePanel(activePanel === "notes" ? null : "notes")} />
          <PanelToggleBtn icon="users" label="Participants" active={activePanel === "participants"} onClick={() => setActivePanel(activePanel === "participants" ? null : "participants")} />
          <PanelToggleBtn icon="pencil" label="Whiteboard" active={activePanel === "whiteboard"} onClick={() => setActivePanel(activePanel === "whiteboard" ? null : "whiteboard")} />
          
          <div className="w-px h-6 bg-white/10 mx-2" />
          
          <Button onClick={leaveMeeting} variant="destructive" className="bg-rose-500 hover:bg-rose-600 rounded-xl">
            {isHost ? "End Meeting" : "Leave"}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Jitsi Wrapper */}
        <div className={cn("flex-1 transition-all duration-300 relative", activePanel ? "mr-[400px]" : "")}>
          {jitsiLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1c1d22] z-10">
              <Icons.spinner className="h-10 w-10 text-primary animate-spin" />
            </div>
          )}
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={meeting.jitsiRoomName}
            configOverwrite={{
              startWithAudioMuted: true,
              disableModeratorIndicator: true,
              startScreenSharing: true,
              enableEmailInStats: false,
              prejoinPageEnabled: false,
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              HIDE_INVITE_MORE_HEADER: true,
              SHOW_CHROME_EXTENSION_BANNER: false,
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'recording',
                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone', 'security'
              ],
            }}
            userInfo={{
              displayName: user?.name || "Participant",
              email: user?.email || "",
            }}
            onApiReady={handleJitsiReady}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
              iframeRef.style.border = 'none';
            }}
          />
        </div>

        {/* Right Panel Slide-in */}
        <MeetingRightPanel meeting={meeting} />
      </div>
    </div>
  );
}

function PanelToggleBtn({ icon, label, active, onClick }: { icon: keyof typeof Icons; label: string; active: boolean; onClick: () => void }) {
  const Icon = Icons[icon];
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
        active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
