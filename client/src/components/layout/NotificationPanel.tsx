import * as React from "react"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/Sheet"
import { Button } from "@/components/ui/Button"
import { Icons } from "@/components/shared/icons"
import { EmptyState } from "@/components/ui/EmptyState"
import { 
  useNotificationQueries, 
  useUnreadCount, 
  useNotificationMutations
} from "@/features/notification/useNotificationQueries"
import type { Notification } from "@/features/notification/useNotificationQueries"
import { NotificationItem } from "@/features/notification/components/NotificationItem"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check, Archive, Settings, Bell, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { useNavigate } from "react-router"
import { useAuthStore } from "@/store/authStore"

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "Chat", label: "Mentions" },
  { id: "Task", label: "Tasks" },
  { id: "File", label: "Files" },
  { id: "Project", label: "Projects" },
  { id: "Workspace", label: "Workspace" },
]

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  
  const { data: unreadCount = 0 } = useUnreadCount()
  const { markAllAsRead } = useNotificationMutations()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  const unreadOnly = activeTab === "unread"
  const filter = activeTab !== "all" && activeTab !== "unread" ? activeTab : "all"

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotificationQueries({
    unreadOnly,
    filter
  })

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!isAuthenticated) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on 'N' when no input is focused
      if (e.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAuthenticated])

  const notifications = data?.pages.flatMap(p => p.notifications) || []
  const filteredNotifications = search 
    ? notifications.filter(n => 
        n.title.toLowerCase().includes(search.toLowerCase()) || 
        n.message.toLowerCase().includes(search.toLowerCase())
      )
    : notifications

  const handleNotificationClick = (notification: Notification) => {
    // Navigate logic based on notification module and entityId
    if (notification.module === 'Project' && notification.workspace) {
      navigate(`/app/workspaces/${notification.workspace}/projects/${notification.entityId}`)
    } else if (notification.module === 'Task' && notification.workspace) {
      navigate(`/app/workspaces/${notification.workspace}/projects`)
    } else if (notification.module === 'Chat' && notification.workspace) {
      navigate(`/app/workspaces/${notification.workspace}/chat`)
    } else if (notification.module === 'File' && notification.workspace) {
      navigate(`/app/workspaces/${notification.workspace}/files`)
    } else if (notification.module === 'Workspace' && notification.workspace) {
      navigate(`/app/workspaces/${notification.workspace}`)
    }
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 text-white/80 hover:bg-white/10 hover:text-white transition-all group"
        >
          <motion.div
            animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </motion.div>
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)] border-2 border-background text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md border-l border-white/10 bg-background/95 backdrop-blur-2xl p-0 flex flex-col gap-0 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-white"
                onClick={() => markAllAsRead.mutate()}
                title="Mark all as read"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-white"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/app/settings/notifications')
                }}
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..." 
              className="pl-9 h-9 bg-black/20 border-white/10 focus-visible:ring-primary/50 text-sm"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "text-primary-foreground shadow-sm shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="notification-tab-active"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gradient-to-b from-black/0 to-black/40">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              icon="bell"
              title="You're all caught up"
              description="No notifications match your current filters."
              className="min-h-[300px] border-none bg-transparent"
              colorClass="bg-primary/10 text-primary"
            />
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification._id} 
                    notification={notification} 
                    onClick={handleNotificationClick}
                  />
                ))}
              </AnimatePresence>

              {hasNextPage && (
                <div className="pt-4 pb-2 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-muted-foreground hover:text-white"
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Load older
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
