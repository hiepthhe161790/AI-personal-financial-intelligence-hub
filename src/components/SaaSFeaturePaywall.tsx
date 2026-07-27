'use client';

import { useState } from 'react';
import { Crown, Check, X, Sparkles, Zap, QrCode, ShieldCheck, Loader2 } from 'lucide-react';
import { SAAS_PLANS } from '@/domain/subscription-plan';
import { PayOSPaymentResult } from '@/lib/payos';

interface SaaSFeaturePaywallProps {
  featureTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess?: () => void;
}

export default function SaaSFeaturePaywall({
  featureTitle = 'Học Viện Đào Tạo AI Financial Academy',
  isOpen,
  onClose,
  onUpgradeSuccess,
}: SaaSFeaturePaywallProps) {
  const [loadingQr, setLoadingQr] = useState(false);
  const [checkoutData, setCheckoutData] = useState<PayOSPaymentResult | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleCreateQr = async (plan: 'PRO_1_MONTH' | 'PRO_1_YEAR') => {
    setLoadingQr(true);
    try {
      const res = await fetch('/api/v1/payment/create-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setCheckoutData(json.data);
      }
    } catch (err) {
      console.error('Failed to create VietQR payment:', err);
    } finally {
      setLoadingQr(false);
    }
  };

  const handleConfirmPaid = () => {
    setUpgrading(true);
    setTimeout(() => {
      setUpgrading(false);
      if (onUpgradeSuccess) onUpgradeSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-100">Nâng Cấp Gói SaaS Pro</h3>
              <p className="text-xs text-amber-400 font-semibold">{featureTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!checkoutData ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Quyền Lợi Gói Chuyên Nghiệp (Pro Tier):
              </div>
              <p className="text-xs text-slate-300">{SAAS_PLANS.PRO.description}</p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Scan Sao Kê Ngân Hàng & Chứng Từ Bằng AI OCR Không Giới Hạn</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Động cơ Tái Cân Đối Danh Mục Tài Sản (Portfolio Rebalancing)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>AI Academy Mentorship Coach & Trợ lý Phân Tích Rủi Ro 24/7</span>
              </li>
            </ul>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleCreateQr('PRO_1_MONTH')}
                disabled={loadingQr}
                className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 hover:border-amber-400 text-left space-y-1 transition-all cursor-pointer group"
              >
                <div className="text-xs text-slate-400">Gói 1 Tháng</div>
                <div className="text-lg font-extrabold text-amber-400">99.000đ / tháng</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <QrCode className="w-3 h-3" /> Quét mã VietQR Tự Động
                </div>
              </button>

              <button
                onClick={() => handleCreateQr('PRO_1_YEAR')}
                disabled={loadingQr}
                className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 text-left space-y-1 transition-all cursor-pointer group relative overflow-hidden"
              >
                <span className="absolute top-2 right-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                  TIẾT KIỆM 25%
                </span>
                <div className="text-xs text-slate-400">Gói 1 Năm</div>
                <div className="text-lg font-extrabold text-emerald-400">899.000đ / năm</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <QrCode className="w-3 h-3" /> Quét mã VietQR Tự Động
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* VietQR Checkout Screen */
          <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 inline-block w-full">
              <div className="text-xs font-bold text-slate-300">
                Mã đơn hàng: <span className="text-amber-400 font-mono">#{checkoutData.orderCode}</span>
              </div>

              {/* VietQR Image */}
              <div className="w-56 h-56 mx-auto bg-white p-2 rounded-2xl shadow-lg border border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={checkoutData.qrCodeUrl}
                  alt="VietQR Payment"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <div className="text-xs space-y-1 text-slate-400 font-mono">
                <div>Ngân hàng: <span className="text-slate-100 font-bold">{checkoutData.bankName}</span></div>
                <div>Số tài khoản: <span className="text-emerald-400 font-bold">{checkoutData.accountNumber}</span></div>
                <div>Chủ tài khoản: <span className="text-slate-100 font-bold">{checkoutData.accountName}</span></div>
                <div className="text-sm font-extrabold text-amber-400 pt-1">
                  Số tiền: {checkoutData.amount.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCheckoutData(null)}
                className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Quay Lại
              </button>
              <button
                onClick={handleConfirmPaid}
                disabled={upgrading}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang Xác Nhận Đã Chuyển Khoản...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Tôi Đã Thanh Toán Khớp Lệnh</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

