import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { QRCodeSVG } from "qrcode.react"

export function InviteMembersModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { activeWorkspace } = useWorkspaceStore()
  const [copiedCode, setCopiedCode] = React.useState(false)
  const [copiedLink, setCopiedLink] = React.useState(false)

  const inviteLink = activeWorkspace ? `${window.location.origin}/app?join=${activeWorkspace.inviteCode}` : ""

  const handleCopyCode = () => {
    if (activeWorkspace?.inviteCode) {
      navigator.clipboard.writeText(activeWorkspace.inviteCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-50 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-2xl flex flex-col md:flex-row"
          >
            {/* Left side: QR Code and Visuals */}
            <div className="w-full md:w-2/5 bg-black/40 border-r border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute -left-1/4 -top-1/4 h-[200px] w-[200px] rounded-full bg-purple-500 blur-[60px]" />
                <div className="absolute -right-1/4 -bottom-1/4 h-[200px] w-[200px] rounded-full bg-blue-500 blur-[60px]" />
              </div>
              
              <div className="relative z-10 w-full flex flex-col items-center space-y-6">
                <div className="p-4 bg-white rounded-2xl shadow-xl">
                  {activeWorkspace ? (
                    <QRCodeSVG 
                      value={inviteLink} 
                      size={160} 
                      level="H"
                      includeMargin={false}
                      fgColor="#000000"
                      bgColor="#ffffff"
                    />
                  ) : (
                    <div className="w-[160px] h-[160px] bg-muted flex items-center justify-center">
                      <Icons.spinner className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-white/80 text-center">Scan to join on mobile</p>
              </div>
            </div>

            {/* Right side: Actions */}
            <div className="w-full md:w-3/5 p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Invite Members</h2>
                  <p className="text-sm text-white/60 mt-1">Grow your workspace and collaborate.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icons.close className="h-4 w-4" />
                </button>
              </div>

              {!activeWorkspace ? (
                 <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-8 text-center flex-1 flex flex-col items-center justify-center">
                   <Icons.info className="mx-auto mb-2 h-8 w-8 text-purple-400" />
                   <p className="text-sm font-medium text-white">No Workspace Selected</p>
                 </div>
              ) : (
                <div className="space-y-6 flex-1">
                  
                  {/* Code Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80">Invite Code</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-xl border border-white/10 bg-black/40 p-3 text-center font-mono text-2xl font-bold tracking-widest text-white">
                        {activeWorkspace.inviteCode}
                      </div>
                      <Button 
                        onClick={handleCopyCode} 
                        className={`h-[60px] px-6 transition-all ${copiedCode ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        variant="ghost"
                      >
                        {copiedCode ? <Icons.check className="h-5 w-5" /> : <Icons.fileText className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-white/40">Or</span></div>
                  </div>

                  {/* Link Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80">Share Link</label>
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-1 pl-3 pr-1">
                      <div className="flex-1 truncate text-sm text-white/60 font-mono">
                        {inviteLink}
                      </div>
                      <Button 
                        onClick={handleCopyLink} 
                        className={`h-9 px-4 transition-all rounded-lg ${copiedLink ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white text-black hover:bg-white/90'}`}
                      >
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </Button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
