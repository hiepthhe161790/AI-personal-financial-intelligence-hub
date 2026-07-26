import { z } from 'zod';
import { AccountType } from '@/models/Account';

export const ParsedItemSchema = z.object({
  accountName: z.string().describe('Tên tài khoản hoặc loại tài sản (Ví dụ: Tiết kiệm Vietcombank, Cổ phiếu FPT)'),
  accountType: z.enum(['CASH', 'INVESTMENT', 'REAL_ESTATE', 'CRYPTO', 'GOLD', 'LOAN']).describe('Loại tài sản'),
  amountVND: z.number().describe('Giá trị định giá tính theo VNĐ (Ví dụ: 50000000)'),
  description: z.string().optional().describe('Ghi chú hoặc chi tiết thêm từ hóa đơn/sao kê'),
  date: z.string().optional().describe('Ngày giao dịch hoặc ngày định giá (YYYY-MM-DD)'),
});

export const StatementExtractionResultSchema = z.object({
  summary: z.string().describe('Tóm tắt ngắn gọn nội dung chứng từ/sao kê được phân tích'),
  items: z.array(ParsedItemSchema).describe('Danh sách các tài sản hoặc khoản nợ được bóc tách'),
  confidenceScore: z.number().min(0).max(100).describe('Thang điểm tin cậy của AI bóc tách (0-100)'),
});

export type ParsedItem = z.infer<typeof ParsedItemSchema>;
export type StatementExtractionResult = z.infer<typeof StatementExtractionResultSchema>;
