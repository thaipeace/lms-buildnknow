"use client";

import React, { useState, useEffect } from "react";
import { Concept, SocraticDrill, MasteryLevel } from "@/types/curriculum";
import { useCurriculum } from "@/context/CurriculumContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  CircleDot,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Send,
  Trophy,
} from "lucide-react";
import { ProblemContextBanner } from "@/components/stage/ProblemContextBanner";
import confetti from "canvas-confetti";

interface SocraticDrillTabProps {
  concept: Concept;
  onNavigateNext?: () => void;
  hasNext?: boolean;
}

export function SocraticDrillTab({ concept, onNavigateNext, hasNext }: SocraticDrillTabProps) {
  const { setConceptMastery, saveUserAnswer, revealHints } = useCurriculum();

  // Local state câu trả lời của user (mặc định lấy từ concept.userAnswer)
  const [answer, setAnswer] = useState(concept.userAnswer || "");
  const [isSaved, setIsSaved] = useState(false);

  // Danh sách các câu hỏi đã được lật mở gợi ý
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>(() => {
    // Nếu concept đã lưu revealedHints thì mở sẵn
    if (concept.revealedHints) {
      const all: Record<string, boolean> = {};
      concept.socraticDrills?.forEach((d) => {
        all[d.id] = true;
      });
      return all;
    }
    return {};
  });

  // Sync khi đổi concept
  useEffect(() => {
    setAnswer(concept.userAnswer || "");
    setIsSaved(false);
    if (concept.revealedHints) {
      const all: Record<string, boolean> = {};
      concept.socraticDrills?.forEach((d) => {
        all[d.id] = true;
      });
      setRevealedQuestions(all);
    } else {
      setRevealedQuestions({});
    }
  }, [concept.id, concept.userAnswer, concept.revealedHints, concept.socraticDrills]);

  // Debounced auto-save cho câu trả lời
  useEffect(() => {
    const handler = setTimeout(() => {
      if (answer !== (concept.userAnswer || "")) {
        saveUserAnswer(concept.id, answer);
        setIsSaved(true);
        const timer = setTimeout(() => setIsSaved(false), 2000);
        return () => clearTimeout(timer);
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [answer, concept.id, concept.userAnswer, saveUserAnswer]);

  const toggleReveal = (drillId: string) => {
    setRevealedQuestions((prev) => {
      const next = { ...prev, [drillId]: !prev[drillId] };
      // Nếu có ít nhất 1 câu được mở, đánh dấu vào store
      if (Object.values(next).some(Boolean)) {
        revealHints(concept.id);
      }
      return next;
    });
  };

  const handleRate = (level: MasteryLevel) => {
    setConceptMastery(concept.id, level);

    if (level === "mastered") {
      // Bắn pháo hoa giấy ăn mừng!
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.65 },
          colors: ["#6366f1", "#10b981", "#f59e0b", "#06b6d4"],
        });
      } catch (e) {
        console.error("Confetti error:", e);
      }
    }
  };

  const drills = concept.socraticDrills || [];

  return (
    <div className="space-y-6 pt-2">
      {/* 1. Bối cảnh Bài toán & Hiện trạng (Problem Context & Current Approach) */}
      <ProblemContextBanner concept={concept} />

      {/* 2. Phương pháp Tự vấn Socratic ngắn gọn */}
      <div className="p-3 rounded-xl border border-indigo-200/80 bg-indigo-50/50 text-slate-700 text-xs flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-indigo-600 shrink-0" />
          <span className="text-[11.5px] leading-relaxed">
            <strong>Nguyên tắc Tự vấn (Active Recall):</strong> Đối chiếu với code bên cạnh & tự trả lời trước khi bấm xem gợi ý cốt lõi.
          </span>
        </div>
      </div>

      {/* Danh sách Câu hỏi Phản biện */}
      <div className="space-y-4 sm:space-y-5">
        {drills.map((drill: SocraticDrill, idx: number) => {
          const isRevealed = revealedQuestions[drill.id] ?? false;

          return (
            <div
              key={drill.id}
              className="p-3.5 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 sm:space-y-4 transition-all"
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Câu hỏi phản biện #{idx + 1}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleReveal(drill.id)}
                  className="h-7 px-2 sm:px-2.5 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs shrink-0"
                >
                  {isRevealed ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                      <span>Ẩn gợi ý</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 text-indigo-600" />
                      <span className="text-indigo-600 font-semibold">
                        <span>Xem gợi ý</span>
                        <span className="hidden sm:inline"> & Điểm cốt lõi</span>
                      </span>
                    </>
                  )}
                </Button>
              </div>

              {/* Question Prompt */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {drill.question}
              </h3>

              {/* Reveal Key Takeaways Box (GIỮ DARK THEME TƯƠNG PHẢN ĐỂ GHI NHỚ) */}
              {isRevealed && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4 space-y-2 animate-in fade-in duration-200 shadow-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Điểm mấu chốt bạn cần trả lời được:
                    </span>
                    <span className="text-slate-500 font-mono text-[11px] hidden xs:inline">Đối chiếu câu trả lời</span>
                  </div>

                  <ul className="list-disc list-inside space-y-2 text-xs text-slate-200 font-mono leading-relaxed bg-slate-900/90 p-3 sm:p-3.5 rounded-lg border border-slate-800">
                    {drill.keyTakeaways.map((pt, ptIdx) => (
                      <li key={ptIdx} className="text-slate-200">
                        <span className="font-sans text-slate-200">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Khung Nhập Câu Trả Lời Của Bạn (Active Recall Textarea) */}
      <div className="p-3.5 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5 text-indigo-600" />
            Câu trả lời & lập luận của bạn:
          </label>
          {isSaved && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Đã lưu
            </span>
          )}
        </div>

        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Tự giải thích theo cách hiểu của bạn: Cơ chế này hoạt động ra sao? Nếu xảy ra lỗi thì hệ thống xử lý như thế nào?..."
          className="min-h-[110px] sm:min-h-[140px] text-sm border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 leading-relaxed shadow-xs"
        />

        <p className="text-[11px] text-slate-500">
          💡 Câu trả lời của bạn sẽ được lưu trực tiếp vào LocalStorage máy bạn và tự động xuất kèm khi bạn tải file JSON.
        </p>
      </div>

      {/* Bộ 3 Nút Đánh Giá Mức Độ Làm Chủ (Self-Assessment Rating) */}
      <div className="p-3.5 sm:p-5 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Đánh giá mức độ thông suốt sau khi đối chiếu:
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Hãy trung thực với bản thân để hệ thống theo dõi chính xác các lỗ hổng tri thức cần củng cố.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto">
          {/* Nút 1: Cần xem lại */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRate("unseen")}
            className={`text-xs h-8 sm:h-9 px-2.5 sm:px-3 gap-1 sm:gap-1.5 border-slate-200 flex-1 sm:flex-initial justify-center cursor-pointer ${
              concept.masteryLevel === "unseen" ? "bg-rose-50 border-rose-300 text-rose-700 font-semibold" : "text-slate-700"
            }`}
          >
            <span>🔴</span>
            <span>Cần xem lại</span>
          </Button>

          {/* Nút 2: Hiểu một phần */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRate("learning")}
            className={`text-xs h-8 sm:h-9 px-2.5 sm:px-3 gap-1 sm:gap-1.5 border-slate-200 flex-1 sm:flex-initial justify-center cursor-pointer ${
              concept.masteryLevel === "learning" ? "bg-amber-50 border-amber-300 text-amber-800 font-semibold" : "text-slate-700"
            }`}
          >
            <span>🟡</span>
            <span>Hiểu 1 phần</span>
          </Button>

          {/* Nút 3: Đã làm chủ */}
          <Button
            size="sm"
            onClick={() => handleRate("mastered")}
            className={`text-xs h-8 sm:h-9 px-3 sm:px-4 gap-1.5 font-bold shadow-xs transition-all cursor-pointer flex-1 sm:flex-initial justify-center ${
              concept.masteryLevel === "mastered"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/30"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>🟢 Đã thông suốt</span>
          </Button>
        </div>
      </div>

      {/* Quick Advance Bar */}
      {concept.masteryLevel === "mastered" && hasNext && onNavigateNext && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/80 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in duration-300">
          <span className="font-semibold flex items-center gap-1.5">
            🎉 Tuyệt vời! Bạn đã làm chủ hoàn toàn concept này.
          </span>
          <Button
            size="sm"
            onClick={onNavigateNext}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold"
          >
            <span>Sang bài tiếp theo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
