# AI Changelog

Nhật ký ghi lại toàn bộ thay đổi do AI (Antigravity) thực hiện trên dự án này.

## [2026-07-27]
### Added
- Khởi tạo file `CHANGELOG_AI.md` để theo dõi các chỉnh sửa tiếp theo.
- Cấu hình file `AGENTS.md` yêu cầu AI ghi nhận log mỗi lần thay đổi mã nguồn.

## [2026-07-28]
### Added
- Thêm file cấu hình PWA: [manifest.json](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/public/manifest.json), Service Worker [sw.js](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/public/sw.js) và component đăng ký [PWARegister.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/components/PWARegister.tsx).
- Thêm provider quản lý giao diện [ThemeProvider.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/components/ThemeProvider.tsx).
- Thêm Mongoose Model [UserSetting.ts](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/models/UserSetting.ts) và API Route [settings/route.ts](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/api/v1/user/settings/route.ts) để lưu trữ key API Gemini cá nhân dạng mã hóa AES-256.

### Modified
- Cập nhật [layout.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/layout.tsx) tích hợp PWA và ThemeProvider.
- Cập nhật [page.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/page.tsx) lưu trữ trạng thái Stealth Mode vào `localStorage`.
- Cập nhật [UserAuthHeader.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/components/UserAuthHeader.tsx) bổ sung nút đổi giao diện Sáng/Tối và Modal cài đặt Gemini API Key cá nhân.
- Cập nhật [ai.ts](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/lib/ai.ts) và route [brief/route.ts](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/api/v1/research/brief/route.ts) để giải mã và ưu tiên sử dụng API Key cá nhân của người dùng khi chạy phân tích AI.
- Cập nhật [main.py](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/services/analytics/main.py) hỗ trợ đọc cổng mạng động qua biến môi trường `PORT` để tương thích khi deploy lên các dịch vụ Cloud.
- Cấu hình và cập nhật đầy đủ biến môi trường trong [.env](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/.env) và [.env.example](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/.env.example), tích hợp URL Render chạy Production cho Python Service.
- Thay thế [favicon.ico](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/favicon.ico) bằng file vector [icon.svg](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/icon.svg) được tái tạo chuẩn theo logo gốc (BrainCircuit trên nền gradient xanh) để hiển thị chuyên nghiệp và đồng bộ.
- Sửa lỗi vi phạm Rules of Hooks (gọi conditional return trước hook useMemo) trong file [PortfolioRebalanceModal.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/components/PortfolioRebalanceModal.tsx), giúp sửa lỗi ứng dụng bị crash khi người dùng nhấp vào nút "Tái Cân Đối Danh Mục".
- Cấu hình Key Google Client ID và Secret thực tế vào file [.env](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/.env) phục vụ tính năng đăng nhập Google OAuth.
- Tối ưu hóa các container chính và thanh Tab ở trang [page.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/page.tsx) để hỗ trợ đầy đủ và hiển thị sắc nét khi chuyển đổi giữa chế độ sáng (Light Mode) và tối (Dark Mode).
- Thiết lập hệ thống đảo ngược màu sắc ngữ nghĩa (Semantic Color Inversion) tại [globals.css](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/globals.css) để toàn bộ 100% các modal, card, biểu đồ và button tự động thích ứng chế độ sáng/tối đồng bộ mà không cần sửa mã nguồn React của từng component.
- Hoàn thành Sprint 17: Tạo Mongoose model [Transaction.ts](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/models/Transaction.ts), các API routes [transactions/route.ts](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/api/v1/transactions/route.ts) và [[id]/route.ts](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/api/v1/transactions/[id]/route.ts), xây dựng UI [CashFlowLedger.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/components/CashFlowLedger.tsx) (Sổ Thu Chi) và [DebtStrategyPlanner.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/components/DebtStrategyPlanner.tsx) (Công cụ so sánh trả nợ Snowball vs Avalanche).
- Hoàn thành Sprint 18: Nâng cấp [ai.ts](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/lib/ai.ts) và API route [brief/route.ts](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/api/v1/research/brief/route.ts) để truy vấn & truyền 50 giao dịch chi tiêu vào Evidence Pack; tinh chỉnh prompt của Gemini phân tích chi phí vặt để đề xuất ngân sách tiết kiệm, chạy giả lập lãi kép tự động trong 5/10 năm và lập biểu đồ gợi ý cơ cấu danh mục đầu tư; cập nhật UI [AIResearchBrief.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/components/AIResearchBrief.tsx) hiển thị các thông tin này trực quan.
- Hoàn thành Sprint 19: Mở rộng [Account.ts](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/models/Account.ts) hỗ trợ `ticker` & `quantity`; nâng cấp Crawler Python [main.py](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/services/analytics/main.py) cào giá vàng SJC XML; xây dựng API route [sync/route.ts](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/api/v1/market/sync/route.ts) để tự động hóa tính toán định giá vàng & cổ phiếu; nâng cấp UI nhập liệu [AddAccountModal.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/components/AddAccountModal.tsx) và bổ sung nút "Đồng Bộ Giá 🔄" trên dashboard chính [page.tsx](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/page.tsx).
