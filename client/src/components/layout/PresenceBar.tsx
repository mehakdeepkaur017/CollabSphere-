import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePresence } from "@/hooks/usePresence";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { cn } from "@/lib/utils";

export function PresenceBar() {
  const { activeWorkspace } = useWorkspaceStore();
  const { presenceMap } = usePresence();

  if (!activeWorkspace) return null;

  const onlineMembers = activeWorkspace.members.filter(m => 
    m.user._id && presenceMap[m.user._id] === 'online'
  );

  if (onlineMembers.length === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-card/50 border rounded-full px-3 py-1.5 shadow-sm">
      <div className="flex -space-x-2">
        <AnimatePresence>
          {onlineMembers.slice(0, 5).map((member) => (
            <motion.div
              key={member.user._id}
              initial={{ opacity: 0, scale: 0.5, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 10 }}
              className="relative z-10 w-8 h-8 rounded-full border-2 border-background flex items-center justify-center bg-primary/10 text-xs font-bold text-primary"
            >
              {member.user.avatar ? (
                <img src={member.user.avatar} alt={member.user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                member.user.name.charAt(0).toUpperCase()
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-background shadow-sm" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold leading-tight">
          {onlineMembers.length} Online
        </span>
        <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Connected
        </span>
      </div>
    </div>
  );
}
