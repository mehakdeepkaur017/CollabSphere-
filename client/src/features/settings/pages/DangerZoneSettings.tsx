import * as React from "react";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDangerZone } from "../hooks/useWorkspaceSettings";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Loader2, AlertTriangle, Archive, Trash2, ArrowRightLeft, Download } from "lucide-react";
import { useState } from "react";

export function DangerZoneSettings() {
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);
  const { deleteWorkspace, transferOwnership } = useDangerZone();
  
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [transferOwnerId, setTransferOwnerId] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    deleteWorkspace.mutate(undefined, {
      onSettled: () => setIsDeleting(false)
    });
  };

  const handleTransfer = () => {
    if (!transferOwnerId) return;
    setIsTransferring(true);
    transferOwnership.mutate(transferOwnerId, {
      onSettled: () => setIsTransferring(false)
    });
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-destructive tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" /> Danger Zone
        </h2>
        <p className="text-muted-foreground">Irreversible and destructive actions. Proceed with caution.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-destructive/20 bg-destructive/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-yellow-400" /> Transfer Ownership
            </CardTitle>
            <CardDescription>
              Transfer full ownership of this workspace to another member. You will be downgraded to an Admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <select 
                className="flex h-10 w-full max-w-[300px] rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background"
                value={transferOwnerId}
                onChange={(e) => setTransferOwnerId(e.target.value)}
              >
                <option value="" disabled>Select a member...</option>
                {workspace?.members?.map((m: any) => (
                  <option key={m.user._id || m.user} value={m.user._id || m.user}>
                    {m.user.name || m.user} ({m.role})
                  </option>
                ))}
              </select>
              <Button 
                variant="outline" 
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                onClick={handleTransfer}
                disabled={!transferOwnerId || isTransferring}
              >
                {isTransferring ? <Loader2 className="w-4 h-4 animate-spin" /> : "Transfer"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/40 bg-destructive/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Workspace
            </CardTitle>
            <CardDescription className="text-destructive/80">
              Permanently delete this workspace and all of its contents. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-destructive/90">
                To confirm, type "{workspace?.name}"
              </label>
              <div className="flex gap-4">
                <Input 
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="bg-black/40 border-destructive/30 text-white max-w-[300px]" 
                  placeholder={workspace?.name}
                />
                <Button 
                  variant="destructive" 
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={deleteConfirmText !== workspace?.name || isDeleting}
                  onClick={handleDelete}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Delete Workspace
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
