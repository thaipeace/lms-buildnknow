"use client";

import React, { useState } from "react";
import { useCurriculum } from "@/context/CurriculumContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Layers,
  ChevronDown,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  Trophy,
  Compass,
  FileEdit,
  MoreVertical,
  BookOpen,
  X,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
} from "lucide-react";
import { ProjectSwitcherModal } from "@/components/modals/ProjectSwitcherModal";
import { ImportModal } from "@/components/modals/ImportModal";
import { ExportModal } from "@/components/modals/ExportModal";
import { EditProjectModal } from "@/components/modals/EditProjectModal";

interface TopbarProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function Topbar({ sidebarCollapsed, onToggleSidebar }: TopbarProps) {
  const {
    activeProject,
    hasProjects,
    stats,
    resetProjectProgress,
    isProjectOverview,
    openProjectOverview,
    syncStatus,
    lastSyncedAt,
    triggerSync,
  } = useCurriculum();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDomainBadge = () => {
    switch (activeProject.domain) {
      case "software":
        return <Badge variant="cyan" className="px-1.5 py-0 text-[10px] sm:text-xs">💻 Software</Badge>;
      case "image":
        return <Badge variant="purple" className="px-1.5 py-0 text-[10px] sm:text-xs">🎨 AI Art</Badge>;
      case "audio":
        return <Badge variant="warning" className="px-1.5 py-0 text-[10px] sm:text-xs">🎙️ Audio</Badge>;
      case "video":
        return <Badge variant="secondary" className="px-1.5 py-0 text-[10px] sm:text-xs">🎬 Video</Badge>;
      default:
        return <Badge variant="outline" className="px-1.5 py-0 text-[10px] sm:text-xs">⚡ Workflow</Badge>;
    }
  };

  const handleReset = () => {
    if (confirm("Bạn có chắc muốn đặt lại toàn bộ tiến độ của dự án này về ban đầu không?")) {
      resetProjectProgress();
    }
  };

  return (
    <>
      <header className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-2.5 sm:px-4 md:px-6 h-14 shrink-0 flex items-center justify-between shadow-2xs z-30 relative">
        {/* Left: Brand & Project Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
          <div className="flex items-center gap-2 font-bold text-slate-900 shrink-0 tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs shadow-indigo-600/20">
              <Layers className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline-block text-base font-bold text-slate-900 tracking-tight">
              BuildNKnow
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block shrink-0" />

          {/* Project Switcher Button */}
          <button
            onClick={() => setSwitcherOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-left transition-all max-w-[130px] xs:max-w-[180px] sm:max-w-xs md:max-w-sm cursor-pointer group shadow-2xs shrink min-w-0"
            title="Đổi dự án khác hoặc nạp mới"
          >
            <div className="shrink-0">{getDomainBadge()}</div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-slate-950 truncate">
              {activeProject.name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 shrink-0 ml-0.5" />
          </button>

          {/* Quick Project Overview Toggle Button */}
          <button
            onClick={openProjectOverview}
            title="Xem tóm tắt dự án & các chức năng chính"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0 ${
              isProjectOverview
                ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600"
            }`}
          >
            <Compass className={`h-3.5 w-3.5 ${isProjectOverview ? "text-white" : "text-indigo-600"}`} />
            <span className="hidden md:inline">Tổng quan</span>
          </button>
        </div>

        {/* Right: Progress & Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Desktop Progress Indicator */}
          <div className="hidden lg:flex flex-col items-end gap-1 min-w-[130px]">
            <div className="flex items-center gap-1.5 text-xs">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-slate-500 font-medium">Làm chủ:</span>
              <strong className="text-slate-900 font-mono">{stats.percentage}%</strong>
              <span className="text-slate-500 text-[11px]">
                ({stats.masteredCount}/{stats.totalConcepts})
              </span>
            </div>
            <Progress
              value={stats.percentage}
              className="w-32 h-1.5 bg-slate-200"
              indicatorColor="bg-indigo-600"
            />
          </div>

          {/* Mobile/Tablet mini percentage badge */}
          <div className="flex lg:hidden items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-xs font-bold">
            <Trophy className="h-3 w-3 text-amber-500" />
            <span>{stats.percentage}%</span>
          </div>

          {/* Cloud Sync Status Indicator */}
          <button
            onClick={() => triggerSync()}
            title={
              syncStatus === "synced"
                ? `Đã đồng bộ Cloudflare D1 (${lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : "vừa xong"}). Nhấn để đồng bộ lại.`
                : syncStatus === "syncing"
                ? "Đang lưu lên Cloudflare D1..."
                : syncStatus === "offline"
                ? "Ngoại tuyến / Mất mạng. Dữ liệu đang được lưu an toàn trong máy."
                : "Nhấn để đồng bộ dữ liệu lên Cloudflare D1"
            }
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer shadow-2xs shrink-0 ${
              syncStatus === "synced"
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70"
                : syncStatus === "syncing"
                ? "bg-blue-50/70 border-blue-200 text-blue-700 hover:bg-blue-100/70"
                : syncStatus === "error" || syncStatus === "offline"
                ? "bg-amber-50/70 border-amber-200 text-amber-700 hover:bg-amber-100/70"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {syncStatus === "synced" && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <CloudCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="hidden sm:inline text-[11px] font-semibold">Cloud</span>
              </>
            )}
            {syncStatus === "syncing" && (
              <>
                <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                <span className="hidden sm:inline text-[11px] font-semibold">Đang lưu...</span>
              </>
            )}
            {(syncStatus === "offline" || syncStatus === "error") && (
              <>
                <CloudOff className="h-3.5 w-3.5 text-amber-600" />
                <span className="hidden sm:inline text-[11px] font-semibold">Cục bộ</span>
              </>
            )}
            {syncStatus === "idle" && (
              <>
                <Cloud className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline text-[11px] font-semibold">Đồng bộ</span>
              </>
            )}
          </button>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-1.5">
            {hasProjects && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                title="Sửa hoặc import lại dự án này (Reset tiến độ)"
                className="h-8 px-2.5 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <FileEdit className="h-3.5 w-3.5 text-indigo-600" />
                <span>Sửa dự án</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(true)}
              className="h-8 px-2.5 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              <span>Import</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportOpen(true)}
              className="h-8 px-2.5 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              title="Đặt lại tiến độ dự án"
              className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Mobile/Tablet: Curriculum Drawer Toggle Button */}
          {onToggleSidebar && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSidebar}
              className="h-8 px-2 xs:px-2.5 text-xs gap-1.5 border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 cursor-pointer lg:hidden font-semibold shadow-2xs"
              title={sidebarCollapsed ? "Mở danh sách bài học" : "Đóng danh sách bài học"}
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden xs:inline">Mục lục</span>
            </Button>
          )}

          {/* Mobile/Tablet More Actions Dropdown Menu Button */}
          <div className="relative lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-8 w-8 text-slate-600 hover:bg-slate-100 cursor-pointer"
              title="Thao tác khác"
              aria-label="Thao tác khác"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {/* Mobile Menu Dropdown Popover */}
            {mobileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-2xs"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Progress summary inside menu */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 mb-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" /> Độ làm chủ
                      </span>
                      <strong className="text-indigo-600 font-mono">{stats.percentage}%</strong>
                    </div>
                    <Progress
                      value={stats.percentage}
                      className="h-1.5 bg-slate-200"
                      indicatorColor="bg-indigo-600"
                    />
                    <div className="text-[11px] text-slate-400 text-right">
                      {stats.masteredCount} / {stats.totalConcepts} concepts
                    </div>
                  </div>

                  {/* Cloud Sync Status in Mobile Menu */}
                  <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 text-slate-600 truncate mr-2">
                      {syncStatus === "synced" && <CloudCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                      {syncStatus === "syncing" && <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin shrink-0" />}
                      {(syncStatus === "offline" || syncStatus === "error") && <CloudOff className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                      {syncStatus === "idle" && <Cloud className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                      <span className="truncate">
                        {syncStatus === "synced"
                          ? `Đã lưu ${lastSyncedAt ? lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "vừa xong"}`
                          : syncStatus === "syncing"
                          ? "Đang lưu Cloud..."
                          : "Đang lưu cục bộ"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerSync();
                        setMobileMenuOpen(false);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 cursor-pointer"
                    >
                      Đồng bộ
                    </button>
                  </div>

                  <div className="space-y-0.5 text-xs text-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        openProjectOverview();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer"
                    >
                      <Compass className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium">Xem Tổng quan Dự án</span>
                    </button>

                    {hasProjects && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditOpen(true);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                      >
                        <FileEdit className="h-4 w-4 text-indigo-600" />
                        <span>Sửa / Cập nhật Dự án</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setImportOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                    >
                      <Upload className="h-4 w-4 text-slate-500" />
                      <span>Nhập Dự án Mới (JSON)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExportOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                    >
                      <Download className="h-4 w-4 text-slate-500" />
                      <span>Xuất Dữ liệu (Export JSON)</span>
                    </button>

                    <div className="h-[1px] bg-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleReset();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors text-left cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4 text-rose-500" />
                      <span>Đặt lại tiến độ dự án</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <ProjectSwitcherModal
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
        onOpenImport={() => setImportOpen(true)}
      />
      <ImportModal open={importOpen} onOpenChange={setImportOpen} />
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
      <EditProjectModal
        open={editOpen}
        onOpenChange={setEditOpen}
        project={activeProject}
      />
    </>
  );
}
