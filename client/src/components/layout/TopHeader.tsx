import * as React from "react"
import { Button } from "@/components/ui/Button"
import { ProfileMenu } from "@/components/shared/ProfileMenu"
import { NotificationPanel } from "./NotificationPanel"
import { Icons } from "@/components/shared/icons"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/DropdownMenu"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useWorkspaces } from "@/features/workspace/useWorkspaceQueries"

import { motion } from "framer-motion"
import { springs } from "@/lib/motion"

import { WorkspaceSwitcher } from "./WorkspaceSwitcher"
import { MobileSidebar } from "./MobileSidebar"

export function TopHeader() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...springs.snappy, delay: 0.1 }}
      className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-white/5 bg-black/40 px-6 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <div className="hidden items-center gap-3 md:flex">
          <WorkspaceSwitcher />
        </div>
      </div>
      
      <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
        <Button
          variant="outline"
          className="group relative h-9 w-full justify-start rounded-full border-muted/60 bg-muted/30 text-sm font-normal text-muted-foreground shadow-none transition-all hover:border-muted hover:bg-muted/50 sm:w-64"
          onClick={() => {
            const event = new KeyboardEvent("keydown", { key: "k", metaKey: true })
            document.dispatchEvent(event)
          }}
        >
          <Icons.search className="mr-2 h-4 w-4 shrink-0 opacity-50 group-hover:opacity-70 transition-opacity" />
          <span>Search workspace...</span>
        </Button>
        <div className="flex items-center gap-3">
          <NotificationPanel />
          <ProfileMenu />
        </div>
      </div>
    </motion.header>
  )
}
