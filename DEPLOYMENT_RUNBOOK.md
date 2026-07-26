# Production Deployment & Operations Runbook

Guide for deploying the **AI Personal Financial Intelligence Hub** to a Linux VPS (Ubuntu/Debian) or Synology/QNAP NAS using Docker Compose.

---

## 📌 Prerequisites

- Docker 24.0+ & Docker Compose v2 installed on target server.
- Domain name pointed to server IP (optional for SSL / Nginx).
- Minimum Server Specs: 1 CPU, 2GB RAM, 10GB SSD.

---

## 🚀 1. One-Click Docker Production Deployment

### Step 1: Clone Repository & Create `.env`
```bash
git clone https://github.com/your-username/AI-personal-financial-intelligence-hub.git
cd AI-personal-financial-intelligence-hub
cp .env.example .env
```

### Step 2: Configure Environment Variables
Edit `.env` file and set your production values:
```env
GEMINI_API_KEY=your_real_gemini_api_key
NEXTAUTH_SECRET=your_random_secret_32_chars
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### Step 3: Launch Docker Stack
```bash
docker-compose up -d --build
```

### Step 4: Verify Service Health
```bash
# Check container status
docker-compose ps

# Test Next.js App
curl http://localhost:3000/api/v1/health

# Test Python Analytics Sidecar
curl http://localhost:8000/health
```

---

## 💾 2. Automated Database Backup Strategy

To back up your MongoDB data volume:
```bash
docker exec -t financial_hub_mongo mongodump --archive=/data/db/backup_$(date +%F).gz --gzip
```

---

## 🔄 3. Updating Application Code

To pull new changes and zero-downtime update containers:
```bash
git pull origin main
docker-compose up -d --build --no-deps web analytics
```
