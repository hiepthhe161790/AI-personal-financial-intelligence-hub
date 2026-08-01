'use client';

import { useState } from 'react';
import { Award, Compass, Heart, ShieldAlert, Sparkles, Lightbulb } from 'lucide-react';
import { minorToMajor } from '@/domain/money';

interface FinancialFreedomMilestonesProps {
  currentNetWorthMinor: number;
}

export default function FinancialFreedomMilestones({ currentNetWorthMinor }: FinancialFreedomMilestonesProps) {
  const [monthlyExpensesMajor, setMonthlyExpensesMajor] = useState(15000000); // Default 15 million VND

  const netWorthMajor = Math.max(0, minorToMajor(currentNetWorthMinor, 'VND'));

  // Define Milestone Levels
  const levels = [
    {
      id: 1,
      title: 'Bảo hiểm Tài chính (Financial Security)',
      description: 'Quỹ khẩn cấp đủ sống tối thiểu trong 6 tháng không cần thu nhập.',
      target: monthlyExpensesMajor * 6,
      icon: <Heart className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      progressColor: 'bg-emerald-500',
    },
    {
      id: 2,
      title: 'Độc lập Tài chính (Financial Independence)',
      description: 'Tài sản đủ lớn để lợi nhuận sinh ra tự lo sinh hoạt trọn đời (Quy tắc 4% / 25 năm chi tiêu).',
      target: monthlyExpensesMajor * 12 * 25,
      icon: <Compass className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400',
      progressColor: 'bg-indigo-500',
    },
    {
      id: 3,
      title: 'Tự do Tài chính (Financial Freedom)',
      description: 'Tài sản cực kỳ vững chắc, đáp ứng trọn vẹn cả nhu cầu sống cao cấp trọn đời (50 năm chi tiêu).',
      target: monthlyExpensesMajor * 12 * 50,
      icon: <Award className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
      progressColor: 'bg-amber-500',
    },
  ];

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Title block */}
      <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-md font-bold text-slate-100">Bậc Thang Cột Mốc Tự Do Tài Chính</h4>
          <p className="text-xs text-slate-400">Định vị vị thế tài sản ròng hiện tại của bạn trên hành trình tự chủ tài chính</p>
        </div>
      </div>

      {/* Expense Slider Config Card */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-300">Chi tiêu sinh hoạt ước tính hàng tháng:</span>
          <span className="font-black text-indigo-400 text-sm">
            {monthlyExpensesMajor.toLocaleString('vi-VN')} đ <span className="text-[10px] text-slate-400 font-normal">/tháng</span>
          </span>
        </div>

        <input
          type="range"
          min={5000000}
          max={100000000}
          step={1000000}
          value={monthlyExpensesMajor}
          onChange={(e) => setMonthlyExpensesMajor(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />

        <p className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span>Kéo thanh trượt để thay đổi mức chi tiêu dự trù. Hệ thống sẽ tính toán lại mục tiêu của các cột mốc tương ứng thời gian thực.</span>
        </p>
      </div>

      {/* Milestones levels stack */}
      <div className="space-y-4">
        {levels.map((level) => {
          const percent = level.target > 0 ? (netWorthMajor / level.target) * 100 : 0;
          const isAchieved = netWorthMajor >= level.target;

          return (
            <div
              key={level.id}
              className={`rounded-2xl bg-gradient-to-r border p-5 space-y-4 shadow-sm transition-all duration-300 ${level.color}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-center shrink-0">
                    {level.icon}
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-sm font-extrabold text-slate-100">{level.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-lg">{level.description}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mục tiêu tài sản</div>
                  <div className="text-md font-black text-slate-100">{level.target.toLocaleString('vi-VN')} đ</div>
                  {isAchieved ? (
                    <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block mt-1">
                      ĐÃ ĐẠT ĐƯỢC 🎉
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-slate-950/60 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full inline-block mt-1">
                      Còn thiếu {(level.target - netWorthMajor).toLocaleString('vi-VN')} đ
                    </span>
                  )}
                </div>
              </div>

              {/* Progress meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Tiến độ tích lũy:</span>
                  <span className="font-bold text-slate-200">{percent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-550 ${level.progressColor}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning message */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 flex items-start gap-3 text-slate-400 text-xs">
        <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
        <p className="leading-relaxed">
          Tài sản ròng hiện tại của bạn: <span className="font-extrabold text-slate-200">{netWorthMajor.toLocaleString('vi-VN')} đ</span>.
          Các phép tính trên được xây dựng trên phương pháp lập kế hoạch tài chính cá nhân chuẩn quốc tế. Cố gắng tích lũy nâng cao thu nhập & đầu tư lãi kép để sớm đạt được Độc lập Tài chính!
        </p>
      </div>
    </div>
  );
}
