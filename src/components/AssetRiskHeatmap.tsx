'use client';

import { useMemo } from 'react';
import { ShieldAlert, Flame } from 'lucide-react';
import { NetWorthOverview } from '@/domain/net-worth';
import { calculateAssetRiskHeatmap } from '@/domain/wealth-goal';
import { formatMoney } from '@/domain/money';

interface AssetRiskHeatmapProps {
  netWorthData: NetWorthOverview | null;
}

export default function AssetRiskHeatmap({ netWorthData }: AssetRiskHeatmapProps) {
  const heatmap = useMemo(() => {
    return calculateAssetRiskHeatmap(netWorthData);
  }, [netWorthData]);

  if (!netWorthData || netWorthData.accounts.length === 0) return null;

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Bản Đồ Phân Tải Rủi Ro 4 Tầng (Asset Risk Heatmap)</span>
            </h3>
            <p className="text-xs text-slate-400">Rà soát mức độ mạo hiểm & độ an toàn của danh mục tài sản cá nhân</p>
          </div>
        </div>
      </div>

      {/* Warning Banner if risk thresholds exceeded */}
      {heatmap.warningMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{heatmap.warningMessage}</span>
        </div>
      )}

      {/* 4 Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {heatmap.tiers.map((tier) => (
          <div
            key={tier.tier}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${tier.badgeColor}`}>
                {tier.tierNameVi}
              </span>
              <span className="text-lg font-extrabold text-white font-mono">{tier.percentage}%</span>
            </div>

            <div className="text-base font-extrabold text-slate-100">
              {formatMoney(Math.round(tier.totalValueVND * 100), 'VND')}
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${
                  tier.tier === 'TIER_1_SAFE'
                    ? 'bg-emerald-400'
                    : tier.tier === 'TIER_2_GROWTH'
                    ? 'bg-indigo-400'
                    : tier.tier === 'TIER_3_SPECULATIVE'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
                style={{ width: `${tier.percentage}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">{tier.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
