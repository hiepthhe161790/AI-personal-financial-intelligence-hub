# Project Context & State Handbook — AI Personal Financial Intelligence Hub

> **Dành cho AI Agent & Developer:** File này lưu trữ trạng thái thực tế của dự án sau mỗi Sprint. Hãy luôn đọc file này trước khi tiếp tục viết code để nắm rõ ngữ cảnh và lộ trình.

---

## 📌 1. Thông Tin Tổng Quan Dự Án

* **Tên dự án:** AI Personal Financial Intelligence Hub
* **Triết lý:** Quản lý Tài sản ròng (Net Worth), Mô phỏng kịch bản tự do tài chính, Tóm tắt tin tức & đánh giá rủi ro bằng AI. Không tư vấn đầu tư mua/bán.
* **Kiến trúc:** **Hybrid Architecture**
  * **Core App (Next.js App Router Fullstack - ~80% code):** Auth, Dashboard UI, CRUD Tài sản, Tính toán Net Worth, Engine mô phỏng kịch bản, AI Research Brief, Gateway API.
  * **Sidecar Service (Python FastAPI - ~20% code):** Cào dữ liệu tỷ giá VCB XML, RSS CafeF/VnExpress, giá vàng SJC, chứng khoán VN.
* **Quy tắc An toàn Dữ liệu:**
  * **Tiền tệ:** Lưu dưới dạng `amountMinor` (số nguyên) + mã `currency` ISO-4217. Tuyệt đối không dùng số thực (floating point).
  * **Định giá:** Lịch sử định giá dạng Append-only (không sửa/xóa trực tiếp bản ghi cũ).
  * **AI:** Server-side LLM call duy nhất, ép JSON bằng Zod Schema + Bắt buộc trích dẫn `citationIds`.

---

## 🚦 2. Trạng Thái Tiến Độ Sprint

| Sprint | Nội dung | Trạng thái | Ghi chú nghiệm thu |
|---|---|---|---|
| **Sprint 1** | Foundation & Base Setup (M0) | 🟢 **HOÀN THÀNH 100%** | Built success! Health API `/api/v1/health` & UI Landing chạy mượt. |
| **Sprint 2** | Quản lý Tài sản Cá nhân & Net Worth (M1) | 🟢 **HOÀN THÀNH 100%** | API `/api/v1/accounts` (GET/POST), Money VO, UI Net Worth Card & Add Account Modal. Cảnh báo dữ liệu cũ (>14 ngày). |
| **Sprint 3** | Engine Mô phỏng Kịch bản (M4) | 🟢 **HOÀN THÀNH 100%** | API `/api/v1/scenarios/calculate`, Domain Simulation Engine (Pure Math), UI ScenarioSimulator với Recharts. |
| **Sprint 4** | AI Research Brief & Advisory Layer (M3) | 🟢 **HOÀN THÀNH 100%** | API `/api/v1/research/brief`, Gemini 2.0 Flash Client Adapter, Evidence Pack Builder, UI AIResearchBrief với trích dẫn. |
| **Sprint 5** | Python Market Crawler Service (M2) | 🟢 **HOÀN THÀNH 100%** | Service Python FastAPI (`services/analytics`), cào VCB XML FX & RSS CafeF/VnExpress, API Gateway Proxy & UI MarketDataCards. |

---

## 📂 3. Các File Cốt Lõi Đã Triển Khai

### Infrastructure & Core
* `src/lib/db.ts`: Utility kết nối MongoDB với Mongoose (có global cache).
* `src/app/api/v1/health/route.ts`: API Health check trạng thái DB và môi trường.
* `.env.example` & `.env.local`: Cấu hình kết nối DB và AI API keys.

### Personal Finance Core (Sprint 2)
* `src/models/Account.ts`: Mongoose Model lưu tài khoản (`financial_accounts`).
* `src/models/ValuationSnapshot.ts`: Mongoose Model lưu lịch sử định giá dạng append-only (`valuation_snapshots`).
* `src/domain/money.ts`: Utility xử lý chuyển đổi tiền tệ & format tiền Việt Nam.
* `src/domain/net-worth.ts`: Utility tính toán Tổng tài sản ròng và kiểm tra cờ Stale Data (>14 ngày).
* `src/app/api/v1/accounts/route.ts`: REST API Handlers cho `GET` (Net worth overview) & `POST` (Tạo tài sản + snapshot đầu tiên).
* `src/components/AddAccountModal.tsx`: Component Modal thêm tài sản mới.
* `src/components/NetWorthCard.tsx`: Component Thẻ Net Worth + Cảnh báo dữ liệu cũ.
* `src/components/AccountList.tsx`: Component danh sách tài sản nhóm theo loại.

### Scenario Simulation Core (Sprint 3)
* `src/domain/simulation.ts`: Engine tính toán tích lũy tài sản, lãi kép hàng tháng & yếu tố lạm phát.
* `src/app/api/v1/scenarios/calculate/route.ts`: API Endpoint nhận thông số kịch bản và trả về dữ liệu mô phỏng.
* `src/components/ScenarioSimulator.tsx`: Component UI tương tác (Sliders, Inputs, Milestones & Biểu đồ Recharts AreaChart).

### AI Advisory & Research Layer (Sprint 4)
* `src/domain/evidence-pack.ts`: Evidence Pack Builder đóng gói dữ liệu danh mục & tỷ giá thị trường làm dữ liệu chống ảo giác cho AI.
* `src/lib/ai.ts`: Gemini 2.0 Flash / Groq LLM Adapter ép Zod JSON schema + Local Fallback Assessor.
* `src/app/api/v1/research/brief/route.ts`: REST API Route tạo báo cáo phân tích tài chính AI.
* `src/components/AIResearchBrief.tsx`: Component UI hiển thị Báo cáo AI, thẻ đánh giá rủi ro (HIGH/MEDIUM/LOW), trích dẫn Citation IDs & Disclaimer.

### Python Market Crawler Service & Integration (Sprint 5)
* `services/analytics/main.py`: FastAPI Microservice cào tỷ giá VCB XML & RSS CafeF/VnExpress (`/api/v1/market/summary`).
* `services/analytics/requirements.txt`: Python package dependencies (`fastapi`, `uvicorn`, `httpx`, `feedparser`, `pymongo`).
* `src/app/api/v1/market/summary/route.ts`: Next.js Gateway Proxy Route kết nối tới Python Analytics Service.
* `src/components/MarketDataCards.tsx`: Component UI hiển thị Bảng tỷ giá Vietcombank & Thẻ tin tức kinh doanh RSS.
* `src/app/page.tsx`: Màn hình Dashboard full 4 Tabs hoàn chỉnh.

---

## 🚀 5. Hướng Dẫn Vận Hành Ứng Dụng (Developer Runbook)

### Chạy ứng dụng Next.js Fullstack Core:
```bash
npm run dev
# Mở trình duyệt tại: http://localhost:3000
```

### Chạy dịch vụ Python Analytics & Crawler Sidecar (Tùy chọn):
```bash
cd services/analytics
pip install -r requirements.txt
python main.py
# Server chạy tại: http://localhost:8000
```

---

*Cập nhật lần cuối: ALL 5 SPRINTS COMPLETE — Full MVP System Verified 100%.*
Sprint 7 — Đăng Nhập & Bảo Mật Đa Người Dùng (Multi-Tenancy Auth):

Tích hợp NextAuth.js với cơ chế xác thực Email/Credentials & Google Provider.
Thêm mã hóa dữ liệu nhạy cảm AES-256 tại src/lib/encryption.ts.
Tách biệt dữ liệu riêng tư giữa các người dùng (userId tenancy isolation) cho mọi API Routes.
Sprint 8 — Tự Động Định Giá Chứng Khoán Việt Nam (VN Stock Auto-Pricing):

Thêm API /api/v1/market/stocks cào giá cổ phiếu thời gian thực từ các sàn HOSE/HNX (HPG, FPT, MBB, TCB, SSI, VIC...).
Xây dựng Động cơ định giá danh mục đầu tư cổ phiếu (src/domain/stock-valuation.ts).
Hiển thị bảng giá điện tử realtime VNStockPortfolioCard.tsx.
Sprint 9 — Chỉ Số Sức Khỏe Tài Chính & Telegram Digest Bot:

Financial Health Score Engine (src/domain/financial-health.ts): Tự động chấm điểm từ 0–100, đo lường số tháng Quỹ khẩn cấp & Tỷ lệ nợ/tài sản.
Hiển thị Thẻ đánh giá sức khỏe tài chính FinancialHealthCard.tsx kèm khuyến nghị phân bổ tài sản.
Telegram Bot Helper (services/analytics/telegram_bot.py): Sẵn sàng kết nối Telegram API tự động gửi báo cáo tổng quan vào điện thoại cá nhân mỗi Chủ Nhật.
Sprint 10 — Đóng Gói Docker Compose & Triển Khai 1-Click:
- Viết file `docker-compose.yml` đóng gói 3 dịch vụ: Next.js Core App, Python Analytics Sidecar, và MongoDB 7.0.
- Viết `Dockerfile.web` & `Dockerfile.analytics` phục vụ môi trường Production.
- Viết tài liệu hướng dẫn vận hành chi tiết tại file `DEPLOYMENT_RUNBOOK.md`.

Sprint 11 — Tiện Ích Thiết Thực & Bảo Mật Ẩn Số Dư (Essential Utilities & Privacy):
- Nút bật/tắt **Chế Độ Ẩn Số Dư (Stealth Privacy Mode)** trên Header và Thẻ Net Worth (`isPrivate` state).
- Động cơ tính **Lịch Trả Nợ Vay Gốc + Lãi Giảm Dần** (`src/domain/loan-amortization.ts`).
- Động cơ quản lý **Ngân Sách & Hạn Mức Chi Tiêu Tháng** (`src/domain/budget.ts`).
- Tích hợp **API Tỷ Giá Crypto Realtime từ CoinGecko** (`GET /api/v1/market/crypto`).

Sprint 12 — Phân Hạng Gói SaaS Pro & Học Viện Đào Tạo AI (SaaS Tiering & AI Academy):
- Xây dựng **Hệ Thống Phân Hạng Gói SaaS** (`FREE` vs `PRO`) tại `src/domain/subscription-plan.ts`.
- Màn hình Paywall khóa tính năng nâng cấp Gói Pro Glassmorphism (`SaaSFeaturePaywall.tsx`).
- **AI Financial Academy Coach (`src/domain/ai-academy.ts` & `AIAcademyCoach.tsx`)**: Đào tạo tư duy định giá P/E, P/B, chiến lược mua tích sản DCA và kiểm soát tâm lý FOMO.
- Tích hợp **AI Safety Guardrails**: Đảm bảo AI chỉ hướng dẫn tư duy & kịch bản phân bổ vốn, không phát lệnh mua/bán mạo hiểm.

---

*Cập nhật lần cuối: ALL 14 SPRINTS COMPLETE — Commercial SaaS Ready to Monetize.*

Sprint 13 — Smart AI Statement OCR & Portfolio Rebalancing Engine:
- **Smart AI Statement OCR (`src/domain/statement-parser.ts`, `src/app/api/v1/ocr/parse-statement/route.ts`, `SmartOCRModal.tsx`)**: Bóc tách tự động tài sản từ hóa đơn/sao kê ngân hàng bằng Gemini 2.0 Flash Vision.
- **Portfolio Rebalancing Engine (`src/domain/portfolio-rebalance.ts`, `src/app/api/v1/portfolio/rebalance/route.ts`, `PortfolioRebalanceModal.tsx`)**: Động cơ tính toán tỷ trọng phân bổ tài sản mục tiêu, đưa ra gợi ý số tiền nạp thêm/chốt lời cho từng kênh.

*Cập nhật lần cuối: ALL 15 SPRINTS COMPLETE — Personal Wealth Cockpit Verified.*

Sprint 14 — Commercialization & VietQR Auto-Payment Engine:
- **VietQR Auto-Payment Gateway (`src/lib/payos.ts`, `create-qr/route.ts`, `webhook/route.ts`, `SaaSFeaturePaywall.tsx`)**: Mã VietQR thanh toán 99k/tháng hoặc 899k/năm + Webhook nâng cấp Pro.
- **Affiliate Revenue Engine (`src/domain/affiliate.ts`, `AffiliateBannerCard.tsx`)**: Động cơ giới thiệu mở tài khoản chứng khoán/thẻ tín dụng nhận hoa hồng 200k - 600k/đơn.

Sprint 15 — Personal Wealth Master Engine & Asset Risk Heatmap:
- **Personal Wealth Tracker (`src/domain/wealth-goal.ts`, `PersonalWealthTracker.tsx`)**: Quản trị mục tiêu tích sản hàng tháng & Checklist 4 bước kỷ luật tài chính cá nhân.
- **Asset Risk Heatmap (`AssetRiskHeatmap.tsx`)**: Bản đồ rủi ro 4 tầng (Siêu an toàn, Tăng trưởng, Đầu cơ, Khoản nợ) với hệ thống cảnh báo sớm khi tài sản đầu cơ vượt 25%.