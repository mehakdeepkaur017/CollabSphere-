import * as React from "react";
import { Outlet, NavLink } from "react-router";
import { 
  Settings, Users, AlertTriangle, Bell, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_LINKS = [
  { to: "/app/settings/general", icon: Settings, label: "General" },
  { to: "/app/settings/members", icon: Users, label: "Members" },
  { to: "/app/settings/personal", icon: Bell, label: "Personal" }, 
  { to: "/app/settings/danger", icon: AlertTriangle, label: "Danger Zone", danger: true },
];

export function SettingsLayout() {
  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden relative rounded-xl border border-[#1f1f2e] shadow-2xl animate-in fade-in duration-500">
      {/* Custom Header matching Image 1 */}
      <div className="shrink-0 px-8 py-8 md:px-10 md:py-8 border-b border-[#1f1f2e] bg-[#0a0a0f] flex items-center gap-6 z-10 shadow-sm">
        
        {/* Icon Circle with Sparkle */}
        <div className="relative shrink-0">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#7445f1] to-[#3f1e94] flex items-center justify-center shadow-[0_0_40px_rgba(116,69,241,0.3)]">
            <Settings className="w-9 h-9 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]" strokeWidth={2.2} />
          </div>
          {/* Sparkle */}
          <div className="absolute -top-1 -right-2 text-[#9d7cf0] drop-shadow-[0_0_8px_rgba(157,124,240,0.8)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" />
            </svg>
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[32px] font-bold tracking-tight text-[#f8f8f8]">Workspace Settings</h1>
          <p className="text-[#8b8b9d] text-[15px] tracking-wide">Manage your workspace preferences, members, and security.</p>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar matching Image 2 */}
        <aside className="w-[280px] shrink-0 border-r border-[#1f1f2e] bg-[#0a0a0f] p-6 overflow-y-auto custom-scrollbar">
          <nav className="flex flex-col gap-3">
            {SETTINGS_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-3.5 px-4 py-4 rounded-[14px] transition-all overflow-hidden group border",
                    isActive 
                      ? "bg-gradient-to-r from-[#392b70] to-[#1e153b] border-[#483885]/50 shadow-lg text-white"
                      : link.danger
                        ? "bg-transparent border-[#2a2a35] text-[#f87171] hover:bg-red-900/10 hover:border-red-900/30"
                        : "bg-transparent border-[#2a2a35] text-[#8b8b9d] hover:text-white hover:bg-white/5 hover:border-white/10"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#a87ffb] shadow-[0_0_12px_3px_rgba(168,127,251,0.6)]" />
                    )}
                    <link.icon className={cn("h-5 w-5", isActive ? "text-white" : link.danger ? "text-[#f87171]" : "text-[#6c6c82] group-hover:text-white")} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="font-semibold text-[15px] tracking-wide relative z-10">{link.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-10 relative bg-[#050505] custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
