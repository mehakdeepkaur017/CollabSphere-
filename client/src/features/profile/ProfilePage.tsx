import * as React from "react"
import { MotionWrapper } from "@/components/shared/MotionWrapper"
import { useAuthStore } from "@/store/authStore"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"

export function ProfilePage() {
  const { user } = useAuthStore()
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U"

  return (
    <MotionWrapper variant="page" className="flex flex-col h-full bg-[#0b0910]">
      {/* Header Area */}
      <div className="relative pt-10 pb-6 px-8 border-b border-white/5 bg-[#110e16] overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Profile Settings
            <Icons.sparkles className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-[#8b8b9d] text-[15px]">Personalize your account details and preferences.</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Profile Card */}
          <div className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start md:items-center">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group/avatar">
                  <div className="h-32 w-32 rounded-full border-4 border-[#1c192b] bg-[#1a1625] flex items-center justify-center text-4xl font-bold text-indigo-400 shadow-2xl shadow-indigo-500/20 overflow-hidden transition-transform duration-300 group-hover/avatar:scale-105">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm">
                    <Icons.image className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
                <Button className="bg-[#1c192b] text-white hover:bg-indigo-500/20 hover:text-indigo-300 border border-white/10 transition-all rounded-xl shadow-lg">
                  Change Photo
                </Button>
              </div>
              
              {/* Info Section */}
              <div className="flex-1 space-y-6 w-full">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Personal Information</h3>
                  <p className="text-[#8b8b9d] text-sm">Update your photo and personal details here.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-indigo-400/80">Full Name</label>
                    <div className="flex items-center px-4 py-3 rounded-xl bg-[#13111c] border border-white/5 text-white/90 font-medium">
                      <Icons.user className="w-4 h-4 mr-3 text-[#55556a]" />
                      {user?.name || "No name set"}
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-indigo-400/80">Email Address</label>
                    <div className="flex items-center px-4 py-3 rounded-xl bg-[#13111c] border border-white/5 text-white/90 font-medium">
                      <Icons.atSign className="w-4 h-4 mr-3 text-[#55556a]" />
                      {user?.email || "No email set"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </MotionWrapper>
  )
}
