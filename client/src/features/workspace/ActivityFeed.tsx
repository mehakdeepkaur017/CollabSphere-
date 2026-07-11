import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useActivities } from "./useActivityQueries";
import type { Activity } from "./useActivityQueries";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Icons } from "@/components/shared/icons";
import { cn } from "@/lib/utils";
import { staggerContainerVariants, fadeSlideUpVariants } from "@/lib/motion";

export function ActivityFeed() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: activities, isLoading } = useActivities(activeWorkspace?._id);

  if (!activeWorkspace) return null;

  return (
    <div className="flex flex-col h-full bg-card/50 border rounded-2xl p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Icons.activity className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Live Activity</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Icons.spinner className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground mt-10">
            No recent activity.
          </div>
        ) : (
          <motion.div
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent"
          >
            <AnimatePresence mode="popLayout">
              {activities.map((activity) => (
                <ActivityItem key={activity._id} activity={activity} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const isCreated = activity.action.includes("created");
  const isDeleted = activity.action.includes("deleted");
  
  const iconColor = isCreated ? "text-emerald-500 bg-emerald-500/10" 
                  : isDeleted ? "text-destructive bg-destructive/10" 
                  : "text-blue-500 bg-blue-500/10";
                  
  const ActionIcon = isCreated ? Icons.plus 
                   : isDeleted ? Icons.trash 
                   : Icons.check;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="relative flex items-start gap-4 group"
    >
      <div className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm transition-transform duration-300 group-hover:scale-110", iconColor, "bg-background")}>
        {activity.user.avatar ? (
          <img src={activity.user.avatar} alt={activity.user.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-xs font-bold">{activity.user.name.charAt(0).toUpperCase()}</span>
        )}
        <div className={cn("absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-background", iconColor)}>
          <ActionIcon className="w-2.5 h-2.5" />
        </div>
      </div>
      
      <div className="flex flex-col flex-1 min-w-0 pt-1">
        <p className="text-sm text-foreground/90 leading-tight">
          <span className="font-semibold text-foreground mr-1">{activity.user.name}</span>
          {activity.message}
        </p>
        <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
          <Icons.clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  );
}
