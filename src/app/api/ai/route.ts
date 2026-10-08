import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AIConceptContext, AIEvaluationResult } from "@/types/ai";

export const dynamic = "force-dynamic";

interface RequestPayload {
  action: "chat" | "evaluate" | "test_key";
  apiKey?: string;
  model?: string;
  prompt?: string;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  context?: AIConceptContext;
  evaluationData?: {
    conceptId: string;
    conceptTitle: string;
    drillId?: string;
    drillQuestion: string;
    keyTakeaways: string[];
    userAnswer: string;
  };
}

// Helper lấy API key từ header hoặc payload hoặc process.env
function resolveApiKey(request: Request, payloadApiKey?: string): string | null {
  const headerKey = request.headers.get("x-gemini-api-key");
  if (headerKey && headerKey.trim().length > 0) return headerKey.trim();
  if (payloadApiKey && payloadApiKey.trim().length > 0) return payloadApiKey.trim();
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) {
    return process.env.GEMINI_API_KEY.trim();
  }
  return null;
}

// Fallback gọi trực tiếp Google Gemini REST API nếu SDK gặp trục trặc
async function callGeminiRestApi(
  apiKey: string,
  model: string,
  contents: any[],
  systemInstruction?: string,
  responseJson: boolean = false
) {
  const cleanModel = model.replace(/^models\//, "");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const body: any = {
    contents,
    generationConfig: {
      temperature: responseJson ? 0.2 : 0.7,
      maxOutputTokens: 2048,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  if (responseJson) {
    body.generationConfig.responseMimeType = "application/json";
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gemini API error (Status ${res.status}): ${res.statusText}`
    );
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") || "";
  return text;
}

async function generateGeminiContent(
  apiKey: string,
  model: string,
  systemInstruction: string,
  contents: any[],
  isJson: boolean = false
): Promise<string> {
  // Thử qua SDK trước
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents: contents.map((c) => {
        if (typeof c === "string") return c;
        if (c.role && c.parts) return c;
        return {
          role: c.role === "assistant" ? "model" : "user",
          parts: [{ text: c.content || c.text || "" }],
        };
      }),
      config: {
        systemInstruction,
        temperature: isJson ? 0.2 : 0.7,
        responseMimeType: isJson ? "application/json" : "text/plain",
      },
    });

    if (response && response.text) {
      return response.text;
    }
  } catch (sdkError: any) {
    console.warn("GoogleGenAI SDK call failed, falling back to REST:", sdkError?.message);
  }

  // Fallback REST
  return await callGeminiRestApi(
    apiKey,
    model || "gemini-2.5-flash",
    contents.map((c) => {
      if (typeof c === "string") {
        return { role: "user", parts: [{ text: c }] };
      }
      return {
        role: c.role === "assistant" ? "model" : "user",
        parts: [{ text: c.content || c.text || "" }],
      };
    }),
    systemInstruction,
    isJson
  );
}

export async function POST(request: Request) {
  try {
    const body: RequestPayload = await request.json();
    const { action, apiKey: payloadKey, model = "gemini-2.5-flash" } = body;

    const apiKey = resolveApiKey(request, payloadKey);

    // 1. Kiểm tra API Key
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          needApiKey: true,
          error:
            "Chưa cấu hình Gemini API Key. Bạn có thể nhập API Key trong phần Cài đặt AI hoặc thiết lập GEMINI_API_KEY trong file .env.",
        },
        { status: 400 }
      );
    }

    // 2. Action: Test Key
    if (action === "test_key") {
      try {
        const testRes = await generateGeminiContent(
          apiKey,
          model,
          "Bạn là hệ thống kiểm tra kết nối.",
          [{ role: "user", parts: [{ text: "Trả lời ngắn gọn chữ OK." }] }],
          false
        );
        return NextResponse.json({
          success: true,
          message: "Kết nối thành công với Google Gemini!",
          sample: testRes.trim(),
        });
      } catch (err: any) {
        return NextResponse.json(
          {
            success: false,
            error: `API Key không hợp lệ hoặc lỗi kết nối: ${err.message}`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Action: Evaluate Socratic Drill Answer
    if (action === "evaluate") {
      const evalData = body.evaluationData;
      const context = body.context;

      if (!evalData || !evalData.userAnswer || evalData.userAnswer.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "Thiếu dữ liệu câu trả lời của người học để đánh giá." },
          { status: 400 }
        );
      }

      const systemInstruction = `Bạn là Senior Technical Mentor và Giám khảo kỹ thuật công tâm, sâu sắc của hệ thống học tập BuildNKnow.
Nhiệm vụ của bạn là thẩm định câu trả lời tự vấn (Socratic Drill) của người học, phân tích xem người học đã thực sự "THÔNG SUỐT" bản chất kỹ thuật hay chưa, chỉ ra điểm mạnh, điểm còn thiếu sót và diễn giải bổ sung mở rộng.

TIÊU CHÍ QUYẾT ĐỊNH THÔNG SUỐT (isMastered):
- isMastered = true (ĐÃ THÔNG SUỐT): Khi người học nắm được >= 70% các điểm mấu chốt kỹ thuật (Key Takeaways), giải thích đúng cơ chế ngầm (Under the hood) hoặc lý do thực tế (Why used), không có ngộ nhận nghiêm trọng. Điểm số (score) từ 75 - 100.
- isMastered = false (CẦN CỦNG CỐ THÊM): Khi người học trả lời quá ngắn/sơ sài, bỏ qua các điểm mấu chốt quan trọng, hoặc giải thích sai bản chất cơ chế. Điểm số (score) từ 0 - 74.

HÃY TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON HỢP LỆ THEO SCHEMA SAU (không bọc trong markdown fences nếu không cần thiết):
{
  "isMastered": boolean,
  "score": number,
  "verdict": "mastered" | "learning",
  "summary": "Tóm tắt ngắn gọn nhận xét cốt lõi trong 1-2 câu",
  "feedback": "Nhận xét chi tiết, mang tính sư phạm và khích lệ người học",
  "strengths": ["Điểm mạnh hoặc khía cạnh người học đã hiểu chuẩn xác 1", "Điểm mạnh 2"],
  "improvements": ["Điểm then chốt còn thiếu cần bổ sung 1", "Khía cạnh cần lưu ý 2"],
  "deepDive": "Diễn giải chuyên sâu thêm về bản chất dưới nắp capô, ví dụ thực tế hoặc bẫy kỹ thuật liên quan để giúp người học vỡ òa tri thức"
}`;

      const userPrompt = `BỐI CẢNH BÀI HỌC:
- Dự án: ${context?.projectName || "Chưa xác định"} (Lĩnh vực: ${context?.projectDomain || "Tech"})
- Bài học (Concept): ${evalData.conceptTitle}
- Vấn đề thực tế (Problem Statement): ${context?.problemStatement || "N/A"}
- Cách xử lý hiện tại (Current Approach): ${context?.currentApproach || "N/A"}
- Tại sao chọn (Why Used): ${context?.whyUsed || "N/A"}
- Cơ chế ngầm bên dưới (Under the hood): ${context?.underTheHood || "N/A"}
- Bẫy kỹ thuật (Pitfalls): ${context?.pitfalls || "N/A"}
- Code / File tham chiếu: ${context?.artifactAnchor || "N/A"}
${context?.artifactSnippet ? `Code snippet:\n\`\`\`${context.artifactSnippet.language || ""}\n${context.artifactSnippet.content}\n\`\`\`` : ""}

CÂU HỎI TỰ VẤN (Socratic Drill):
${evalData.drillQuestion}

CÁC ĐIỂM MẤU CHỐT CẦN ĐẠT (Key Takeaways):
${evalData.keyTakeaways?.map((kt, i) => `${i + 1}. ${kt}`).join("\n") || "Đối chiếu theo cơ chế kỹ thuật"}

CÂU TRẢ LỜI CỦA NGƯỜI HỌC:
"""
${evalData.userAnswer}
"""

Hãy chấm điểm và xuất JSON kết quả đánh giá theo đúng cấu trúc đã yêu cầu.`;

      let rawResponse: string;
      try {
        rawResponse = await generateGeminiContent(
          apiKey,
          model,
          systemInstruction,
          [{ role: "user", parts: [{ text: userPrompt }] }],
          true
        );
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: `Lỗi khi gọi Gemini: ${err.message}` },
          { status: 500 }
        );
      }

      // Parse JSON từ Gemini
      let parsedResult: any;
      try {
        const cleaned = rawResponse
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();
        parsedResult = JSON.parse(cleaned);
      } catch {
        // Fallback nếu JSON bị lệch
        parsedResult = {
          isMastered: false,
          score: 65,
          verdict: "learning",
          summary: "AI đã xem xét câu trả lời của bạn.",
          feedback: rawResponse,
          strengths: ["Có tinh thần tự vấn và suy ngẫm"],
          improvements: ["Cần đối chiếu kỹ hơn với các điểm mấu chốt"],
          deepDive: "Hãy xem lại phần 'Bản chất ngầm' trong bài học.",
        };
      }

      const finalEvaluation: AIEvaluationResult = {
        isMastered: Boolean(parsedResult.isMastered),
        score: typeof parsedResult.score === "number" ? Math.min(100, Math.max(0, parsedResult.score)) : 70,
        verdict: parsedResult.isMastered ? "mastered" : "learning",
        summary: parsedResult.summary || "Kết quả đánh giá",
        feedback: parsedResult.feedback || "",
        strengths: Array.isArray(parsedResult.strengths) ? parsedResult.strengths : [],
        improvements: Array.isArray(parsedResult.improvements) ? parsedResult.improvements : [],
        deepDive: parsedResult.deepDive || "",
        conceptId: evalData.conceptId,
        conceptTitle: evalData.conceptTitle,
        drillId: evalData.drillId,
        drillQuestion: evalData.drillQuestion,
      };

      return NextResponse.json({
        success: true,
        evaluation: finalEvaluation,
      });
    }

    // 4. Action: Chat / Q&A with Context
    if (action === "chat") {
      const { prompt, messages = [], context } = body;

      if (!prompt && (!messages || messages.length === 0)) {
        return NextResponse.json(
          { success: false, error: "Vui lòng nhập câu hỏi cho AI." },
          { status: 400 }
        );
      }

      const systemInstruction = `Bạn là Senior Technical Mentor và Trợ lý học tập thông minh của BuildNKnow.
Bạn luôn đồng hành cùng người học trong lúc họ nghiên cứu dự án mã nguồn / pipeline kỹ thuật.

NGUYÊN TẮC HƯỚNG DẪN:
1. LUÔN BÁM SÁT NGỮ CẢNH: Khi trả lời, hãy gắn liền với dự án (${context?.projectName || "Dự án"}), bài học hiện tại (${context?.conceptTitle || ""}), và đoạn mã nguồn (${context?.artifactAnchor || ""}).
2. GIẢI THÍCH BẢN CHẤT ("WHY" & "UNDER THE HOOD"): Không chỉ nói "làm như thế nào", mà phân tích "tại sao lại làm như vậy", cơ chế ngầm hoạt động ra sao, và nếu làm sai thì gặp lỗi gì (pitfalls).
3. PHONG CÁCH SƯ PHẠM: Thân thiện, truyền cảm hứng, dùng ví dụ so sánh trực quan (metaphor) dễ hiểu. Sử dụng tiếng Việt kỹ thuật chuẩn xác.
4. ĐỊNH DẠNG: Sử dụng markdown với code block, in đậm từ khóa quan trọng, gạch đầu dòng rõ ràng để dễ đọc.

NGỮ CẢNH HIỆN TẠI CỦA NGƯỜI HỌC:
- Dự án: ${context?.projectName || "Chưa xác định"} (Domain: ${context?.projectDomain || "software"})
- Tóm tắt dự án: ${context?.projectSummary || "N/A"}
- Module: ${context?.moduleTitle || "N/A"}
- Bài học (Concept): ${context?.conceptTitle || "N/A"}
- Vấn đề thực tế (Problem): ${context?.problemStatement || "N/A"}
- Cách tiếp cận hiện tại (Current approach): ${context?.currentApproach || "N/A"}
- Tại sao chọn giải pháp này (Why used): ${context?.whyUsed || "N/A"}
- Cơ chế ngầm bên dưới (Under the hood): ${context?.underTheHood || "N/A"}
- Cạm bẫy / Lỗi thường gặp (Pitfalls): ${context?.pitfalls || "N/A"}
- Vị trí mã nguồn: ${context?.artifactAnchor || "N/A"}
${context?.artifactSnippet ? `Snippet Code:\n\`\`\`${context.artifactSnippet.language || ""}\n${context.artifactSnippet.content}\n\`\`\`` : ""}
${context?.userAnswer ? `Câu trả lời tự vấn của học viên: "${context.userAnswer}"` : ""}
${context?.userNotes ? `Ghi chú cá nhân của học viên: "${context.userNotes}"` : ""}`;

      // Xây dựng chuỗi hội thoại
      const conversationContents: any[] = [];

      // Thêm lịch sử tin nhắn gần nhất (tối đa 10 tin để tối ưu context)
      const recentMessages = messages.slice(-10);
      for (const msg of recentMessages) {
        conversationContents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }

      // Thêm câu hỏi hiện tại nếu chưa nằm trong messages
      if (prompt && (!recentMessages.length || recentMessages[recentMessages.length - 1].content !== prompt)) {
        conversationContents.push({
          role: "user",
          parts: [{ text: prompt }],
        });
      }

      try {
        const responseText = await generateGeminiContent(
          apiKey,
          model,
          systemInstruction,
          conversationContents,
          false
        );

        return NextResponse.json({
          success: true,
          content: responseText,
        });
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: `Lỗi từ Gemini: ${err.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: false, error: "Action không hợp lệ." }, { status: 400 });
  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
