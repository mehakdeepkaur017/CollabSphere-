import * as React from "react"

import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { MotionWrapper } from "@/components/shared/MotionWrapper"
import { Button } from "@/components/ui/Button"
import { Icons } from "@/components/shared/icons"

export function SemesterPage() {
  return (
    <MotionWrapper variant="page" className="flex flex-col gap-6 h-full">
      <WorkspaceHeader 
        title="Semester"
        subtitle="Organize your academic timeline and subjects."
        action={
          <Button className="rounded-full shadow-sm">
            <Icons.plus className="mr-2 h-4 w-4" /> Add Semester
          </Button>
        }
      />
      <div className="flex flex-1 items-center justify-center py-10">
        <EmptyState 
          icon="folder"
          title="Organize your subjects."
          description="Create your first semester to start organizing your schedule, assignments, and resources."
          className="w-full max-w-3xl border-none bg-transparent shadow-none"
          colorClass="bg-indigo-500/10 text-indigo-500"
          action={
            <Button size="lg" className="rounded-full shadow-sm hover:-translate-y-0.5 transition-transform">
              <Icons.plus className="mr-2 h-5 w-5" /> Create Semester
            </Button>
          }
        />
      </div>
    </MotionWrapper>
  )
}

