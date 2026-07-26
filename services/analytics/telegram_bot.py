import os
import httpx
from typing import Dict, Any

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

async function_send_telegram = None

async def send_telegram_digest(net_worth_vnd: str, total_assets_vnd: str, health_score: int) -> Dict[str, Any]:
    """
    Sends weekly Telegram financial digest to user's Telegram app.
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram bot token/chat_id not configured. Mocking Telegram digest send.")
        return {
            "status": "mocked",
            "message": "Báo cáo Telegram chưa cấu hình Token/ChatID nhưng logic đã hoàn chỉnh."
        }

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    message = (
        f"📊 *BÁO CÁO TÀI CHÍNH HÀNG TUẦN - AI FINANCIAL HUB*\n\n"
        f"💰 *Tài Sản Ròng (Net Worth):* {net_worth_vnd}\n"
        f"🏦 *Tổng Tài Sản:* {total_assets_vnd}\n"
        f"🩺 *Điểm Sức Khỏe Tài Chính:* {health_score}/100\n\n"
        f"✨ *Hệ thống đang hoạt động ổn định và bảo mật!*"
    )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json={
                "chat_id": TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "Markdown"
            })
            if resp.status_code == 200:
                return {"status": "sent", "response": resp.json()}
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")

    return {"status": "error", "message": "Không thể gửi tin nhắn Telegram"}
