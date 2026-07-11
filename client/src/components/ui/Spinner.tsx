import * as React from "react"


import { Icons } from "@/components/shared/icons"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
}

const spinnerSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
}

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      <Icons.spinner className={cn("animate-spin", spinnerSizes[size])} />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

