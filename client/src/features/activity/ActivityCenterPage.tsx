import * as React from "react"
import { useState, useMemo } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useActivityQueries } from "./useActivityQueries"
import type { Activity } from "./useActivityQueries"
import { ActivityItem } from "./components/ActivityItem"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Filter, Search, Inbox } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { format, isToday, isYesterday, startOfWeek } from "date-fns"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import { EmptyState } from "@/components/ui/EmptyState"
import { MotionWrapper } from "@/components/shared/MotionWrapper"

import { Icons } from "@/components/shared/icons"

const FILTER_TABS = [
  { id: "all", label: "All Activity", icon: "grid" as keyof typeof Icons },
  { id: "Workspace", label: "Workspace", icon: "folder" as keyof typeof Icons },
  { id: "Project", label: "Projects", icon: "calendar" as keyof typeof Icons },
  { id: "ProjectTask", label: "Tasks", icon: "checkSquare" as keyof typeof Icons },
  { id: "Message", label: "Chat", icon: "messageSquare" as keyof typeof Icons },
  { id: "Meeting", label: "Meetings", icon: "video" as keyof typeof Icons },
  { id: "File", label: "Files", icon: "file" as keyof typeof Icons },
  { id: "Folder", label: "Folders", icon: "folder" as keyof typeof Icons },
]

export function ActivityCenterPage() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useActivityQueries(
    activeWorkspace?._id || "",
    { type: activeTab, search: debouncedSearch }
  )

  // Group activities by Date (Today, Yesterday, This Week, Earlier)
  const groupedActivities = useMemo(() => {
    if (!data) return {}

    const activities = data.pages.flatMap((page) => page.activities)
    const groups: Record<string, Activity[]> = {}

    activities.forEach((activity) => {
      const date = new Date(activity.createdAt)
      let groupKey = "Earlier"

      if (isToday(date)) {
        groupKey = "Today"
      } else if (isYesterday(date)) {
        groupKey = "Yesterday"
      } else if (date >= startOfWeek(new Date())) {
        groupKey = "This Week"
      } else {
        groupKey = format(date, "MMMM yyyy")
      }

      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(activity)
    })

    return groups
  }, [data])

  if (!activeWorkspace) {
    return (
      <MotionWrapper variant="page" className="flex flex-col gap-6 h-full p-6 bg-background">
        <div className="flex flex-1 items-center justify-center py-10">
          <EmptyState 
            icon="activity"
            title="No Active Workspace"
            description="You need to select or create a workspace first to view activity."
            className="w-full max-w-3xl border-none bg-transparent shadow-none"
            colorClass="bg-purple-500/10 text-purple-500"
          />
        </div>
      </MotionWrapper>
    )
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#050505] relative overflow-hidden text-white">
      {/* Header Area matching reference design */}
      <div className="relative z-10 px-8 pt-8 shrink-0 max-w-[1600px] mx-auto w-full">
        {/* Header Container with custom background */}
        <div className="relative w-full h-36 shrink-0 rounded-[24px] overflow-hidden bg-[#0a0710] border border-white/5 flex items-center px-10 z-10">
          
          {/* Center Graphic Scene */}
          <div className="absolute inset-0 flex justify-center items-end pointer-events-none overflow-hidden">
            {/* Main Background Glow */}
            <div className="absolute top-[-50px] w-full max-w-[800px] h-[300px] bg-[#60a5fa]/20 blur-[80px] rounded-full" />
            
            {/* Stars */}
            <div className="absolute top-4 left-1/3 h-1 w-1 bg-white rounded-full opacity-50 blur-[1px]" />
            <div className="absolute top-10 left-1/4 h-1.5 w-1.5 bg-white rounded-full opacity-70 blur-[1px]" />
            <div className="absolute top-8 right-1/3 h-1 w-1 bg-white rounded-full opacity-40 blur-[1px]" />
            
            {/* Clouds */}
            <svg className="absolute bottom-6 left-[35%] w-16 h-10 opacity-30 text-blue-900" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.5 19c-2.5 0-4.5-2-4.5-4.5 0-.25.02-.5.06-.75C12.33 13.9 11.5 14 10.5 14 7.5 14 5 11.5 5 8.5 5 7.15 5.5 5.92 6.32 5A5.5 5.5 0 0 1 11.5 1c3.04 0 5.5 2.46 5.5 5.5 0 .15-.02.3-.06.44C17.67 6.78 18.3 6.5 19 6.5c2.5 0 4.5 2 4.5 4.5S21.5 15.5 19 15.5H17.5V19z" />
            </svg>
            <svg className="absolute bottom-12 right-[32%] w-20 h-12 opacity-20 text-blue-800" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.5 19c-2.5 0-4.5-2-4.5-4.5 0-.25.02-.5.06-.75C12.33 13.9 11.5 14 10.5 14 7.5 14 5 11.5 5 8.5 5 7.15 5.5 5.92 6.32 5A5.5 5.5 0 0 1 11.5 1c3.04 0 5.5 2.46 5.5 5.5 0 .15-.02.3-.06.44C17.67 6.78 18.3 6.5 19 6.5c2.5 0 4.5 2 4.5 4.5S21.5 15.5 19 15.5H17.5V19z" />
            </svg>

            {/* Concentric Circles */}
            <div className="absolute bottom-[-20px] flex items-center justify-center">
              <div className="absolute w-[300px] h-[300px] rounded-full bg-blue-500/10" />
              <div className="absolute w-[200px] h-[200px] rounded-full bg-blue-500/20" />
              <div className="absolute w-[120px] h-[120px] rounded-full bg-blue-500/30 shadow-[0_0_50px_rgba(96,165,250,0.5)] flex items-center justify-center">
                <Icons.activity className="h-10 w-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
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
                Activity Center 
                <Icons.sparkles className="h-5 w-5 text-blue-400 ml-1 mt-0.5" />
              </h1>
              <p className="text-white/60 text-sm">Real-time pulse of everything happening in {activeWorkspace.name}.</p>
            </div>

            <div className="relative w-[280px]">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search activities..." 
                className="w-full pl-12 bg-white/5 border border-white/10 rounded-full focus-visible:ring-1 focus-visible:ring-blue-500/50 h-12 text-[14px] placeholder:text-white/40 text-white shadow-inner backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Filters / Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto mt-6 scrollbar-none pb-2">
          {FILTER_TABS.map((tab) => {
            const Icon = Icons[tab.icon]
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-5 py-3 text-[14.5px] font-medium rounded-[14px] transition-all whitespace-nowrap flex items-center gap-2.5",
                  isActive 
                    ? "text-[#f8f8f8] bg-[#101935] border border-[#233876] shadow-[0_4px_20px_-5px_rgba(96,165,250,0.2)]" 
                    : "text-[#8b8b9d] bg-transparent hover:text-white hover:bg-white/5 border border-[#1f1f2e]"
                )}
              >
                {isActive && (
                  <div className="absolute bottom-[-1px] left-4 right-4 h-[2px] bg-[#60a5fa] shadow-[0_0_10px_2px_rgba(96,165,250,0.7)]" />
                )}
                <Icon className={cn("w-4 h-4", isActive ? "text-[#60a5fa]" : "text-[#6c6c82]")} />
                <span className="relative z-10 tracking-wide">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Feed */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="mx-auto max-w-3xl space-y-8">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
          ) : Object.keys(groupedActivities).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/20 dark:bg-white/5 border border-white/5 mb-6 shadow-inner">
                <Inbox className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No activities found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-[250px]">
                {searchTerm 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "When things happen in this workspace, they'll show up here."}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {Object.entries(groupedActivities).map(([group, activities]) => (
                <motion.div 
                  key={group}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h3 className="sticky top-0 z-20 flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border backdrop-blur-md py-2">
                    {group}
                  </h3>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {activities.map((activity) => (
                        <ActivityItem key={activity._id} activity={activity} />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {hasNextPage && (
            <div className="flex justify-center pt-6 pb-10">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-full bg-black/20 dark:bg-white/5 border border-white/5 px-6 py-2.5 text-sm font-medium text-foreground hover:bg-black/40 dark:hover:bg-white/10 transition-all flex items-center gap-2 shadow-sm"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Loading more...
                  </>
                ) : (
                  "Load more activities"
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
