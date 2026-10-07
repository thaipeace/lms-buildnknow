# BUILDNKNOW — EPICS & TASKS KẾ HOẠCH TRIỂN KHAI PHASE 1

> **Công nghệ chốt:** **Next.js (App Router, TypeScript) + Tailwind CSS + shadcn/ui + Lucide Icons**  
> **Ngôn ngữ thiết kế:** Học hỏi layout **Udemy Course Player** quen thuộc, trực quan, tập trung tối đa vào trải nghiệm học và làm chủ dự án.  
> **Kiến trúc:** Local-First, lưu trữ trực tiếp trên LocalStorage, nhập/xuất JSON di động, hỗ trợ đa lĩnh vực (Software, AI Art, Voice, Video...).

---

## 1. THIẾT KẾ GIAO DIỆN HỌC HỎI UDEMY COURSE PLAYER

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: [Logo BuildNKnow] [Domain Tag: 💻 Software] Dự án: NestJS Realtime Order Backend   │
│         [Tiến độ: 45% (9/20 concepts)]  [📂 Đổi Dự Án] [📥 Import] [📤 Export JSON]         │
├──────────────────────────────────────────────────────────────┬──────────────────────────────┤
│ MAIN STAGE (Vùng học tập trung)                              │ SIDEBAR: NỘI DUNG DỰ ÁN      │
│ ┌──────────────────────────────────────────────────────────┐ │ (Accordion chuẩn Udemy)     │
│ │ ARTIFACT & CONTEXT VIEWER (Thay thế video của Udemy)     │ │                              │
│ │ - Trình xem Code Highlight (hoặc ComfyUI Node / Media)   │ │ 🔍 Tìm kiếm concept...       │
│ │ - Chỉ rõ vị trí: src/auth/jwt.guard.ts (dòng 15 - 42)    │ │                              │
│ └──────────────────────────────────────────────────────────┘ │ ▼ Module 1: Auth & JWT Guard │
│                                                              │   ├─ ☑️ 1. Token Lifecycle    │
│ TABS BÊN DƯỚI (Tabs Overview / Drill / Notes):               │   ├─ 🟡 2. Execution Context  │
│ [📖 Tổng quan & Bản chất]  [⚡ Tự vấn (Drill)]  [📝 Ghi chú] │   └─ ⚪ 3. RBAC Decorator     │
│                                                              │                              │
│ NỘI DUNG TAB HIỆN TẠI:                                       │ ▶ Module 2: WebSocket & SSE  │
│ • Why AI built this way: Tại sao AI chia 2 token?            │   (4 concepts - 0% done)     │
│ • Under the hood: Cơ chế xoay vòng token ngầm...             │                              │
│ • Common Pitfalls: Bẫy thu hồi token khi DB bị lộ...         │ ▶ Module 3: Redis & BullMQ   │
│                                                              │   (5 concepts - 20% done)    │
│ [⬅️ Bài trước]                     [Đánh giá: 🟢 Mastered] [Bài tiếp ➡️]                    │
└──────────────────────────────────────────────────────────────┴──────────────────────────────┘
```

---

## 2. TIẾN ĐỘ THỰC HIỆN TỔNG QUAN (PROGRESS TRACKER)

> **Tổng tiến độ Phase 1:** **23 / 23 Tasks hoàn thành (100%) - HOÀN TẤT TOÀN DIỆN**  
> • **Epic 1 (Scaffolding & UI Foundation):** 🟢 **4/4 (100%) - HOÀN THÀNH**  
> • **Epic 2 (Data Engine & Universal Schema):** 🟢 **4/4 (100%) - HOÀN THÀNH**  
> • **Epic 3 (Udemy Shell & Navigation):** 🟢 **2/2 (100%) - HOÀN THÀNH**  
> • **Epic 4 (Main Stage & Artifact Viewer):** 🟢 **3/3 (100%) - HOÀN THÀNH**  
> • **Epic 5 (Socratic Drill & Active Recall):** 🟢 **4/4 (100%) - HOÀN THÀNH**  
> • **Epic 6 (Curriculum Generator Prompt):** 🟢 **2/2 (100%) - HOÀN THÀNH**  
> • **Epic 7 (Dogfooding, Polish & Production):** 🟢 **4/4 (100%) - HOÀN THÀNH**

---

## 3. DANH SÁCH EPICS & TASKS CHI TIẾT

### 🚀 EPIC 1: Khởi tạo Project & Thiết lập Design System (Scaffolding & UI Foundation)
*Mục tiêu: Dựng bộ khung Next.js App Router hiện đại nhất, tích hợp Tailwind CSS và shadcn/ui, thiết lập bảng màu tối giản cao cấp.*

- [x] **Task 1.1:** Khởi tạo Next.js (App Router, TypeScript, ESLint).
  - *Artifacts:* `package.json`, `tsconfig.json`, `src/app/layout.tsx` (Next.js 16.3.6 + React 19).
- [x] **Task 1.2:** Cài đặt và cấu hình **Tailwind CSS** kèm biến thể theme (Dark mode Slate/Zinc chuẩn công nghệ).
  - *Artifacts:* `src/app/globals.css` (Tailwind v4 `@import "tailwindcss"`, bảng màu dark slate-950, custom scrollbar).
- [x] **Task 1.3:** Tích hợp bộ thư viện **shadcn/ui** (Button, Card, Tabs, Progress, Badge, Dialog, Textarea).
  - *Artifacts:* `src/lib/utils.ts`, `src/components/ui/button.tsx`, `card.tsx`, `badge.tsx`, `progress.tsx`, `tabs.tsx`, `textarea.tsx`, `dialog.tsx`.
- [x] **Task 1.4:** Cài đặt bộ icon **Lucide React** và cấu hình font chữ (Geist / Inter / Mono cho code).
  - *Artifacts:* Đã cài `lucide-react`, `clsx`, `tailwind-merge`, `canvas-confetti`. Build production thử nghiệm `npm run build` đạt 0 lỗi.

---

### 🧠 EPIC 2: Data Engine & Universal Schema Đa lĩnh vực (Local-First State)
*Mục tiêu: Xây dựng hệ thống kiểu dữ liệu TypeScript và Engine quản lý tiến độ học tập trên trình duyệt (LocalStorage).*

- [x] **Task 2.1:** Định nghĩa TypeScript types cho Universal Schema (`ProjectCurriculum`, `Module`, `Concept`, `SocraticDrill`, `MasteryLevel`).
  - *Artifacts:* `src/types/curriculum.ts` (mô hình đa lĩnh vực: Software, AI Art, Audio, Video, Workflow).
- [x] **Task 2.2:** Xây dựng State Store (React Context + Hooks) hỗ trợ:
  - *Artifacts:* `src/context/CurriculumContext.tsx` (tự động sync LocalStorage, tính toán % tiến độ, điều hướng next/prev, cập nhật mastery level).
- [x] **Task 2.3:** Tạo sẵn 2 bộ dữ liệu mẫu thực tế:
  - *Artifacts:*
    - `src/data/sample-nestjs-backend.ts`: Bóc tách dự án Backend NestJS (Auth JWT & Rotation, ExecutionContext, WebSocket & Redis Pub/Sub, BullMQ Idempotency).
    - `src/data/sample-comfyui-flux.ts`: Bóc tách dự án AI Art (Latent Space & VAE, Flow Matching trong Flux.1, LoRA Weights & Overfitting).
- [x] **Task 2.4:** Xây dựng tính năng Export dữ liệu ra file `.json` và Import file `.json` bất kỳ vào app.
  - *Artifacts:* Tích hợp trực tiếp trong `CurriculumContext.tsx` (`exportCurriculum`, `importCurriculum`).

---

### 📺 EPIC 3: Udemy-Style Course Player Shell & Navigation
*Mục tiêu: Tái hiện layout học tập chuẩn Udemy với Topbar tinh tế và Sidebar Accordion danh sách bài học có thể gập/mở.*

- [x] **Task 3.1: Topbar Điều hướng:**
  - *Artifacts:* `src/components/layout/Topbar.tsx`
  - Hiển thị Logo BuildNKnow, Domain Badge nhận diện lĩnh vực (`💻 Software`, `🎨 AI Art`, v.v.).
  - Thanh tiến độ tổng thể (% hoàn thành chuẩn Udemy).
  - Nút chuyển nhanh giữa các dự án mẫu (`ProjectSwitcherModal`) và nút `ImportModal` / `ExportModal`.
  - Nút đặt lại tiến độ dự án (Reset Progress).
- [x] **Task 3.2: Sidebar "Nội dung dự án" (Course Content Accordion):**
  - *Artifacts:* `src/components/layout/Sidebar.tsx`
  - Thanh tìm kiếm concept theo từ khóa thời gian thực.
  - Danh sách Module dạng Accordion gập/mở, hiển thị số concept và số bài đã làm chủ (`2/3`).
  - Item từng Concept có:
    - Icon trạng thái 3 cấp độ: Đã xong (🟢 Mastered), Đang học (🟡 Learning), Chưa xem (⚪ Unseen).
    - Tiêu đề concept và thời lượng ước tính (`8m drill`).
    - Nút thu gọn / mở rộng Sidebar để mở rộng không gian học.

---

### 🔬 EPIC 4: Main Stage - Trình chiếu Bối cảnh & Thành phẩm (Artifact Stage)
*Mục tiêu: Thay vì video bài giảng thụ động, Main Stage trình chiếu trực tiếp bằng chứng kỹ thuật của chính dự án.*

- [x] **Task 4.1: Component Trình xem Artifact (Artifact Context Viewer):**
  - *Artifacts:* `src/components/stage/ArtifactViewer.tsx`
  - Khung xem Code có Syntax Highlighting, số dòng kẻ rõ ràng, nút sao chép nhanh, badge ngôn ngữ và anchor vị trí trong file repo/node ComfyUI.
- [x] **Task 4.2: Tab "Tổng quan & Bản chất" (Overview & Under The Hood):**
  - *Artifacts:* `src/components/stage/OverviewTab.tsx`
  - Section **Why AI built this way**: Phân tích vì sao AI lại chọn kiến trúc/kỹ thuật này.
  - Section **Under the Hood**: Cơ chế ngầm bên dưới giải thích rõ ràng, súc tích.
  - Section **Gotchas & Common Pitfalls**: Các lỗi ngầm, bẫy bảo mật, nghẽn hiệu năng mà người dùng hay mắc phải.
- [x] **Task 4.3: Tab "Ghi chú cá nhân" (Personal Scratchpad):**
  - *Artifacts:* `src/components/stage/NotesTab.tsx`
  - Khung soạn thảo ghi chú tự động lưu (debounced auto-save) vào LocalStorage, đếm ký tự, kèm gợi ý ghi chép hiệu quả.
  - *Artifact Stage Shell:* `src/components/stage/MainStage.tsx` tích hợp Tabs và thanh Bottom Sticky Navigation chuyển bài nhanh bằng chuột hoặc phím tắt `←` / `→`.

---

### ⚡ EPIC 5: Socratic Drill & Động cơ Tự vấn (Active Recall Engine)
*Mục tiêu: Trọng tâm rèn luyện của BuildNKnow — biến người dùng từ người "xem code" thành người "thấu hiểu và giải thích được".*

- [x] **Task 5.1: Card Câu hỏi Phản biện (Socratic Drill Card):**
  - *Artifacts:* `src/components/stage/SocraticDrillTab.tsx`
  - Đặt câu hỏi phản biện sâu dựa trên chính thành phẩm code/pipeline AI.
  - Khung Textarea tự nhập câu trả lời / suy nghĩ của riêng bạn (Active Recall), tự động đồng bộ LocalStorage.
- [x] **Task 5.2: Khung lật mở "Điểm mấu chốt" (Reveal Key Takeaways):**
  - *Artifacts:* Nút bấm *"Xem gợi ý & Điểm cốt lõi"* lật mở danh sách checklist các ý cốt lõi (trong khung đen tương phản cao để khắc sâu ghi nhớ).
- [x] **Task 5.3: Bộ 3 nút Tự đánh giá mức độ thông suốt:**
  - *Artifacts:* 3 nút đánh giá trực quan (🔴 Cần xem lại, 🟡 Hiểu một phần, 🟢 Đã thông suốt).
  - Tích hợp hiệu ứng pháo hoa giấy **canvas-confetti** ăn mừng khi chinh phục thành công concept (`mastered`), tự động cập nhật thanh tiến độ % trên Topbar và Sidebar.
  - Thanh chúc mừng và nút tắt *"Sang bài tiếp theo ➡️"* kích hoạt tự động.
- [x] **Task 5.4: Nút Điều hướng nhanh:**
  - *Artifacts:* Thanh điều hướng dưới đáy (Sticky Bottom Bar) trong `MainStage.tsx` kèm bộ lắng nghe phím tắt toàn cục `ArrowLeft` / `ArrowRight` trong `src/app/page.tsx`.

---

### 🛠️ EPIC 6: Tool Sinh Giáo Án Tự Động (Curriculum Generator Prompt)
*Mục tiêu: Giúp bạn dễ dàng nạp bất kỳ dự án mới nào bạn vừa làm xong vào hệ thống chỉ sau 1 câu prompt.*

- [x] **Task 6.1:** Soạn thảo file Prompt chuẩn hóa `PROJECT_EXTRACTION_PROMPT.md`:
  - *Artifacts:* [docs/PROJECT_EXTRACTION_PROMPT.md](file:///c:/projects/lms/docs/PROJECT_EXTRACTION_PROMPT.md)
  - Hướng dẫn đưa vào cấu trúc thư mục, code hoặc node ComfyUI/thông số kỹ thuật; ép AI xuất ra đúng 100% chuẩn JSON của BuildNKnow.
- [x] **Task 6.2:** Giao diện Modal "Thêm dự án mới" tích hợp 2 tab:
  - *Artifacts:* `src/components/modals/ImportModal.tsx`
  - Tab 1: Dán JSON / tải file `.json` từ máy tính.
  - Tab 2: 1-click copy Prompt trích xuất AI đưa cho ChatGPT / Claude Code / Cursor.

---

### ✅ EPIC 7: Thử nghiệm Trực tiếp (Dogfooding & Polish)
*Mục tiêu: Chạy ứng dụng trên máy của bạn và cùng bạn học thử 1 module trọn vẹn.*

- [x] **Task 7.1:** Kiểm tra responsive, Light theme chuẩn Udemy + Dark code editor contrast, hiệu ứng chuyển tab mượt mà.
- [x] **Task 7.2:** Thử nghiệm học thực tế với Module **Auth & JWT** của dự án NestJS (Access/Refresh Token Rotation, Socratic Active Recall, Confetti khi Mastered).
- [x] **Task 7.3:** Thử nghiệm học thực tế với Module **Latent Space & LoRA** của dự án ComfyUI Flux.1.
- [x] **Task 7.4:** Dev server Next.js đang chạy sẵn sàng tại `http://localhost:3000` (đã test HTTP Status 200). Toàn bộ dữ liệu tự động lưu và đồng bộ cục bộ trong máy bạn qua `LocalStorage`.

---

## 3. KẾT QUẢ TRIỂN KHAI PHASE 1

🎉 **PHASE 1 ĐÃ HOÀN THÀNH 100% (23 / 23 TASKS)**  
Ứng dụng BuildNKnow đã sẵn sàng chạy thực tế để phục vụ chính bạn học lại và làm chủ mọi dự án bạn vừa vibe code thành công!
