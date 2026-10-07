"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  ProjectCurriculum,
  Concept,
  MasteryLevel,
  ProjectSummaryStats,
} from "@/types/curriculum";
import { sampleNestjsBackend } from "@/data/sample-nestjs-backend";
import { sampleComfyuiFlux } from "@/data/sample-comfyui-flux";

const PRELOADED_PROJECTS: ProjectCurriculum[] = [
  sampleNestjsBackend,
  sampleComfyuiFlux,
];

const STORAGE_KEY = "buildnknow_curriculums_v1";
const ACTIVE_PROJECT_KEY = "buildnknow_active_project_id_v1";
const DELETED_PROJECTS_KEY = "buildnknow_deleted_project_ids_v1";
const UPDATED_AT_KEY = "buildnknow_updated_at_v1";

const getDeletedProjectIds = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(DELETED_PROJECTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const addDeletedProjectId = (id: string) => {
  if (typeof window === "undefined") return;
  try {
    const current = getDeletedProjectIds();
    if (!current.includes(id)) {
      localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify([...current, id]));
    }
  } catch (e) {
    console.error("Failed to save deleted project id:", e);
  }
};

const removeDeletedProjectId = (id: string) => {
  if (typeof window === "undefined") return;
  try {
    const current = getDeletedProjectIds();
    localStorage.setItem(
      DELETED_PROJECTS_KEY,
      JSON.stringify(current.filter((item) => item !== id))
    );
  } catch (e) {
    console.error("Failed to remove deleted project id:", e);
  }
};

export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

interface CurriculumContextType {
  projects: ProjectCurriculum[];
  hasProjects: boolean;
  activeProject: ProjectCurriculum;
  activeConcept: Concept | null;
  activeConceptId: string;
  activeModuleId: string | null;
  isProjectOverview: boolean;
  stats: ProjectSummaryStats;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  syncError: string | null;
  triggerSync: () => Promise<void>;
  setActiveConceptId: (conceptId: string) => void;
  openProjectOverview: () => void;
  switchProject: (projectId: string) => void;
  setConceptMastery: (conceptId: string, level: MasteryLevel) => void;
  saveUserAnswer: (conceptId: string, answer: string) => void;
  saveUserNotes: (conceptId: string, notes: string) => void;
  revealHints: (conceptId: string) => void;
  importCurriculum: (jsonString: string) => { success: boolean; error?: string };
  reimportProject: (targetProjectId: string, jsonString: string) => { success: boolean; error?: string };
  deleteProject: (projectId: string) => void;
  restoreDefaultProjects: () => void;
  exportCurriculum: (project?: ProjectCurriculum) => string;
  resetProjectProgress: () => void;
  navigateToNextConcept: () => void;
  navigateToPrevConcept: () => void;
  hasNextConcept: boolean;
  hasPrevConcept: boolean;
}

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

export function CurriculumProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectCurriculum[]>(PRELOADED_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(sampleNestjsBackend.id);
  const [activeConceptId, setActiveConceptId] = useState<string>(
    sampleNestjsBackend.modules[0]?.concepts[0]?.id || ""
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isCloudInitializedRef = React.useRef(false);
  const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const localUpdatedAtRef = React.useRef<number>(0);

  // 1. Khôi phục trạng thái từ LocalStorage khi khởi chạy
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem(STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_PROJECT_KEY);
      const deletedIds = getDeletedProjectIds();

      if (savedProjects) {
        const parsed = JSON.parse(savedProjects) as ProjectCurriculum[];
        if (Array.isArray(parsed)) {
          // Lọc các dự án mà user chưa xóa
          const nonDeletedParsed = parsed.filter((p) => !deletedIds.includes(p.id));

          // Merge các preloaded project chưa bị xóa
          const activePreloaded = PRELOADED_PROJECTS.filter((pre) => !deletedIds.includes(pre.id));

          const merged: ProjectCurriculum[] = [];

          activePreloaded.forEach((pre) => {
            const existing = nonDeletedParsed.find((p) => p.id === pre.id);
            if (!existing) {
              merged.push(pre);
              return;
            }

            merged.push({
              ...pre,
              modules: pre.modules.map((preMod) => {
                const existingMod = existing.modules?.find((m) => m.id === preMod.id);
                if (!existingMod) return preMod;

                return {
                  ...preMod,
                  concepts: preMod.concepts.map((preConcept) => {
                    const existingConcept = existingMod.concepts?.find((c) => c.id === preConcept.id);
                    if (!existingConcept) return preConcept;

                    return {
                      ...preConcept,
                      masteryLevel: existingConcept.masteryLevel || preConcept.masteryLevel,
                      userAnswer: existingConcept.userAnswer ?? preConcept.userAnswer,
                      userNotes: existingConcept.userNotes ?? preConcept.userNotes,
                      revealedHints: existingConcept.revealedHints ?? preConcept.revealedHints,
                    };
                  }),
                };
              }),
            });
          });

          // Thêm các custom project do user import thêm
          nonDeletedParsed.forEach((p) => {
            if (!PRELOADED_PROJECTS.some((pre) => pre.id === p.id) && !merged.some((m) => m.id === p.id)) {
              merged.push(p);
            }
          });

          setProjects(merged);
        }
      } else {
        const activePreloaded = PRELOADED_PROJECTS.filter((pre) => !deletedIds.includes(pre.id));
        setProjects(activePreloaded);
      }

      if (savedActiveId && !deletedIds.includes(savedActiveId)) {
        setActiveProjectId(savedActiveId);
      }

      const savedTimestamp = Number(localStorage.getItem(UPDATED_AT_KEY) || 0);
      localUpdatedAtRef.current = savedTimestamp;
      if (savedTimestamp > 0) {
        setLastSyncedAt(new Date(savedTimestamp));
      }
    } catch (e) {
      console.error("Failed to load state from LocalStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Helper gửi dữ liệu lên Cloudflare D1
  const pushCloudState = async (
    projs: ProjectCurriculum[],
    activeId: string,
    deletedIds: string[],
    timestamp: number
  ) => {
    try {
      setSyncStatus("syncing");
      setSyncError(null);
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projects: projs,
          activeProjectId: activeId,
          deletedProjectIds: deletedIds,
          updatedAt: timestamp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus("synced");
        setLastSyncedAt(new Date(data.updatedAt || timestamp));
        setSyncError(null);
      } else {
        setSyncStatus("error");
        setSyncError(data.error || "Lỗi đồng bộ Cloudflare D1");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Mất kết nối mạng";
      setSyncStatus("offline");
      setSyncError(msg);
    }
  };

  // 2. Khởi tạo & Kiểm tra đồng bộ Cloudflare D1 khi trang load
  useEffect(() => {
    if (!isLoaded) return;
    let isMounted = true;

    const initCloudSync = async () => {
      try {
        const res = await fetch("/api/sync");
        const json = await res.json();
        if (!isMounted) return;

        if (!json.success || !json.configured) {
          setSyncStatus("idle");
          isCloudInitializedRef.current = true;
          return;
        }

        const cloudUpdatedAt = typeof json.updatedAt === "number" ? json.updatedAt : 0;
        const localUpdatedAt = localUpdatedAtRef.current;

        if (json.data && cloudUpdatedAt > localUpdatedAt) {
          // Cloud có dữ liệu mới hơn (vừa học trên điện thoại/máy khác)
          const cloudProjects = json.data.projects;
          const cloudActiveId = json.data.activeProjectId;
          const cloudDeletedIds = json.data.deletedProjectIds || [];

          if (Array.isArray(cloudProjects) && cloudProjects.length > 0) {
            setProjects(cloudProjects);
            if (cloudActiveId) setActiveProjectId(cloudActiveId);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudProjects));
              if (cloudActiveId) localStorage.setItem(ACTIVE_PROJECT_KEY, cloudActiveId);
              localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify(cloudDeletedIds));
              localStorage.setItem(UPDATED_AT_KEY, String(cloudUpdatedAt));
            } catch (e) {
              console.error("Failed to update localStorage with cloud data:", e);
            }
            localUpdatedAtRef.current = cloudUpdatedAt;
            setLastSyncedAt(new Date(cloudUpdatedAt));
            setSyncStatus("synced");
          }
        } else if (localUpdatedAt > cloudUpdatedAt || (!json.data && projects.length > 0)) {
          // Local mới hơn hoặc Cloud chưa có dữ liệu: đẩy local lên cloud
          await pushCloudState(projects, activeProjectId, getDeletedProjectIds(), localUpdatedAt || Date.now());
        } else {
          // Cả hai đã đồng bộ
          setLastSyncedAt(new Date(cloudUpdatedAt || Date.now()));
          setSyncStatus("synced");
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        console.warn("Cloudflare D1 init check error:", err);
        setSyncStatus("offline");
      } finally {
        if (isMounted) {
          isCloudInitializedRef.current = true;
        }
      }
    };

    initCloudSync();

    return () => {
      isMounted = false;
    };
  }, [isLoaded]);

  // 3. Tự động lưu LocalStorage tức thì (0ms) & Debounce đồng bộ lên Cloudflare D1
  useEffect(() => {
    if (!isLoaded) return;

    // A. Lưu LocalStorage tức thì - không có độ trễ
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
    } catch (e) {
      console.error("Failed to save state to LocalStorage:", e);
    }

    // B. Chỉ kích hoạt sync lên cloud khi đã hoàn thành bước kiểm tra cloud ban đầu
    if (!isCloudInitializedRef.current) return;

    const now = Date.now();
    localUpdatedAtRef.current = now;
    try {
      localStorage.setItem(UPDATED_AT_KEY, String(now));
    } catch {}

    setSyncStatus("syncing");

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce 2500ms để không gọi API liên tục khi đang gõ bài tập hoặc ghi chú
    syncTimeoutRef.current = setTimeout(() => {
      pushCloudState(projects, activeProjectId, getDeletedProjectIds(), now);
    }, 2500);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [projects, activeProjectId, isLoaded]);

  // 4. Kích hoạt đồng bộ thủ công ngay lập tức khi người dùng click nút
  const triggerSync = async () => {
    const now = Date.now();
    localUpdatedAtRef.current = now;
    try {
      localStorage.setItem(UPDATED_AT_KEY, String(now));
    } catch {}
    await pushCloudState(projects, activeProjectId, getDeletedProjectIds(), now);
  };

  // Project đang được chọn
  const activeProject = useMemo(() => {
    const found = projects.find((p) => p.id === activeProjectId);
    return found || projects[0] || sampleNestjsBackend;
  }, [projects, activeProjectId]);

  const hasProjects = projects.length > 0;

  // Danh sách phẳng tất cả concepts trong project hiện tại (hỗ trợ next/prev)
  const allConceptsInActiveProject = useMemo(() => {
    const list: { concept: Concept; moduleId: string }[] = [];
    (activeProject?.modules || []).forEach((mod) => {
      (mod?.concepts || []).forEach((c) => {
        list.push({ concept: c, moduleId: mod.id });
      });
    });
    return list;
  }, [activeProject]);

  const isProjectOverview = activeConceptId === "project-overview";

  const openProjectOverview = () => {
    setActiveConceptId("project-overview");
  };

  // Thiết lập concept mặc định ban đầu nếu chưa chọn
  useEffect(() => {
    if (activeConceptId === "project-overview") return;
    if (allConceptsInActiveProject.length > 0) {
      const exists = allConceptsInActiveProject.some((item) => item.concept.id === activeConceptId);
      if (!exists) {
        setActiveConceptId(allConceptsInActiveProject[0].concept.id);
      }
    }
  }, [activeProject, allConceptsInActiveProject, activeConceptId]);

  // Concept và Module đang hiển thị
  const currentConceptInfo = useMemo(() => {
    if (isProjectOverview) return null;
    return allConceptsInActiveProject.find((item) => item.concept.id === activeConceptId) || null;
  }, [allConceptsInActiveProject, activeConceptId, isProjectOverview]);

  const activeConcept = isProjectOverview
    ? null
    : (currentConceptInfo?.concept || allConceptsInActiveProject[0]?.concept || null);
  const activeModuleId = currentConceptInfo?.moduleId || null;

  // Tính toán thống kê độ hoàn thành
  const stats = useMemo<ProjectSummaryStats>(() => {
    let total = 0;
    let mastered = 0;
    let learning = 0;
    let unseen = 0;

    activeProject.modules.forEach((mod) => {
      mod.concepts.forEach((c) => {
        total++;
        if (c.masteryLevel === "mastered") mastered++;
        else if (c.masteryLevel === "learning") learning++;
        else unseen++;
      });
    });

    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return {
      totalConcepts: total,
      masteredCount: mastered,
      learningCount: learning,
      unseenCount: unseen,
      percentage,
    };
  }, [activeProject]);

  // Cập nhật thuộc tính của 1 concept cụ thể
  const updateConcept = (conceptId: string, updates: Partial<Concept>) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id !== activeProject.id) return p;
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          modules: p.modules.map((m) => ({
            ...m,
            concepts: m.concepts.map((c) => {
              if (c.id === conceptId) {
                return { ...c, ...updates };
              }
              return c;
            }),
          })),
        };
      })
    );
  };

  const setConceptMastery = (conceptId: string, level: MasteryLevel) => {
    updateConcept(conceptId, { masteryLevel: level });
  };

  const saveUserAnswer = (conceptId: string, answer: string) => {
    updateConcept(conceptId, { userAnswer: answer });
  };

  const saveUserNotes = (conceptId: string, notes: string) => {
    updateConcept(conceptId, { userNotes: notes });
  };

  const revealHints = (conceptId: string) => {
    updateConcept(conceptId, { revealedHints: true });
  };

  const switchProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setActiveConceptId("project-overview");
  };

  // Điều hướng Next/Prev concept
  const currentIndex = allConceptsInActiveProject.findIndex(
    (item) => item.concept.id === activeConceptId
  );
  const hasPrevConcept = isProjectOverview ? false : true;
  const hasNextConcept = isProjectOverview
    ? allConceptsInActiveProject.length > 0
    : currentIndex < allConceptsInActiveProject.length - 1 && currentIndex !== -1;

  const navigateToNextConcept = () => {
    if (isProjectOverview) {
      if (allConceptsInActiveProject.length > 0) {
        setActiveConceptId(allConceptsInActiveProject[0].concept.id);
      }
      return;
    }
    if (hasNextConcept) {
      setActiveConceptId(allConceptsInActiveProject[currentIndex + 1].concept.id);
    }
  };

  const navigateToPrevConcept = () => {
    if (isProjectOverview) return;
    if (currentIndex <= 0) {
      setActiveConceptId("project-overview");
    } else {
      setActiveConceptId(allConceptsInActiveProject[currentIndex - 1].concept.id);
    }
  };

  // Import curriculum từ JSON (cho dự án mới hoặc ghi đè)
  const importCurriculum = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString) as ProjectCurriculum;
      if (!data.id || !data.name || !Array.isArray(data.modules)) {
        return { success: false, error: "Định dạng JSON không hợp lệ: thiếu id, name hoặc modules." };
      }

      if (data.modules.length === 0) {
        return { success: false, error: "Dự án phải có ít nhất 1 module học tập." };
      }

      // Khởi tạo sạch các concept
      const cleanModules = data.modules.map((m) => ({
        ...m,
        concepts: (m.concepts || []).map((c) => ({
          ...c,
          masteryLevel: (c.masteryLevel || "unseen") as MasteryLevel,
          userAnswer: c.userAnswer || "",
          userNotes: c.userNotes || "",
          revealedHints: !!c.revealedHints,
        })),
      }));

      const cleanProject: ProjectCurriculum = {
        ...data,
        modules: cleanModules,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      removeDeletedProjectId(cleanProject.id);

      setProjects((prev) => {
        const filtered = prev.filter((p) => p.id !== cleanProject.id);
        return [cleanProject, ...filtered];
      });
      setActiveProjectId(cleanProject.id);
      // Hiển thị ngay màn hình Tổng quan dự án (Summary & Key Features)
      setActiveConceptId("project-overview");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Không thể phân tích cú pháp JSON." };
    }
  };

  // Sửa / Import lại dự án: cập nhật toàn bộ cấu trúc và RESET toàn bộ tiến trình
  const reimportProject = (
    targetProjectId: string,
    jsonString: string
  ): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString) as ProjectCurriculum;
      if (!data.id || !data.name || !Array.isArray(data.modules)) {
        return { success: false, error: "Định dạng JSON không hợp lệ: thiếu id, name hoặc modules." };
      }

      if (data.modules.length === 0) {
        return { success: false, error: "Dự án phải có ít nhất 1 module học tập." };
      }

      // RESET toàn bộ tiến trình học của các concept về 'unseen' sạch sẽ
      const cleanModules = data.modules.map((m) => ({
        ...m,
        concepts: (m.concepts || []).map((c) => ({
          ...c,
          masteryLevel: "unseen" as MasteryLevel,
          userAnswer: "",
          userNotes: "",
          revealedHints: false,
        })),
      }));

      const updatedProject: ProjectCurriculum = {
        ...data,
        modules: cleanModules,
        updatedAt: new Date().toISOString(),
      };

      removeDeletedProjectId(updatedProject.id);

      setProjects((prev) => {
        // Nếu giữ nguyên ID hoặc tìm thấy targetProjectId
        const targetIdx = prev.findIndex((p) => p.id === targetProjectId);
        if (targetIdx !== -1) {
          const next = [...prev];
          next[targetIdx] = updatedProject;
          return next;
        }

        // Nếu ID thay đổi sang một ID mới
        const filtered = prev.filter((p) => p.id !== targetProjectId && p.id !== updatedProject.id);
        return [updatedProject, ...filtered];
      });

      setActiveProjectId(updatedProject.id);
      setActiveConceptId("project-overview");

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Không thể phân tích cú pháp JSON." };
    }
  };

  // Xóa vĩnh viễn dự án khỏi danh sách
  const deleteProject = (projectId: string) => {
    addDeletedProjectId(projectId);

    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== projectId);
      
      // Nếu dự án bị xóa đang là active project, chuyển sang dự án khác
      if (activeProjectId === projectId) {
        if (remaining.length > 0) {
          setActiveProjectId(remaining[0].id);
          setActiveConceptId("project-overview");
        } else {
          setActiveProjectId("");
        }
      }
      return remaining;
    });
  };

  // Khôi phục các dự án mẫu ban đầu
  const restoreDefaultProjects = () => {
    try {
      localStorage.removeItem(DELETED_PROJECTS_KEY);
    } catch (e) {
      console.error("Failed to clear deleted projects:", e);
    }

    setProjects((prev) => {
      const merged = [...prev];
      PRELOADED_PROJECTS.forEach((pre) => {
        if (!merged.some((p) => p.id === pre.id)) {
          merged.push(pre);
        }
      });
      return merged;
    });

    setActiveProjectId(sampleNestjsBackend.id);
    setActiveConceptId("project-overview");
  };

  // Export curriculum hiện tại hoặc một project cụ thể
  const exportCurriculum = (project?: ProjectCurriculum): string => {
    const target = project || activeProject;
    return JSON.stringify(target, null, 2);
  };

  // Reset tiến độ của dự án hiện tại về 'unseen'
  const resetProjectProgress = () => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProject.id) return p;
        return {
          ...p,
          modules: p.modules.map((m) => ({
            ...m,
            concepts: m.concepts.map((c) => ({
              ...c,
              masteryLevel: "unseen",
              userAnswer: "",
              revealedHints: false,
            })),
          })),
        };
      })
    );
  };

  return (
    <CurriculumContext.Provider
      value={{
        projects,
        hasProjects,
        activeProject,
        activeConcept,
        activeConceptId,
        activeModuleId,
        isProjectOverview,
        stats,
        syncStatus,
        lastSyncedAt,
        syncError,
        triggerSync,
        setActiveConceptId,
        openProjectOverview,
        switchProject,
        setConceptMastery,
        saveUserAnswer,
        saveUserNotes,
        revealHints,
        importCurriculum,
        reimportProject,
        deleteProject,
        restoreDefaultProjects,
        exportCurriculum,
        resetProjectProgress,
        navigateToNextConcept,
        navigateToPrevConcept,
        hasNextConcept,
        hasPrevConcept,
      }}
    >
      {children}
    </CurriculumContext.Provider>
  );
}

export function useCurriculum() {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error("useCurriculum must be used within a CurriculumProvider");
  }
  return context;
}
