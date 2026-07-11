import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  userName: string;
  isVideo: boolean;
}

export function CallModal({ isOpen, onClose, roomName, userName, isVideo }: CallModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-6xl h-[85vh] bg-[#111116] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="h-14 bg-white/[0.02] border-b border-white/10 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                {isVideo ? <Icons.video className="w-4 h-4" /> : <Icons.phone className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">{roomName.replace(/_/g, ' ')}</h3>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Call
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <Icons.x className="w-5 h-5" />
            </Button>
          </div>

          {/* Jitsi Iframe */}
          <div className="flex-1 w-full bg-black">
            <JitsiMeeting
              domain="meet.jit.si"
              roomName={`CollabSphere-${roomName}`}
              configOverwrite={{
                startWithAudioMuted: false,
                startWithVideoMuted: !isVideo,
                disableModeratorIndicator: true,
                startScreenSharing: false,
                enableEmailInStats: false,
                prejoinPageEnabled: false,
                defaultLanguage: 'en',
                disableInviteFunctions: true
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                SHOW_CHROME_EXTENSION_BANNER: false,
                LANG_DETECTION: false,
                HIDE_INVITE_MORE_HEADER: true
              }}
              lang="en"
              userInfo={{
                displayName: userName,
                email: ''
              }}
              onApiReady={(externalApi) => {
                // Attach custom event listeners if needed
                externalApi.addListener('videoConferenceLeft', onClose);
              }}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = '100%';
                iframeRef.style.width = '100%';
                iframeRef.style.border = 'none';
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
