import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { QRCodeSVG } from "qrcode.react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState<"code" | "qrcode">("code");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const inviteCode = activeWorkspace?.inviteCode || "";
  const joinUrl = `${window.location.origin}/join/${inviteCode}`;

  const regenerateCode = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/workspaces/${activeWorkspace._id}/invite-code/regenerate`);
      setActiveWorkspace(data);
    } catch (error) {
      console.error("Failed to regenerate invite code", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setTimeout(() => {
          setActiveTab("code");
        }, 300);
      }
    }}>
      <DialogContent className="sm:max-w-[480px] bg-black/80 backdrop-blur-3xl border-white/10 text-white p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Header Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />
        
        <div className="relative p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Icons.users className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Invite People to {activeWorkspace?.name}</h2>
              <p className="text-sm text-white/50">Grow your workspace and collaborate together.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
            <button
              onClick={() => setActiveTab("code")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "code" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
              }`}
            >
              Invite Code
            </button>
            <button
              onClick={() => setActiveTab("qrcode")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "qrcode" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
              }`}
            >
              QR Code
            </button>
          </div>

          {/* Content */}
          <div className="min-h-[160px]">
            <AnimatePresence mode="wait">
              {activeTab === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Secure Invite Code</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-2xl text-white font-mono tracking-widest text-center shadow-inner">
                        {inviteCode}
                      </div>
                      <Button
                        onClick={() => handleCopy(inviteCode)}
                        className={`h-[56px] w-[56px] px-0 rounded-xl transition-all ${
                          copied ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        {copied ? <Icons.check className="w-5 h-5" /> : <Icons.copy className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4">
                    <div>
                      <h4 className="text-sm font-medium text-white/90">Regenerate Code</h4>
                      <p className="text-xs text-white/50 mt-0.5">Invalidate the current code and create a new one.</p>
                    </div>
                    <Button
                      onClick={regenerateCode}
                      disabled={loading}
                      variant="outline"
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-9"
                    >
                      {loading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Regenerate"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === "qrcode" && (
                <motion.div
                  key="qrcode"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center space-y-4"
                >
                  <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <QRCodeSVG value={joinUrl} size={180} level="H" />
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-white/90">Scan to join the workspace</p>
                    <p className="text-xs text-white/50">Point your camera at this code to open the invitation link instantly.</p>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20"
                    onClick={() => handleCopy(joinUrl)}
                  >
                    {copied ? "Link Copied!" : "Copy URL"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
