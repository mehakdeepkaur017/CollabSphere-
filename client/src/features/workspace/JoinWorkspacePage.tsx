import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { workspaceApi } from "./workspace.api";

export function JoinWorkspacePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setActiveWorkspace } = useWorkspaceStore();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0c0c0e]">
        <div className="text-center space-y-4">
          <Icons.lock className="w-12 h-12 text-white/20 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Authentication Required</h1>
          <p className="text-white/50">Please log in to join this workspace.</p>
          <Button onClick={() => navigate("/login")} className="bg-indigo-600 hover:bg-indigo-500">Log In</Button>
        </div>
      </div>
    );
  }

  const handleJoin = async () => {
    if (!inviteCode) return;
    setIsJoining(true);
    setError(null);
    try {
      const workspace = await workspaceApi.joinWorkspace(inviteCode);
      
      // We don't have setWorkspaces in the store, the Dashboard fetches it on load anyway.
      setActiveWorkspace(workspace);
      navigate("/app/chat");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to join workspace. The code might be invalid or expired.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0c0c0e] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl p-8 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 shadow-inner">
            <Icons.users className="w-10 h-10" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">You've been invited!</h1>
            <p className="text-white/50 text-sm">You are about to join a workspace.</p>
          </div>

          <div className="w-full bg-black/40 rounded-xl p-4 border border-white/5 flex items-center justify-center gap-3">
            <Icons.hash className="w-5 h-5 text-indigo-400" />
            <span className="text-lg font-mono tracking-widest text-white/90">{inviteCode}</span>
          </div>
          
          {error && (
            <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2 text-left">
              <Icons.alertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button 
            className="w-full py-6 text-lg rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 border-0"
            onClick={handleJoin}
            disabled={isJoining || !inviteCode}
          >
            {isJoining ? (
              <Icons.spinner className="w-6 h-6 animate-spin" />
            ) : (
              "Join Workspace"
            )}
          </Button>
          
          <button onClick={() => navigate("/app")} className="text-sm text-white/40 hover:text-white transition-colors">
            Cancel and return to dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
