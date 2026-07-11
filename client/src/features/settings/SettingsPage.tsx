import * as React from "react"
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader"
import { MotionWrapper } from "@/components/shared/MotionWrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Switch } from "@/components/ui/Switch"
import { Button } from "@/components/ui/Button"
import { Loader2 } from "lucide-react"
import { useNotificationSettings, useUpdateNotificationSettings } from "@/features/notification/useNotificationQueries"

const MODULES = [
  { id: "Project", label: "Projects", desc: "Project creation, completion" },
  { id: "Task", label: "Tasks", desc: "Assignments, status changes" },
  { id: "File", label: "Files", desc: "Uploads, comments, shares" },
  { id: "Chat", label: "Chat", desc: "Mentions, replies" },
  { id: "Workspace", label: "Workspace", desc: "Member joins, role changes" }
]

export function SettingsPage() {
  const { data: settings, isLoading } = useNotificationSettings()
  const { mutate: updateSettings, isPending } = useUpdateNotificationSettings()

  const handleToggle = (moduleId: string, type: "inApp" | "email") => {
    if (!settings) return
    const currentModuleSettings = settings[moduleId] || { inApp: true, email: false }
    const newSettings = {
      ...settings,
      [moduleId]: {
        ...currentModuleSettings,
        [type]: !currentModuleSettings[type]
      }
    }
    updateSettings(newSettings)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 h-full items-center justify-center animate-in fade-in duration-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-4xl pb-12">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Personal Settings</h2>
        <p className="text-white/60 mt-2">Configure your notification preferences and user settings.</p>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-2xl border-white/5 bg-black/40 shadow-xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">Notification Preferences</CardTitle>
            <CardDescription className="text-white/50">Manage how you receive alerts for each module.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-white/10 text-sm font-medium text-white/50 px-4">
              <div className="col-span-8">Module</div>
              <div className="col-span-2 text-center">In-App</div>
              <div className="col-span-2 text-center">Email</div>
            </div>
            
            {MODULES.map(module => {
              const pref = settings?.[module.id] || { inApp: true, email: false }
              return (
                <div key={module.id} className="grid grid-cols-12 gap-4 items-center rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                  <div className="col-span-8 space-y-1">
                    <p className="text-sm font-medium text-white">{module.label}</p>
                    <p className="text-xs text-white/50">{module.desc}</p>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Switch 
                      checked={pref.inApp !== false}
                      onCheckedChange={() => handleToggle(module.id, "inApp")}
                      disabled={isPending}
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Switch 
                      checked={pref.email === true}
                      onCheckedChange={() => handleToggle(module.id, "email")}
                      disabled={isPending}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
