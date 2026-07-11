import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog"
import { Icons } from "@/components/shared/icons"
import { useJoinWorkspace } from "@/features/workspace/useWorkspaceQueries"

const joinSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required").transform(val => {
    // If user pastes a full URL, extract the code
    if (val.includes("join/")) {
      return val.split("join/")[1]?.split("?")[0] || val
    }
    return val
  }),
})

type JoinValues = z.infer<typeof joinSchema>

export interface JoinWorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function JoinWorkspaceModal({ isOpen, onClose }: JoinWorkspaceModalProps) {
  const [serverError, setServerError] = React.useState<string | null>(null)
  const navigate = useNavigate()
  const { mutateAsync: joinWorkspace, isPending, isSuccess } = useJoinWorkspace()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: { inviteCode: "" },
  })

  React.useEffect(() => {
    if (!isOpen) {
      reset()
      setServerError(null)
    }
  }, [isOpen, reset])

  const onSubmit = async (data: JoinValues) => {
    setServerError(null)
    try {
      await joinWorkspace(data.inviteCode)
      // Wait for success animation
      setTimeout(() => {
        onClose()
        navigate("/app")
      }, 600)
    } catch (error: any) {
      setServerError(error.response?.data?.error || "Failed to join workspace. Invalid code.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-[#0F0F13] border-[#1f1f2e] shadow-2xl">
        <div className="flex flex-col w-full">
          {/* Top Decorative Area */}
          <div className="w-full h-32 flex justify-center items-center relative overflow-hidden bg-gradient-to-b from-[#1c1836] to-transparent">
            {/* Sparkles and Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#8e7cf0]/30 rounded-full blur-[40px]"></div>
            <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-[#1f1b36] border border-[#2a2a3e] shadow-[0_0_30px_rgba(142,124,240,0.2)]">
              <Icons.globe className="w-8 h-8 text-[#8e7cf0]" />
            </div>
          </div>

          <div className="px-6 pb-6 pt-2">
            <DialogHeader className="mb-6 text-center">
              <DialogTitle className="text-2xl font-bold tracking-tight text-white mb-1">Join Workspace</DialogTitle>
              <DialogDescription className="text-[14px] text-[#8b8b9d]">
                Enter an invite code or link to collaborate with your team.
              </DialogDescription>
            </DialogHeader>

            <form id="join-workspace-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-[13px] text-red-400 flex items-start gap-2"
                  >
                    <Icons.warning className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>{serverError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#eaeaea]">Invite Code or Link</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#1f1b36] flex items-center justify-center">
                    <Icons.link className="w-4 h-4 text-[#8e7cf0]" />
                  </div>
                  <Input
                    {...register("inviteCode")}
                    placeholder="e.g. 8F2A9B1C"
                    autoFocus
                    className={`w-full pl-13 py-6 bg-transparent border-[#2a2a3e] rounded-xl focus-visible:ring-1 focus-visible:ring-[#8e7cf0]/50 focus-visible:border-[#8e7cf0] text-[15px] font-mono tracking-wider placeholder:tracking-normal placeholder:text-[#55556a] ${errors.inviteCode ? "border-red-500/50 focus-visible:ring-red-500/50 focus-visible:border-red-500/50" : ""}`}
                    style={{ paddingLeft: '3.25rem' }}
                  />
                </div>
                {errors.inviteCode && <p className="text-xs text-red-400 mt-1">{errors.inviteCode.message}</p>}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#7a5af8] to-[#997dfa] hover:opacity-90 text-white rounded-xl h-12 shadow-[0_0_15px_rgba(122,90,248,0.4)] transition-all font-medium text-[15px]"
                  isLoading={isPending}
                  isSuccess={isSuccess}
                >
                  Join Workspace
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
