import * as React from "react";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useWorkspaceSettings } from "../hooks/useWorkspaceSettings";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GeneralSettings() {
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);
  const { updateWorkspace } = useWorkspaceSettings();
  
  const [formData, setFormData] = React.useState({
    name: workspace?.name || "",
    description: workspace?.description || "",
    department: workspace?.department || "",
    academicYear: workspace?.academicYear || "",
    semester: workspace?.semester || "",
    timezone: workspace?.timezone || "UTC",
    language: workspace?.language || "en",
    icon: workspace?.icon || "folder",
  });

  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    updateWorkspace.mutate(formData, {
      onSuccess: () => {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12 animate-in slide-in-from-bottom-4 fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">General Settings</h2>
        <p className="text-white/60 mt-2">Manage your workspace's basic information and identity.</p>
      </div>


      <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Basic Information</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Workspace Name</label>
            <Input name="name" value={formData.name} onChange={handleChange} className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus-visible:ring-indigo-500/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Description</label>
            <Input name="description" value={formData.description} onChange={handleChange} className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus-visible:ring-indigo-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Department</label>
              <Input name="department" value={formData.department} onChange={handleChange} className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus-visible:ring-indigo-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Academic Year</label>
              <Input name="academicYear" value={formData.academicYear} onChange={handleChange} className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus-visible:ring-indigo-500/50" />
            </div>
          </div>
        </div>
      </div>


      <div className="flex justify-end pt-2 pb-10">
        <Button 
          onClick={handleSave} 
          disabled={updateWorkspace.isPending}
          className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-8 h-12 text-sm font-medium shadow-lg shadow-indigo-500/20 min-w-[140px] transition-all"
        >
          {updateWorkspace.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSuccess ? (
            <div className="flex items-center gap-2 animate-in zoom-in">
              <CheckCircle2 className="w-5 h-5" /> Saved
            </div>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
