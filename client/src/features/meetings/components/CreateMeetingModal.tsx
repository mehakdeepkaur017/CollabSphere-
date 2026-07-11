import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateMeeting } from "../useMeetingQueries";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Icons } from "@/components/shared/icons";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMeetingModal({ isOpen, onClose }: CreateMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [recurring, setRecurring] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [waitingRoom, setWaitingRoom] = useState(false);
  const [password, setPassword] = useState("");
  
  const createMeeting = useCreateMeeting();
  const workspace = useWorkspaceStore(state => state.activeWorkspace);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime || !workspace) return;

    try {
      await createMeeting.mutateAsync({
        title,
        description,
        workspaceId: workspace._id,
        date,
        startTime,
        endTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        recurring,
        waitingRoom,
        password,
        participants: workspace.members.map(m => m.user._id) // Default all members for simplicity right now
      });
      
      toast.success("Meeting scheduled successfully");
      setTitle("");
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
      onClose();
    } catch (error) {
      toast.error("Failed to schedule meeting");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-black/90 border-white/10 backdrop-blur-xl text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Icons.video className="h-6 w-6 text-primary" />
            Schedule Meeting
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/80 mb-1 block">Meeting Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Weekly Sync"
                className="bg-white/5 border-white/10"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-white/80 mb-1 block">Description (Optional)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this meeting about?"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-white/80 mb-1 block">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white/80 mb-1 block">Start Time</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white/80 mb-1 block">End Time</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={waitingRoom} 
                  onChange={(e) => setWaitingRoom(e.target.checked)} 
                  className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50 h-4 w-4"
                />
                Enable Waiting Room
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-white/5 text-white/80">
              Cancel
            </Button>
            <Button type="submit" disabled={createMeeting.isPending || !title || !date || !startTime || !endTime} className="bg-primary text-white hover:bg-primary/90">
              {createMeeting.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
