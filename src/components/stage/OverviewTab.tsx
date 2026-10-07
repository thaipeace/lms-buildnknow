"use client";

import React from "react";
import { Concept } from "@/types/curriculum";
import { Lightbulb, Cog, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProblemContextBanner } from "@/components/stage/ProblemContextBanner";

interface OverviewTabProps {
  concept: Concept;
  onGoToDrill?: () => void;
}

export function OverviewTab({ concept, onGoToDrill }: OverviewTabProps) {
  return (
    <div className="space-y-4 pt-1">
      {/* 0. Bối cảnh bài toán & Hiện trạng giải pháp */}
      <ProblemContextBanner concept={concept} />

      {/* 1. Why AI Built This Way */}
      <Card className="border-indigo-200/80 bg-indigo-50/40 shadow-xs">
        <CardHeader className="p-3.5 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Lightbulb className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-bold text-indigo-950">
              1. Tại sao AI / Pipeline lại chọn giải pháp này? (The "Why")
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3.5 pt-0">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {concept.whyUsed}
          </p>
        </CardContent>
      </Card>

      {/* 2. Under The Hood */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader className="p-3.5 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              <Cog className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-bold text-slate-900">
              2. Cơ chế hoạt động ngầm bên dưới (Under the Hood)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3.5 pt-0">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {concept.underTheHood}
          </p>
        </CardContent>
      </Card>

      {/* 3. Gotchas & Pitfalls */}
      <Card className="border-amber-200/80 bg-amber-50/40 shadow-xs">
        <CardHeader className="p-3.5 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-bold text-amber-950">
              3. Bẫy kỹ thuật & Lỗi ngầm cần lưu ý (Common Pitfalls)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3.5 pt-0">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {concept.pitfalls}
          </p>
        </CardContent>
      </Card>

      {/* Call to Action: Socratic Drill */}
      {onGoToDrill && (
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Bạn đã nắm được bản chất chưa?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuyển sang tab Tự vấn (Drill) để tự trả lời các câu hỏi phản biện thực tế.
            </p>
          </div>
          <button
            onClick={onGoToDrill}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0 active:scale-[0.98]"
          >
            <span>Làm bài Tự vấn ngay</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
