"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCurriculum } from "@/context/CurriculumContext";
import { ProjectCurriculum } from "@/types/curriculum";
import {
  FileEdit,
  RotateCcw,
  UploadCloud,
  FileCode2,
  Copy,
  Check,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Code2,
  Layers,
  HelpCircle,
  Target,
} from "lucide-react";

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectCurriculum | null;
}

export function EditProjectModal({ open, onOpenChange, project }: EditProjectModalProps) {
  const { reimportProject } = useCurriculum();
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [jsonContent, setJsonContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; message?: string }>({
    type: "idle",
  });
  const [mandatoryUpdates, setMandatoryUpdates] = useState("");

  const QUICK_UPDATE_SUGGESTIONS = [
    "Bổ sung module phân tích kiến trúc chuyên sâu",
    "Thêm các bẫy kỹ thuật (pitfalls) & cách phòng tránh",
    "Viết lại câu hỏi phản biện Socratic thực chiến hơn",
    "Tối ưu lại Key Features và tóm tắt kiến trúc",
    "Bổ sung code snippet minh họa chi tiết cho concepts",
  ];

  // Pre-populate JSON content whenever project changes or modal opens
  useEffect(() => {
    if (project && open) {
      setJsonContent(JSON.stringify(project, null, 2));
      setStatus({ type: "idle" });
      setActiveTab("edit");
    }
  }, [project, open]);

  const aiUpdatePrompt = useMemo(() => {
    if (!project) return "";

    const updateSection = mandatoryUpdates.trim()
      ? `### YÊU CẦU CẬP NHẬT / NHỮNG PHẦN BẮT BUỘC PHẢI CÓ ĐỂ HỌC:
Người học ĐẶC BIỆT YÊU CẦU dự án cập nhật BẮT BUỘC PHẢI CÓ các phần sau:
${mandatoryUpdates.trim()}

*CHỈ THỊ QUAN TRỌNG CHO AI*: Bạn PHẢI thiết kế các Module hoặc Concepts tương ứng để mổ xẻ triệt để các phần trên trong JSON mới, không được bỏ qua!`
      : `### YÊU CẦU CẬP NHẬT / MỞ RỘNG:
[Dán yêu cầu của bạn vào đây: ví dụ thêm 1 module mới, đi sâu hơn vào giải thuật X, hoặc viết lại câu hỏi phản biện Socratic Drills]`;

    return `Bạn là Kiến trúc sư Công nghệ và Chuyên gia Đánh giá Năng lực (Lead Architect & Tech Evaluator).
Tôi muốn bạn tối ưu hóa, chỉnh sửa hoặc mở rộng giáo án bóc tách cho dự án sau trên nền tảng BuildNKnow LMS.

### THÔNG TIN DỰ ÁN HIỆN TẠI (Dự án: "${project.name}", ID: "${project.id}"):
\`\`\`json
${JSON.stringify(
  {
    id: project.id,
    name: project.name,
    domain: project.domain,
    summary: project.summary,
    keyFeatures: project.keyFeatures,
    modules: project.modules.map((m) => ({
      id: m.id,
      title: m.title,
      artifactScope: m.artifactScope,
      concepts: m.concepts.map((c) => ({
        id: c.id,
        title: c.title,
        estimatedMinutes: c.estimatedMinutes,
        artifactAnchor: c.artifactAnchor,
        whyUsed: c.whyUsed,
      })),
    })),
  },
  null,
  2
)}
\`\`\`

---

${updateSection}

---

### ĐỊNH DẠNG ĐẦU RA:
BẮT BUỘC CHỈ XUẤT RA DUY NHẤT CHUỖI JSON HỢP LỆ THEO SCHEMA BUILDNKNOW, KHÔNG CÓ LỜI DẪN NÀO NGOÀI KHỐI MÃ JSON.`;
  }, [project, mandatoryUpdates]);

  // Real-time quick preview of parsed JSON
  let parsedSummary: { name: string; id: string; modulesCount: number; conceptsCount: number } | null = null;
  let parseError: string | null = null;

  try {
    if (jsonContent.trim()) {
      const parsed = JSON.parse(jsonContent);
      if (parsed && typeof parsed === "object") {
        const modules = Array.isArray(parsed.modules) ? parsed.modules : [];
        const conceptsCount = modules.reduce(
          (sum: number, m: any) => sum + (Array.isArray(m?.concepts) ? m.concepts.length : 0),
          0
        );
        parsedSummary = {
          name: parsed.name || "Chưa có tên",
          id: parsed.id || "Chưa có ID",
          modulesCount: modules.length,
          conceptsCount,
        };
      }
    }
  } catch (e: any) {
    parseError = e.message || "Cú pháp JSON chưa hợp lệ";
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormatJson = () => {
    try {
      const obj = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(obj, null, 2));
      setStatus({ type: "idle" });
    } catch (e: any) {
      setStatus({ type: "error", message: `Không thể định dạng: ${e.message}` });
    }
  };

  const handleResetToOriginal = () => {
    if (project) {
      setJsonContent(JSON.stringify(project, null, 2));
      setStatus({ type: "idle" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonContent(content);
      setStatus({ type: "idle" });
    };
    reader.readAsText(file);
  };

  const handleSaveAndReimport = () => {
    if (!project) return;
    if (!jsonContent.trim()) {
      setStatus({ type: "error", message: "Vui lòng nhập nội dung JSON của dự án." });
      return;
    }

    const result = reimportProject(project.id, jsonContent);
    if (result.success) {
      setStatus({
        type: "success",
        message: "Cập nhật & Đặt lại tiến độ thành công! Đang chuyển về trang tổng quan...",
      });
      setTimeout(() => {
        setStatus({ type: "idle" });
        onOpenChange(false);
      }, 900);
    } else {
      setStatus({
        type: "error",
        message: result.error || "Không thể cập nhật dự án từ dữ liệu JSON.",
      });
    }
  };

  const handleAddUpdateSuggestion = (sug: string) => {
    setMandatoryUpdates((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) {
        return `- ${sug}`;
      }
      if (prev.includes(sug)) return prev;
      return `${trimmed}\n- ${sug}`;
    });
  };

  const handleCopyAiPrompt = () => {
    navigator.clipboard.writeText(aiUpdatePrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-3xl">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <FileEdit className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Sửa & Import Lại Dự Án
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Cập nhật cấu trúc, tóm tắt và giáo án của dự án:{" "}
              <strong className="text-slate-800 font-semibold">{project.name}</strong>
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Warning Box: Notice about progress reset */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs my-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Lưu ý quan trọng:</strong> Khi lưu hoặc nhập lại JSON, toàn bộ cấu trúc dự án sẽ
          được cập nhật mới và{" "}
          <strong className="text-amber-950 underline underline-offset-2">
            toàn bộ tiến trình học tập (tiến độ ghi chú, câu trả lời, trạng thái làm chủ)
          </strong>{" "}
          của dự án này sẽ được đặt lại (reset) về trạng thái ban đầu sạch sẽ.
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="my-1">
        <TabsList className="w-full bg-slate-100 border border-slate-200">
          <TabsTrigger value="edit" className="flex-1 gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-3">
            <Code2 className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">1. Trình Chỉnh Sửa JSON Dự Án</span>
            <span className="sm:hidden">1. Sửa JSON</span>
          </TabsTrigger>
          <TabsTrigger value="prompt" className="flex-1 gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-3">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span className="hidden sm:inline">2. Lấy Prompt AI Cập Nhật</span>
            <span className="sm:hidden">2. Prompt AI</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: EDIT / PASTE JSON */}
        <TabsContent value="edit" className="space-y-2.5 pt-1">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <label className="cursor-pointer inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-2xs">
                <FileCode2 className="h-3.5 w-3.5 text-indigo-600" />
                <span>Nạp file .json</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleFormatJson}
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-2xs cursor-pointer"
                title="Tự động căn lề thụt dòng chuẩn"
              >
                <span>Format</span>
              </button>

              <button
                type="button"
                onClick={handleResetToOriginal}
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium transition-colors shadow-2xs cursor-pointer"
                title="Khôi phục nội dung JSON ban đầu của dự án"
              >
                <RotateCcw className="h-3 w-3 text-slate-400" />
                <span className="hidden xs:inline">Khôi phục gốc</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-700 font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Đã chép!" : "Sao chép JSON"}</span>
            </button>
          </div>

          {/* JSON Textarea */}
          <div className="relative">
            <Textarea
              value={jsonContent}
              onChange={(e) => {
                setJsonContent(e.target.value);
                if (status.type === "error") setStatus({ type: "idle" });
              }}
              spellCheck={false}
              className="font-mono text-xs min-h-[160px] sm:min-h-[260px] max-h-[35vh] border-slate-800 bg-slate-950 text-slate-200 leading-relaxed scrollbar-thin resize-y"
              placeholder='Dán nội dung JSON dự án vào đây...'
            />
          </div>

          {/* Real-time Parsed Status summary */}
          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] px-1 text-slate-500">
            {parsedSummary ? (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[280px] sm:max-w-none">
                  Hợp lệ: <strong>{parsedSummary.name}</strong> ({parsedSummary.modulesCount} modules,{" "}
                  {parsedSummary.conceptsCount} concepts)
                </span>
              </div>
            ) : parseError ? (
              <div className="flex items-center gap-2 text-rose-700 bg-rose-50/80 px-2.5 py-1 rounded-md border border-rose-200">
                <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span className="truncate max-w-[300px] sm:max-w-[500px]">Cú pháp: {parseError}</span>
              </div>
            ) : (
              <span>Khung trống</span>
            )}

            <span className="font-mono text-slate-400">ID: {parsedSummary?.id || project.id}</span>
          </div>

          {/* Status Message */}
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

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
            <div className="text-[11px] text-slate-400">
              ID cũ: <code className="font-mono">{project.id}</code>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Hủy bỏ
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveAndReimport}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Cập nhật & Đặt lại</span>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: AI PROMPT */}
        <TabsContent value="prompt" className="space-y-4 pt-1">
          {/* Card: Khung người dùng điền những phần buộc phải có khi cập nhật */}
          <div className="p-3.5 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 space-y-2.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                  <Target className="h-3.5 w-3.5" />
                </div>
                <label className="text-xs font-bold text-slate-900 tracking-tight">
                  Những phần BẮT BUỘC phải bổ sung hoặc đào sâu thêm trong dự án này:
                </label>
              </div>

              {mandatoryUpdates.trim() ? (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <Check className="h-3 w-3" /> Đã tích hợp vào Prompt
                </span>
              ) : (
                <Badge variant="outline" className="text-[10px] font-medium text-amber-700 border-amber-300 bg-amber-50">
                  Tùy chọn bổ sung
                </Badge>
              )}
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Nhập các yêu cầu sửa đổi, module cần thêm mới, hoặc các chủ đề kỹ thuật mà bạn muốn AI <strong>bắt buộc phải bóc tách</strong> trong lần cập nhật này:
            </p>

            <Textarea
              value={mandatoryUpdates}
              onChange={(e) => setMandatoryUpdates(e.target.value)}
              placeholder={`Ví dụ:
- Bổ sung thêm 1 module chuyên sâu về cơ chế phân quyền RBAC & Casbin
- Mổ xẻ chi tiết bẫy kỹ thuật memory leak khi streaming dữ liệu lớn
- Viết lại các câu hỏi phản biện Socratic thực chiến hơn`}
              className="text-xs min-h-[72px] max-h-[140px] bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 leading-relaxed shadow-2xs resize-y"
            />

            {/* Quick suggestion tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-semibold text-slate-500">Gợi ý nhanh:</span>
              {QUICK_UPDATE_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddUpdateSuggestion(sug)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 transition-colors cursor-pointer shadow-2xs font-medium"
                >
                  + {sug}
                </button>
              ))}
              {mandatoryUpdates.trim() && (
                <button
                  type="button"
                  onClick={() => setMandatoryUpdates("")}
                  className="text-[10px] text-slate-400 hover:text-rose-600 underline ml-auto cursor-pointer"
                >
                  Xóa trắng
                </button>
              )}
            </div>
          </div>

          {/* Prompt Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Prompt AI cập nhật dự án hoàn chỉnh:</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAiPrompt}
                className="h-7 text-xs gap-1.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold cursor-pointer shadow-2xs"
              >
                {promptCopied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {promptCopied ? "Đã chép Prompt!" : "Sao chép Prompt"}
              </Button>
            </div>

            <Textarea
              readOnly
              value={aiUpdatePrompt}
              className="font-mono text-[11px] min-h-[140px] sm:min-h-[220px] max-h-[30vh] border-slate-800 bg-slate-950 text-slate-300 leading-relaxed resize-y scrollbar-thin"
            />
          </div>

          <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
            💡 <strong>Hướng dẫn:</strong> Sao chép prompt này gửi cho Claude / ChatGPT / Gemini kèm yêu cầu bạn muốn thay đổi. Sau khi nhận được khối JSON mới từ AI, hãy chuyển sang tab <strong>"1. Trình Chỉnh Sửa JSON Dự Án"</strong>, dán đè vào và bấm <strong>"Cập nhật & Đặt lại tiến độ"</strong>.
          </div>
        </TabsContent>
      </Tabs>
    </Dialog>
  );
}
