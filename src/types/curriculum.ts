export type DomainType = "software" | "image" | "audio" | "video" | "workflow";

export type MasteryLevel = "unseen" | "learning" | "mastered";

export interface SocraticDrill {
  id: string;
  question: string;
  hint?: string;
  keyTakeaways: string[];
}

export interface Concept {
  id: string;
  title: string;
  estimatedMinutes?: number;
  // Bối cảnh bài toán & Hiện trạng giải pháp
  description?: string; // Tóm tắt bối cảnh bài toán
  problemStatement?: string; // Vấn đề thực tế đang đối mặt (What problem are we facing?)
  currentApproach?: string; // Cách hiện tại đang làm trong code / pipeline (How is it currently handled?)
  // Bối cảnh thành phẩm thực tế trong dự án
  artifactAnchor: string; // VD: "src/auth/jwt.guard.ts:L15-42" hoặc "Node #45: KSampler (Flux.1)"
  artifactSnippet?: {
    language?: string; // "typescript", "json", "python", "prompt", "parameters"
    content: string;
  };
  // 5 khía cạnh thấu hiểu bản chất
  whyUsed: string; // Tại sao AI / Pipeline lại chọn công nghệ hoặc thông số này?
  underTheHood: string; // Bản chất cơ chế hoạt động ngầm bên dưới
  pitfalls: string; // Bẫy kỹ thuật, lỗi biến dạng thường gặp và cách xử lý
  socraticDrills: SocraticDrill[];
  // Dữ liệu cá nhân của người học (lưu trong LocalStorage)
  masteryLevel: MasteryLevel;
  userAnswer?: string;
  userNotes?: string;
  revealedHints?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  artifactScope: string; // VD: "Authentication & Authorization" hoặc "Character Identity Consistency"
  concepts: Concept[];
}

export interface ProjectCurriculum {
  id: string;
  name: string;
  domain: DomainType;
  description: string;
  summary?: string; // Tóm tắt ngắn gọn tổng quan về dự án (bối cảnh, bài toán, kiến trúc)
  keyFeatures?: string[]; // Danh sách các chức năng / trọng tâm kỹ thuật chính sẽ tìm hiểu
  version: string;
  aiToolsUsed: string[];
  createdAt?: string;
  updatedAt?: string;
  modules: Module[];
}

export interface ProjectSummaryStats {
  totalConcepts: number;
  masteredCount: number;
  learningCount: number;
  unseenCount: number;
  percentage: number;
}
