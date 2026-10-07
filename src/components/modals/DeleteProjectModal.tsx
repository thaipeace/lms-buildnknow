"use client";

import React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurriculum } from "@/context/CurriculumContext";
import { ProjectCurriculum, DomainType } from "@/types/curriculum";
import {
  Trash2,
  AlertTriangle,
  Code2,
  Palette,
  Mic,
  Video,
  Workflow,
  Sparkles,
  Boxes,
  BookOpen,
} from "lucide-react";

interface DeleteProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectCurriculum | null;
}

export function DeleteProjectModal({ open, onOpenChange, project }: DeleteProjectModalProps) {
  const { deleteProject, projects } = useCurriculum();

  if (!project) return null;

  const totalConcepts = project.modules.reduce((acc, m) => acc + (m.concepts?.length || 0), 0);
  const isOnlyProject = projects.length <= 1;

  const getDomainIcon = (domain: DomainType) => {
    switch (domain) {
      case "software":
        return <Code2 className="h-4 w-4 text-sky-600" />;
      case "image":
        return <Palette className="h-4 w-4 text-purple-600" />;
      case "audio":
        return <Mic className="h-4 w-4 text-amber-600" />;
      case "video":
        return <Video className="h-4 w-4 text-rose-600" />;
      case "workflow":
        return <Workflow className="h-4 w-4 text-emerald-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-indigo-600" />;
    }
  };

  const getDomainBadge = (domain: DomainType) => {
    switch (domain) {
      case "software":
        return <Badge variant="cyan">💻 Software</Badge>;
      case "image":
        return <Badge variant="purple">🎨 AI Art</Badge>;
      case "audio":
        return <Badge variant="warning">🎙️ Audio</Badge>;
      case "video":
        return <Badge variant="secondary">🎬 Video</Badge>;
      default:
        return <Badge variant="outline">⚡ Workflow</Badge>;
    }
  };

  const handleConfirmDelete = () => {
    deleteProject(project.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-lg w-full">
      <DialogHeader>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 shrink-0">
            <Trash2 className="h-4 sm:h-5 w-4 sm:w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900">
              Xác Nhận Xóa Dự Án
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Hành động này sẽ gỡ bỏ dự án khỏi danh sách học tập trên trình duyệt của bạn.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-3.5 my-3">
        {/* Project Snapshot Card */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {getDomainIcon(project.domain)}
              <h4 className="font-bold text-slate-900 text-sm">{project.name}</h4>
            </div>
            {getDomainBadge(project.domain)}
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {project.summary || project.description}
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
            <span className="flex items-center gap-1">
              <Boxes className="h-3.5 w-3.5 text-slate-400" />
              {project.modules.length} modules
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
              {totalConcepts} concepts
            </span>
          </div>
        </div>

        {/* Warning Alert */}
        <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Cảnh báo:</strong> Mọi ghi chú cá nhân, câu trả lời bài tập và tiến trình học tập của dự án này sẽ bị xóa hoàn toàn khỏi LocalStorage. Hành động này{" "}
            <strong className="underline underline-offset-2">không thể hoàn tác</strong>.
          </div>
        </div>

        {isOnlyProject && (
          <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 leading-relaxed">
            💡 Đây là dự án cuối cùng trong danh sách. Sau khi xóa, bạn có thể nạp dự án mới bằng file JSON hoặc bấm <strong>"Khôi phục dự án mẫu"</strong> bất cứ lúc nào.
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
          Hủy bỏ
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleConfirmDelete}
          className="gap-1.5 font-semibold"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Xác Nhận Xóa Dự Án</span>
        </Button>
      </div>
    </Dialog>
  );
}
