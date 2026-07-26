# AI Personal Financial Intelligence Hub — Implementation Blueprint

**Version:** 1.0  
**Status:** Ready for implementation  
**Source of truth:** `FINAL_Product_Vision_AI_Financial_Intelligence_Hub.docx`  
**Scope:** Single-user personal application; Vietnamese-first; not a fintech, broker, robo-advisor, or multi-tenant SaaS.

## 1. Product decision

The product is a private financial intelligence workspace. It combines the user's financial position, selected market signals, sourced news, and deterministic simulations so that the user can understand their situation and evaluate options. AI is an analysis and explanation layer, never an autonomous decision maker.

The MVP succeeds when, after an initial data import, a user can in under two minutes: (1) see net worth and its change, (2) see the latest market context and research with sources, and (3) compare a financial scenario against the current baseline.

### Explicit non-goals for MVP

- No bank-account connection, payment execution, brokerage order, portfolio rebalancing, or investment recommendation.
- No multi-user/team support, subscription/billing, mobile app, microservices, event bus, or chat agent.
- No scraping that violates a provider's terms. Market/news sources must be configurable and attributable.
- No mandatory daily/weekly manual transaction entry. Manual entry and CSV import are both supported.

## 2. MVP scope and release slices

| Slice | Included outcome | Excluded until later |
|---|---|---|
| S0 Foundation | Secure private app, database, auditability, backup, seed data | User registration, RBAC hierarchy |
| S1 Personal finance | Assets, liabilities, income/expense cash-flow, net-worth history | Bank sync and OCR |
| S2 Market intelligence | Tracked indicators, price history, source health, news feed | Intraday trading UI |
| S3 Research | AI research brief with citations, impact/risk labels and feedback | Buy/sell instructions or price targets |
| S4 Simulation | Deterministic baseline and alternative projections | Tax optimizer and Monte Carlo |

## 3. Users, workflows, and acceptance outcomes

### Primary user

The owner of the data, using the app occasionally to catch up and compare decisions. The UI must still be useful if no new transaction was recorded that week.

### Core workflow A — update financial position

1. User records or imports an asset, liability, income, expense, or valuation.
2. System validates currency, date, amount, category, and ownership.
3. System updates computed net worth and retains the original record.
4. Dashboard shows a dated snapshot and flags stale valuations.

**Acceptance:** a user can add a cash account and a gold/stock/fund holding, edit it without losing audit history, and see the totals reflected consistently on dashboard, asset list, and history chart.

### Core workflow B — review market context

1. Scheduled job fetches configured market indicators and approved news feeds.
2. Raw payload and fetch status are stored; normalized observations are deduplicated.
3. User sees latest value, change vs prior observation, freshness and source.

**Acceptance:** a failed provider does not overwrite the last good value; the UI clearly labels stale data and exposes its source/time.

### Core workflow C — read research

1. User requests a research brief for a date range and selected indicators/news.
2. Backend constructs a bounded evidence pack from stored data only.
3. Model returns structured Vietnamese output; server validates it and saves it with model/prompt versions.
4. User can open all cited source items and rate usefulness.

**Acceptance:** every factual statement in a brief is either derived from stored observations or linked to a source item; the brief includes uncertainty and a non-advisory disclaimer.

### Core workflow D — compare a scenario

1. User selects a baseline financial position and horizon.
2. User changes monthly saving/investing amount, income, expense, and expected annual return.
3. Backend calculates month-by-month baseline and alternative results deterministically.
4. UI compares end value, contributions, gain/loss and optional target-date difference.

**Acceptance:** the same inputs always yield identical outputs; assumptions are visible and persisted with the scenario; no AI call is needed.

## 4. Architecture

Use a modular monolith in a TypeScript monorepo. Keep application modules independent, but deploy one API and one web app.

```text
Next.js web (App Router, TypeScript, Tailwind, Recharts)
        |
REST /api/v1 + OpenAPI
        |
Node.js API (NestJS, TypeScript)
  ├─ Finance module       ├─ Market module       ├─ Research module
  ├─ Scenario module      ├─ Ingestion scheduler ├─ Audit/backup module
  └─ Auth/config module
        |
MongoDB (primary data) ── optional Redis (rate limit/cache/job lock)
        |
External adapters: approved market provider | RSS/news provider | Gemini or Claude
```

### Repository layout

```text
apps/web                 # Next.js UI
apps/api                 # NestJS REST API and scheduler
packages/contracts       # DTOs, Zod schemas, OpenAPI generated types
packages/domain          # money, allocation, simulation, shared rules
packages/config          # eslint, tsconfig, env schema
infra/docker             # compose, Dockerfiles, backup scripts
docs                     # ADRs, API, runbooks, provider register
```

### Architecture options & trade-offs

- **Option A (Default - Clean Architecture):** NestJS API (`apps/api`) + Next.js UI (`apps/web`) in monorepo with `packages/domain` and `packages/contracts`. Strong NestJS DI/decorators, ideal for multi-service separation.
- **Option B (Fast Track - Single Developer & AI Agent):** Next.js Standalone (App Router API Routes `/app/api/...`) keeping `packages/domain` for pure financial & simulation logic. Eliminates cross-app CORS, session cookie sync overhead, and OpenAPI codegen steps.

### Key design rules

- Store money as integer minor units (`amountMinor`) plus ISO-4217 `currency`; never use floating point for money.
- Treat `userId` as required even in a single-user MVP, but seed exactly one owner. This avoids a breaking schema later.
- Separate immutable source records from derived aggregates. Do not persist dashboard totals as truth.
- All write endpoints use schema validation, correlation IDs, audit events, and optimistic-concurrency `version` fields.
- Use UTC timestamps; display `Asia/Ho_Chi_Minh` by default. Dates used for finance are explicit `YYYY-MM-DD` local dates.
- AI calls happen server-side only. Keys never reach the browser. Model output is untrusted until schema-validated.
- **Stale Data Strategy:**
  - **Dashboard (M1-11):** Visually flag asset valuations or holdings not updated for >14 days (e.g., *"Dữ liệu định giá danh mục X đã 15 ngày chưa cập nhật"*).
  - **AI Research (M3-01):** Pass data freshness indicators into the evidence pack so AI briefs explicitly note stale inputs under limitations.

## 5. Data model

| Collection | Essential fields | Indexes / notes |
|---|---|---|
| `users` | `_id`, `email`, `role`, `preferences`, `createdAt` | unique `email`; seed owner |
| `financial_accounts` | `userId`, `name`, `kind`, `currency`, `isActive`, `version` | `(userId,isActive)` |
| `financial_entries` | `userId`, `accountId`, `type`, `amountMinor`, `currency`, `occurredOn`, `categoryId`, `note`, `source`, `version` | `(userId,occurredOn)`, `(accountId,occurredOn)`; immutable correction model |
| `asset_positions` | `userId`, `assetType`, `symbol?`, `quantity`, `costBasisMinor`, `currency`, `asOf`, `source`, `version` | `(userId,assetType,symbol,asOf)` |
| `valuation_snapshots` | `userId`, `positionId?`, `valueMinor`, `currency`, `asOf`, `source` | `(userId,asOf)`; append-only |
| `goals` | `userId`, `name`, `targetMinor`, `currency`, `targetDate?`, `isActive` | optional; not a dashboard prerequisite |
| `market_instruments` | `code`, `name`, `kind`, `currency`, `provider`, `isTracked` | unique `(code,provider)` |
| `market_observations` | `instrumentId`, `observedAt`, `value`, `unit`, `provider`, `rawRef`, `quality` | unique `(instrumentId,observedAt,provider)` |
| `news_items` | `url`, `title`, `publishedAt`, `publisher`, `summary?`, `contentHash`, `tags` | unique `url`, unique `contentHash` |
| `research_briefs` | `userId`, `period`, `scope`, `evidenceRefs`, `content`, `citations`, `model`, `promptVersion`, `status` | `(userId,createdAt)` |
| `scenarios` | `userId`, `name`, `baseline`, `assumptions`, `results`, `engineVersion`, `createdAt` | `(userId,createdAt)` |
| `audit_events` | `actorId`, `action`, `entityType`, `entityId`, `before?`, `after?`, `requestId`, `createdAt` | `(entityType,entityId)`, TTL only for noisy technical logs |
| `ingestion_runs` | `provider`, `jobType`, `startedAt`, `finishedAt`, `status`, `counts`, `error?` | `(provider,startedAt)` |

### Classification enums

- Account/asset kinds: `cash`, `savings`, `gold`, `stock`, `fund`, `certificate_of_deposit`, `business`, `freelance_receivable`, `other_asset`, `liability`.
- Entry types: `income`, `expense`, `transfer`, `adjustment`, `valuation`.
- Research impact: `positive`, `negative`, `mixed`, `unclear`; confidence: `low`, `medium`, `high`.

## 6. API contract

Base URL: `/api/v1`. JSON response envelope: `{ data, meta?, requestId }`. Errors: `{ error: { code, message, details? }, requestId }`.

| Area | Endpoint | Purpose |
|---|---|---|
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | private access using secure HTTP-only session cookie |
| Dashboard | `GET /dashboard?asOf=YYYY-MM-DD` | net worth, allocation, cash flow, stale indicators, latest research |
| Accounts | `GET/POST /accounts`, `PATCH /accounts/:id` | accounts and asset containers |
| Finance | `GET/POST /entries`, `POST /entries/import`, `POST /positions`, `POST /valuations` | financial sources and imports |
| Finance | `GET /net-worth/history?from&to&currency` | calculated series |
| Goals | `GET/POST/PATCH /goals` | optional goals |
| Market | `GET /market/instruments`, `GET /market/observations`, `POST /market/refresh` | source-backed market data |
| News | `GET /news?from&to&tag` | deduplicated source items |
| Research | `POST /research/briefs`, `GET /research/briefs`, `GET /research/briefs/:id`, `POST /research/briefs/:id/feedback` | async AI briefing and feedback |
| Scenario | `POST /scenarios/calculate`, `GET/POST /scenarios`, `GET /scenarios/:id` | calculation then persistence |
| Ops | `GET /health`, `GET /ready`, `GET /admin/ingestions` | operational visibility |

All collection endpoints support cursor pagination, ISO-date range filtering, stable sorting, and a maximum page size of 100. State-changing requests require a CSRF strategy and return `409` when `version` is stale.

## 7. AI research specification

Input is an evidence pack containing only selected stored `market_observations`, `news_items`, user-declared exposure summaries, and explicit time period. Never send raw notes, credentials, complete transaction history, or identifiers unless necessary and consented.

Required structured result:

```json
{
  "headline": "string",
  "executiveSummary": "string",
  "observations": [{"claim":"string","evidenceIds":["string"]}],
  "impactAssessment": [{"area":"cash|gold|stock|fund|other","impact":"positive|negative|mixed|unclear","reason":"string","confidence":"low|medium|high"}],
  "risks": ["string"],
  "questionsToConsider": ["string"],
  "limitations": ["string"],
  "citationIds": ["string"]
}
```

Guardrails: prohibit personalized buy/sell commands, promised returns, fabricated facts/citations, and use of external knowledge as evidence. On invalid output, retry once with a repair prompt; otherwise mark the brief `failed` and preserve diagnostics. Display: “Thông tin để tham khảo, không phải khuyến nghị đầu tư.”

## 8. Scenario engine

Inputs: opening investable balance, monthly contribution, annual return, annual income growth, monthly expenses, horizon in months, contribution timing (`start`/`end`), and optional target amount. Default compounding is monthly: `r = (1 + annualReturn)^(1/12) - 1`; then apply the selected contribution timing. Return a row per month plus totals.

Constraints: horizon 1–600 months; annual return -100% to 100%; all money inputs must share a selected reporting currency. Clearly label that projected return is an assumption, nominal, and excludes tax/inflation unless those inputs are explicitly enabled in a later version.

## 9. Security, reliability, and operations

- Require an owner bootstrap secret for first setup; use Argon2id password hashes, rate limits, secure/HTTP-only/SameSite cookies, and CSRF protection.
- Encrypt secrets using deployment secret manager; redact PII and tokens from logs. Encrypt MongoDB volumes/backups at rest.
- Nightly encrypted MongoDB backup, 30-day retention, monthly restore drill; migration is forward-only with a backup before execution.
- Provider adapters have timeout, retry with exponential backoff, rate limit, idempotency key, and circuit-breaker state. Keep last successful data when refresh fails.
- CI gates: format, lint, typecheck, unit tests, API integration tests, migration dry run, dependency/security scan, and build.
- Deploy via Docker Compose initially: `web`, `api`, `mongodb`, optional `redis`, reverse proxy. Provide `.env.example`, health checks, and rollback runbook.

## 10. Implementation backlog

**Definition of done for every task:** reviewed; lint/typecheck passing; tests added/updated; error states handled; OpenAPI/README updated when behavior changes; no secrets or user financial data in fixtures/logs.

### Milestone M0 — foundation

- [ ] **M0-01** Create pnpm TypeScript monorepo and workspace layout; add Node version, package scripts, Prettier, ESLint, strict TypeScript, commit conventions.
- [ ] **M0-02** Scaffold Next.js web and NestJS API; configure local Docker Compose with MongoDB and optional Redis.
- [ ] **M0-03** Implement typed environment schema, `.env.example`, startup validation, and secret-redaction utility.
- [ ] **M0-04** Add CI workflow for install, lint, typecheck, unit tests, build, and dependency audit.
- [ ] **M0-05** Add API OpenAPI generation, shared Zod DTOs, response/error envelope, request IDs, and global exception mapping.
- [ ] **M0-06** Implement health/readiness endpoints and structured JSON logging.
- [ ] **M0-07** Define Mongo connection, collection validators, index bootstrap, and forward-only migration runner.
- [ ] **M0-08** Implement bootstrap-owner/login/logout/me, secure session cookie, CSRF protection, and login rate limit.
- [ ] **M0-09** Implement audit-event writer middleware and immutable audit viewer API.
- [ ] **M0-10** Add encrypted backup script, restore verification script, and operational runbook.

### Milestone M1 — financial foundation

- [ ] **M1-01** Define finance domain value objects: Money, ReportingCurrency, LocalDate, AssetType, and validation tests.
- [ ] **M1-02** Build accounts CRUD with optimistic concurrency and audit records.
- [ ] **M1-03** Build categories and financial entries CRUD; validate transfers as balanced pairs.
- [ ] **M1-04** Implement CSV import preview, column mapping, validation report, idempotent commit, and downloadable error CSV.
- [ ] **M1-05** Build asset positions CRUD for cash, savings, gold, stock, fund, CD, business, freelance, other asset, and liabilities.
- [ ] **M1-06** Build append-only valuations and correction workflow; never overwrite a historical valuation.
- [ ] **M1-07** Implement net-worth and allocation calculation service, including missing/stale valuation status.
- [ ] **M1-08** Implement net-worth history aggregation and currency/reporting-date filters.
- [ ] **M1-09** Build dashboard API composition with cache headers and no duplicated financial calculations.
- [ ] **M1-10** Build Accounts, Entries, Positions, Valuations and Import pages with accessible validation/error states.
- [ ] **M1-11** Build dashboard: dated net worth, allocation, cash flow, “last updated”, stale-data state, and empty-state onboarding.
- [ ] **M1-12** Add optional goals CRUD and goal progress calculation; dashboard must work with zero goals.

### Milestone M2 — market intelligence

- [ ] **M2-01** Establish provider register: source URL, allowed use, refresh cadence, fields, attribution, fallback, owner.
- [ ] **M2-02** Implement market instrument catalog and admin configuration for VN-Index, VN30, gold, savings rates, CDs, and macro indicators.
- [ ] **M2-03** Create provider-adapter interface and one fixture adapter; contract-test normalization and error mapping.
- [ ] **M2-04** Implement ingestion scheduler, single-run lock, retry/backoff, run log, and manual refresh authorization.
- [ ] **M2-05** Persist normalized observations and raw-payload references; enforce deduplication and source timestamps.
- [ ] **M2-06** Build market list/detail API with freshness, change calculation, range series, and source metadata.
- [ ] **M2-07** Build news RSS/provider adapter, article normalization, URL/content-hash dedupe, tags, and source attribution.
- [ ] **M2-08** Build market dashboard cards and chart with loading, empty, stale, failed-provider states.
- [ ] **M2-09** Build market/news page with date/tag filters, source links, and ingestion-status panel.
- [ ] **M2-10** Add alert-free data-quality checks: outlier detection, late observation detection, and visible quality flags.

### Milestone M3 — research

- [ ] **M3-01** Implement evidence-pack builder with explicit scope, size limits, data minimization, and source IDs.
- [ ] **M3-02** Create provider-neutral LLM client, Gemini/Claude adapters, timeout, retry, cost/usage telemetry, and feature flag.
- [ ] **M3-03** Define research output JSON schema and server-side validation/repair path.
- [ ] **M3-04** Implement research-brief creation job, status polling, persistence of evidence/model/prompt versions, and failure diagnostics.
- [ ] **M3-05** Implement citation resolver; reject briefs with unknown citations or unsupported factual claims.
- [ ] **M3-06** Build Research page: scope form, in-progress state, brief reader, source links, limitations, disclaimer, and no-advice copy.
- [ ] **M3-07** Add usefulness feedback, brief archive, and model evaluation fixture set for regression tests.
- [ ] **M3-08** Add AI security tests: prompt injection in news, fabricated citation, recommendation wording, and data-leak prevention.

### Milestone M4 — scenarios and release hardening

- [ ] **M4-01** Implement pure scenario-engine package and golden tests for monthly compounding, zero return, negative return, and start/end contributions.
- [ ] **M4-02** Implement calculate API with input validation, precision rules, assumptions, engine version, and comparison summary.
- [ ] **M4-03** Implement saved scenario CRUD and immutable result snapshots.
- [ ] **M4-04** Build scenario form, results table/chart, baseline-vs-alternative comparison, validation, and explanation of assumptions.
- [ ] **M4-05** Link optional goals to scenario output; show estimated gap/date only when sufficient inputs exist.
- [ ] **M4-06** Add end-to-end tests for owner login, finance update, market refresh, research brief, and saved scenario.
- [ ] **M4-07** Run threat model, accessibility review, performance budget check, backup restore drill, and production readiness checklist.
- [ ] **M4-08** Prepare production Compose configuration, reverse proxy/TLS instructions, monitoring dashboard, alerts for ingestion/backup failure, and rollback runbook.

## 11. Dependencies and delivery order

`M0 → M1 → M2 → M3` and `M1 → M4`. Research must only start after market/news provenance is implemented. The scenario engine can be built in parallel with market work after M1; its UI requires the dashboard baseline API.

Recommended working rhythm: small vertical slices, feature branch per task, one deployable milestone at a time. Do not scaffold every future module before M1 is usable.

## 12. Release acceptance checklist

- [ ] Owner can authenticate, add/import financial data, and recover from validation mistakes without silent data loss.
- [ ] Dashboard totals reconcile with underlying positions/entries for deterministic fixtures.
- [ ] Each market number/news item shows provider and time; stale/failed data is distinguishable from current data.
- [ ] Every AI brief has source links, limitations, model/prompt version, and the non-advice disclaimer.
- [ ] Scenario results are reproducible from saved inputs and engine version.
- [ ] Restore test succeeds using a fresh environment; migrations do not modify historical records in place.
- [ ] CI passes and deployment exposes health/readiness checks with no secrets in client bundles or logs.

## 13. Resolved recommendations & deferred decisions

### Approved Free & Open Providers Register

#### A. Free Financial & Market Data APIs
1. **Vietcombank FX Rates:** `https://portal.vietcombank.com.vn/Usercontrols/TVWeb/ExchangeRate.aspx?exporttype=xml` (Daily USD, EUR, JPY exchange rates; no API key required).
2. **VNDirect Stock & Index API:** `https://api-price.vndirect.com.vn/v1/prices` & `https://finfo-api.vndirect.com.vn/v5/stock/snapshot` (VN-Index, VN30, stock price quotes).
3. **Yahoo Finance Query API (`yahoo-finance2` npm):** World Gold (`GC=F`), Global Market Indices, USD/VND rates (`USDVND=X`).
4. **CoinGecko Crypto API:** `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,vnd` (Free public crypto rates; no API key required).

#### B. Free Vietnamese News RSS Feeds
1. **VnExpress Business:** `https://vnexpress.net/rss/kinh-doanh.rss`
2. **CafeF Stock & Market:** `https://cafef.vn/thi-truong-chung-khoan.rss`
3. **Tuoi Tre Business:** `https://tuoitre.net/rss/kinh-doanh.rss`

#### C. Free AI Model Provider Options (Provider-Neutral Adapter)
1. **Google AI Studio (Gemini 2.0 Flash / 1.5 Flash):** Free tier (15 RPM / 1,500 RPD), fast response, excellent Vietnamese support, large context window.
2. **Groq Cloud API:** Free tier for `llama-3.3-70b-versatile` and `deepseek-r1-distill-llama-70b` via OpenAI SDK compatible endpoint (`https://api.groq.com/openai/v1`).
3. **OpenRouter Free Tier:** OpenRouter endpoint (`https://openrouter.ai/api/v1`) for zero-cost models (`google/gemma-2-9b-it:free`, `meta-llama/llama-3.3-70b-instruct:free`).
4. **Ollama (100% Offline / Private Local AI):** Local Ollama endpoint (`http://localhost:11434/v1`) running `deepseek-r1:8b`, `qwen2.5:7b`, or `llama3.2` for zero cost and 100% financial data privacy.

### Base Reporting Currency & Conversion Rules
* Base currency is set to **`VND`**. Assets measured in USD, Gold (tael/ounce), or foreign equities are converted to VND using historical valuation snapshots.

### Selected Architecture Choice
* **Hybrid Architecture (Next.js Fullstack Core + Python Analytics Service Sidecar):**
  - **Next.js (80% codebase):** Fullstack app handling Auth, UI, Financial CRUD, Net Worth calculations, and Scenario Simulation Engine.
  - **Python FastAPI (20% codebase):** Modular service handling market data crawlers (VnStock, VCB FX, CafeF RSS) and advanced data analytics.

### Sprint Execution Roadmap (Completed & Extended)
* **Sprint 1 (Foundation):** 🟢 **COMPLETED** — Next.js App Router, MongoDB connection, `.env` validation, Health API (`/api/v1/health`).
* **Sprint 2 (Personal Finance):** 🟢 **COMPLETED** — Asset CRUD, Money Value Object, Net Worth Calculation, Dashboard UI, Stale Data Warnings.
* **Sprint 3 (Simulation):** 🟢 **COMPLETED** — Pure Math Scenario Engine, Monthly compounding, Recharts AreaChart projections.
* **Sprint 4 (AI Research):** 🟢 **COMPLETED** — Gemini 2.0 Flash / Groq LLM client, Zod Output Validation, Evidence Pack, Brief UI with Citations & Disclaimer.
* **Sprint 5 (Market & Python):** 🟢 **COMPLETED** — Python FastAPI crawler service (`services/analytics`), VCB XML & RSS ingestion, Market Data Cards.
* **Sprint 6 (Advanced Analytics & Export):** 🟢 **COMPLETED** — Net Worth History Snapshots (`/api/v1/snapshots/history`), LineChart Timeline UI, CSV & Print PDF Financial Exporters.

### Remaining deployment decisions
1. Hosting environment (e.g., local Docker Compose / private VPS) and owner account password recovery strategy.
