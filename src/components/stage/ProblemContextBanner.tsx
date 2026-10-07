"use client";

import React from "react";
import { Concept } from "@/types/curriculum";
import { Target, AlertCircle, Compass } from "lucide-react";

interface ProblemContextBannerProps {
  concept: Concept;
  className?: string;
}

export function ProblemContextBanner({ concept, className = "" }: ProblemContextBannerProps) {
  // Nếu concept chưa có description cụ thể, ta trích xuất gợi ý từ whyUsed
  const description =
    concept.description ||
    `Tìm hiểu bối cảnh kỹ thuật và mục đích giải quyết bài toán của đoạn code/cấu hình ${concept.artifactAnchor}.`;

  const problemStatement =
    concept.problemStatement ||
    (concept.pitfalls
      ? `Nguy cơ kỹ thuật hoặc bẫy tiềm ẩn cần phòng vệ: ${concept.pitfalls.slice(0, 160)}...`
      : "Bài toán thực tế cần đảm bảo tính ổn định, bảo mật và hiệu năng cao trong kiến trúc dự án.");

  const currentApproach =
    concept.currentApproach ||
    concept.whyUsed ||
    "Giải pháp kỹ thuật đang được áp dụng trực tiếp trong đoạn mã nguồn bên cạnh.";

  return (
    <div
      className={`rounded-xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 p-3.5 sm:p-4 shadow-2xs space-y-3 ${className}`}
    >
      {/* 1. Header & Summary Description */}
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5 shadow-2xs shadow-indigo-600/30">
          <Target className="h-4 w-4" />
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
              Bối cảnh bài toán & Hiện trạng giải pháp
            </h3>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded font-medium">
              Định vị bài toán trước khi tự vấn
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </div>

      {/* 2. Hai cột song song: Vấn đề đối mặt vs Hiện tại đang làm như thế nào */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
        {/* Khối 1: Đang đối mặt vấn đề gì? */}
        <div className="rounded-lg bg-rose-50/80 border border-rose-200/70 p-3 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-rose-950">
            <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span>1. Bạn đang đối mặt vấn đề gì?</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {problemStatement}
          </p>
        </div>

        {/* Khối 2: Hiện tại đang làm như thế nào? */}
        <div className="rounded-lg bg-emerald-50/80 border border-emerald-200/70 p-3 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950">
            <Compass className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span>2. Hiện tại code/pipeline đang làm thế nào?</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {currentApproach}
          </p>
        </div>
      </div>
    </div>
  );
}
