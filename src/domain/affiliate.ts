export interface AffiliateOffer {
  id: string;
  category: 'STOCK' | 'BANK' | 'FUND' | 'INSURANCE';
  title: string;
  partnerName: string;
  badgeText: string;
  commissionEstimate: string;
  description: string;
  reflink: string;
  logoBgColor: string;
}

export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: 'OFFER-TCBS',
    category: 'STOCK',
    title: 'Mở Tài Khoản Chứng Khoán TCBS iConnect',
    partnerName: 'Công ty Chứng Khoán Techcombank (TCBS)',
    badgeText: 'Miễn Phí Giao Dịch',
    commissionEstimate: 'Nhận đến 500,000đ / tài khoản',
    description: 'Miễn phí giao dịch cổ phiếu & trái phiếu, tích hợp quản lý tài sản thông minh tự động.',
    reflink: process.env.NEXT_PUBLIC_AFFILIATE_TCBS || 'https://tcbs.com.vn/',
    logoBgColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    id: 'OFFER-VPS',
    category: 'STOCK',
    title: 'Mở Tài Khoản Chứng Khoán VPS SmartOne',
    partnerName: 'Công ty Chứng Khoán VPS',
    badgeText: 'Số 1 Thị Phần HOSE',
    commissionEstimate: 'Nhận 300,000đ / tài khoản',
    description: 'Mở tài khoản eKYC trong 3 phút, tặng gói tư vấn tín hiệu AI khớp lệnh giao dịch.',
    reflink: process.env.NEXT_PUBLIC_AFFILIATE_VPS || 'https://vps.com.vn/',
    logoBgColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  {
    id: 'OFFER-VPBANK',
    category: 'BANK',
    title: 'Mở Thẻ Tín Dụng VPBank Cashback 10%',
    partnerName: 'Ngân Hàng VPBank',
    badgeText: 'Duyệt Hồ Sơ Online 5 Phút',
    commissionEstimate: 'Nhận 600,000đ / thẻ duyệt',
    description: 'Hoàn tiền đến 10% cho mọi chi tiêu siêu thị, mua sắm online & thanh toán hóa đơn.',
    reflink: process.env.NEXT_PUBLIC_AFFILIATE_VPBANK || 'https://www.vpbank.com.vn/',
    logoBgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
];
