import UserSettingModel from '@/models/UserSetting';
import { decryptText } from './encryption';

export async function sendTelegramAlert(message: string, userId: string = 'owner'): Promise<boolean> {
  let token = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID;

  try {
    const settings = await UserSettingModel.findOne({ userId }).lean();
    if (settings?.telegramBotTokenEncrypted) {
      token = decryptText(settings.telegramBotTokenEncrypted);
    }
    if (settings?.telegramChatIdEncrypted) {
      chatId = decryptText(settings.telegramChatIdEncrypted);
    }
  } catch (err) {
    console.error('Failed to read user telegram settings from DB:', err);
  }

  if (!token || !chatId || token.includes('your_') || chatId.includes('your_') || token === '' || chatId === '') {
    console.warn('Telegram Bot credentials are not configured.');
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
    return false;
  }
}
