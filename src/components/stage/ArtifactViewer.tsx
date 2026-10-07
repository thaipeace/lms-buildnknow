"use client";

import React, { useState } from "react";
import { Copy, Check, FileCode2, Sliders, WrapText, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ArtifactViewerProps {
  anchor: string;
  snippet?: {
    language?: string;
    content: string;
  };
  domain?: string;
  className?: string;
}

export function ArtifactViewer({
  anchor,
  snippet,
  domain = "software",
  className = "",
}: ArtifactViewerProps) {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [fontSize, setFontSize] = useState<"compact" | "normal">("compact");

  if (!snippet) {
    return (
      <div className={`h-full rounded-xl border border-slate-800 bg-slate-950 p-6 flex flex-col items-center justify-center text-center text-slate-500 text-xs ${className}`}>
        <FileCode2 className="h-8 w-8 text-slate-700 mb-2" />
        <p>Không có snippet đính kèm cho concept này.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = snippet.content.split("\n");
  const isCode = snippet.language === "typescript" || snippet.language === "javascript" || snippet.language === "json";

  return (
    <div
      className={`h-full flex flex-col rounded-xl border border-slate-800/90 bg-slate-950 shadow-md overflow-hidden ${className}`}
    >
      {/* Compact Viewer Header */}
      <div className="h-10 px-2.5 sm:px-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden min-w-0">
          {isCode ? (
            <FileCode2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          ) : (
            <Sliders className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          )}
          <span
            className="font-mono text-slate-300 text-xs font-medium truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-xs"
            title={anchor}
          >
            {anchor}
          </span>
          <Badge variant={isCode ? "cyan" : "purple"} className="text-[10px] px-1.5 py-0 shrink-0">
            {snippet.language || "text"}
          </Badge>
          <span className="text-[10px] font-mono text-slate-500 hidden md:inline shrink-0">
            {lines.length} dòng
          </span>
        </div>

        {/* Header Tools */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWrapLines(!wrapLines)}
            title={wrapLines ? "Tắt tự xuống dòng" : "Bật tự xuống dòng"}
            className={`h-6 px-1.5 text-[11px] gap-1 cursor-pointer transition-colors ${
              wrapLines ? "text-indigo-400 bg-indigo-950/40" : "text-slate-400 hover:text-white"
            }`}
          >
            <WrapText className="h-3 w-3" />
            <span className="hidden lg:inline">{wrapLines ? "Đang ngắt" : "Ngắt dòng"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFontSize(fontSize === "compact" ? "normal" : "compact")}
            title="Chỉnh cỡ chữ"
            className="h-6 px-1.5 text-[11px] text-slate-400 hover:text-white cursor-pointer font-mono"
          >
            {fontSize === "compact" ? "A+" : "A-"}
          </Button>

          <div className="h-3 w-[1px] bg-slate-800 mx-0.5" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 px-1.5 sm:px-2 text-[11px] text-slate-300 hover:text-white hover:bg-slate-800/80 gap-1 sm:gap-1.5 cursor-pointer font-sans"
            title="Sao chép code"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 hidden xs:inline">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-slate-400" />
                <span className="hidden xs:inline">Sao chép</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code / Parameter Body with Line Numbers */}
      <div
        className={`flex-1 min-h-0 overflow-auto bg-slate-950 p-2.5 sm:p-3 dark-scroll ${
          fontSize === "compact" ? "text-[11.5px] leading-snug" : "text-[13px] leading-relaxed"
        } font-mono`}
      >
        <table className="border-collapse w-full">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-900/60 transition-colors group">
                <td className="text-right pr-3 pl-1 select-none text-slate-600 font-mono text-[10.5px] w-8 align-top border-r border-slate-800/60 group-hover:text-slate-400">
                  {idx + 1}
                </td>
                <td
                  className={`pl-3 text-slate-200 align-top font-mono ${
                    wrapLines ? "whitespace-pre-wrap break-all" : "whitespace-pre"
                  }`}
                >
                  {line || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
