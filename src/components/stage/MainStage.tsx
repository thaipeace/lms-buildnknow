"use client";

import React, { useState } from "react";
import { useCurriculum } from "@/context/CurriculumContext";
import { ArtifactViewer } from "@/components/stage/ArtifactViewer";
import { OverviewTab } from "@/components/stage/OverviewTab";
import { SocraticDrillTab } from "@/components/stage/SocraticDrillTab";
import { NotesTab } from "@/components/stage/NotesTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Zap,
  FileEdit,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  CircleDot,
  Circle,
  Columns2,
  Code2,
  BookText,
  PanelRightClose,
  PanelRightOpen,
  Compass,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MasteryLevel } from "@/types/curriculum";
import { ProjectOverviewStage } from "@/components/stage/ProjectOverviewStage";

interface MainStageProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function MainStage({ sidebarCollapsed = false, onToggleSidebar }: MainStageProps) {
  const {
    activeProject,
    activeConcept,
    isProjectOverview,
    openProjectOverview,
    hasPrevConcept,
    hasNextConcept,
    navigateToPrevConcept,
    navigateToNextConcept,
    setConceptMastery,
  } = useCurriculum();

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [viewMode, setViewMode] = useState<"split" | "code" | "content">("split");

  if (isProjectOverview || !activeConcept) {
    return (
      <ProjectOverviewStage
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
      />
    );
  }

  const handleRateMastery = (level: MasteryLevel) => {
    setConceptMastery(activeConcept.id, level);
    if (level === "mastered") {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.8 },
          colors: ["#6366f1", "#10b981", "#f59e0b", "#06b6d4"],
        });
      } catch (e) {
        console.error("Confetti error:", e);
      }
    }
  };

  const getMasteryBadge = () => {
    switch (activeConcept.masteryLevel) {
      case "mastered":
        return (
          <Badge variant="success" className="gap-1 font-medium text-[11px] px-1.5 sm:px-2 py-0.5 shrink-0" title="Đã làm chủ">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span className="hidden sm:inline">Đã làm chủ</span>
          </Badge>
        );
      case "learning":
        return (
          <Badge variant="warning" className="gap-1 font-medium text-[11px] px-1.5 sm:px-2 py-0.5 shrink-0" title="Đang củng cố">
            <CircleDot className="h-3 w-3 shrink-0" />
            <span className="hidden sm:inline">Đang củng cố</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 font-medium text-[11px] px-1.5 sm:px-2 py-0.5 shrink-0" title="Chưa học">
            <Circle className="h-3 w-3 shrink-0" />
            <span className="hidden sm:inline">Chưa học</span>
          </Badge>
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50">
      {/* 1. Header Information & Layout Controller */}
      <div className="h-11 sm:h-12 px-2.5 sm:px-4 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 shadow-2xs z-10">
        {/* Left: Concept Info */}
        <div className="flex items-center gap-1.5 sm:gap-3 overflow-hidden min-w-0">
          <div className="shrink-0">{getMasteryBadge()}</div>

          <h1
            className="text-xs sm:text-sm font-bold text-slate-900 truncate"
            title={activeConcept.title}
          >
            {activeConcept.title}
          </h1>

          {activeConcept.estimatedMinutes && (
            <Badge variant="outline" className="hidden md:flex gap-1 text-[11px] text-slate-600 border-slate-200 shrink-0">
              <Clock className="h-3 w-3 text-slate-400" /> ~{activeConcept.estimatedMinutes}m
            </Badge>
          )}

          <span className="hidden xl:inline text-[11px] text-slate-400 font-mono truncate shrink-0">
            {activeConcept.artifactAnchor}
          </span>
        </div>

        {/* Right: Layout Switchers & Sidebar Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={openProjectOverview}
            className="h-7 sm:h-8 px-2 sm:px-2.5 text-xs gap-1.5 text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 border-slate-200 hidden md:inline-flex cursor-pointer"
            title="Xem tóm tắt dự án & các chức năng chính"
          >
            <Compass className="h-3.5 w-3.5 text-indigo-600" />
            <span>Tổng quan</span>
          </Button>

          {/* View Mode Toggle (Split / Code / Content) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              title="Xem song song Code & Bài học"
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "split"
                  ? "bg-white text-indigo-700 font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Song song</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("code")}
              title="Chỉ xem Code phóng to"
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "code"
                  ? "bg-white text-indigo-700 font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Code</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("content")}
              title="Chỉ xem Nội dung bài học"
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "content"
                  ? "bg-white text-indigo-700 font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bài học</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

          {/* Toggle Sidebar Button */}
          {onToggleSidebar && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSidebar}
              className="text-xs gap-1.5 h-8 px-2.5 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
              title={sidebarCollapsed ? "Mở danh sách bài học" : "Thu gọn danh sách bài học"}
            >
              {sidebarCollapsed ? (
                <>
                  <PanelRightOpen className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="hidden md:inline">Danh sách</span>
                </>
              ) : (
                <>
                  <PanelRightClose className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden md:inline">Thu gọn</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 2. Main Parallel Stage (Code on Left, Lesson Content on Right) */}
      <div className="flex-1 min-h-0 p-2 sm:p-2.5 overflow-hidden flex flex-col lg:flex-row gap-2.5">
        {/* Left Pane: Compact Artifact & Code Viewer */}
        <div
          className={`${
            viewMode === "split"
              ? "w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col min-h-0 overflow-hidden"
              : viewMode === "code"
              ? "w-full h-full flex flex-col min-h-0 overflow-hidden"
              : "hidden"
          }`}
        >
          <ArtifactViewer
            anchor={activeConcept.artifactAnchor}
            snippet={activeConcept.artifactSnippet}
            domain={activeProject.domain}
            className="h-full"
          />
        </div>

        {/* Right Pane: Interactive Learning Tabs (Overview, Drill, Notes) */}
        <div
          className={`${
            viewMode === "split"
              ? "w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col min-h-0 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden"
              : viewMode === "content"
              ? "w-full h-full flex flex-col min-h-0 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden"
              : "hidden"
          }`}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col min-h-0">
            {/* Pinned Tab Header */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 shrink-0 flex items-center justify-between gap-2">
              <TabsList className="h-8 bg-slate-200/70 p-0.5 rounded-lg">
                <TabsTrigger value="overview" className="h-7 px-2.5 text-xs gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Bản chất</span>
                </TabsTrigger>

                <TabsTrigger value="drill" className="h-7 px-2.5 text-xs gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Tự vấn ({activeConcept.socraticDrills?.length || 0})</span>
                </TabsTrigger>

                <TabsTrigger value="notes" className="h-7 px-2.5 text-xs gap-1.5">
                  <FileEdit className="h-3.5 w-3.5 text-sky-600" />
                  <span>Ghi chú</span>
                  {activeConcept.userNotes && (
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  )}
                </TabsTrigger>
              </TabsList>

              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                {activeTab === "overview" && "The 'Why' & Mechanics"}
                {activeTab === "drill" && "Socratic Active Recall"}
                {activeTab === "notes" && "Personal Insights"}
              </span>
            </div>

            {/* Scrollable Tab Content Container */}
            <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 scrollbar-thin">
              {/* Tab 1: Overview */}
              <TabsContent value="overview" className="mt-0">
                <OverviewTab
                  concept={activeConcept}
                  onGoToDrill={() => setActiveTab("drill")}
                />
              </TabsContent>

              {/* Tab 2: Socratic Drill Engine */}
              <TabsContent value="drill" className="mt-0">
                <SocraticDrillTab
                  concept={activeConcept}
                  onNavigateNext={navigateToNextConcept}
                  hasNext={hasNextConcept}
                />
              </TabsContent>

              {/* Tab 3: Personal Notes */}
              <TabsContent value="notes" className="mt-0">
                <NotesTab concept={activeConcept} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* 3. Bottom Fixed Player Navigation Bar */}
      <footer className="h-12 border-t border-slate-200 bg-white px-2 sm:px-4 flex items-center justify-between shrink-0 z-20 shadow-2xs">
        {/* Previous Concept Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={navigateToPrevConcept}
          disabled={!hasPrevConcept}
          className="gap-1 sm:gap-1.5 text-xs h-8 px-2 sm:px-2.5 border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer shrink-0"
          title="Bài trước"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Bài trước</span>
        </Button>

        {/* Center: Quick Self-Assessment Mastery Bar */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
            Đánh giá nhanh:
          </span>

          <button
            type="button"
            onClick={() => handleRateMastery("unseen")}
            title="Đánh dấu cần xem lại"
            className={`px-1.5 sm:px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeConcept.masteryLevel === "unseen"
                ? "bg-rose-100 text-rose-800 border border-rose-300 font-semibold"
                : "text-slate-600 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <span>🔴</span>
            <span className="hidden xs:inline ml-1 sm:hidden">Lại</span>
            <span className="hidden sm:inline ml-1">Cần xem lại</span>
          </button>

          <button
            type="button"
            onClick={() => handleRateMastery("learning")}
            title="Đánh dấu đang củng cố"
            className={`px-1.5 sm:px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeConcept.masteryLevel === "learning"
                ? "bg-amber-100 text-amber-900 border border-amber-300 font-semibold"
                : "text-slate-600 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <span>🟡</span>
            <span className="hidden xs:inline ml-1 sm:hidden">Học</span>
            <span className="hidden sm:inline ml-1">Đang củng cố</span>
          </button>

          <button
            type="button"
            onClick={() => handleRateMastery("mastered")}
            title="Đánh dấu đã làm chủ"
            className={`px-1.5 sm:px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeConcept.masteryLevel === "mastered"
                ? "bg-emerald-600 text-white shadow-2xs font-semibold"
                : "text-slate-600 hover:bg-slate-100 border border-transparent"
            }`}
          >
            <span>🟢</span>
            <span className="hidden xs:inline ml-1 sm:hidden">Làm chủ</span>
            <span className="hidden sm:inline ml-1">Đã làm chủ</span>
          </button>
        </div>

        {/* Right: Shortcut and Next Concept Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 font-mono mr-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600">
              →
            </kbd>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={navigateToNextConcept}
            disabled={!hasNextConcept}
            className="gap-1 sm:gap-1.5 text-xs h-8 px-2 sm:px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs disabled:opacity-40 cursor-pointer"
            title="Bài tiếp theo"
          >
            <span className="hidden sm:inline">Bài tiếp theo</span>
            <span className="sm:hidden">Tiếp</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
