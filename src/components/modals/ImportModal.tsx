"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCurriculum } from "@/context/CurriculumContext";
import {
  UploadCloud,
  FileCode2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Target,
  RotateCcw,
  Zap,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_FOCUS_SUGGESTIONS = [
  "Cơ chế xác thực & phân quyền (JWT / Guards)",
  "Hàng đợi tác vụ bất đồng bộ (BullMQ / Worker)",
  "Tối ưu hóa Database & Caching Redis",
  "Giao tiếp Realtime qua WebSocket",
  "Xử lý Transaction & Rollback khi lỗi",
  "Kiến trúc Clean Architecture / DDD",
];

export const buildExtractPrompt = (mandatoryTopics: string): string => {
  const mandatorySection = mandatoryTopics.trim()
    ? `### 4. CÁC NỘI DUNG / KỸ THUẬT BẮT BUỘC PHẢI CÓ ĐỂ HỌC (MANDATORY TOPICS TO MASTER):
Người học ĐẶC BIỆT YÊU CẦU kết quả trả về BẮT BUỘC PHẢI CÓ các module / khái niệm trọng tâm sau đây để học và làm chủ:
${mandatoryTopics.trim()}

*CHỈ THỊ BẮT BUỘC CHO AI*: Bạn PHẢI thiết kế ít nhất một Module hoặc các Concepts chuyên sâu trực tiếp giải quyết và bóc tách triệt để các phần trên (đầy đủ vị trí file code artifactAnchor, whyUsed, underTheHood, pitfalls và câu hỏi phản biện socraticDrills). Tuyệt đối không được bỏ qua bất kỳ điểm nào ở trên!`
    : `### 4. CÁC NỘI DUNG TRỌNG TÂM MUỐN ĐÀO SÂU:
[Nếu có những chức năng, module, hoặc file code cụ thể bạn muốn tập trung mổ xẻ sâu, hãy liệt kê ở đây để AI ưu tiên thiết kế giáo án]`;

  return `Bạn là Kiến trúc sư Công nghệ và Chuyên gia Đánh giá Năng lực (Lead Architect & Tech Evaluator). 
Tôi vừa hoàn thành một dự án với sự hỗ trợ của AI, và bây giờ tôi muốn tự học, tự vấn và thấu hiểu sâu sắc 100% bản chất công nghệ đằng sau dự án này.

Hãy phân tích dự án dưới đây và sinh ra một file JSON chuẩn tương thích với nền tảng BuildNKnow LMS.

### THÔNG TIN DỰ ÁN CỦA TÔI:
[Dán cấu trúc thư mục, package.json, các đoạn code mấu chốt, hoặc thông số workflow ComfyUI/Audio/Video của bạn vào đây]

---

### YÊU CẦU NỘI DUNG BÓC TÁCH:

1. TỔNG QUAN DỰ ÁN (PROJECT SUMMARY):
   - summary: Viết một đoạn tóm tắt ngắn gọn, súc tích (3 - 5 câu) về dự án: giải quyết bài toán thực tế nào, kiến trúc tổng thể ra sao, luồng vận hành cốt lõi và giá trị công nghệ mang lại.
   - description: Câu tóm tắt 1 dòng về sản phẩm.

2. NHỮNG CHỨC NĂNG CHÍNH SẼ TÌM HIỂU (KEY FEATURES TO EXPLORE):
   - keyFeatures: Danh sách từ 3 - 6 chức năng / cụm kỹ thuật trọng tâm nhất của dự án mà người học cần bóc tách, mổ xẻ và làm chủ bản chất (Ví dụ: Cơ chế xác thực phân quyền đa lớp, Xử lý hàng đợi tác vụ bất đồng bộ, Streaming dữ liệu realtime qua WebSocket, Tối ưu hóa bộ nhớ đệm cache,...). Mỗi chức năng nêu rõ tính năng và giá trị kỹ thuật đi kèm.

3. CẤU TRÚC GIÁO TRÌNH HỌC TẬP (MODULES & CONCEPTS):
   - Chia nhỏ thành 2 - 4 Modules công nghệ cốt lõi.
   - Mỗi Module có 2 - 3 Concepts quan trọng nhất.
   - Mỗi Concept phải giải quyết triệt để các khía cạnh:
     + artifactAnchor: Vị trí file/dòng code hoặc tên node ComfyUI trong dự án (VD: "src/auth/jwt.guard.ts:L15-42").
     + artifactSnippet: Đoạn code hoặc thông số tiêu biểu nhất (10-30 dòng).
     + whyUsed: Tại sao AI/Hệ thống lại chọn công nghệ/kỹ thuật này thay vì cách khác?
     + underTheHood: Cơ chế hoạt động ngầm bên dưới (không phụ thuộc vào framework).
     + pitfalls: Các bẫy kỹ thuật, lỗi bảo mật, nghẽn hiệu năng mà người mới hay mắc phải.
     + socraticDrills: 1-2 câu hỏi phản biện tình huống thực tế kèm danh sách checklist keyTakeaways.

${mandatorySection}

---

### ĐỊNH DẠNG ĐẦU RA (BẮT BUỘC CHỈ XUẤT DUY NHẤT CHUỖI JSON HỢP LỆ, KHÔNG CÓ MARKDOWN HAY CHỮ THỪA NGOÀI KHỐI JSON):
{
  "id": "my-project-id",
  "name": "Tên Dự Án Thực Tế",
  "domain": "software",
  "description": "Mô tả một câu ngắn gọn về sản phẩm vừa tạo",
  "summary": "Đoạn tóm tắt tổng quan ngắn gọn (3-5 câu) về bối cảnh dự án, bài toán giải quyết, kiến trúc hệ thống cốt lõi và giá trị thực tiễn.",
  "keyFeatures": [
    "Tên & mô tả ngắn chức năng chính 1 sẽ tìm hiểu",
    "Tên & mô tả ngắn chức năng chính 2 sẽ tìm hiểu",
    "Tên & mô tả ngắn chức năng chính 3 sẽ tìm hiểu",
    "Tên & mô tả ngắn chức năng chính 4 sẽ tìm hiểu"
  ],
  "version": "1.0.0",
  "aiToolsUsed": ["Cursor", "Claude Code"],
  "modules": [
    {
      "id": "mod-1",
      "title": "Module 1: Tên Cụm Công Nghệ",
      "artifactScope": "src/*",
      "concepts": [
        {
          "id": "concept-1",
          "title": "Tên Khái Niệm Bản Chất",
          "estimatedMinutes": 10,
          "description": "Tóm tắt bối cảnh bài toán gặp phải trong dự án",
          "problemStatement": "Vấn đề kỹ thuật thực tế đang đối mặt nếu không xử lý kỹ",
          "currentApproach": "Cách hiện tại đang làm trong code / pipeline",
          "artifactAnchor": "src/file.ts:L10-40",
          "artifactSnippet": { "language": "typescript", "content": "// code snippet..." },
          "whyUsed": "Lý do AI chọn giải pháp / công nghệ này...",
          "underTheHood": "Bản chất cơ chế hoạt động ngầm bên dưới...",
          "pitfalls": "Bẫy kỹ thuật, lỗi biến dạng thường gặp và cách xử lý...",
          "socraticDrills": [
            {
              "id": "drill-1",
              "question": "Câu hỏi phản biện tình huống thực tế...",
              "hint": "Gợi ý suy nghĩ phản biện...",
              "keyTakeaways": ["Điểm cốt lõi 1", "Điểm cốt lõi 2"]
            }
          ],
          "masteryLevel": "unseen"
        }
      ]
    }
  ]
}`;
};

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const { importCurriculum } = useCurriculum();
  const [activeTab, setActiveTab] = useState<string>("import");
  const [jsonInput, setJsonInput] = useState("");
  const [mandatoryTopics, setMandatoryTopics] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; message?: string }>({
    type: "idle",
  });

  const generatedPrompt = useMemo(() => {
    return buildExtractPrompt(mandatoryTopics);
  }, [mandatoryTopics]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleAddSuggestion = (sug: string) => {
    setMandatoryTopics((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) {
        return `- ${sug}`;
      }
      if (prev.includes(sug)) return prev;
      return `${trimmed}\n- ${sug}`;
    });
  };

  const handleImport = () => {
    if (!jsonInput.trim()) {
      setStatus({ type: "error", message: "Vui lòng dán nội dung JSON vào khung bên dưới." });
      return;
    }

    const res = importCurriculum(jsonInput);
    if (res.success) {
      setStatus({ type: "success", message: "Nhập dự án thành công! Đang chuyển đến tổng quan dự án..." });
      setTimeout(() => {
        setStatus({ type: "idle" });
        setJsonInput("");
        onOpenChange(false);
      }, 1000);
    } else {
      setStatus({ type: "error", message: res.error || "Không thể phân tích dữ liệu JSON." });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      setStatus({ type: "idle" });
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-3xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <UploadCloud className="h-5 w-5 text-indigo-600" />
          Nạp Dự Án Mới vào BuildNKnow
        </DialogTitle>
        <DialogDescription>
          Nhập file JSON giáo án hoặc lấy Prompt mẫu để AI tự động trích xuất từ dự án của bạn.
        </DialogDescription>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="my-2">
        <TabsList className="w-full bg-slate-100 border border-slate-200">
          <TabsTrigger value="import" className="flex-1 gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-3">
            <UploadCloud className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">1. Dán JSON Dự Án</span>
            <span className="sm:hidden">1. Dán JSON</span>
          </TabsTrigger>
          <TabsTrigger value="prompt" className="flex-1 gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-3">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span className="hidden sm:inline">2. Lấy Prompt Trích Xuất</span>
            <span className="sm:hidden">2. Prompt AI</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Dán JSON */}
        <TabsContent value="import" className="space-y-3 sm:space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Dán chuỗi JSON hoặc tải file:
            </label>
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
              <FileCode2 className="h-3.5 w-3.5" />
              <span>Chọn file .json</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <Textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              if (status.type === "error") setStatus({ type: "idle" });
            }}
            placeholder='{"id": "my-project", "name": "Dự án mới", "domain": "software", "modules": [...]}'
            className="font-mono text-xs min-h-[160px] sm:min-h-[220px] max-h-[35vh] border-slate-800 bg-slate-950 text-slate-200 leading-relaxed resize-y"
          />

          {status.type === "error" && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          {status.type === "success" && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Hủy bỏ
            </Button>
            <Button variant="default" size="sm" onClick={handleImport} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              Xác nhận Nhập Dự Án
            </Button>
          </div>
        </TabsContent>

        {/* Tab 2: Prompt Trích Xuất AI kèm ô nhập nội dung bắt buộc */}
        <TabsContent value="prompt" className="space-y-4 pt-1">
          {/* Card: Khung người dùng điền những phần buộc phải có để học */}
          <div className="p-3.5 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 space-y-2.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                  <Target className="h-3.5 w-3.5" />
                </div>
                <label className="text-xs font-bold text-slate-900 tracking-tight">
                  Những phần BẮT BUỘC phải có trong kết quả trả về để học:
                </label>
              </div>

              {mandatoryTopics.trim() ? (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <Check className="h-3 w-3" /> Đã tự động tích hợp vào Prompt
                </span>
              ) : (
                <Badge variant="outline" className="text-[10px] font-medium text-amber-700 border-amber-300 bg-amber-50">
                  Tùy chọn trọng tâm
                </Badge>
              )}
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Điền các chức năng, cụm module, file code hoặc kỹ thuật cụ thể mà bạn muốn AI <strong>bắt buộc phải bóc tách sâu</strong> để làm chủ:
            </p>

            <Textarea
              value={mandatoryTopics}
              onChange={(e) => setMandatoryTopics(e.target.value)}
              placeholder={`Ví dụ:
- Bắt buộc phải có module giải thích chi tiết cơ chế Authentication & JWT Guards trong src/auth
- Phân tích luồng xử lý hàng đợi BullMQ và Worker bất đồng bộ
- Mổ xẻ cơ chế transaction Prisma và rollback khi có lỗi`}
              className="text-xs min-h-[72px] max-h-[140px] bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 leading-relaxed shadow-2xs resize-y"
            />

            {/* Quick suggestion tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-semibold text-slate-500">Gợi ý nhanh:</span>
              {QUICK_FOCUS_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddSuggestion(sug)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 transition-colors cursor-pointer shadow-2xs font-medium"
                >
                  + {sug}
                </button>
              ))}
              {mandatoryTopics.trim() && (
                <button
                  type="button"
                  onClick={() => setMandatoryTopics("")}
                  className="text-[10px] text-slate-400 hover:text-rose-600 underline ml-auto cursor-pointer"
                >
                  Xóa trắng
                </button>
              )}
            </div>
          </div>

          {/* Prompt Preview & Copy Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Prompt trích xuất hoàn chỉnh (Đã tự động gắn yêu cầu của bạn):</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                className="h-7 text-xs gap-1.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold cursor-pointer shadow-2xs"
              >
                {promptCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {promptCopied ? "Đã chép Prompt!" : "Sao chép Prompt"}
              </Button>
            </div>

            <Textarea
              readOnly
              value={generatedPrompt}
              className="font-mono text-[11px] min-h-[140px] sm:min-h-[220px] max-h-[30vh] border-slate-800 bg-slate-950 text-slate-300 leading-relaxed resize-y scrollbar-thin"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            💡 Sao chép prompt trên gửi kèm code/dự án của bạn cho Claude, ChatGPT hoặc Gemini. Sau khi AI xuất ra khối JSON, chỉ cần chuyển sang tab <strong>"1. Dán JSON Dự Án"</strong> để nạp ngay vào app.
          </p>
        </TabsContent>
      </Tabs>
    </Dialog>
  );
}
