import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_bytes_length_ok!'; // Must be 32 bytes (256 bits)
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

/**
 * Encrypts a plain text string into an IV-prefixed hex payload.
 */
export function encryptText(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt_financial_hub', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an IV-prefixed hex payload back to plain text.
 */
export function decryptText(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return encryptedText; // If not encrypted, return as is
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt_financial_hub', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return encryptedText;
  }
}
