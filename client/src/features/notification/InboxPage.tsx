import * as React from "react"

import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { MotionWrapper } from "@/components/shared/MotionWrapper"

export function InboxPage() {
  return (
    <MotionWrapper variant="page" className="flex flex-col gap-6 h-full">
      <WorkspaceHeader 
        title="Inbox"
        subtitle="Manage your notifications and messages."
      />
      <div className="flex flex-1 items-center justify-center py-10">
        <EmptyState 
          icon="bell"
          title="No conversations yet."
          description="When teammates mention you or comment on your work, you'll see it here."
          className="w-full max-w-3xl border-none bg-transparent shadow-none"
          colorClass="bg-blue-500/10 text-blue-500"
        />
      </div>
    </MotionWrapper>
  )
}

