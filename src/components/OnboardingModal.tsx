'use client';

import { useState, useEffect } from 'react';
import {
  BrainCircuit, Wallet, Target, CheckCircle2,
  ChevronRight, Sparkles, X,
} from 'lucide-react';

const ONBOARDING_KEY = 'onboarding_completed_v1';

interface OnboardingModalProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: BrainCircuit,
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    title: 'Chào mừng đến AI Financial Hub! 🎉',
    subtitle: 'Hệ thống quản lý tài sản cá nhân thông minh',
    description:
      'AI Financial Hub giúp bạn theo dõi tài sản ròng, phân tích rủi ro, lên kế hoạch tài chính, và nhận cảnh báo thông minh — tất cả trong một nền tảng duy nhất.',
    tips: [
      '📊 Biểu đồ tài sản real-time',
      'AI phân tích & cảnh báo tài chính',
      '🎯 Theo dõi mục tiêu & tự do tài chính',
      '📤 Xuất báo cáo Excel/PDF chuyên nghiệp',
    ],
    cta: 'Bắt Đầu →',
  },
  {
    icon: Wallet,
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-400',
    dotColor: 'bg-blue-400',
    title: 'Bước 1: Thêm Tài Khoản Tài Sản 💼',
    subtitle: 'Ghi nhận tất cả tài sản và khoản nợ của bạn',
    description:
      'Bắt đầu bằng cách thêm các tài khoản: tiền mặt, ngân hàng, chứng khoán, vàng, bất động sản... Hệ thống sẽ tự động tính Net Worth của bạn.',
    tips: [
      '💵 CASH — Tiền mặt trong ví',
      '🏦 BANK — Tài khoản ngân hàng',
      '📈 STOCK — Danh mục chứng khoán',
      '🏠 Có thể thêm nợ (LIABILITY) để tính ròng',
    ],
    cta: 'Tiếp Theo →',
  },
  {
    icon: Target,
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-400',
    dotColor: 'bg-amber-400',
    title: 'Bước 2: Đặt Mục Tiêu Tài Chính 🎯',
    subtitle: 'Xác định đích đến để có hướng đi rõ ràng',
    description:
      'Tạo các mục tiêu như "Mua nhà 2B", "Nghỉ hưu ở tuổi 45", hay "Quỹ du lịch 100 triệu". Hệ thống sẽ theo dõi tiến độ và cảnh báo khi bạn gần đạt đích.',
    tips: [
      '🏠 Mua nhà / căn hộ',
      '🚗 Mua xe ô tô',
      '✈️ Du lịch / trải nghiệm',
      '🌅 Nghỉ hưu sớm (FIRE)',
    ],
    cta: 'Hoàn Thành & Bắt Đầu! ✅',
  },
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setVisible(true);
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setVisible(false);
    onComplete();
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      style={{ backgroundColor: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(6px)' }}
    >
      {/* Card — always dark regardless of theme */}
      <div
        className="relative rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300 border"
        style={{
          backgroundColor: '#0f172a',
          borderColor: '#1e293b',
          color: '#f8fafc',
        }}
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 rounded-xl transition-colors cursor-pointer"
          style={{ color: '#64748b' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          title="Bỏ qua"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? `w-6 ${s.dotColor}` : i < step ? 'w-2 bg-slate-600' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-2xl ${current.iconBg} flex items-center justify-center mx-auto mb-6 border`}
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <Icon className={`w-8 h-8 ${current.iconText}`} />
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: '#f8fafc' }}>
            {current.title}
          </h2>
          <p className="text-xs mb-4" style={{ color: '#64748b' }}>
            {current.subtitle}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
            {current.description}
          </p>
        </div>

        {/* Tips */}
        <div className="grid grid-cols-2 gap-2 mb-8">
          {current.tips.map((tip) => (
            <div
              key={tip}
              className="flex items-start gap-2 rounded-xl p-2.5 border"
              style={{ backgroundColor: 'rgba(30,41,59,0.8)', borderColor: '#334155' }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-snug" style={{ color: '#cbd5e1' }}>
                {tip}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-xs transition-colors cursor-pointer px-3 py-2"
              style={{ color: '#64748b' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              ← Quay lại
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="text-xs transition-colors cursor-pointer px-3 py-2"
              style={{ color: '#475569' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              Bỏ qua
            </button>
          )}

          <button
            onClick={isLast ? handleComplete : () => setStep((s) => s + 1)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-sm transition-all cursor-pointer shadow-lg"
            style={{ color: '#0f172a' }}
          >
            <Sparkles className="w-4 h-4" />
            {current.cta}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
