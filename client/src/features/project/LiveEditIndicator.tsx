import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import type { ProjectUser } from "@/hooks/useProjectSocket";

interface LiveEditIndicatorProps {
  typingUsers: ProjectUser[];
}

export function LiveEditIndicator({ typingUsers }: LiveEditIndicatorProps) {
  if (typingUsers.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 shadow-sm backdrop-blur-sm"
      >
        <div className="flex h-4 w-4 items-center justify-center text-primary">
          <Icons.pencil className="h-3 w-3" />
        </div>
        <span className="text-xs font-medium text-primary flex items-center gap-1">
          {typingUsers.map(u => u.name).join(", ")} {typingUsers.length > 1 ? 'are' : 'is'} editing
          <span className="flex items-center gap-0.5 ml-1">
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1 h-1 rounded-full bg-primary" />
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1 h-1 rounded-full bg-primary" />
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1 h-1 rounded-full bg-primary" />
          </span>
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
