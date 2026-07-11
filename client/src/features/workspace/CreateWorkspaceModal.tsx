import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog"
import { Icons } from "@/components/shared/icons"
import { useCreateWorkspace } from "./useWorkspaceQueries"

const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().max(120).optional(),
  privacy: z.enum(["public", "private"]),
  theme: z.string(),
  icon: z.string(),
})

type CreateWorkspaceValues = z.infer<typeof createWorkspaceSchema>

interface CreateWorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const { mutate: createWorkspace, isPending, isSuccess } = useCreateWorkspace()
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<CreateWorkspaceValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "private",
      theme: "indigo",
      icon: "folder",
    },
  })

  const description = watch("description") || ""

  const onSubmit = (data: CreateWorkspaceValues) => {
    createWorkspace(data, {
      onSuccess: () => {
        setTimeout(() => {
          onClose()
          reset()
        }, 800)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-[#0F0F13] border-[#1f1f2e] shadow-2xl">
        <div className="flex flex-col w-full">
          
          {/* Top Illustration Area */}
          <div className="w-full pt-8 pb-4 flex justify-center items-center relative overflow-hidden bg-gradient-to-b from-[#1c1836] to-transparent">
            {/* Sparkles and Glow (Using an image) */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <img src="/purple_folder.png" alt="Workspace Folder" className="w-full h-full object-contain drop-shadow-2xl z-10" />
            </div>
          </div>

          <div className="px-6 pb-6 pt-2">
            <DialogHeader className="mb-6 text-center">
              <DialogTitle className="text-2xl font-bold tracking-tight text-white mb-1">Create Workspace</DialogTitle>
              <DialogDescription className="text-[14px] text-[#8b8b9d]">
                Bring your team, projects and files together in one place.
              </DialogDescription>
            </DialogHeader>

            <form id="create-workspace-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#eaeaea]">Workspace Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#1f1b36] flex items-center justify-center">
                    <Icons.folder className="w-4 h-4 text-[#8e7cf0]" />
                  </div>
                  <Input 
                    {...register("name")} 
                    placeholder="e.g. AI Research Team" 
                    autoFocus
                    className="pl-13 py-6 bg-transparent border-[#2a2a3e] rounded-xl focus-visible:ring-1 focus-visible:ring-[#8e7cf0]/50 focus-visible:border-[#8e7cf0] text-[15px] placeholder:text-[#55556a]"
                    style={{ paddingLeft: '3.25rem' }}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#eaeaea]">
                  Description <span className="text-[#6c6c82] font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-4 w-8 h-8 rounded-lg bg-[#1f1b36] flex items-center justify-center">
                    <Icons.messageSquare className="w-4 h-4 text-[#8e7cf0]" />
                  </div>
                  <textarea 
                    {...register("description")} 
                    placeholder="Tell your teammates what this workspace is for..." 
                    className="w-full pl-13 pt-5 pb-6 bg-transparent border border-[#2a2a3e] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8e7cf0]/50 focus:border-[#8e7cf0] text-[14px] placeholder:text-[#55556a] resize-none h-28"
                    style={{ paddingLeft: '3.25rem' }}
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-[#55556a]">
                    {description.length}/120
                  </div>
                </div>
                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
              </div>
            </form>

            <div className="mt-8 flex items-center justify-between">
              <Button type="button" onClick={onClose} disabled={isPending} className="bg-[#1c1c28] hover:bg-[#252535] text-white border-none rounded-xl h-11 px-6">
                Cancel
              </Button>
              <Button form="create-workspace-form" type="submit" isLoading={isPending} isSuccess={isSuccess} className="bg-gradient-to-r from-[#7a5af8] to-[#997dfa] hover:opacity-90 text-white rounded-xl h-11 px-6 shadow-[0_0_15px_rgba(122,90,248,0.4)] transition-all">
                {!isPending && !isSuccess && <Icons.sparkles className="w-4 h-4 mr-2" />} Create Workspace
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
