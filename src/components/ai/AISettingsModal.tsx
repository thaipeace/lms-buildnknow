"use client";

import React, { useState } from "react";
import { useAI } from "@/context/AIContext";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIModelType } from "@/types/ai";
import {
  Key,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Cpu,
} from "lucide-react";

interface AISettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISettingsModal({ open, onOpenChange }: AISettingsModalProps) {
  const { apiKey, setApiKey, model, setModel, testApiKey } = useAI();
  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedModel, setSelectedModel] = useState<AIModelType>(model);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  // Sync state khi mở modal
  React.useEffect(() => {
    if (open) {
      setInputKey(apiKey);
      setSelectedModel(model);
      setTestResult(null);
    }
  }, [open, apiKey, model]);

  const handleSave = () => {
    setApiKey(inputKey);
    setModel(selectedModel);
    onOpenChange(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testApiKey(inputKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, error: err?.message || "Lỗi kiểm tra API" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="sm:max-w-lg">
      <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Cài đặt Trợ lý AI (Google Gemini)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Cấu hình API Key để kích hoạt khả năng hỏi đáp ngữ cảnh và tự động chấm điểm phản biện.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* 1. API Key Input */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-indigo-600" />
                Gemini API Key:
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 font-medium underline underline-offset-2"
              >
                <span>Lấy khóa miễn phí từ Google AI Studio</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </label>

            <div className="relative">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="AIzaSy..."
                className="w-full h-10 px-3 pr-24 rounded-lg border border-slate-300 bg-white font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testing || !inputKey.trim()}
                className="absolute right-1 top-1 h-8 text-[11px] px-2.5 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {testing ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                    <span>Kiểm tra...</span>
                  </>
                ) : (
                  <span>Test Key</span>
                )}
              </Button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              💡 Khóa được lưu trữ an toàn trong trình duyệt (LocalStorage) của bạn hoặc có thể thiết lập biến môi trường <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">GEMINI_API_KEY</code> trong file <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">.env</code>.
            </p>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 animate-in fade-in duration-200 ${
                testResult.success
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                  : "bg-rose-50/80 border-rose-200 text-rose-900"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                {testResult.success ? (
                  <>
                    <span className="font-bold">Tuyệt vời!</span> {testResult.message}
                  </>
                ) : (
                  <>
                    <span className="font-bold">Lỗi kết nối:</span> {testResult.error}
                  </>
                )}
              </div>
            </div>
          )}

          {/* 2. Model Selection */}
          <div className="space-y-2 pt-1">
            <label className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-indigo-600" />
              Chọn phiên bản mô hình Gemini:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedModel("gemini-2.5-flash")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedModel === "gemini-2.5-flash"
                    ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">2.5 Flash</span>
                  <Badge variant="success" className="text-[9px] px-1 py-0">Khuyên dùng</Badge>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-tight">
                  Tốc độ cao, tư duy phản biện sắc bén, tối ưu chi phí.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel("gemini-1.5-flash")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedModel === "gemini-1.5-flash"
                    ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">1.5 Flash</span>
                  <Badge variant="secondary" className="text-[9px] px-1 py-0">Ổn định</Badge>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-tight">
                  Phiên bản tiền nhiệm ổn định, hỗ trợ context dài.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel("gemini-2.0-flash")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedModel === "gemini-2.0-flash"
                    ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">2.0 Flash</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0">Thế hệ mới</Badge>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-tight">
                  Xử lý logic đa phương tiện cực nhanh.
                </p>
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[11px] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Khóa API của bạn không bao giờ được lưu trên máy chủ chung, chỉ gửi trực tiếp tới endpoint Gemini của dự án.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-700 cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-xs"
          >
            Lưu Cấu Hình
          </Button>
        </DialogFooter>
    </Dialog>
  );
}
