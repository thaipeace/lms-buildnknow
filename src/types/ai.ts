import { MasteryLevel } from "./curriculum";

export interface AIEvaluationResult {
  isMastered: boolean;
  score: number; // 0 - 100
  verdict: MasteryLevel;
  summary: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  deepDive?: string;
  conceptId: string;
  conceptTitle: string;
  drillId?: string;
  drillQuestion?: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  type?: "chat" | "evaluation";
  evaluation?: AIEvaluationResult;
  contextSnapshot?: {
    conceptId: string;
    conceptTitle: string;
    artifactAnchor?: string;
  };
}

export interface AIConceptContext {
  projectName: string;
  projectDomain: string;
  projectSummary?: string;
  moduleTitle: string;
  conceptTitle: string;
  conceptDescription?: string;
  problemStatement?: string;
  currentApproach?: string;
  artifactAnchor: string;
  artifactSnippet?: {
    language?: string;
    content: string;
  };
  whyUsed: string;
  underTheHood: string;
  pitfalls: string;
  socraticDrills?: Array<{
    id: string;
    question: string;
    hint?: string;
    keyTakeaways: string[];
  }>;
  userAnswer?: string;
  userNotes?: string;
}

export type AIModelType = "gemini-2.5-flash" | "gemini-1.5-flash" | "gemini-2.0-flash";
