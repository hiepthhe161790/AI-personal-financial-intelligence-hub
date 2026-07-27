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
- Thay thế [favicon.ico](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/favicon.ico) mặc định và thêm [icon.png](file:///d:/sontayweb/AI-personal-financial-intelligence-hub/src/app/icon.png) bằng logo thiết kế riêng để hiển thị biểu tượng tab trình duyệt chuyên nghiệp.
