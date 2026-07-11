import React from "react";
import { motion } from "framer-motion";

export function FileCardSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-black/20">
        <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/5 rounded-md w-1/3 animate-pulse" />
          <div className="h-3 bg-white/5 rounded-md w-1/4 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-white/5 bg-[#111116] overflow-hidden">
      <div className="h-32 w-full bg-white/5 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/5 rounded-md w-3/4 animate-pulse" />
        <div className="h-3 bg-white/5 rounded-md w-1/2 animate-pulse" />
      </div>
    </div>
  );
}

export function FolderCardSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse shrink-0" />
          <div className="h-4 bg-white/5 rounded-md w-24 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 rounded-2xl border border-white/5 bg-[#111116]">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-white/5 rounded-md w-3/4 animate-pulse" />
        <div className="h-3 bg-white/5 rounded-md w-1/2 animate-pulse" />
      </div>
    </div>
  );
}
