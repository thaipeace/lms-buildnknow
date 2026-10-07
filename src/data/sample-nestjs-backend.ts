import { ProjectCurriculum } from "@/types/curriculum";

export const sampleNestjsBackend: ProjectCurriculum = {
  id: "proj-nestjs-trading-backend",
  name: "Trading & Realtime Order Management Backend",
  domain: "software",
  description:
    "Hệ thống backend xử lý khớp lệnh, xác thực JWT đa lớp, phân phối dữ liệu thị trường theo thời gian thực qua WebSocket và xếp hàng xử lý bất đồng bộ với BullMQ.",
  summary:
    "Hệ thống backend giao dịch chứng khoán/crypto phân tán chịu tải cao, giải quyết trọn vẹn bài toán xác thực đa lớp với JWT Refresh Token Rotation không gián đoạn, stream sổ lệnh (Orderbook) thời gian thực dưới 5ms qua WebSocket và xếp hàng khớp lệnh phi đồng bộ với BullMQ & Redis.",
  keyFeatures: [
    "Bảo mật xác thực đa tầng với JWT Refresh Token Rotation và cơ chế tự động hủy toàn bộ phiên khi phát hiện Token Reuse Attack",
    "Streaming sổ lệnh (Orderbook) và khớp lệnh Realtime độ trễ thấp qua WebSocket Gateway và Redis Pub/Sub",
    "Xử lý hàng đợi tác vụ tài chính bất đồng bộ (Async Queue) chống quá tải bằng BullMQ và Redis clustering",
    "Kiến trúc Clean Architecture kết hợp NestJS ExecutionContext và Guards phân quyền RBAC/ABAC chặt chẽ",
  ],
  version: "1.0.0",
  aiToolsUsed: ["Claude Code", "Cursor", "Antigravity"],
  modules: [
    {
      id: "mod-auth-security",
      title: "Module 1: Bảo mật, JWT & ExecutionContext",
      artifactScope: "src/auth/* & src/common/guards/*",
      concepts: [
        {
          id: "concept-jwt-rotation",
          title: "Vòng đời Access Token & Cơ chế Refresh Token Rotation",
          estimatedMinutes: 10,
          description:
            "Hệ thống sàn giao dịch cần duy trì phiên đăng nhập bảo mật cao mà không bắt người dùng nhập mật khẩu liên tục mỗi 15 phút, đồng thời phải phòng chống triệt để tấn công đánh cắp token (Token Theft / Sniffing).",
          problemStatement:
            "Nếu Access Token có thời hạn quá dài (7 ngày), kẻ gian đánh cắp được token sẽ toàn quyền truy cập tài khoản suốt tuần mà server không cách nào thu hồi vì tính chất stateless của JWT. Ngược lại, nếu Access Token quá ngắn, người dùng sẽ liên tục bị văng đăng nhập gây ức chế.",
          currentApproach:
            "Hệ thống chia làm 2 token: Access Token sống ngắn (15 phút) lưu trong bộ nhớ client, và Refresh Token sống dài (7 ngày) được mã hóa bcrypt lưu trong DB. Mỗi lần client gửi Refresh Token để xin Access Token mới, server lập tức hủy token cũ và cấp Refresh Token mới (Rotation). Nếu phát hiện token cũ bị gửi lại lần 2, hệ thống nhận diện Token Reuse Attack và xóa sạch mọi phiên đăng nhập của người dùng đó.",
          artifactAnchor: "src/auth/auth.service.ts:L45-88",
          artifactSnippet: {
            language: "typescript",
            content: `// src/auth/auth.service.ts
async refreshToken(userId: string, refreshToken: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.hashedRefreshToken) throw new UnauthorizedException('Access Denied');

  const isMatched = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
  if (!isMatched) {
    // PHÁT HIỆN GIAN LẬN: Thu hồi toàn bộ token của user ngay lập tức!
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });
    throw new ForbiddenException('Token Reuse Detected - All Sessions Revoked');
  }

  const tokens = await this.generateTokens(user.id, user.email, user.role);
  await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
  return tokens;
}`,
          },
          whyUsed:
            "AI chia nhỏ thành Access Token (sống ngắn 15 phút) và Refresh Token (sống 7 ngày, lưu mã hóa băm trong DB) để vừa bảo vệ hệ thống khi token bị bắt gói tin (sniffing), vừa đảm bảo trải nghiệm người dùng không bị văng đăng nhập liên tục.",
          underTheHood:
            "Mỗi lần Refresh Token được sử dụng, server không chỉ cấp Access Token mới mà còn hủy Refresh Token cũ và cấp một Refresh Token hoàn toàn mới (Rotation). Nếu một Refresh Token cũ bị kẻ gian dùng lại, hệ thống nhận diện hành vi Token Reuse Attack và vô hiệu hóa lập tức toàn bộ phiên đăng nhập của người dùng đó.",
          pitfalls:
            "Lỗi phổ biến nhất của code do AI sinh ra là: lưu thẳng Refresh Token dạng plain text trong DB hoặc không xóa token cũ khi rotate. Nếu DB bị lộ (read leak), hacker sẽ có quyền truy cập vĩnh viễn.",
          socraticDrills: [
            {
              id: "drill-jwt-1",
              question:
                "Giả sử hacker đánh cắp được Refresh Token cũ của người dùng và gửi request lên /auth/refresh sau khi người dùng hợp pháp đã refresh rồi. Hãy giải thích cơ chế phòng vệ nào trong code ngăn chặn điều này?",
              keyTakeaways: [
                "Server kiểm tra bcrypt hash của refresh token nhận được với hashedRefreshToken hiện tại trong DB.",
                "Vì người dùng hợp pháp đã rotate, hash trong DB đã đổi sang token mới.",
                "Khi bcrypt so sánh thất bại, hàm kích hoạt cờ 'Token Reuse Detected' và xóa sạch hashedRefreshToken về null, buộc cả hacker lẫn người dùng phải đăng nhập lại từ đầu.",
              ],
            },
            {
              id: "drill-jwt-2",
              question:
                "Tại sao không lưu Access Token vào Redis để kiểm tra thu hồi (blacklist) ở mọi request thay vì chỉ để token tự hết hạn?",
              keyTakeaways: [
                "Lợi thế lớn nhất của JWT là stateless (không cần query DB/Redis ở mỗi request, giải phóng I/O cho server).",
                "Nếu mỗi request HTTP đều tra cứu Redis để check blacklist, JWT đã bị biến tướng thành Statefull Session, làm mất đi khả năng scale ngang không biên giới của API.",
              ],
            },
          ],
          masteryLevel: "unseen",
        },
        {
          id: "concept-execution-context",
          title: "Sức mạnh của ExecutionContext trong Guard & Decorator",
          estimatedMinutes: 8,
          description:
            "Hệ thống backend vận hành đồng thời REST API và WebSocket Gateway để nhận lệnh giao dịch, yêu cầu tầng xác thực quyền hạn (RBAC) phải đồng nhất mà không bị trùng lặp mã nguồn.",
          problemStatement:
            "Mỗi giao thức vận hành trên cấu trúc dữ liệu khác nhau: HTTP Request có headers, session, params; trong khi WebSocket Gateway lại nhận Socket client và payload message. Nếu viết Guard riêng cho từng giao thức, code sẽ phân mảnh, khó bảo trì và dễ bỏ sót lỗ hổng bảo mật.",
          currentApproach:
            "Code sử dụng `ExecutionContext` của NestJS làm lớp trừu tượng hóa đa giao thức. Guard dùng `reflector.getAllAndOverride` để lấy metadata quyền hạn, sau đó trích xuất thông tin user thông qua `context.switchToHttp()` hoặc `context.switchToWs()`, cho phép 1 Guard duy nhất bảo vệ an toàn cho cả endpoint REST lẫn sự kiện WebSocket.",
          artifactAnchor: "src/common/guards/roles.guard.ts:L12-38",
          artifactSnippet: {
            language: "typescript",
            content: `// src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    // ExecutionContext trừu tượng hóa cho cả HTTP lẫn WebSocket!
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}`,
          },
          whyUsed:
            "Trong một backend vừa có REST API vừa có WebSocket và Microservices, NestJS sử dụng `ExecutionContext` làm lớp vỏ bọc trừu tượng (abstraction) giúp bạn viết 1 Guard duy nhất nhưng tái sử dụng được trên cả request HTTP thông thường lẫn sự kiện WebSocket Gateway.",
          underTheHood:
            "`ExecutionContext` kế thừa từ `ArgumentsHost`. Nó nắm giữ thông tin ngữ cảnh thực thi: đang chạy controller nào (`getClass()`), method nào (`getHandler()`), loại transport là gì (`context.getType()` -> 'http' | 'ws' | 'rpc'). Hàm `switchToHttp()` hoặc `switchToWs()` trả về các đối tượng tương thích với giao thức tương ứng.",
          pitfalls:
            "Nếu bạn ép kiểu thô bạo `context.switchToHttp().getRequest()` bên trong một Guard dùng cho WebSocket Gateway, code sẽ văng lỗi runtime crash vì WebSocket không có req/res của Express/Fastify.",
          socraticDrills: [
            {
              id: "drill-ec-1",
              question:
                "Nếu bạn muốn áp dụng RolesGuard này cho sự kiện WebSocket @SubscribeMessage('place_order'), bạn phải sửa đổi phương thức trích xuất user như thế nào?",
              keyTakeaways: [
                "Kiểm tra context.getType() === 'ws'.",
                "Dùng context.switchToWs().getClient<Socket>() để lấy socket client.",
                "Trích xuất user từ socket.data.user (được gắn vào lúc bắt tay handshake xác thực).",
              ],
            },
          ],
          masteryLevel: "unseen",
        },
      ],
    },
    {
      id: "mod-realtime-scale",
      title: "Module 2: Realtime WebSocket & Redis Adapter",
      artifactScope: "src/events/* & src/market/market.gateway.ts",
      concepts: [
        {
          id: "concept-redis-adapter",
          title: "Socket.IO Clustering với Redis Streams / PubSub Adapter",
          estimatedMinutes: 12,
          description:
            "Hệ thống phân phối bảng giá khớp lệnh theo thời gian thực tới hàng chục nghìn client thông qua cụm nhiều server WebSocket đặt sau Load Balancer.",
          problemStatement:
            "Khi mở rộng hệ thống lên nhiều container (cluster/k8s), client A kết nối vào Server 1 còn client B kết nối vào Server 2. Nếu một sự kiện khớp lệnh xảy ra tại Server 1, Server 1 chỉ phát tin cho client trong RAM của chính nó, khiến client B ở Server 2 hoàn toàn không nhận được cập nhật giá thị trường.",
          currentApproach:
            "Code triển khai `RedisIoAdapter` kế thừa từ `IoAdapter` của Socket.IO, kết nối vào Redis Pub/Sub bằng 2 client (PubClient & SubClient). Khi Server 1 gọi `server.to('room_btc').emit()`, message được publish lên kênh Redis chung; Redis Adapter trên tất cả các server khác sẽ bắt sự kiện và đồng loạt phát tán tới toàn bộ WebSocket client cục bộ của từng server.",
          artifactAnchor: "src/market/market.gateway.ts:L20-65",
          artifactSnippet: {
            language: "typescript",
            content: `// src/events/redis-io.adapter.ts
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}`,
          },
          whyUsed:
            "Khi triển khai trên production có 3 container NestJS chạy song song sau Load Balancer, nếu User A kết nối tới Server 1 và User B kết nối tới Server 2, Server 1 sẽ không thể gửi thông báo tới User B nếu không có Redis Adapter làm cầu nối phát tán (broadcast) xuyên server.",
          underTheHood:
            "Mỗi container NestJS lắng nghe một kênh Redis Pub/Sub chuyên dụng. Khi server 1 gọi `server.to('room_btc').emit('price_update', data)`, Redis Adapter đóng gói message và publish lên Redis; tất cả các container NestJS khác nhận được message và chuyển tiếp tới các socket client cục bộ của riêng chúng.",
          pitfalls:
            "Redis Pub/Sub là cơ chế 'Fire-and-forget' (gửi xong không lưu lại). Nếu một client bị rớt mạng trong 2 giây rồi kết nối lại, client đó sẽ vĩnh viễn mất các sự kiện diễn ra trong 2 giây đó trừ khi bạn kết hợp kỹ thuật Catch-up hoặc Redis Streams.",
          socraticDrills: [
            {
              id: "drill-redis-ws-1",
              question:
                "Sự khác biệt cốt lõi giữa Redis Pub/Sub và Redis Stream trong bài toán phát tin thị trường chứng khoán/crypto là gì?",
              keyTakeaways: [
                "Pub/Sub không lưu lịch sử tin nhắn; subscriber offline là mất tin.",
                "Redis Stream lưu trữ dữ liệu dạng append-only log có ID thời gian, hỗ trợ consumer groups và cho phép client đọc lại (replay) các tin đã bỏ lỡ từ timestamp cụ thể.",
              ],
            },
          ],
          masteryLevel: "unseen",
        },
      ],
    },
    {
      id: "mod-async-queues",
      title: "Module 3: Hàng đợi Bất đồng bộ & Xử lý Giao dịch với BullMQ",
      artifactScope: "src/orders/order.processor.ts & src/orders/orders.service.ts",
      concepts: [
        {
          id: "concept-bullmq-idempotency",
          title: "Tính Bất biến (Idempotency) & Retry Backoff trong Khớp Lệnh",
          estimatedMinutes: 15,
          description:
            "Hệ thống xử lý trừ tiền và khớp lệnh giao dịch tài chính thông qua hàng đợi tác vụ bất đồng bộ BullMQ.",
          problemStatement:
            "Trong môi trường mạng phân tán, hàng đợi chỉ đảm bảo cơ chế 'At-least-once delivery'. Khi worker bị crash hoặc mạng chập chờn lúc gửi ACK, BullMQ sẽ tự động retry job. Nếu không có cơ chế phòng vệ, lệnh trừ tiền $1000 có thể bị thực thi 2 lần (Double Spending), gây thất thoát tài sản không thể hoàn tác.",
          currentApproach:
            "Code áp dụng mẫu thiết kế Idempotent Consumer: trước khi thực hiện logic trừ tiền, worker tra cứu trong Database xem `orderId` đã tồn tại transaction chưa. Nếu đã có, job lập tức bỏ qua và trả về kết quả cũ. Toàn bộ quá trình thay đổi số dư và lưu giao dịch được bọc trong một Database Transaction duy nhất (`prisma.$transaction`).",
          artifactAnchor: "src/orders/order.processor.ts:L30-75",
          artifactSnippet: {
            language: "typescript",
            content: `// src/orders/order.processor.ts
@Processor('order-matching')
export class OrderProcessor extends WorkerHost {
  async process(job: Job<{ orderId: string; amount: number }>): Promise<any> {
    const { orderId } = job.data;
    
    // Đảm bảo Idempotency: Kiểm tra xem lệnh này đã được xử lý chưa
    const existingTx = await this.prisma.transaction.findUnique({
      where: { orderId },
    });
    if (existingTx) {
      this.logger.warn(\`Duplicate job detected for order \${orderId}, skipping.\`);
      return existingTx;
    }

    return await this.prisma.$transaction(async (tx) => {
      // Khớp lệnh an toàn với database transaction...
    });
  }
}`,
          },
          whyUsed:
            "Trong mạng lưới phân tán, job queue có thể bị retry khi mạng chập chờn hoặc worker bị restart. Nếu không thiết kế tính Bất biến (Idempotency), một lệnh trừ tiền $1000 có thể bị thực thi 2 lần (Double Spending) gây thất thoát nghiêm trọng.",
          underTheHood:
            "BullMQ đảm bảo 'At-least-once delivery' (tin nhắn được gửi đi ít nhất 1 lần). Do đó trách nhiệm xử lý không trùng lặp thuộc về code của bạn. Bạn phải dùng Unique Key (như `orderId`) kết hợp Database Unique Constraint hoặc Distributed Lock trước khi commit giao dịch.",
          pitfalls:
            "Nhiều dev ỷ lại vào BullMQ và nghĩ rằng hàng đợi sẽ tự động đảm bảo chỉ chạy đúng 1 lần duy nhất (Exactly-once). Trên thực tế 'Exactly-once execution' trong hệ phân tán là điều bất khả thi ở tầng network nếu không có Idempotent Consumer.",
          socraticDrills: [
            {
              id: "drill-bullmq-1",
              question:
                "Tại sao trong hệ thống tài chính, BullMQ Job ID nên được gán bằng chính Order ID từ ban đầu thay vì để BullMQ tự sinh UUID ngẫu nhiên?",
              keyTakeaways: [
                "BullMQ không cho phép 2 job có cùng Job ID tồn tại đồng thời trong queue.",
                "Bằng cách đặt Job ID = Order ID, nếu người dùng click nút 'Đặt lệnh' 2 lần liên tiếp do mạng lag, BullMQ sẽ từ chối job thứ 2 ngay tại cửa ngõ trước khi worker kịp xử lý.",
              ],
            },
          ],
          masteryLevel: "unseen",
        },
      ],
    },
  ],
};
