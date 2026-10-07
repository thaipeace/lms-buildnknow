"use client";

import React, { useState } from "react";
import { useCurriculum } from "@/context/CurriculumContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Layers,
  Clock,
  Trophy,
  Target,
  FileCode2,
  CheckCircle2,
  CircleDot,
  Circle,
  Cpu,
  Boxes,
  Code2,
  Palette,
  Mic,
  Video,
  Workflow,
  Wand2,
  PanelRightClose,
  PanelRightOpen,
  FileEdit,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { DomainType } from "@/types/curriculum";
import { EditProjectModal } from "@/components/modals/EditProjectModal";
import { DeleteProjectModal } from "@/components/modals/DeleteProjectModal";

interface ProjectOverviewStageProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function ProjectOverviewStage({
  sidebarCollapsed = false,
  onToggleSidebar,
}: ProjectOverviewStageProps) {
  const {
    activeProject,
    stats,
    setActiveConceptId,
    navigateToNextConcept,
    resetProjectProgress,
  } = useCurriculum();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Find first concept in project
  const firstConcept = activeProject.modules[0]?.concepts[0];

  // Calculate total estimated minutes
  const totalMinutes = activeProject.modules.reduce((sum, mod) => {
    return (
      sum +
      mod.concepts.reduce((mSum, c) => mSum + (c.estimatedMinutes || 10), 0)
    );
  }, 0);

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
      default:
        return <Workflow className="h-4 w-4 text-emerald-600" />;
    }
  };

  const getDomainBadge = (domain: DomainType) => {
    switch (domain) {
      case "software":
        return <Badge variant="cyan">💻 Software Architecture</Badge>;
      case "image":
        return <Badge variant="purple">🎨 Generative AI Art</Badge>;
      case "audio":
        return <Badge variant="warning">🎙️ Audio Engineering</Badge>;
      case "video":
        return <Badge variant="secondary">🎬 Video & Motion</Badge>;
      default:
        return <Badge variant="outline">⚡ Workflow Automation</Badge>;
    }
  };

  return (
    <div
      id="project-overview-container"
      className="h-full w-full overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-slate-50 p-3.5 sm:p-6 lg:p-8 scrollbar-thin space-y-4 sm:space-y-6"
    >
      {/* 1. HERO HEADER */}
      <div className="relative rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-4 sm:p-6 lg:p-8 shadow-md overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 h-48 w-48 rounded-full bg-sky-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top meta tags */}
          <div className="flex flex-wrap items-center gap-2">
            {getDomainBadge(activeProject.domain)}
            <Badge variant="outline" className="text-indigo-200 border-indigo-700 bg-indigo-950/60 font-mono text-[11px]">
              v{activeProject.version}
            </Badge>

            {activeProject.aiToolsUsed && activeProject.aiToolsUsed.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-200">
                <Wand2 className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[11px] text-indigo-300">AI Co-pilots:</span>
                {activeProject.aiToolsUsed.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-medium border border-white/10"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}

            {onToggleSidebar && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleSidebar}
                className="text-xs gap-1.5 h-7 px-2.5 border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer ml-auto"
                title={sidebarCollapsed ? "Mở danh sách bài học" : "Thu gọn danh sách bài học"}
              >
                {sidebarCollapsed ? (
                  <>
                    <PanelRightOpen className="h-3.5 w-3.5 text-indigo-300" />
                    <span className="hidden md:inline">Danh sách</span>
                  </>
                ) : (
                  <>
                    <PanelRightClose className="h-3.5 w-3.5 text-indigo-200" />
                    <span className="hidden md:inline">Thu gọn</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Project Title */}
          <div>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {activeProject.name}
            </h1>
            {activeProject.description && (
              <p className="text-xs sm:text-sm text-indigo-100/90 mt-1.5 sm:mt-2 max-w-3xl leading-relaxed">
                {activeProject.description}
              </p>
            )}
          </div>

          {/* Quick CTA Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-2.5">
            {firstConcept && (
              <Button
                size="default"
                onClick={() => setActiveConceptId(firstConcept.id)}
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 h-9 sm:h-10 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer gap-2 flex-1 sm:flex-initial justify-center"
              >
                <span>Bắt đầu bài học đầu tiên</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="h-9 sm:h-10 px-2.5 sm:px-3 text-xs gap-1.5 border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-xs cursor-pointer shadow-2xs"
              title="Chỉnh sửa hoặc import lại JSON dự án này (Reset tiến độ)"
            >
              <FileEdit className="h-3.5 w-3.5 text-indigo-300" />
              <span>Sửa / Import lại</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Bạn có chắc muốn đặt lại toàn bộ tiến độ của dự án này về ban đầu không?")) {
                  resetProjectProgress();
                }
              }}
              className="h-9 sm:h-10 px-2.5 sm:px-3 text-xs gap-1.5 border-white/15 bg-white/5 hover:bg-white/15 text-indigo-200 hover:text-white backdrop-blur-xs cursor-pointer shadow-2xs"
              title="Đặt lại tiến độ học tập của dự án này"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-300" />
              <span className="hidden sm:inline">Reset tiến độ</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="h-9 sm:h-10 px-2.5 sm:px-3 text-xs gap-1.5 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 hover:text-white backdrop-blur-xs cursor-pointer shadow-2xs"
              title="Xóa dự án này"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>Xóa</span>
            </Button>

            <div className="flex items-center gap-2 text-xs text-indigo-200 bg-white/5 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-xs w-full sm:w-auto sm:ml-auto justify-center sm:justify-start">
              <Clock className="h-4 w-4 text-indigo-400" />
              <span>Ước tính: <strong>~{totalMinutes} phút</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Tổng Concepts</span>
            <BookOpen className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {stats.totalConcepts}
          </div>
          <p className="text-[11px] text-slate-400">Khái niệm cốt lõi</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Modules dự án</span>
            <Boxes className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {activeProject.modules.length}
          </div>
          <p className="text-[11px] text-slate-400">Cụm công nghệ chính</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Đã làm chủ</span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">
            {stats.masteredCount}
            <span className="text-xs text-slate-400 font-normal"> / {stats.totalConcepts}</span>
          </div>
          <p className="text-[11px] text-slate-400">Concepts thành thạo</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Tiến độ tổng</span>
            <span className="text-xs font-bold text-indigo-600">{stats.percentage}%</span>
          </div>
          <div className="pt-2">
            <Progress value={stats.percentage} className="h-2 bg-slate-100" indicatorColor="bg-indigo-600" />
          </div>
          <p className="text-[11px] text-slate-400 pt-0.5">{stats.learningCount} đang củng cố</p>
        </div>
      </div>

      {/* 3. PROJECT SUMMARY & CONTEXT (ĐOẠN SUMMARY NGẮN VỀ DỰ ÁN) */}
      <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 p-4 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs shadow-indigo-600/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Tóm tắt Dự án & Bối cảnh Kiến trúc
            </h2>
            <p className="text-xs text-slate-500">
              Tổng quan bài toán thực tế, kiến trúc hệ thống và giá trị công nghệ cốt lõi
            </p>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl bg-white border border-indigo-100 text-slate-700 text-xs sm:text-sm leading-relaxed shadow-2xs">
          <p className="font-normal text-slate-800 text-justify">
            {activeProject.summary || activeProject.description}
          </p>
        </div>
      </div>

      {/* 4. KEY FEATURES TO EXPLORE (NHỮNG CHỨC NĂNG CHÍNH SẼ TÌM HIỂU) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs shadow-amber-500/20">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Những Chức năng Chính Sẽ Tìm Hiểu & Làm Chủ
              </h2>
              <p className="text-xs text-slate-500">
                Các trọng tâm công nghệ và kỹ thuật mấu chốt bạn sẽ mổ xẻ sâu trong dự án này
              </p>
            </div>
          </div>

          <Badge variant="outline" className="hidden sm:inline-flex text-xs font-mono text-indigo-700 border-indigo-200 bg-indigo-50">
            {activeProject.keyFeatures?.length || activeProject.modules.length} Điểm Trọng Tâm
          </Badge>
        </div>

        {activeProject.keyFeatures && activeProject.keyFeatures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {activeProject.keyFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="group p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all flex items-start gap-3.5 shadow-2xs"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-mono font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-indigo-950 leading-snug">
                    {feature}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {activeProject.modules.map((mod, idx) => (
              <div
                key={mod.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3.5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-mono font-bold text-xs">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Phạm vi: <code className="font-mono text-[11px] bg-slate-200/60 px-1 py-0.5 rounded">{mod.artifactScope}</code>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. ROADMAP: MODULES & CONCEPTS LIST */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xs space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-600 text-white shadow-xs shadow-sky-600/20">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Lộ trình Giáo án (Modules & Concepts Roadmap)
            </h2>
            <p className="text-xs text-slate-500">
              Bấm vào bất kỳ concept nào bên dưới để bắt đầu tự học & tự vấn ngay
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 pt-1">
          {activeProject.modules.map((mod, mIdx) => (
            <div
              key={mod.id}
              className="rounded-xl border border-slate-200/90 overflow-hidden bg-slate-50/30"
            >
              {/* Module Header */}
              <div className="p-3 sm:p-3.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-[11px] font-bold">
                    M{mIdx + 1}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    {mod.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                    {mod.artifactScope}
                  </span>
                  <span>{mod.concepts.length} bài học</span>
                </div>
              </div>

              {/* Concepts Grid */}
              <div className="p-2.5 sm:p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                {mod.concepts.map((concept) => {
                  const isMastered = concept.masteryLevel === "mastered";
                  const isLearning = concept.masteryLevel === "learning";

                  return (
                    <button
                      key={concept.id}
                      type="button"
                      onClick={() => setActiveConceptId(concept.id)}
                      className="p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] text-slate-400 group-hover:text-indigo-600 truncate max-w-[170px]">
                            {concept.artifactAnchor.split(":")[0]}
                          </span>
                          {isMastered ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          ) : isLearning ? (
                            <CircleDot className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                          )}
                        </div>

                        <h4 className="text-xs font-semibold text-slate-800 group-hover:text-indigo-900 line-clamp-2 leading-snug">
                          {concept.title}
                        </h4>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {concept.estimatedMinutes || 10}m
                        </span>
                        <span className="text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Học ngay <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. BOTTOM ACTION FOOTER */}
      {firstConcept && (
        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-sm text-center sm:text-left">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Sẵn sàng làm chủ 100% bản chất dự án?
            </h3>
            <p className="text-xs text-indigo-100 mt-0.5">
              Bắt đầu với bài học đầu tiên: <strong>{firstConcept.title}</strong>
            </p>
          </div>

          <Button
            size="default"
            onClick={() => setActiveConceptId(firstConcept.id)}
            className="bg-white hover:bg-slate-100 text-indigo-900 font-bold text-xs sm:text-sm px-5 h-9 shrink-0 shadow-xs cursor-pointer gap-2 justify-center"
          >
            <span>Vào bài học ngay</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Modals */}
      <EditProjectModal
        open={editOpen}
        onOpenChange={setEditOpen}
        project={activeProject}
      />
      <DeleteProjectModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        project={activeProject}
      />
    </div>
  );
}
