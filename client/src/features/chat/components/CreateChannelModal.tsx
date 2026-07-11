import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useCreateChannel } from "../useChatQueries";
import { useChatStore } from "@/store/chatStore";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateChannelModal({ isOpen, onClose }: CreateChannelModalProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { setActiveChannel } = useChatStore();
  const { mutate: createChannel, isPending } = useCreateChannel(activeWorkspace?._id || "");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"public" | "private">("public");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createChannel(
      {
        name: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description,
        type,
      },
      {
        onSuccess: (channel) => {
          setActiveChannel(channel._id);
          onClose();
          setName("");
          setDescription("");
          setType("public");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-[#111116] border-white/10 shadow-2xl">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                <Icons.hash className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-white">Create Channel</DialogTitle>
                <DialogDescription className="text-white/50 text-xs">
                  Channels are where your team communicates.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Channel Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">#</span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. design-reviews"
                  autoFocus
                  className="bg-white/5 border-white/10 text-white pl-7 focus-visible:ring-emerald-500/30"
                />
              </div>
              {name && (
                <p className="text-[10px] text-white/30">
                  Will be created as{" "}
                  <span className="text-emerald-400 font-medium">
                    #{name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}
                  </span>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Description <span className="text-white/30">(optional)</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this channel about?"
                rows={2}
                className="bg-white/5 border-white/10 text-white resize-none focus-visible:ring-emerald-500/30"
              />
            </div>

            {/* Type */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("public")}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    type === "public"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-white/5 border-white/5 text-white/50 hover:bg-white/[0.07]"
                  }`}
                >
                  <Icons.hash className="w-4 h-4" />
                  <div className="text-left">
                    <p className="text-xs font-medium">Public</p>
                    <p className="text-[10px] opacity-60">Anyone can join</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setType("private")}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    type === "private"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-white/5 border-white/5 text-white/50 hover:bg-white/[0.07]"
                  }`}
                >
                  <Icons.lock className="w-4 h-4" />
                  <div className="text-left">
                    <p className="text-xs font-medium">Private</p>
                    <p className="text-[10px] opacity-60">Invite only</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isPending}
                className="text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/20"
              >
                {isPending ? (
                  <Icons.spinner className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Icons.plus className="w-4 h-4 mr-2" />
                )}
                Create Channel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
