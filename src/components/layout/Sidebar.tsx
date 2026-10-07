"use client";

import React, { useState, useMemo } from "react";
import { useCurriculum } from "@/context/CurriculumContext";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  CircleDot,
  Circle,
  Search,
  BookOpen,
  Clock,
  X,
  Compass,
} from "lucide-react";
import { MasteryLevel } from "@/types/curriculum";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const {
    activeProject,
    activeConcept,
    setActiveConceptId,
    isProjectOverview,
    openProjectOverview,
    stats,
  } = useCurriculum();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    (activeProject?.modules || []).forEach((m) => {
      initial[m.id] = true;
    });
    return initial;
  });

  const handleSelectConcept = (conceptId: string) => {
    setActiveConceptId(conceptId);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onToggleCollapse();
    }
  };

  const handleOpenOverview = () => {
    openProjectOverview();
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onToggleCollapse();
    }
  };

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const filteredModules = useMemo(() => {
    const modules = activeProject?.modules || [];
    if (!searchQuery.trim()) return modules;

    const q = searchQuery.toLowerCase();
    return modules
      .map((mod) => {
        const matchesConcepts = (mod.concepts || []).filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.whyUsed.toLowerCase().includes(q) ||
            c.artifactAnchor.toLowerCase().includes(q)
        );
        const matchesModuleTitle = mod.title.toLowerCase().includes(q);

        if (matchesModuleTitle) return mod;
        if (matchesConcepts.length > 0) {
          return { ...mod, concepts: matchesConcepts };
        }
        return null;
      })
      .filter(Boolean) as typeof activeProject.modules;
  }, [activeProject, searchQuery]);

  const getStatusIcon = (level: MasteryLevel, isActive: boolean) => {
    switch (level) {
      case "mastered":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
      case "learning":
        return <CircleDot className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return (
          <Circle
            className={`h-4 w-4 shrink-0 ${
              isActive ? "text-indigo-600" : "text-slate-300"
            }`}
          />
        );
    }
  };

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggleCollapse}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel: Slide-over Drawer on Mobile/Tablet, Inline on Desktop */}
      <aside
        className={`bg-white flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out z-50
          fixed inset-y-0 right-0 w-[88vw] sm:w-96 max-w-md shadow-2xl border-l border-slate-200
          ${collapsed ? "translate-x-full pointer-events-none" : "translate-x-0 pointer-events-auto"}
          lg:static lg:translate-x-0 lg:z-auto
          ${
            collapsed
              ? "lg:w-0 lg:border-none lg:opacity-0 lg:pointer-events-none"
              : "lg:w-80 xl:w-96 lg:border-l lg:border-slate-200 lg:shadow-xs lg:opacity-100"
          }
        `}
      >
        {/* Sidebar Header */}
        <div className="p-3 sm:p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm min-w-0">
            <BookOpen className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="truncate">Nội dung dự án</span>
            {stats && (
              <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 rounded-full shrink-0">
                {stats.masteredCount}/{stats.totalConcepts}
              </span>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Đóng sidebar"
            aria-label="Đóng sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Project Overview Quick Link */}
        <div className="p-2 border-b border-slate-200 bg-slate-50/60 shrink-0">
          <button
            type="button"
            onClick={handleOpenOverview}
            className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer border text-left ${
              isProjectOverview
                ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                : "bg-white hover:bg-indigo-50/60 border-slate-200 hover:border-indigo-200 text-slate-800 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  isProjectOverview
                    ? "bg-white/20 text-white"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                <Compass className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div
                  className={`text-xs font-bold truncate ${
                    isProjectOverview ? "text-white" : "text-slate-900"
                  }`}
                >
                  Tổng quan dự án
                </div>
                <div
                  className={`text-[10px] truncate ${
                    isProjectOverview ? "text-indigo-100" : "text-slate-500"
                  }`}
                >
                  Tóm tắt & Chức năng chính
                </div>
              </div>
            </div>
            <ChevronRight
              className={`h-4 w-4 shrink-0 ${
                isProjectOverview ? "text-white" : "text-slate-400"
              }`}
            />
          </button>
        </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-200 bg-white shrink-0">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm concept, file, từ khóa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Modules & Concepts Accordion List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5">
        {filteredModules.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Không tìm thấy concept nào khớp với từ khóa "{searchQuery}"
          </div>
        ) : (
          filteredModules.map((mod) => {
            const isExpanded = expandedModules[mod.id] ?? true;
            const masteredInMod = mod.concepts.filter((c) => c.masteryLevel === "mastered").length;
            const totalInMod = mod.concepts.length;

            return (
              <div key={mod.id} className="py-1">
                {/* Module Header */}
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-800 group-hover:text-slate-950 line-clamp-1">
                      {mod.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
                    {masteredInMod}/{totalInMod}
                  </span>
                </button>

                {/* Concepts List */}
                {isExpanded && (
                  <div className="mt-1 space-y-1 pl-3 pr-1">
                    {mod.concepts.map((concept) => {
                      const isActive = activeConcept?.id === concept.id;

                      return (
                        <button
                          key={concept.id}
                          type="button"
                          onClick={() => handleSelectConcept(concept.id)}
                          className={`w-full px-3 py-2.5 rounded-lg flex items-start gap-2.5 text-left transition-all cursor-pointer ${
                            isActive
                              ? "bg-indigo-50 border border-indigo-200 text-indigo-950 shadow-2xs font-medium"
                              : "text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <div className="pt-0.5">
                            {getStatusIcon(concept.masteryLevel, isActive)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs leading-snug line-clamp-2 ${
                                isActive ? "font-semibold text-indigo-900" : "text-slate-800"
                              }`}
                            >
                              {concept.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                              {concept.estimatedMinutes && (
                                <span className="flex items-center gap-1 font-sans">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  {concept.estimatedMinutes}m drill
                                </span>
                              )}
                              <span className="truncate max-w-[130px] font-mono text-slate-400">
                                {concept.artifactAnchor.split(":")[0]}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
    </>
  );
}
