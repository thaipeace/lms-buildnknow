"use client";

import React, { useState, useEffect } from "react";
import { CurriculumProvider, useCurriculum } from "@/context/CurriculumContext";
import { AIProvider, useAI } from "@/context/AIContext";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainStage } from "@/components/stage/MainStage";
import { Button } from "@/components/ui/button";
import { ImportModal } from "@/components/modals/ImportModal";
import { Layers, Sparkles, RotateCcw } from "lucide-react";

function CoursePlayerShell() {
  const {
    hasProjects,
    activeConcept,
    navigateToPrevConcept,
    navigateToNextConcept,
    hasPrevConcept,
    hasNextConcept,
    restoreDefaultProjects,
  } = useCurriculum();
  const { registerSidebarOpener } = useAI();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    registerSidebarOpener(() => setSidebarCollapsed(false));
  }, [registerSidebarOpener]);

  useEffect(() => {
    // Open sidebar by default only on larger screens (>= 1024px)
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarCollapsed(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement?.tagName.toLowerCase();
      if (activeEl === "input" || activeEl === "textarea") return;

      if (e.key === "ArrowRight" && hasNextConcept) {
        navigateToNextConcept();
      } else if (e.key === "ArrowLeft" && hasPrevConcept) {
        navigateToPrevConcept();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNextConcept, hasPrevConcept, navigateToNextConcept, navigateToPrevConcept]);

  if (!hasProjects) {
    return (
      <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
        <Topbar />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Layers className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Chưa có dự án học tập nào</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Bạn đã xóa toàn bộ các dự án khỏi hệ thống. Hãy nạp dự án mới bằng file JSON giáo án hoặc khôi phục lại các dự án mẫu ban đầu.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                variant="default"
                size="default"
                onClick={() => setImportOpen(true)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-xs"
              >
                <Sparkles className="h-4 w-4" />
                <span>+ Nhập Dự Án Mới (JSON)</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => restoreDefaultProjects()}
                className="gap-2 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer shadow-2xs"
              >
                <RotateCcw className="h-4 w-4 text-slate-500" />
                <span>↺ Khôi phục Dự Án Mẫu</span>
              </Button>
            </div>
          </div>
        </div>
        <ImportModal open={importOpen} onOpenChange={setImportOpen} />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Topbar with sidebar toggle support */}
      <Topbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Body: Split Player Layout */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Main Learning Stage */}
        <main className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0 bg-slate-50">
          <MainStage
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </main>

        {/* Sidebar Accordion / Drawer on Mobile */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <CurriculumProvider>
      <AIProvider>
        <CoursePlayerShell />
      </AIProvider>
    </CurriculumProvider>
  );
}
