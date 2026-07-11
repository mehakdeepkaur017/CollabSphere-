import * as React from "react"


import { cn } from "@/lib/utils"

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  title: string
  description?: string
}

export function AuthLayout({ className, children, title, description, ...props }: AuthLayoutProps) {
  return (
    <div className={cn("flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8", className)} {...props}>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

