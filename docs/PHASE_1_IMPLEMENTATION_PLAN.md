# BUILDNKNOW — KẾ HOẠCH TRIỂN KHAI PHASE 1 (UNIVERSAL DOGFOODING MVP)

> **Mục tiêu tối thượng của Phase 1:**  
> Xây dựng một ứng dụng Web cục bộ siêu nhẹ (Local Web App), vận hành theo **mô hình dữ liệu độc lập với lĩnh vực (Domain-Agnostic)**. Bạn có thể nạp vào bất kỳ dự án nào bạn vừa thực hiện cùng AI — từ **Lập trình phần mềm, Vẽ tranh AI (ComfyUI/Flux/LoRA), Lồng tiếng / Voice Clone (RVC/Bark), đến Làm Video điện ảnh (Kling/Runway)** — để tự học, tự vấn và thấu hiểu 100% công nghệ ngầm đằng sau.

---

## 1. MÔ HÌNH HÓA ĐA LĨNH VỰC (UNIVERSAL DOMAIN ABSTRACTION)

Thay vì gắn cứng với các khái niệm lập trình (`code`, `repo`, `file`), Phase 1 chuẩn hóa các thuật ngữ để áp dụng cho mọi thành phẩm sáng tạo cùng AI:

| Khái niệm hệ thống | Khi áp dụng vào Lập trình | Khi áp dụng vào Vẽ tranh AI | Khi áp dụng vào Lồng tiếng AI | Khi áp dụng vào Làm Video AI |
| :--- | :--- | :--- | :--- | :--- |
| **Artifact (Thành phẩm)** | API / Web App / Bot | Bức vẽ / Bộ character sheet | Đoạn podcast / Giọng lồng tiếng | Clip ngắn / Video quảng cáo |
| **AI Generator Tools** | Cursor / Claude Code / Antigravity | Midjourney / ComfyUI / Flux | ElevenLabs / RVC / Bark | Runway Gen-3 / Kling / Sora |
| **Tech & Mechanics Stack** | WebSocket, Redis, JWT, Postgres | Latent Space, LoRA, Denoise, VAE | Mel-spectrogram, Phonemes, Vocoder | Frame interpolation, Temporal coherency |
| **Context Anchor** | Đường dẫn file / Tên hàm xử lý | Node ID trong ComfyUI / Prompt seed | Đoạn timestamp audio / Thông số pitch | Đoạn timeline video / Motion brush settings |
| **Common Pitfalls** | Race condition, Memory leak | Cháy ảnh, méo ngón tay, vỡ cấu trúc | Robot hóa giọng, vỡ tiếng (clipping) | Giật khung hình (jittering), biến dạng mặt |
| **Socratic Drill** | "Tại sao dùng Redis Pub/Sub?" | "Tại sao LoRA rank 32 gây quá nhiệt?" | "Làm sao giảm độ trễ dưới 200ms?" | "Cách giữ khuôn mặt nhân vật qua 5 scene?" |

---

## 2. CẤU TRÚC DỮ LIỆU ĐỒNG NHẤT (`project-curriculum.json`)

File dữ liệu chuẩn của Phase 1 được thiết kế để mở rộng không giới hạn:

```json
{
  "project": {
    "name": "Dự án ví dụ",
    "domain": "software" | "image" | "audio" | "video" | "workflow",
    "description": "Mô tả sản phẩm tạo cùng AI",
    "aiToolsUsed": ["Tên công cụ AI đã dùng"],
    "version": "1.0.0"
  },
  "modules": [
    {
      "id": "mod-1",
      "title": "Tên nhóm công nghệ / kỹ thuật",
      "artifactAnchor": "Vị trí trong thành phẩm (File code, Node ComfyUI, Timeline video...)",
      "concepts": [
        {
          "id": "concept-1",
          "title": "Tên khái niệm công nghệ cốt lõi",
          "whyUsed": "Tại sao AI/Quy trình lại cần công nghệ này để tạo ra kết quả?",
          "underTheHood": "Bản chất cơ chế hoạt động ngầm (Deep mechanism)...",
          "pitfalls": "Bẫy kỹ thuật, lỗi thường gặp và cách khắc phục bản chất...",
          "socraticDrills": [
            {
              "id": "drill-1",
              "question": "Câu hỏi phản biện / tình huống thực tế...",
              "keyTakeaways": [
                "Điểm mấu chốt 1 bạn cần nắm",
                "Điểm mấu chốt 2 bạn cần nắm"
              ]
            }
          ],
          "masteryLevel": "unseen" // "unseen" | "learning" | "mastered",
          "userNotes": ""
        }
      ]
    }
  ]
}
```

---

## 3. THIẾT KẾ GIAO DIỆN & TÍNH NĂNG WEB APP P1

### 3.1. Phong cách thiết kế (Design Aesthetics)
- **Chuẩn giao diện:** Tối giản hiện đại (Minimalist Dark Mode), bảng màu Slate/Indigo/Cyan cao cấp, font chữ Inter sắc nét, bo góc mềm mại, hiệu ứng vi chuyển động (micro-interactions) tinh tế.
- **Badge phân loại đa dạng:** Tự động hiển thị thẻ tag màu nhận diện Domain (`💻 Software`, `🎨 AI Art`, `🎙️ Audio/Voice`, `🎬 AI Video`, `⚡ Automation`).

### 3.2. Bố cục 3 khối chức năng
1. **Header & Project Selector:**
   - Hiển thị tên dự án hiện tại, Domain tag, thanh tiến độ tổng thể (% Mastery).
   - Nút **Switch Project / Demo Projects** (đổi nhanh giữa các dự án: Coding, Vẽ tranh ComfyUI, Lồng tiếng...).
   - Nút **Import / Export JSON** (lưu lại hoặc nạp dữ liệu học bất kỳ lúc nào).
2. **Sidebar - Navigation:**
   - Danh sách các Modules và Concepts.
   - Trạng thái trực quan: Chấm tròn màu (🔴 Chưa học, 🟡 Đang học, 🟢 Đã làm chủ).
3. **Main Workspace - Study & Socratic Drill:**
   - **Thẻ 1 - Bối cảnh & Bản chất (Context & Under The Hood):**  
     Phân tích *Why Used*, *Bản chất ngầm*, *Gotchas & Pitfalls*.
   - **Thẻ 2 - Tự vấn & Phản biện (Active Recall Drill):**  
     Hiển thị câu hỏi xoáy $\rightarrow$ Khung cho bạn tự gõ giải thích tư duy $\rightarrow$ Nút "Xem điểm cốt lõi" $\rightarrow$ 3 nút tự đánh giá mức độ thông suốt.

---

## 4. BỘ DỮ LIỆU MẪU CÓ SẴN (PRE-LOADED DEMOS)

Để bạn có thể kiểm thử và trải nghiệm ngay lập tức trên máy mình, Phase 1 sẽ đi kèm **2 bộ dữ liệu thực tế mẫu**:

1. **Demo 1 (Software):** *Realtime Order/Trading Backend with NestJS, Redis Pub/Sub, BullMQ & WebSockets.*
   - Giúp bạn học sâu lại chính dự án backend bạn đang lên kế hoạch.
2. **Demo 2 (Creative / AI Image):** *Consistent Character Generation Pipeline with Flux.1, ComfyUI, LoRA & ControlNet.*
   - Giúp chứng minh ngay tính nhất quán đa lĩnh vực: hiểu Latent space, Denoise strength, VAE decode và cách khắc phục vỡ hình dạng khuôn mặt.

---

## 5. LỘ TRÌNH THỰC HIỆN PHASE 1 NGAY BÂY GIỜ

* [x] **Bước 1:** Chuẩn hóa mô hình kiến trúc đa lĩnh vực (Universal Domain Model).
* [ ] **Bước 2:** Tạo bộ file mã nguồn Web App P1 (`index.html`, `style.css`, `app.js`) siêu nhẹ, không cần build step, chạy được ngay trên mọi trình duyệt.
* [ ] **Bước 3:** Chuẩn bị sẵn 2 file JSON mẫu (`demo-software-nestjs.json`, `demo-image-flux-comfyui.json`) và Prompt chuẩn để bạn tự trích xuất bất kỳ dự án nào sau này.
* [ ] **Bước 4:** Khởi chạy server local và cùng bạn trực tiếp trải nghiệm (Dogfooding) trên chính máy bạn.
