import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/components/shared/icons"

interface DashboardMetricsProps {
  projectsCount: number
  projectsThisWeekCount: number
  membersCount: number
  onlineMembersCount: number
  meetingsCount: number
  meetingsTodayCount: number
  tasksCount: number
  pendingTasksCount: number
}

export function DashboardMetrics({
  projectsCount,
  projectsThisWeekCount,
  membersCount,
  onlineMembersCount,
  meetingsCount,
  meetingsTodayCount,
  tasksCount,
  pendingTasksCount
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Projects Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 rounded-2xl bg-[#12121a] border border-white/5 p-5 shadow-sm hover:border-white/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2e1d4a] flex items-center justify-center shrink-0">
            <Icons.folder className="w-6 h-6 text-[#9f7aea]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-white/50 font-medium">Projects</span>
            <span className="text-[28px] font-bold text-white leading-none tracking-tight">{projectsCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#9f7aea] mt-1 pl-1">
          <Icons.trendingUp className="w-3.5 h-3.5" />
          <span>{projectsThisWeekCount} this week</span>
        </div>
      </motion.div>

      {/* Members Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-3 rounded-2xl bg-[#12121a] border border-white/5 p-5 shadow-sm hover:border-white/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#16302b] flex items-center justify-center shrink-0">
            <Icons.users className="w-6 h-6 text-[#4ade80]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-white/50 font-medium">Members</span>
            <span className="text-[28px] font-bold text-white leading-none tracking-tight">{membersCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#4ade80] mt-1 pl-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
          <span>{onlineMembersCount} Online</span>
        </div>
      </motion.div>

      {/* Meetings Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-3 rounded-2xl bg-[#12121a] border border-white/5 p-5 shadow-sm hover:border-white/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#3a2318] flex items-center justify-center shrink-0">
            <Icons.calendar className="w-6 h-6 text-[#fb923c]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-white/50 font-medium">Meetings</span>
            <span className="text-[28px] font-bold text-white leading-none tracking-tight">{meetingsCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#fb923c] mt-1 pl-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#fb923c]" />
          <span>{meetingsTodayCount} Today</span>
        </div>
      </motion.div>

      {/* Tasks Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-3 rounded-2xl bg-[#12121a] border border-white/5 p-5 shadow-sm hover:border-white/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1a2b4c] flex items-center justify-center shrink-0">
            <Icons.checkCircle className="w-6 h-6 text-[#60a5fa]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-white/50 font-medium">Tasks</span>
            <span className="text-[28px] font-bold text-white leading-none tracking-tight">{tasksCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#60a5fa] mt-1 pl-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa]" />
          <span>{pendingTasksCount} Pending</span>
        </div>
      </motion.div>
    </div>
  )
}
