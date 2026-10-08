"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAI } from "@/context/AIContext";
import { useCurriculum } from "@/context/CurriculumContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  Settings,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Flame,
  Key,
  Compass,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AISettingsModal } from "./AISettingsModal";

interface AIAgentPanelProps {
  className?: string;
  onClose?: () => void;
}

export function AIAgentPanel({ className = "", onClose }: AIAgentPanelProps) {
  const {
    apiKey,
    model,
    messages,
    isChatting,
    isEvaluating,
    sendChatMessage,
    clearMessages,
    settingsModalOpen,
    setSettingsModalOpen,
  } = useAI();

  const { activeConcept, activeProject } = useCurriculum();

  const [input, setInput] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [expandedDeepDives, setExpandedDeepDives] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatting, isEvaluating]);

  const handleSend = async () => {
    if (!input.trim() || isChatting || isEvaluating) return;
    const currentInput = input;
    setInput("");
    await sendChatMessage(currentInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Trích dẫn code snippet của concept hiện tại vào input
  const handleQuoteCode = () => {
    if (!activeConcept?.artifactSnippet?.content) return;
    const snippet = activeConcept.artifactSnippet.content;
    const quote = `\`\`\`${activeConcept.artifactSnippet.language || ""}\n${snippet}\n\`\`\`\n\nGiải thích chi tiết đoạn code này giúp tôi:`;
    setInput((prev) => (prev ? `${prev}\n\n${quote}` : quote));
    textareaRef.current?.focus();
  };

  const toggleDeepDive = (msgId: string) => {
    setExpandedDeepDives((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const quickPrompts = [
    {
      label: "💡 Giải thích code",
      prompt: "Hãy giải thích chi tiết mục đích và cơ chế hoạt động của đoạn code trong bài học này.",
    },
    {
      label: "⚙️ Cơ chế ngầm",
      prompt: "Bản chất ngầm bên dưới (under the hood) của giải pháp này hoạt động ra sao?",
    },
    {
      label: "⚠️ Cạm bẫy & lỗi",
      prompt: "Những lỗi hoặc cạm bẫy kỹ thuật (pitfalls) hay gặp nhất khi áp dụng phần này là gì và cách phòng tránh?",
    },
    {
      label: "🧪 Thử thách tôi",
      prompt: "Hãy đặt cho tôi 1 câu hỏi tình huống thực tế hóc búa liên quan đến bài học này để tôi rèn luyện.",
    },
  ];

  return (
    <div className={`flex flex-col h-full bg-slate-50 overflow-hidden ${className}`}>
      {/* 1. Header */}
      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-2xs shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 truncate">
                AI Mentor & Chấm điểm
              </span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono text-slate-500">
                {model.replace("gemini-", "")}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-[10.5px] text-slate-500">
              {apiKey ? (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Sẵn sàng
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(true)}
                  className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium cursor-pointer underline"
                >
                  <Key className="h-2.5 w-2.5" />
                  Nhập API Key
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearMessages}
              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200 cursor-pointer"
              title="Xóa lịch sử hội thoại"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsModalOpen(true)}
            className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200 cursor-pointer"
            title="Cài đặt API Key & Model"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>

          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-7 px-2 text-xs text-slate-500 hover:text-slate-800 border-slate-200 cursor-pointer lg:hidden"
            >
              Đóng
            </Button>
          )}
        </div>
      </div>

      {/* 2. Context Tracking Indicator */}
      {activeConcept && (
        <div className="px-3 py-1.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
            <Compass className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span className="text-slate-500 shrink-0">Ngữ cảnh:</span>
            <span className="font-semibold text-indigo-900 truncate">
              {activeConcept.title}
            </span>
          </div>

          {activeConcept.artifactAnchor && (
            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px] hidden sm:inline ml-1 shrink-0">
              {activeConcept.artifactAnchor.split(":")[0]}
            </span>
          )}
        </div>
      )}

      {/* 3. Messages Stream */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 space-y-4">
        {/* Welcome state when empty */}
        {messages.length === 0 && (
          <div className="py-6 px-3 text-center space-y-4 animate-in fade-in duration-300">
            <div className="h-12 w-12 rounded-2xl bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto shadow-2xs">
              <Sparkles className="h-6 w-6" />
            </div>

            <div className="max-w-xs mx-auto space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                AI Mentor & Giám khảo Kỹ thuật
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Giải đáp ngắn gọn, đi thẳng vào trọng tâm vấn đề và chấm điểm tự vấn. Bạn có thể hỏi sâu thêm bất cứ khi nào cần.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-1.5 pt-2 text-left max-w-sm mx-auto">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
                Gợi ý câu hỏi nhanh:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendChatMessage(qp.prompt)}
                    disabled={isChatting || isEvaluating}
                    className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/60 hover:border-indigo-200 text-left transition-all cursor-pointer group shadow-2xs flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-900">
                      {qp.label}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Items */}
        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-indigo-600 text-white p-3 text-xs leading-relaxed shadow-2xs">
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  <div className="text-[10px] text-indigo-200 text-right mt-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          }

          // AI Evaluation Card Message
          if (msg.type === "evaluation" && msg.evaluation) {
            const evalRes = msg.evaluation;
            const isMastered = evalRes.isMastered;

            return (
              <div
                key={msg.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in zoom-in-98 duration-200"
              >
                {/* Result Header Banner */}
                <div
                  className={`p-3.5 border-b flex items-start justify-between gap-3 ${
                    isMastered
                      ? "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white border-emerald-200"
                      : "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        isMastered
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {isMastered ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isMastered ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          {isMastered ? "🟢 ĐÃ THÔNG SUỐT" : "🟡 CẦN CỦNG CỐ THÊM"}
                        </span>
                        <span
                          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isMastered
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {evalRes.score}/100 điểm
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isMastered
                          ? "Hệ thống đã tự động đánh dấu 'Đã làm chủ' cho concept này!"
                          : "Hệ thống đã ghi nhận tiến độ 'Đang củng cố'. Hãy xem kỹ góp ý."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary & Pedagogical Feedback */}
                <div className="p-3.5 space-y-3 text-xs text-slate-700 leading-relaxed">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-medium text-slate-800">
                    {evalRes.summary}
                  </div>

                  {evalRes.feedback && (
                    <div className="prose prose-xs max-w-none text-slate-700">
                      <ReactMarkdown>{evalRes.feedback}</ReactMarkdown>
                    </div>
                  )}

                  {/* Strengths Checklist */}
                  {evalRes.strengths && evalRes.strengths.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Điểm bạn đã nắm vững:
                      </span>
                      <ul className="space-y-1 pl-1">
                        {evalRes.strengths.map((str, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-700 flex items-start gap-1.5"
                          >
                            <span className="text-emerald-500 mt-0.5">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements Checklist */}
                  {evalRes.improvements && evalRes.improvements.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1.5">
                        <HelpCircle className="h-3.5 w-3.5" />
                        Điểm cần bổ sung & lưu ý:
                      </span>
                      <ul className="space-y-1 pl-1">
                        {evalRes.improvements.map((imp, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-700 flex items-start gap-1.5"
                          >
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deep Dive Accordion */}
                  {evalRes.deepDive && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => toggleDeepDive(msg.id)}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 text-indigo-900 font-semibold text-xs cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                          Diễn giải chuyên sâu & Mở rộng (Deep Dive)
                        </span>
                        {expandedDeepDives[msg.id] ? (
                          <ChevronUp className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-indigo-600" />
                        )}
                      </button>

                      {expandedDeepDives[msg.id] && (
                        <div className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed space-y-2 animate-in fade-in duration-200">
                          <div className="prose prose-invert prose-xs max-w-none font-sans text-slate-200">
                            <ReactMarkdown>{evalRes.deepDive}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Regular AI Assistant Chat Message
          return (
            <div key={msg.id} className="flex gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0 max-w-[92%] rounded-2xl rounded-tl-xs bg-white border border-slate-200 p-3 sm:p-3.5 text-xs text-slate-800 leading-relaxed shadow-2xs">
                <div className="prose prose-xs max-w-none text-slate-800 break-words leading-relaxed font-sans">
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const codeContent = String(children).replace(/\n$/, "");
                        return (
                          <div className="relative group my-2">
                            <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto border border-slate-800">
                              <code>{codeContent}</code>
                            </pre>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(codeContent)}
                              className="absolute right-2 top-2 p-1 rounded bg-slate-800 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Sao chép mã"
                            >
                              {copiedSnippet ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                <div className="text-[10px] text-slate-400 text-right mt-1.5 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {(isChatting || isEvaluating) && (
          <div className="flex gap-2.5 animate-in fade-in duration-200">
            <div className="h-7 w-7 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-xs bg-white border border-slate-200 p-3 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
              <span>
                {isEvaluating
                  ? "AI đang đối chiếu câu trả lời với tiêu chí kỹ thuật & chấm điểm..."
                  : "AI đang suy nghĩ và tổng hợp câu trả lời theo ngữ cảnh..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Input Area */}
      <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0 space-y-2">
        {/* Quick Tool Helpers */}
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            {activeConcept?.artifactSnippet && (
              <button
                type="button"
                onClick={handleQuoteCode}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10.5px] transition-colors cursor-pointer"
                title="Chèn mã nguồn của concept hiện tại vào khung chat"
              >
                <Code2 className="h-3 w-3 text-indigo-600" />
                <span>+ Trích dẫn Code</span>
              </button>
            )}
          </div>

          <span className="text-[10px] text-slate-400 hidden xs:inline">
            Enter để gửi • Shift+Enter xuống dòng
          </span>
        </div>

        {/* Text Input Container */}
        <div className="relative flex items-end gap-1.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isChatting || isEvaluating}
            placeholder={
              apiKey
                ? "Hỏi ngắn gọn điều bạn thắc mắc (AI trả lời thẳng vào trọng tâm)..."
                : "Nhập câu hỏi (hệ thống sẽ yêu cầu API Key nếu chưa có)..."
            }
            rows={2}
            className="w-full resize-none p-2.5 pr-12 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed shadow-2xs"
          />

          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isChatting || isEvaluating}
            className="absolute right-1.5 bottom-1.5 h-8 w-8 p-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs disabled:opacity-30 transition-all"
            title="Gửi câu hỏi"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Settings Modal */}
      <AISettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
      />
    </div>
  );
}
