"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurriculum } from "@/context/CurriculumContext";
import { DownloadCloud, Copy, Check } from "lucide-react";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const { exportCurriculum, activeProject } = useCurriculum();
  const [copied, setCopied] = useState(false);

  const jsonContent = exportCurriculum();

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeProject.id}-progress.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl w-full">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-900">
          <DownloadCloud className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Xuất Dữ Liệu Học Tập (Export)</span>
        </DialogTitle>
        <DialogDescription className="text-xs sm:text-sm">
          Tải về file JSON chứa toàn bộ tiến độ, câu trả lời và ghi chú cá nhân của dự án này.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 my-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="truncate max-w-[200px] sm:max-w-none">Dự án: <strong className="text-slate-900">{activeProject.name}</strong></span>
          <span className="font-mono shrink-0">{(jsonContent.length / 1024).toFixed(1)} KB</span>
        </div>

        {/* Khung Editor JSON - GIỮ DARK THEME CHO CODE PREVIEW */}
        <Textarea
          readOnly
          value={jsonContent}
          className="font-mono text-xs min-h-[160px] sm:min-h-[220px] max-h-[35vh] border-slate-800 bg-slate-950 text-slate-200"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700">
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? "Đã sao chép!" : "Sao chép JSON"}</span>
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload} className="gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm">
            <DownloadCloud className="h-4 w-4" />
            <span>Tải file .json</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
