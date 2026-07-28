'use client';

import { Activity, ShieldCheck, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { NetWorthOverview } from '@/domain/net-worth';
import { evaluateFinancialHealth } from '@/domain/financial-health';

interface FinancialHealthCardProps {
  data: NetWorthOverview | null;
}

export default function FinancialHealthCard({ data }: FinancialHealthCardProps) {
  if (!data) return null;

  const health = evaluateFinancialHealth(data);

  const gradeColors = {
    EXCELLENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    GOOD: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    FAIR: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const gradeLabels = {
    EXCELLENT: 'XUẤT SẮC',
    GOOD: 'TỐT',
    FAIR: 'TRUNG BÌNH',
    CRITICAL: 'CẢNH BÁO RỦI RO',
  };

  return (
    <div className="rounded-3xl bg-slate-950 dark:bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Chỉ Số Sức Khỏe Tài Chính (Health Score)</h3>
            <p className="text-xs text-slate-400">Đánh giá sức chịu đựng rủi ro & tỷ lệ phân bổ tài sản</p>
          </div>
        </div>

        <div className={`px-4 py-1.5 rounded-full border text-xs font-extrabold ${gradeColors[health.grade]}`}>
          {gradeLabels[health.grade]} ({health.score}/100)
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/50 dark:bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Quỹ Dự Phòng Khẩn Cấp</div>
          <div className="text-xl font-extrabold text-emerald-400">
            {health.emergencyFundMonths} <span className="text-xs font-normal text-slate-300">tháng</span>
          </div>
          <p className="text-[10px] text-slate-500">Tiền mặt/Tiết kiệm duy trì chi tiêu sinh hoạt</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 dark:bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Tỷ Lệ Nợ / Tài Sản</div>
          <div className="text-xl font-extrabold text-amber-400">
            {health.debtToAssetRatioPercent}%
          </div>
          <p className="text-[10px] text-slate-500">Mức an toàn khuyến nghị dưới 30%</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 dark:bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Tỷ Lệ Tài Sản Thanh Khoản</div>
          <div className="text-xl font-extrabold text-teal-400">
            {health.liquidityRatioPercent}%
          </div>
          <p className="text-[10px] text-slate-500">Khả năng chuyển đổi nhanh thành tiền mặt</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/30 dark:bg-slate-950/60 border border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Gợi Ý Tối Ưu Cấu Trúc Danh Mục Tài Sản:
        </h4>
        <ul className="space-y-1.5 pl-6 text-xs text-slate-400 list-disc">
          {health.recommendations.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
