import { NetWorthOverview } from '@/domain/net-worth';
import { formatMoney } from '@/domain/money';

/**
 * Converts Net Worth Overview & Accounts list into standard CSV data.
 */
export function generateCSVReport(netWorth: NetWorthOverview): string {
  const headers = ['Tên Tài Sản/Khoản Nợ', 'Loại Danh Mục', 'Tiền Tệ', 'Số Dư/Giá Trị (VND)', 'Định Giá Cuối', 'Trạng Thái Dữ Liệu'];
  
  const rows = netWorth.accounts.map((acc) => [
    `"${acc.name.replace(/"/g, '""')}"`,
    acc.type,
    acc.currency,
    formatMoney(acc.currentBalanceMinor, acc.currency).replace(/,/g, ''),
    new Date(acc.lastValuationAt).toISOString().split('T')[0],
    acc.isStale ? 'CẢNH BÁO CŨ (>14 ngày)' : 'CẬP NHẬT MỚI',
  ]);

  const summaryRows = [
    [],
    ['TỔNG QUAN TÀI SẢN RÒNG (NET WORTH)'],
    ['Tổng Tài Sản', formatMoney(netWorth.totalAssetsMinor, 'VND').replace(/,/g, '')],
    ['Tổng Khoản Nợ', formatMoney(netWorth.totalLiabilitiesMinor, 'VND').replace(/,/g, '')],
    ['Tài Sản Ròng (Net Worth)', formatMoney(netWorth.netWorthMinor, 'VND').replace(/,/g, '')],
    ['Ngày Báo Cáo', new Date().toLocaleDateString('vi-VN')],
  ];

  return [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    ...summaryRows.map((r) => r.join(',')),
  ].join('\n');
}

/**
 * Downloads a generated CSV string as a file.
 */
export function downloadCSVFile(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
