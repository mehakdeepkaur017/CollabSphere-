import * as React from "react"
import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/store/authStore"
import { Icons } from "@/components/shared/icons"

export function GuestRoutes() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
