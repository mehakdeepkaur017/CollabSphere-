import * as React from "react";
import { useState, useEffect } from "react";
import { useMeetingStore } from "@/store/meetingStore";
import type { Meeting } from "../useMeetingQueries";
import { useUpdateMeetingNotes } from "../useMeetingQueries";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router";

export function MeetingRightPanel({ meeting }: { meeting: Meeting }) {
  const { activePanel, setActivePanel } = useMeetingStore();

  return (
    <AnimatePresence>
      {activePanel && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 bottom-0 w-[400px] bg-black/80 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col z-20"
        >
          <div className="h-14 shrink-0 border-b border-white/5 flex items-center justify-between px-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              {activePanel}
            </h2>
            <button onClick={() => setActivePanel(null)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
              <Icons.x className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {activePanel === "notes" && <MeetingNotesPanel meeting={meeting} />}
            {activePanel === "participants" && <MeetingParticipantsPanel meeting={meeting} />}
            {activePanel === "chat" && <MeetingChatPanel meeting={meeting} />}
            {activePanel === "whiteboard" && <MeetingWhiteboardPanel meeting={meeting} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// PANELS
// ==========================================

function MeetingNotesPanel({ meeting }: { meeting: Meeting }) {
  const [notes, setNotes] = useState(meeting.notes || "");
  const updateNotes = useUpdateMeetingNotes();
  const [isSaving, setIsSaving] = useState(false);

  // Sync incoming socket updates
  useEffect(() => {
    if (meeting.notes !== undefined && meeting.notes !== notes && !isSaving) {
      setNotes(meeting.notes);
    }
  }, [meeting.notes, isSaving]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    setIsSaving(true);
    updateNotes.mutate(
      { id: meeting._id, notes },
      {
        onSettled: () => setIsSaving(false)
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#111113]">
      <div className="p-3 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Icons.info className="h-3 w-3" />
          Markdown supported. Auto-syncs for everyone.
        </p>
        <Button onClick={handleSave} size="sm" variant="ghost" className="h-7 text-xs bg-white/5 hover:bg-white/10" disabled={updateNotes.isPending}>
          {updateNotes.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleSave}
        placeholder="# Meeting Notes\n\n- Write down action items here..."
        className="flex-1 w-full bg-transparent resize-none p-4 text-sm text-white/90 focus:outline-none custom-scrollbar placeholder:text-white/20"
      />
    </div>
  );
}

function MeetingParticipantsPanel({ meeting }: { meeting: Meeting }) {
  const { jitsiApi } = useMeetingStore();
  const [jitsiParticipants, setJitsiParticipants] = useState<any[]>([]);

  useEffect(() => {
    if (!jitsiApi) return;
    
    // In a real implementation, you would bind to jitsiApi events
    // videoConferenceJoined, participantJoined, participantLeft, etc.
    // For this UI mockup, we'll just show the expected participants.
    
    // Fallback: Show participants from the DB
  }, [jitsiApi]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search participants..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl h-10 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
        {meeting.participants.map((p: any) => (
          <div key={p._id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl group transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center text-sm font-bold border border-white/10">
                  {p.avatar ? <img src={p.avatar} alt={p.name} /> : p.name.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#1c1d22]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p._id === meeting.createdBy?._id ? "Host" : "Participant"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Icons.mic className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeetingChatPanel({ meeting }: { meeting: Meeting }) {
  // If we had a chatChannelId attached to the meeting, we could reuse the <ChatWindow />
  // For now, we will render a simplified placeholder chat UI just for the meeting.
  const [messages, setMessages] = useState<{id: string, text: string, sender: string}[]>([]);
  const [input, setInput] = useState("");
  const { user } = useAuthStore();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), text: input, sender: user?.name || "Me" }]);
    setInput("");
    // In a real app, emit to socket
  };

  return (
    <div className="flex flex-col h-full bg-[#111113]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <Icons.messageSquare className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs opacity-60">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={cn("flex flex-col max-w-[85%]", m.sender === user?.name ? "ml-auto items-end" : "items-start")}>
              <span className="text-[10px] text-muted-foreground mb-1 px-1">{m.sender}</span>
              <div className={cn("px-3 py-2 rounded-2xl text-sm", m.sender === user?.name ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-white/10 text-white rounded-bl-sm")}>
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t border-white/5 bg-black/20">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..." 
            className="w-full bg-white/5 border border-white/10 rounded-full h-10 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50"
          />
          <button type="submit" disabled={!input.trim()} className="absolute right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
            <Icons.send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function MeetingWhiteboardPanel({ meeting }: { meeting: Meeting }) {
  // A button to launch the full whiteboard, since fitting a canvas in 400px might be tight
  // Or we could embed an iframe of the whiteboard view
  const { setMeetingId } = useMeetingStore();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 text-center">
      <div className="h-20 w-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
        <Icons.pencil className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Collaborative Whiteboard</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Start a real-time drawing session with all meeting participants. The whiteboard will open in a new tab.
      </p>
      <Button onClick={() => window.open('/app/whiteboard', '_blank')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
        Open Whiteboard
      </Button>
    </div>
  );
}
