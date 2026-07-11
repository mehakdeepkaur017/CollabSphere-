import * as React from "react"
import { createBrowserRouter, RouterProvider } from "react-router"
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { ProtectedRoutes } from "@/components/auth/ProtectedRoutes"
import { GuestRoutes } from "@/components/auth/GuestRoutes"
import { AuthLayout } from "@/features/auth/AuthLayout"

// Main Pages
import { LandingPage } from "@/features/landing/LandingPage"
import { HomePage } from "@/features/dashboard/HomePage"
import { SemesterPage } from "@/features/semester/SemesterPage"
import { ProjectsPage } from "@/features/project/ProjectsPage"
import { ProjectDetailView } from "@/features/project/ProjectDetailView"
import { MyTasksPage } from "@/features/project/MyTasksPage"
import { PlannerPage } from "@/features/calendar/PlannerPage"
import { InboxPage } from "@/features/notification/InboxPage"
import { ProfilePage } from "@/features/profile/ProfilePage"
import { SettingsPage } from "@/features/settings/SettingsPage"
import { CollaborationPage } from "@/features/chat/CollaborationPage"
import { FilesHubPage } from "@/features/files/FilesHubPage"

import { ActivityCenterPage } from "@/features/activity/ActivityCenterPage"
import { MeetingsDashboard } from "@/features/meetings/MeetingsDashboard"
import { LiveMeetingRoom } from "@/features/meetings/LiveMeetingRoom"

// Settings Pages
import { Navigate } from "react-router"
import { SettingsLayout } from "@/features/settings/layout/SettingsLayout"
import { GeneralSettings } from "@/features/settings/pages/GeneralSettings"
import { MembersSettings } from "@/features/settings/pages/MembersSettings"
import { DangerZoneSettings } from "@/features/settings/pages/DangerZoneSettings"

// Auth Pages
import { LoginPage } from "@/features/auth/LoginPage"
import { RegisterPage } from "@/features/auth/RegisterPage"
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage"
import { ResetPasswordPage } from "@/features/auth/ResetPasswordPage"
import { VerifyEmailPage } from "@/features/auth/VerifyEmailPage"
import { NotFoundPage } from "@/features/error/NotFoundPage"
import { JoinWorkspacePage } from "@/features/workspace/JoinWorkspacePage"

export const router = createBrowserRouter([
  // Guest Routes (Authentication)
  {
    element: <GuestRoutes />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
          { path: "/verify-email", element: <VerifyEmailPage /> },
        ]
      }
    ]
  },
  // Landing Page
  {
    path: "/",
    element: <LandingPage />
  },
  // Protected Routes (App Shell)
  {
    path: "/app",
    element: (
      <ProtectedRoutes />
    ),
    children: [
      {
        element: (
          <ErrorBoundary>
            <WorkspaceLayout />
          </ErrorBoundary>
        ),
        children: [
          { index: true, element: <HomePage /> },
          { path: "semester", element: <SemesterPage /> },
          { path: "projects", element: <ProjectsPage /> },
          { path: "projects/:projectId", element: <ProjectDetailView /> },
          { path: "tasks", element: <MyTasksPage /> },
          { path: "planner", element: <PlannerPage /> },
          { path: "chat", element: <CollaborationPage /> },
          { path: "files", element: <FilesHubPage /> },
          { path: "activity", element: <ActivityCenterPage /> },
          { path: "meetings", element: <MeetingsDashboard /> },
          { path: "meetings/:meetingId/live", element: <LiveMeetingRoom /> },
          { path: "inbox", element: <InboxPage /> },
          { path: "profile", element: <ProfilePage /> },
          {
            path: "settings",
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="general" replace /> },
              { path: "general", element: <GeneralSettings /> },
              { path: "members", element: <MembersSettings /> },
              { path: "personal", element: <SettingsPage /> },
              { path: "danger", element: <DangerZoneSettings /> }
            ]
          },
        ],
      }
    ],
  },
  // Join Workspace Route
  {
    path: "/join/:inviteCode",
    element: <JoinWorkspacePage />
  },
  // 404
  {
    path: "*",
    element: <NotFoundPage />
  }
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
