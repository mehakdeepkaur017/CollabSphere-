import * as React from "react"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router"
import { useMeetings } from "@/features/meetings/useMeetingQueries"
import { isPast, format, isToday } from "date-fns"
import { useAuthStore } from "@/store/authStore"

export function UpcomingMeetingsWidget() {
  const navigate = useNavigate()
  const { data: meetings = [], isLoading } = useMeetings()
  const { user } = useAuthStore()

  const myMeetings = meetings.filter(
    (m: any) => m.createdBy?._id === user?.id || m.participants.some((p: any) => p._id === user?.id)
  )

  const isMeetingPast = (m: any) => {
    if (m.status === "completed" || m.status === "cancelled") return true
    try {
      const datePart = m.date.split("T")[0]
      return isPast(new Date(`${datePart}T${m.endTime}`))
    } catch {
      return false
    }
  }

  const upcomingAndLive = myMeetings.filter((m: any) => !isMeetingPast(m))
  
  upcomingAndLive.sort((a: any, b: any) => {
    const dateA = new Date(`${a.date.split("T")[0]}T${a.startTime}`).getTime()
    const dateB = new Date(`${b.date.split("T")[0]}T${b.startTime}`).getTime()
    return dateA - dateB
  })

  const nextMeeting = upcomingAndLive.length > 0 ? upcomingAndLive[0] : null

  return (
    <div className="flex flex-col rounded-[24px] border border-white/5 bg-[#12121a] p-6 shadow-sm h-full w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icons.video className="h-5 w-5 text-[#60a5fa]" />
          <h2 className="text-[15px] font-bold text-white">Upcoming Meeting</h2>
        </div>
        <button onClick={() => navigate('/app/meetings')} className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">
          View All
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center min-h-[120px]">
            <Icons.spinner className="h-6 w-6 animate-spin text-[#55556a]" />
          </div>
        ) : nextMeeting ? (
          <>
            <div className="flex items-center justify-between rounded-[16px] bg-[#1a1a24] border border-white/5 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2e1d4a]">
                  <Icons.clock className="h-5 w-5 text-[#9f7aea]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-[#a87ffb] mb-0.5">
                    {nextMeeting.startTime}
                  </span>
                  <span className="text-[14px] font-bold text-white leading-snug line-clamp-1">
                    {nextMeeting.title}
                  </span>
                  <span className="text-[12px] text-white/50 mt-0.5">
                    {isToday(new Date(nextMeeting.date)) ? "Today" : format(new Date(nextMeeting.date), "MMM d")} • 30 mins
                  </span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/app/meetings')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4 py-2 h-auto text-[13px] font-medium shadow-none"
              >
                Join
              </Button>
            </div>
            
            <div className="flex flex-col items-center justify-center rounded-[16px] border border-white/5 p-5 mt-auto bg-black/20">
              <Icons.calendar className="h-5 w-5 text-white/30 mb-2" />
              <p className="text-[13px] text-white/50 mb-1 font-medium">No more meetings today</p>
              <p className="text-[12px] text-white/30 mb-4">Enjoy your day!</p>
              <Button 
                onClick={() => navigate('/app/meetings')} 
                className="rounded-lg bg-transparent border border-white/10 text-white/70 hover:bg-white/5 text-[12px] h-8 px-4"
              >
                Schedule Meeting
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-[16px] border border-white/5 p-6 bg-black/20 text-center">
            <Icons.calendar className="h-6 w-6 text-white/30 mb-3" />
            <p className="text-[13px] font-medium text-white/50 mb-4">No upcoming meetings today</p>
            <Button 
              onClick={() => navigate('/app/meetings')} 
              className="rounded-lg bg-transparent border border-white/10 text-white/70 hover:bg-white/5 text-[12px] h-8 px-4"
            >
              Schedule Meeting
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
