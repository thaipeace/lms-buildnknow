"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurriculum } from "@/context/CurriculumContext";
import {
  Check,
  FolderGit2,
  Sparkles,
  Code2,
  Palette,
  Mic,
  Video,
  Workflow,
  FileEdit,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { DomainType, ProjectCurriculum } from "@/types/curriculum";
import { EditProjectModal } from "./EditProjectModal";
import { DeleteProjectModal } from "./DeleteProjectModal";

interface ProjectSwitcherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenImport: () => void;
}

export function ProjectSwitcherModal({ open, onOpenChange, onOpenImport }: ProjectSwitcherModalProps) {
  const { projects, activeProject, switchProject, restoreDefaultProjects } = useCurriculum();
  const [editingProject, setEditingProject] = useState<ProjectCurriculum | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectCurriculum | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl w-full">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-900">
          <FolderGit2 className="h-5 w-5 text-indigo-600 shrink-0" />
          <span>Chọn Dự án Học tập</span>
        </DialogTitle>
        <DialogDescription className="text-xs sm:text-sm">
          Chuyển đổi giữa các dự án bạn đã vibe code thành công hoặc nạp dự án mới để làm chủ.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 my-2 sm:my-3 max-h-[55vh] overflow-y-auto pr-1">
        {projects.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
            <FolderGit2 className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Chưa có dự án nào</p>
            <p className="text-xs text-slate-500">
              Bạn có thể nạp dự án mới bằng file JSON hoặc khôi phục các dự án mẫu ban đầu.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onOpenImport();
                }}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>+ Nhập Dự án Mới</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => restoreDefaultProjects()}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Khôi phục Mẫu</span>
              </Button>
            </div>
          </div>
        ) : (
          projects.map((proj) => {
            const isSelected = proj.id === activeProject?.id;
            const totalConcepts = proj.modules.reduce((acc, m) => acc + (m.concepts?.length || 0), 0);
            const masteredCount = proj.modules.reduce(
              (acc, m) => acc + (m.concepts?.filter((c) => c.masteryLevel === "mastered").length || 0),
              0
            );
            const percent = totalConcepts > 0 ? Math.round((masteredCount / totalConcepts) * 100) : 0;

            return (
              <div
                key={proj.id}
                onClick={() => {
                  switchProject(proj.id);
                  onOpenChange(false);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {getDomainIcon(proj.domain)}
                    <h4 className="font-bold text-slate-900 text-sm truncate">{proj.name}</h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] text-indigo-700 font-semibold bg-indigo-100/70 px-2 py-0.5 rounded-full">
                        <Check className="h-3 w-3" /> Đang học
                      </span>
                    )}

                    {/* Sửa / Import lại dự án */}
                    <button
                      type="button"
                      title="Sửa / Import lại dự án này (Reset tiến độ)"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(proj);
                        setEditOpen(true);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors cursor-pointer"
                    >
                      <FileEdit className="h-3.5 w-3.5" />
                    </button>

                    {/* Xóa dự án */}
                    <button
                      type="button"
                      title="Xóa dự án này"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProject(proj);
                        setDeleteOpen(true);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {proj.summary || proj.description}
                </p>

                {proj.keyFeatures && proj.keyFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.keyFeatures.slice(0, 2).map((feat, fIdx) => (
                      <span
                        key={fIdx}
                        className="inline-flex items-center text-[10px] font-medium bg-indigo-50/70 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-100 truncate max-w-[280px]"
                        title={feat}
                      >
                        ✦ {feat}
                      </span>
                    ))}
                    {proj.keyFeatures.length > 2 && (
                      <span className="text-[10px] font-mono text-slate-400 self-center">
                        +{proj.keyFeatures.length - 2} chức năng nữa
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {getDomainBadge(proj.domain)}
                    <span className="text-slate-400 font-medium">{totalConcepts} concepts</span>
                  </div>
                  <span className="font-mono text-slate-600">
                    Đã làm chủ: <strong className="text-emerald-600">{percent}%</strong>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onOpenImport();
            }}
            className="gap-1.5 sm:gap-2 text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold text-xs sm:text-sm px-2.5 sm:px-3"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">+ Nhập Dự án Mới (JSON)</span>
            <span className="sm:hidden">+ Nhập Dự Án</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => restoreDefaultProjects()}
            title="Khôi phục các dự án mẫu ban đầu nếu đã bị xóa"
            className="text-xs text-slate-500 hover:text-slate-800 gap-1.5 px-2"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Khôi phục mẫu</span>
          </Button>
        </div>

        <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)} className="ml-auto sm:ml-0">
          Đóng
        </Button>
      </div>

      {/* Edit & Delete Modals */}
      <EditProjectModal
        open={editOpen}
        onOpenChange={setEditOpen}
        project={editingProject}
      />
      <DeleteProjectModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        project={deletingProject}
      />
    </Dialog>
  );
}
