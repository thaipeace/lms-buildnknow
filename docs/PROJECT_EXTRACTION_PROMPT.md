# PROMPT MẪU TRÍCH XUẤT GIÁO ÁN TỰ HỌC CHO BUILDNKNOW (PROJECT EXTRACTION PROMPT)

> **Mục đích:**  
> Copy toàn bộ nội dung prompt này gửi cho bất kỳ AI Coding Agent nào (ChatGPT, Claude Code, Cursor, Antigravity...) kèm theo mã nguồn dự án hoặc mô tả quy trình của bạn (Software, ComfyUI, ElevenLabs, Kling...).  
> AI sẽ tự động phân tích và sinh ra **file JSON chuẩn 100%** để bạn nạp ngay vào ứng dụng BuildNKnow.

---

```markdown
Bạn là Kiến trúc sư Công nghệ và Chuyên gia Đánh giá Năng lực (Lead Architect & Tech Evaluator). 
Tôi vừa hoàn thành một dự án với sự hỗ trợ của AI, và bây giờ tôi muốn tự học, tự vấn và thấu hiểu sâu sắc 100% bản chất công nghệ đằng sau dự án này.

Hãy phân tích dự án dưới đây và sinh ra một file JSON chuẩn tương thích với nền tảng BuildNKnow.

### THÔNG TIN DỰ ÁN CỦA TÔI:
[Dán cấu trúc thư mục, package.json, các đoạn code mấu chốt, hoặc thông số workflow ComfyUI/Audio/Video của bạn vào đây]

---

### YÊU CẦU NỘI DUNG BÓC TÁCH:
1. **Chia nhỏ thành 2 - 4 Modules công nghệ cốt lõi** (không làm dàn trải, tập trung vào những phần kỹ thuật phức tạp hoặc dễ mắc lỗi nhất).
2. **Mỗi Module có 2 - 3 Concepts quan trọng nhất**.
3. **Mỗi Concept phải giải quyết triệt để 5 khía cạnh:**
   - `artifactAnchor`: Vị trí file/dòng code hoặc tên node ComfyUI trong dự án.
   - `artifactSnippet`: Đoạn code hoặc thông số tiêu biểu nhất (10-30 dòng).
   - `whyUsed`: Tại sao AI/Hệ thống lại chọn công nghệ/kỹ thuật này thay vì cách khác? (Lý do thiết kế kiến trúc).
   - `underTheHood`: Cơ chế hoạt động ngầm bên dưới (không phụ thuộc vào framework).
   - `pitfalls`: Các bẫy kỹ thuật, lỗi bảo mật, nghẽn hiệu năng hoặc lỗi biến dạng hình ảnh/âm thanh mà người mới hay mắc phải.
   - `socraticDrills`: 1-2 câu hỏi phản biện tình huống thực tế kèm danh sách checklist `keyTakeaways` các ý cốt lõi mà người học cần tự trả lời được.

---

### ĐỊNH DẠNG ĐẦU RA (BẮT BUỘC CHỈ XUẤT DUY NHẤT CHUỖI JSON HỢP LỆ):
```json
{
  "id": "project-slug-id",
  "name": "Tên Dự Án Thực Tế",
  "domain": "software", // "software" | "image" | "audio" | "video" | "workflow"
  "description": "Mô tả ngắn gọn về sản phẩm vừa tạo",
  "version": "1.0.0",
  "aiToolsUsed": ["Cursor", "Claude Code", "v.v."],
  "modules": [
    {
      "id": "mod-1",
      "title": "Tên Cụm Công Nghệ (VD: Module 1: Xử lý Xác thực Token)",
      "artifactScope": "Đường dẫn file (VD: src/auth/*)",
      "concepts": [
        {
          "id": "concept-1",
          "title": "Tên Khái Niệm Bản Chất",
          "estimatedMinutes": 10,
          "artifactAnchor": "src/auth/auth.service.ts:L45-88",
          "artifactSnippet": {
            "language": "typescript", // "typescript" | "json" | "parameters"
            "content": "// Đoạn code hoặc thông số cấu hình mấu chốt"
          },
          "whyUsed": "Lý do vì sao AI chọn cách này...",
          "underTheHood": "Cơ chế hoạt động ngầm bên dưới...",
          "pitfalls": "Bẫy kỹ thuật, lỗi thường gặp...",
          "socraticDrills": [
            {
              "id": "drill-1",
              "question": "Câu hỏi tình huống phản biện xoáy sâu vào bản chất...",
              "keyTakeaways": [
                "Điểm mấu chốt 1",
                "Điểm mấu chốt 2"
              ]
            }
          ],
          "masteryLevel": "unseen"
        }
      ]
    }
  ]
}
```
LƯU Ý: Không giải thích thêm, chỉ xuất chuỗi JSON hoàn chỉnh để tôi copy trực tiếp vào ứng dụng BuildNKnow.
```
