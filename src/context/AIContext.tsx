"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Concept, SocraticDrill } from "@/types/curriculum";
import { AIMessage, AIEvaluationResult, AIConceptContext, AIModelType } from "@/types/ai";
import { useCurriculum } from "./CurriculumContext";
import confetti from "canvas-confetti";

const API_KEY_STORAGE = "buildnknow_gemini_api_key";
const MODEL_STORAGE = "buildnknow_gemini_model";
const MESSAGES_STORAGE = "buildnknow_ai_messages_v1";

interface AIContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  model: AIModelType;
  setModel: (m: AIModelType) => void;
  messages: AIMessage[];
  isChatting: boolean;
  isEvaluating: boolean;
  activeSidebarTab: "curriculum" | "ai";
  setActiveSidebarTab: (tab: "curriculum" | "ai") => void;
  openAISidebar: () => void;
  registerSidebarOpener: (opener: () => void) => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  sendChatMessage: (prompt: string, quotedSnippet?: string) => Promise<void>;
  evaluateAnswer: (concept: Concept, drill: SocraticDrill, answer: string) => Promise<AIEvaluationResult | null>;
  clearMessages: () => void;
  testApiKey: (keyToTest?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const {
    activeProject,
    activeConcept,
    activeModuleId,
    setConceptMastery,
    saveUserAnswer,
  } = useCurriculum();

  const [apiKey, setApiKeyState] = useState<string>("");
  const [model, setModelState] = useState<AIModelType>("gemini-2.5-flash");
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isChatting, setIsChatting] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"curriculum" | "ai">("curriculum");
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // 1. Tải API key & model từ localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(API_KEY_STORAGE);
      if (savedKey) setApiKeyState(savedKey);

      const savedModel = localStorage.getItem(MODEL_STORAGE) as AIModelType;
      if (savedModel) setModelState(savedModel);

      const savedMessages = localStorage.getItem(MESSAGES_STORAGE);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load AI state from localStorage:", e);
    }
  }, []);

  // 2. Lưu tin nhắn vào localStorage khi có thay đổi (giữ tối đa 40 tin nhắn gần nhất)
  useEffect(() => {
    try {
      if (messages.length > 0) {
        const toSave = messages.slice(-40);
        localStorage.setItem(MESSAGES_STORAGE, JSON.stringify(toSave));
      }
    } catch (e) {
      console.error("Failed to save AI messages to localStorage:", e);
    }
  }, [messages]);

  const setApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem(API_KEY_STORAGE, trimmed);
      } else {
        localStorage.removeItem(API_KEY_STORAGE);
      }
    } catch (e) {
      console.error("Failed to save API key to localStorage:", e);
    }
  }, []);

  const setModel = useCallback((m: AIModelType) => {
    setModelState(m);
    try {
      localStorage.setItem(MODEL_STORAGE, m);
    } catch (e) {
      console.error("Failed to save model to localStorage:", e);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(MESSAGES_STORAGE);
    } catch (e) {
      console.error("Failed to clear AI messages:", e);
    }
  }, []);

  // Helper tạo snapshot context hiện tại
  const buildConceptContext = useCallback(
    (concept?: Concept | null): AIConceptContext | undefined => {
      const targetConcept = concept || activeConcept;
      if (!targetConcept || !activeProject) return undefined;

      const currentModule = activeProject.modules?.find((m) =>
        m.concepts?.some((c) => c.id === targetConcept.id)
      );

      return {
        projectName: activeProject.name,
        projectDomain: activeProject.domain,
        projectSummary: activeProject.summary || activeProject.description,
        moduleTitle: currentModule?.title || "Chưa xác định",
        conceptTitle: targetConcept.title,
        conceptDescription: targetConcept.description,
        problemStatement: targetConcept.problemStatement,
        currentApproach: targetConcept.currentApproach,
        artifactAnchor: targetConcept.artifactAnchor,
        artifactSnippet: targetConcept.artifactSnippet,
        whyUsed: targetConcept.whyUsed,
        underTheHood: targetConcept.underTheHood,
        pitfalls: targetConcept.pitfalls,
        socraticDrills: targetConcept.socraticDrills,
        userAnswer: targetConcept.userAnswer,
        userNotes: targetConcept.userNotes,
      };
    },
    [activeConcept, activeProject]
  );

  const [openSidebarCallback, setOpenSidebarCallback] = useState<(() => void) | null>(null);

  const registerSidebarOpener = useCallback((opener: () => void) => {
    setOpenSidebarCallback(() => opener);
  }, []);

  // Mở tab AI ở sidebar và focus
  const openAISidebar = useCallback(() => {
    setActiveSidebarTab("ai");
    if (openSidebarCallback) {
      openSidebarCallback();
    }
  }, [openSidebarCallback]);

  // Test API Key
  const testApiKey = useCallback(
    async (keyToTest?: string) => {
      const key = keyToTest !== undefined ? keyToTest : apiKey;
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-gemini-api-key": key,
          },
          body: JSON.stringify({ action: "test_key", apiKey: key, model }),
        });
        const data = await res.json();
        return data;
      } catch (err: any) {
        return { success: false, error: err?.message || "Lỗi mạng khi kiểm tra API key" };
      }
    },
    [apiKey, model]
  );

  // Gửi tin nhắn hỏi đáp tự do
  const sendChatMessage = useCallback(
    async (prompt: string, quotedSnippet?: string) => {
      if (!prompt.trim() && !quotedSnippet?.trim()) return;

      const userText = quotedSnippet
        ? `> "${quotedSnippet.trim()}"\n\n${prompt.trim()}`
        : prompt.trim();

      const userMsg: AIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userText,
        timestamp: Date.now(),
        type: "chat",
        contextSnapshot: activeConcept
          ? {
              conceptId: activeConcept.id,
              conceptTitle: activeConcept.title,
              artifactAnchor: activeConcept.artifactAnchor,
            }
          : undefined,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsChatting(true);

      const context = buildConceptContext();

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-gemini-api-key": apiKey,
          },
          body: JSON.stringify({
            action: "chat",
            apiKey,
            model,
            prompt: userText,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            context,
          }),
        });

        const data = await res.json();

        if (!data.success) {
          if (data.needApiKey) {
            setSettingsModalOpen(true);
          }
          const errorMsg: AIMessage = {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `⚠️ **Không thể kết nối Gemini:** ${data.error || "Có lỗi xảy ra"}. ${
              data.needApiKey ? "\n\n👉 Vui lòng nhấn vào biểu tượng **Cài đặt** ở trên để nhập API Key của bạn." : ""
            }`,
            timestamp: Date.now(),
            type: "chat",
          };
          setMessages((prev) => [...prev, errorMsg]);
          return;
        }

        const aiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.content,
          timestamp: Date.now(),
          type: "chat",
          contextSnapshot: activeConcept
            ? {
                conceptId: activeConcept.id,
                conceptTitle: activeConcept.title,
                artifactAnchor: activeConcept.artifactAnchor,
              }
            : undefined,
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: any) {
        const errorMsg: AIMessage = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Lỗi kết nối mạng:** ${err?.message || "Không thể gửi yêu cầu đến máy chủ."}`,
          timestamp: Date.now(),
          type: "chat",
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsChatting(false);
      }
    },
    [activeConcept, apiKey, buildConceptContext, messages, model]
  );

  // Chấm điểm và thẩm định câu trả lời Socratic
  const evaluateAnswer = useCallback(
    async (concept: Concept, drill: SocraticDrill, answer: string): Promise<AIEvaluationResult | null> => {
      if (!answer.trim()) return null;

      // 1. Tự động chuyển qua tab AI ở right sidebar & mở sidebar nếu đang đóng
      setActiveSidebarTab("ai");
      if (openSidebarCallback) {
        openSidebarCallback();
      }
      setIsEvaluating(true);

      // 2. Lưu câu trả lời của user vào store
      saveUserAnswer(concept.id, answer);

      // 3. Thêm tin nhắn user vào stream chat
      const userMsg: AIMessage = {
        id: `eval-user-${Date.now()}`,
        role: "user",
        content: `**[Yêu cầu Thẩm định Tự vấn]**\n\n**Câu hỏi:** *${drill.question}*\n\n**Lập luận của tôi:**\n"""\n${answer.trim()}\n"""`,
        timestamp: Date.now(),
        type: "chat",
        contextSnapshot: {
          conceptId: concept.id,
          conceptTitle: concept.title,
          artifactAnchor: concept.artifactAnchor,
        },
      };

      setMessages((prev) => [...prev, userMsg]);

      const context = buildConceptContext(concept);

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-gemini-api-key": apiKey,
          },
          body: JSON.stringify({
            action: "evaluate",
            apiKey,
            model,
            context,
            evaluationData: {
              conceptId: concept.id,
              conceptTitle: concept.title,
              drillId: drill.id,
              drillQuestion: drill.question,
              keyTakeaways: drill.keyTakeaways,
              userAnswer: answer.trim(),
            },
          }),
        });

        const data = await res.json();

        if (!data.success) {
          if (data.needApiKey) {
            setSettingsModalOpen(true);
          }
          const errorMsg: AIMessage = {
            id: `eval-err-${Date.now()}`,
            role: "assistant",
            content: `⚠️ **Không thể thẩm định:** ${data.error || "Lỗi chưa xác định"}. ${
              data.needApiKey ? "\n\n👉 Vui lòng cấu hình Gemini API Key để AI bắt đầu chấm điểm." : ""
            }`,
            timestamp: Date.now(),
            type: "chat",
          };
          setMessages((prev) => [...prev, errorMsg]);
          return null;
        }

        const evalResult: AIEvaluationResult = data.evaluation;

        // 4. Nếu AI quyết định "Đã thông suốt" (isMastered === true)
        if (evalResult.isMastered) {
          setConceptMastery(concept.id, "mastered");
          try {
            confetti({
              particleCount: 100,
              spread: 85,
              origin: { y: 0.65 },
              colors: ["#6366f1", "#10b981", "#f59e0b", "#06b6d4", "#a855f7"],
            });
          } catch (e) {
            console.error("Confetti error:", e);
          }
        } else {
          // Chưa thông suốt thì đánh dấu đang học/củng cố
          setConceptMastery(concept.id, "learning");
        }

        // 5. Thêm tin nhắn kết quả đánh giá vào stream
        const aiMsg: AIMessage = {
          id: `eval-res-${Date.now()}`,
          role: "assistant",
          content: evalResult.summary || "Kết quả thẩm định từ AI Mentor",
          timestamp: Date.now(),
          type: "evaluation",
          evaluation: evalResult,
          contextSnapshot: {
            conceptId: concept.id,
            conceptTitle: concept.title,
            artifactAnchor: concept.artifactAnchor,
          },
        };

        setMessages((prev) => [...prev, aiMsg]);
        return evalResult;
      } catch (err: any) {
        const errorMsg: AIMessage = {
          id: `eval-err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Lỗi mạng khi gửi bài chấm:** ${err?.message || "Vui lòng thử lại sau giây lát."}`,
          timestamp: Date.now(),
          type: "chat",
        };
        setMessages((prev) => [...prev, errorMsg]);
        return null;
      } finally {
        setIsEvaluating(false);
      }
    },
    [apiKey, buildConceptContext, model, openSidebarCallback, saveUserAnswer, setConceptMastery]
  );

  return (
    <AIContext.Provider
      value={{
        apiKey,
        setApiKey,
        model,
        setModel,
        messages,
        isChatting,
        isEvaluating,
        activeSidebarTab,
        setActiveSidebarTab,
        openAISidebar,
        registerSidebarOpener,
        settingsModalOpen,
        setSettingsModalOpen,
        sendChatMessage,
        evaluateAnswer,
        clearMessages,
        testApiKey,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
}
