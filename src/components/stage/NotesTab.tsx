"use client";

import React, { useState, useEffect } from "react";
import { Concept } from "@/types/curriculum";
import { useCurriculum } from "@/context/CurriculumContext";
import { Textarea } from "@/components/ui/textarea";
import { Check, Sparkles, BookMarked } from "lucide-react";

interface NotesTabProps {
  concept: Concept;
}

export function NotesTab({ concept }: NotesTabProps) {
  const { saveUserNotes } = useCurriculum();
  const [notes, setNotes] = useState(concept.userNotes || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNotes(concept.userNotes || "");
    setSaved(false);
  }, [concept.id, concept.userNotes]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (notes !== (concept.userNotes || "")) {
        saveUserNotes(concept.id, notes);
        setSaved(true);
        const timer = setTimeout(() => setSaved(false), 2000);
        return () => clearTimeout(timer);
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [notes, concept.id, concept.userNotes, saveUserNotes]);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Ghi chú cá nhân cho concept này
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {saved && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <Check className="h-3.5 w-3.5" /> Đã lưu tự động
            </span>
          )}
          <span className="text-slate-500 font-mono">
            {notes.length} ký tự
          </span>
        </div>
      </div>

      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ghi lại những điều bạn vừa nhận ra, câu hỏi phỏng vấn dự kiến, hoặc kinh nghiệm debug thực tế..."
        className="min-h-[140px] sm:min-h-[220px] font-sans text-sm border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 leading-relaxed shadow-xs"
      />

      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 text-xs text-slate-600 space-y-1.5">
        <p className="font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Gợi ý ghi chép hiệu quả:
        </p>
        <p>• Tóm tắt lại câu trả lời theo cách hiểu riêng của bạn bằng 2-3 gạch đầu dòng.</p>
        <p>• Ghi lại bẫy bug thực tế nếu dự án của bạn từng gặp phải lỗi ở phần này.</p>
        <p>• Dữ liệu ghi chú được lưu an toàn trong máy bạn và sẽ được đính kèm khi bạn bấm Export JSON.</p>
      </div>
    </div>
  );
}
