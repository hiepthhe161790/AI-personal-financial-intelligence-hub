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
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    title: 'Chào mừng đến AI Financial Hub! 🎉',
    subtitle: 'Hệ thống quản lý tài sản cá nhân thông minh',
    description:
      'AI Financial Hub giúp bạn theo dõi tài sản ròng, phân tích rủi ro, lên kế hoạch tài chính, và nhận cảnh báo thông minh — tất cả trong một nền tảng duy nhất.',
    tips: [
      '📊 Biểu đồ tài sản real-time',
      '🤖 AI phân tích & cảnh báo tài chính',
      '🎯 Theo dõi mục tiêu & tự do tài chính',
      '📤 Xuất báo cáo Excel/PDF chuyên nghiệp',
    ],
    cta: 'Bắt Đầu →',
  },
  {
    icon: Wallet,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
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
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-4 duration-300">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          title="Bỏ qua"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-emerald-400' : i < step ? 'w-2 bg-emerald-600' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl ${current.bg} border ${current.border} flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`w-8 h-8 ${current.color}`} />
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-1">{current.title}</h2>
          <p className="text-xs text-slate-400 mb-4">{current.subtitle}</p>
          <p className="text-sm text-slate-300 leading-relaxed">{current.description}</p>
        </div>

        {/* Tips */}
        <div className="grid grid-cols-2 gap-2 mb-8">
          {current.tips.map((tip) => (
            <div
              key={tip}
              className="flex items-start gap-2 bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[11px] text-slate-300 leading-snug">{tip}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer px-3 py-2"
            >
              ← Quay lại
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer px-3 py-2"
            >
              Bỏ qua
            </button>
          )}

          <button
            onClick={isLast ? handleComplete : () => setStep((s) => s + 1)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
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
