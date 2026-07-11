import * as React from "react"


import { cn } from "@/lib/utils"

export function PageContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6", className)} {...props} />
  )
}

export function ContentContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-1 flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm", className)} {...props} />
  )
}

