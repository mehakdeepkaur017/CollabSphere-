import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import type { Activity } from "../useActivityQueries"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  CheckCircle2,
  File,
  Folder,
  FolderPlus,
  PlusCircle,
  Settings,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Edit2,
  Pin,
  ArrowRightCircle,
  Hash,
  Paperclip,
  UserMinus,
} from "lucide-react"

interface ActivityItemProps {
  activity: Activity
}

const getActionDetails = (action: string, resourceType?: string) => {
  switch (action) {
    // Workspace
    case "created_workspace": return { icon: PlusCircle, color: "text-blue-500", bg: "bg-blue-500/10" }
    case "updated_workspace": return { icon: Settings, color: "text-blue-500", bg: "bg-blue-500/10" }
    case "joined_workspace": return { icon: UserPlus, color: "text-green-500", bg: "bg-green-500/10" }
    case "left_workspace": return { icon: UserMinus, color: "text-red-500", bg: "bg-red-500/10" }
    case "member_removed": return { icon: UserMinus, color: "text-red-500", bg: "bg-red-500/10" }
    case "owner_changed": return { icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" }
    case "member_updated": return { icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" }
    
    // Project
    case "created_project": return { icon: PlusCircle, color: "text-purple-500", bg: "bg-purple-500/10" }
    case "updated_project": return { icon: Edit2, color: "text-purple-500", bg: "bg-purple-500/10" }
    case "deleted_project": return { icon: Trash2, color: "text-red-500", bg: "bg-red-500/10" }
    
    // Task
    case "created_task": return { icon: PlusCircle, color: "text-indigo-500", bg: "bg-indigo-500/10" }
    case "moved_task": return { icon: ArrowRightCircle, color: "text-yellow-500", bg: "bg-yellow-500/10" }
    case "task_completed": return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" }
    case "deleted_task": return { icon: Trash2, color: "text-red-500", bg: "bg-red-500/10" }
    
    // Message
    case "message_sent": return { icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-400/10" }
    case "edited_message": return { icon: Edit2, color: "text-blue-400", bg: "bg-blue-400/10" }
    case "deleted_message": return { icon: Trash2, color: "text-red-400", bg: "bg-red-400/10" }
    case "pinned_message": return { icon: Pin, color: "text-amber-500", bg: "bg-amber-500/10" }
    case "unpinned_message": return { icon: Pin, color: "text-muted-foreground", bg: "bg-muted-foreground/10" }
    
    // File/Folder
    case "uploaded_file": return { icon: Upload, color: "text-sky-500", bg: "bg-sky-500/10" }
    case "renamed_file": return { icon: Edit2, color: "text-sky-500", bg: "bg-sky-500/10" }
    case "deleted_file": return { icon: Trash2, color: "text-red-500", bg: "bg-red-500/10" }
    case "created_folder": return { icon: FolderPlus, color: "text-orange-500", bg: "bg-orange-500/10" }
    case "renamed_folder": return { icon: Edit2, color: "text-orange-500", bg: "bg-orange-500/10" }
    case "deleted_folder": return { icon: Trash2, color: "text-red-500", bg: "bg-red-500/10" }
    
    // Extras
    case "added_comment": return { icon: MessageSquare, color: "text-muted-foreground", bg: "bg-muted-foreground/10" }
    case "added_attachment": return { icon: Paperclip, color: "text-sky-500", bg: "bg-sky-500/10" }
    case "created_channel": return { icon: Hash, color: "text-emerald-500", bg: "bg-emerald-500/10" }
    case "deleted_channel": return { icon: Trash2, color: "text-red-500", bg: "bg-red-500/10" }
    
    // Meeting
    case "created_meeting": return { icon: PlusCircle, color: "text-rose-500", bg: "bg-rose-500/10" }
    case "started_meeting": return { icon: ArrowRightCircle, color: "text-rose-500", bg: "bg-rose-500/10" }
    case "ended_meeting": return { icon: CheckCircle2, color: "text-gray-500", bg: "bg-gray-500/10" }

    default:
      if (resourceType === "Project") return { icon: PlusCircle, color: "text-purple-500", bg: "bg-purple-500/10" }
      if (resourceType === "Message") return { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" }
      if (resourceType === "Meeting") return { icon: PlusCircle, color: "text-rose-500", bg: "bg-rose-500/10" }
      if (resourceType === "File") return { icon: File, color: "text-sky-500", bg: "bg-sky-500/10" }
      if (resourceType === "Folder") return { icon: Folder, color: "text-orange-500", bg: "bg-orange-500/10" }
      return { icon: PlusCircle, color: "text-muted-foreground", bg: "bg-muted-foreground/10" }
  }
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { icon: Icon, color, bg } = getActionDetails(activity.action, activity.resourceType)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex gap-4 rounded-xl border border-white/5 bg-black/20 p-4 transition-all hover:bg-black/40 hover:border-white/10 dark:bg-card/50 dark:hover:bg-card/80"
    >
      {/* Activity Icon */}
      <div className="relative mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-white/5 shadow-sm">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", bg)}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                {activity.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-foreground">
              {activity.user.name}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
          {activity.message}
        </p>

        {/* Optional Metadata block (e.g. for previews) */}
        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
          <div className="mt-2 rounded-lg bg-black/20 dark:bg-white/5 p-3 text-xs text-muted-foreground border border-white/5">
            {Object.entries(activity.metadata).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="font-medium text-foreground/70 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="truncate">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
