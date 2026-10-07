import { ProjectCurriculum } from "@/types/curriculum";

export const sampleComfyuiFlux: ProjectCurriculum = {
  id: "proj-comfyui-flux-character",
  name: "Consistent Character Design Pipeline với Flux.1 & ComfyUI",
  domain: "image",
  description:
    "Quy trình dựng nhân vật 3D/Anime nhất quán trên 10 góc cảnh khác nhau sử dụng mô hình Flux.1-Dev, kết hợp LoRA fine-tuning, ControlNet OpenPose và kỹ thuật tinh chỉnh Latent Denoising.",
  summary:
    "Pipeline tạo hình nhân vật AI chuyên nghiệp đảm bảo tính nhất quán diện mạo (Face/Body/Outfit) trên đa dạng góc máy và bối cảnh ánh sáng phức tạp, kết hợp sức mạnh kiến trúc Rectified Flow của Flux.1-Dev cùng ControlNet và LoRA.",
  keyFeatures: [
    "Tối ưu hóa không gian tiềm ẩn (Latent Space) và giải mã VAE 16-channel của Flux.1 giúp tiết kiệm VRAM tối đa",
    "Huấn luyện và ghép nối LoRA cục bộ để giữ chuẩn nhận diện khuôn mặt và phong cách nghệ thuật qua nhiều lượt sinh ảnh",
    "Khống chế dáng điệu và góc camera chính xác bằng ControlNet OpenPose và Canny Edge",
    "Kỹ thuật lấy mẫu nâng cao (Euler KSampler, CFG Guidance, Denoise Step Scheduling) loại bỏ biến dạng chi tiết tay/mắt",
  ],
  version: "1.0.0",
  aiToolsUsed: ["ComfyUI", "Flux.1-Dev", "Kohya_ss", "Photoshop AI"],
  modules: [
    {
      id: "mod-latent-diffusion",
      title: "Module 1: Kiến trúc Latent Diffusion & VAE trong Flux.1",
      artifactScope: "ComfyUI Workflow Nodes: Load Checkpoint, VAE Decode, Empty Latent Image",
      concepts: [
        {
          id: "concept-latent-space",
          title: "Bản chất Không gian Tiềm ẩn (Latent Space) & Bộ giải mã VAE",
          estimatedMinutes: 10,
          description:
            "Quy trình sinh ảnh nhân vật chất lượng cao 1024x1024 với mô hình Flux.1 trong ComfyUI.",
          problemStatement:
            "Một bức ảnh 1024x1024 RGB chứa hơn 3 triệu điểm ảnh số thực. Khử nhiễu trực tiếp trên từng pixel RGB đòi hỏi hàng trăm GB VRAM và mất nhiều phút cho mỗi bức ảnh, khiến việc lặp lại prompt trong thực tế là bất khả thi trên máy tính cá nhân.",
          currentApproach:
            "Pipeline sử dụng node `EmptyLatentImage` để khởi tạo ma trận nhiễu trong 'Không gian Tiềm ẩn' (Latent Space) với tỷ lệ nén 8x (kích thước nén chỉ còn 128x128x16 channels). Quá trình khuếch tán chỉ diễn ra trên không gian toán học siêu nhẹ này; đến bước cuối cùng, node `VAEDecode` dùng bộ giải mã `ae.safetensors` để chuyển đổi các vector tiềm ẩn trở lại thành điểm ảnh màu RGB 1024x1024.",
          artifactAnchor: "ComfyUI Node #8: VAEDecode & Node #5: EmptyLatentImage (1024x1024)",
          artifactSnippet: {
            language: "parameters",
            content: `// ComfyUI Node Setup:
Node 5: EmptyLatentImage
  - Width: 1024 px
  - Height: 1024 px
  - Batch Size: 1
  - Latent Dimensions: 128 x 128 x 16 (Tỷ lệ nén x8 / 16 channels của Flux)

Node 8: VAEDecode
  - Input: samples (từ KSampler)
  - VAE: ae.safetensors (Flux VAE 16-channel)
  - Output: IMAGE (RGB 1024x1024x3)`,
          },
          whyUsed:
            "Xử lý khử nhiễu trực tiếp trên ma trận điểm ảnh RGB (1024x1024 = 3 triệu số thực) đòi hỏi hàng trăm GB VRAM và siêu chậm. VAE (Variational Autoencoder) nén ảnh thành một biểu diễn toán học nhỏ hơn gấp 8 lần gọi là 'Không gian Tiềm ẩn' (Latent Space) để GPU tính toán siêu tốc.",
          underTheHood:
            "Quá trình sinh ảnh thực chất KHÔNG diễn ra trên các pixel màu. Mô hình Flux chỉ khử nhiễu các vector xác suất trong Latent Space. Đến bước cuối cùng, `VAEDecode` mới 'dịch ngược' ma trận latent thành các pixel màu mắt người nhìn thấy được.",
          pitfalls:
            "Nếu bạn dùng nhầm VAE (ví dụ dùng VAE của Stable Diffusion 1.5/SDXL cho Flux), ảnh sinh ra sẽ bị sai lệch toàn bộ màu sắc, xuất hiện màn sương tím tái (color cast) hoặc hình ảnh bị mờ hạt nghiêm trọng.",
          socraticDrills: [
            {
              id: "drill-latent-1",
              question:
                "Tại sao kích thước ảnh trong Empty Latent Image luôn phải chia hết cho 16 hoặc 8? Điều gì sẽ xảy ra nếu bạn nhập kích thước lẻ như 1005 x 753?",
              keyTakeaways: [
                "Bộ nén VAE hoạt động theo các khối khối giảm mẫu (downsampling factor) theo bội số của 8 hoặc 16.",
                "Nếu kích thước không chia hết, phép chia ma trận latent sẽ bị lẻ thập phân, gây lỗi tính toán tensor hoặc tạo ra các đường vạch xanh/đen (seam artifacts) ở mép ảnh.",
              ],
            },
          ],
          masteryLevel: "unseen",
        },
        {
          id: "concept-flow-matching",
          title: "Cơ chế Flow Matching trong Flux.1 vs Diffusion truyền thống",
          estimatedMinutes: 8,
          description:
            "Cấu hình thuật toán lấy mẫu (sampling) trong ComfyUI để biến đổi nhiễu ngẫu nhiên thành nhân vật chi tiết với số bước tối ưu.",
          problemStatement:
            "Các mô hình Diffusion truyền thống (như Stable Diffusion 1.5/SDXL) sử dụng phương trình vi phân ngẫu nhiên (SDE) với quỹ đạo khử nhiễu cong hình học phức tạp, đòi hỏi 50-100 bước để ảnh sắc nét và thường xuyên gặp lỗi méo mó ở các chi tiết giải phẫu ngón tay hoặc ánh mắt.",
          currentApproach:
            "Pipeline cấu hình node `ModelSamplingFlux` áp dụng thuật toán Flow Matching với quỹ đạo đường thẳng (straight paths) và sampler Euler. Vector vận tốc đưa nhiễu thẳng đến ảnh đích chỉ trong 20-28 bước, kết hợp Guidance CFG 3.5 giúp nhân vật bám sát prompt mà không bị biến dạng hay cháy sáng tương phản.",
          artifactAnchor: "ComfyUI Node #3: ModelSamplingFlux & KSampler (euler, simple)",
          artifactSnippet: {
            language: "parameters",
            content: `// Flux Flow Matching Parameters:
Model: flux1-dev.safetensors
Sampler: euler
Scheduler: simple (Flow Matching Straight Paths)
Steps: 28
Guidance (Distilled CFG): 3.5
Max Shift: 1.15
Base Shift: 0.5`,
          },
          whyUsed:
            "Flux.1 không sử dụng cơ chế khuếch tán ngẫu nhiên (DDPM/Score-based Diffusion) của Stable Diffusion cũ, mà áp dụng công nghệ mới nhất: Flow Matching. Giúp vector nhiễu di chuyển theo đường thẳng (straight paths) đến ảnh mục tiêu chỉ sau 20-30 bước thay vì quỹ đạo cong phức tạp.",
          underTheHood:
            "Flow Matching huấn luyện mạng nơ-ron học trường vector vận tốc (velocity vector field). Nhờ đường đi thẳng từ nhiễu thuần túy đến ảnh hoàn chỉnh, chất lượng chi tiết ngón tay, cấu trúc giải phẫu và độ bám sát prompt vượt trội hơn hẳn các thế hệ trước.",
          pitfalls:
            "Đặt Guidance quá cao (trên 5.0) trên Flux-Dev sẽ khiến ảnh bị 'cháy tương phản' (oversaturated), da nhân vật bóng như tượng sáp hoặc xuất hiện viền gắt quanh tóc.",
          socraticDrills: [
            {
              id: "drill-flux-1",
              question:
                "Tại sao với Flux-Schnell ta chỉ cần 4 bước (steps=4) nhưng với Flux-Dev lại cần 20-28 bước để đạt chi tiết tối đa?",
              keyTakeaways: [
                "Flux-Schnell là bản chưng cất bước (step-distilled model), đã được huấn luyện ép quỹ đạo vector rút gọn chỉ trong 4 bước cho tác vụ nhanh.",
                "Flux-Dev giữ nguyên đầy đủ quỹ đạo flow matching để cho phép người dùng can thiệp tinh chỉnh chi tiết sâu bằng CFG Guidance và LoRA.",
              ],
            },
          ],
          masteryLevel: "unseen",
        },
      ],
    },
    {
      id: "mod-character-consistency",
      title: "Module 2: Đảm bảo Nhất quán Nhân vật bằng LoRA & Denoise",
      artifactScope: "ComfyUI Node #15: LoraLoaderModelOnly & Node #22: KSampler Inpaint",
      concepts: [
        {
          id: "concept-lora-weights",
          title: "Trọng số LoRA (Strength) & Bẫy Overfitting khi đổi góc chụp",
          estimatedMinutes: 12,
          description:
            "Sử dụng LoRA để khóa nhận diện khuôn mặt nhân vật cụ thể trên nhiều góc chụp (chân dung cận cảnh vs toàn thân).",
          problemStatement:
            "Nếu giữ nguyên Model Strength của LoRA ở mức cao (>= 1.0) khi đổi từ chụp chân dung sang chụp toàn thân hoặc góc máy nghiêng, đặc trưng khuôn mặt trong LoRA sẽ ép toàn bộ khung hình biến dạng, sinh ra da mặt bóng như sáp, mắt lác hoặc các vệt nhiễu artifact từ tập train.",
          currentApproach:
            "Pipeline cấu hình node `LoraLoaderModelOnly` với `model_strength: 0.85` và `clip_strength: 1.0` để cân bằng giữa độ nhận diện nhân vật và khả năng tiếp thu góc chụp mới từ prompt. Đồng thời kết hợp node Inpaint với Denoise 0.65 để chỉ tinh chỉnh khuôn mặt mà không làm ảnh hưởng bối cảnh xung quanh.",
          artifactAnchor: "ComfyUI Node #15: LoraLoader (model_strength: 0.85, clip_strength: 1.0)",
          artifactSnippet: {
            language: "parameters",
            content: `// Node #15: LoraLoaderModelOnly
LoRA Name: my_character_v2.safetensors
Model Strength: 0.85
Clip Strength: 1.0

// Node #22: Inpainting Mask
Denoise Strength: 0.65
Mask Blur: 8px`,
          },
          whyUsed:
            "LoRA (Low-Rank Adaptation) đóng băng toàn bộ mô hình gốc 12 tỷ tham số của Flux và chỉ chèn thêm các ma trận tích có hạng thấp (rank 16/32) chứa thông tin khuôn mặt nhân vật, cho phép tái hiện khuôn mặt người cụ thể với dung lượng file chỉ 50MB-200MB.",
          underTheHood:
            "`Model Strength` quyết định mức độ can thiệp vào các lớp trọng số biến đổi (Cross-Attention layers). Nếu đặt Model Strength = 1.0 hoặc cao hơn, các đặc trưng khuôn mặt sẽ bị 'áp bức' (overbaked), làm mất khả năng đổi biểu cảm cười/buồn hoặc không thể thay đổi góc chụp nghiêng/từ dưới lên.",
          pitfalls:
            "Nhiều người nghĩ LoRA không giống là do weight quá thấp nên tăng vọt lên 1.3. Hậu quả là mắt bị lác, da bị sần hạt nhiễu (noise artifacts) và phông nền bị ám hình ảnh trong tập huấn luyện.",
          socraticDrills: [
            {
              id: "drill-lora-1",
              question:
                "Khi bạn đổi prompt từ 'chụp cận cảnh chân dung' sang 'nhân vật đang chạy dưới trời mưa góc toàn thân', tại sao bạn nên giảm Model Strength của LoRA từ 0.9 xuống 0.75?",
              keyTakeaways: [
                "LoRA nhân vật thường được train chủ yếu bằng ảnh cận cảnh khuôn mặt (close-up portraits).",
                "Ở góc chụp toàn thân (wide shot), vùng khuôn mặt chiếm tỷ lệ pixel rất nhỏ; nếu để strength quá cao, LoRA sẽ ép toàn bộ khung cảnh xung quanh biến dạng theo các đặc trưng chân dung của nó.",
              ],
            },
          ],
          masteryLevel: "unseen",
        },
      ],
    },
  ],
};
