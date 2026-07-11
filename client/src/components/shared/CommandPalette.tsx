import * as React from "react"
import { Command } from "cmdk"
import { Icons } from "@/components/shared/icons"
import { Dialog, DialogContent } from "@/components/ui/Dialog"
import { useNavigate } from "react-router"
import { useWorkspaceStore } from "@/store/workspaceStore"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const { activeWorkspace } = useWorkspaceStore()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl [&>button]:hidden sm:rounded-xl focus:outline-none focus-visible:outline-none bg-[#12121a] border border-white/10">
        <Command className="[&_[cmdk-root]]:h-full [&_[cmdk-root]]:w-full bg-transparent text-white flex h-full w-full flex-col overflow-hidden">
          <div className="flex items-center border-b border-white/5 px-4">
            <Icons.search className="mr-3 h-5 w-5 shrink-0 opacity-50" />
            <Command.Input 
              placeholder="Search tasks, projects, or type a command..." 
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="hidden sm:inline-block bg-white/10 text-white/50 px-2 py-1 rounded text-xs font-mono">ESC</kbd>
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
            <Command.Empty className="py-6 text-center text-sm text-white/40">
              No results found.
            </Command.Empty>
            
            <Command.Group heading="Quick Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-white/40 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
              <Command.Item 
                onSelect={() => { setOpen(false); /* Task creation logic could be triggered via global store/event */ }}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none aria-selected:bg-white/5 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3">
                  <Icons.plus className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white/90">Create Task</div>
                  <div className="text-xs text-white/40">Add a new task</div>
                </div>
                <kbd className="hidden sm:inline-block bg-white/10 text-white/50 px-2 py-1 rounded text-xs font-mono">N</kbd>
              </Command.Item>
              
              <Command.Item 
                onSelect={() => { navigate('/app/projects'); setOpen(false); }}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none aria-selected:bg-white/5 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors mt-1"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-3">
                  <Icons.folder className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white/90">Create Project</div>
                  <div className="text-xs text-white/40">Start a new project</div>
                </div>
                <kbd className="hidden sm:inline-block bg-white/10 text-white/50 px-2 py-1 rounded text-xs font-mono">P</kbd>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation" className="mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-white/40 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
              <Command.Item 
                onSelect={() => { navigate('/app/projects'); setOpen(false); }}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-white/5 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 text-white/50 flex items-center justify-center mr-3">
                  <Icons.layoutTemplate className="w-3.5 h-3.5" />
                </div>
                <span className="text-white/80 font-medium">Projects Hub</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => { navigate('/app/chat'); setOpen(false); }}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-white/5 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors mt-1"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 text-white/50 flex items-center justify-center mr-3">
                  <Icons.messageSquare className="w-3.5 h-3.5" />
                </div>
                <span className="text-white/80 font-medium">Chat</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => { navigate('/app/files'); setOpen(false); }}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-white/5 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors mt-1"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 text-white/50 flex items-center justify-center mr-3">
                  <Icons.paperclip className="w-3.5 h-3.5" />
                </div>
                <span className="text-white/80 font-medium">Files</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
