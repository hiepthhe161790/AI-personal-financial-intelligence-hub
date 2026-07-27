'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AccountSummary } from '@/domain/net-worth';
import { AccountType } from '@/models/Account';
import { formatMoney, minorToMajor } from '@/domain/money';
import { PieChart as PieIcon } from 'lucide-react';

/* ─── Colour palette per account type ─────────────────────────────────────── */
const TYPE_CONFIG: Record<
  AccountType,
  { label: string; color: string; bg: string }
> = {
  CASH:        { label: 'Tiền Mặt',      color: '#10b981', bg: 'bg-emerald-500' },
  BANK:        { label: 'Ngân Hàng',     color: '#3b82f6', bg: 'bg-blue-500'    },
  SAVINGS:     { label: 'Tiết Kiệm',     color: '#06b6d4', bg: 'bg-cyan-500'    },
  GOLD:        { label: 'Vàng',          color: '#f59e0b', bg: 'bg-amber-500'   },
  STOCK:       { label: 'Chứng Khoán',   color: '#8b5cf6', bg: 'bg-violet-500'  },
  FUND:        { label: 'Quỹ Đầu Tư',   color: '#a78bfa', bg: 'bg-violet-400'  },
  CRYPTO:      { label: 'Crypto',        color: '#f97316', bg: 'bg-orange-500'  },
  OTHER_ASSET: { label: 'Tài Sản Khác',  color: '#64748b', bg: 'bg-slate-500'   },
  LIABILITY:   { label: 'Khoản Nợ',      color: '#f43f5e', bg: 'bg-rose-500'    },
};

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
interface AllocationSlice {
  type: AccountType;
  label: string;
  color: string;
  bg: string;
  totalMinor: number;
  percentage: number;
}

function buildAllocationData(
  accounts: AccountSummary[],
  totalAssetsMinor: number,
  showLiabilities: boolean,
): AllocationSlice[] {
  const map = new Map<AccountType, number>();
  for (const acc of accounts) {
    if (!showLiabilities && acc.type === 'LIABILITY') continue;
    map.set(acc.type, (map.get(acc.type) ?? 0) + acc.currentBalanceMinor);
  }

  const total = showLiabilities ? totalAssetsMinor : totalAssetsMinor; // always use asset total for %
  const slices: AllocationSlice[] = [];
  map.forEach((minor, type) => {
    if (minor <= 0) return;
    slices.push({
      type,
      label: TYPE_CONFIG[type]?.label ?? type,
      color: TYPE_CONFIG[type]?.color ?? '#64748b',
      bg:    TYPE_CONFIG[type]?.bg ?? 'bg-slate-500',
      totalMinor: minor,
      percentage: total > 0 ? (minor / total) * 100 : 0,
    });
  });

  return slices.sort((a, b) => b.totalMinor - a.totalMinor);
}

/* ─── Custom Tooltip ───────────────────────────────────────────────────────── */
interface TooltipPayload {
  payload?: {
    label: string;
    totalMinor: number;
    percentage: number;
    color: string;
  };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  if (!d) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 shadow-xl text-sm">
      <div className="font-bold text-slate-100 mb-1 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
        {d.label}
      </div>
      <div className="text-emerald-400 font-mono font-bold">
        {formatMoney(d.totalMinor, 'VND')}
      </div>
      <div className="text-slate-400 text-xs mt-0.5">
        {d.percentage.toFixed(1)}% tổng tài sản
      </div>
    </div>
  );
}

/* ─── Centre label rendered as SVG text ───────────────────────────────────── */
interface CentreProps {
  cx: number;
  cy: number;
  netWorthMinor: number;
  isPrivate: boolean;
}

function CentreLabel({ cx, cy, netWorthMinor, isPrivate }: CentreProps) {
  const value = isPrivate
    ? '••••••'
    : formatMoney(netWorthMinor, 'VND');
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#94a3b8" fontSize={10} fontFamily="sans-serif">
        TÀI SẢN RÒNG
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#10b981" fontSize={13} fontWeight="bold" fontFamily="sans-serif">
        {value}
      </text>
    </g>
  );
}

/* ─── Props ────────────────────────────────────────────────────────────────── */
interface PortfolioAllocationChartProps {
  accounts: AccountSummary[];
  totalAssetsMinor: number;
  totalLiabilitiesMinor: number;
  netWorthMinor: number;
  isPrivate?: boolean;
}

/* ─── Main component ───────────────────────────────────────────────────────── */
export default function PortfolioAllocationChart({
  accounts,
  totalAssetsMinor,
  totalLiabilitiesMinor,
  netWorthMinor,
  isPrivate = false,
}: PortfolioAllocationChartProps) {
  const assetSlices = useMemo(
    () => buildAllocationData(accounts, totalAssetsMinor, false),
    [accounts, totalAssetsMinor],
  );

  const liabilityMinor = totalLiabilitiesMinor;
  const hasData = assetSlices.length > 0;

  if (!hasData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[240px] gap-3">
        <PieIcon className="w-10 h-10 text-slate-600" />
        <p className="text-slate-400 text-sm">Chưa có tài sản nào để phân tích.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <PieIcon className="w-4.5 h-4.5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Phân Bổ Danh Mục Tài Sản</h3>
            <p className="text-[11px] text-slate-400">Cơ cấu tài sản theo từng loại hình đầu tư</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
          {assetSlices.length} loại tài sản
        </div>
      </div>

      {/* Chart + Breakdown side-by-side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Donut Chart */}
        <div className="relative" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assetSlices}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={110}
                paddingAngle={3}
                dataKey="totalMinor"
                nameKey="label"
                isAnimationActive
                animationBegin={0}
                animationDuration={800}
              >
                {assetSlices.map((slice) => (
                  <Cell
                    key={slice.type}
                    fill={slice.color}
                    stroke="transparent"
                    style={{ filter: 'drop-shadow(0 0 6px ' + slice.color + '55)' }}
                  />
                ))}
              </Pie>

              {/* Custom tooltip */}
              <Tooltip content={<CustomTooltip />} />

              {/* Centre net worth label — rendered via customized label prop trick */}
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#94a3b8"
                fontSize={9}
                fontFamily="sans-serif"
              >
                TÀI SẢN RÒNG
              </text>
              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#10b981"
                fontSize={11}
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {isPrivate ? '••••••' : formatMoney(netWorthMinor, 'VND')}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown List */}
        <div className="space-y-2.5">
          {assetSlices.map((slice) => (
            <div key={slice.type} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: slice.color }}
                  />
                  <span className="text-xs font-semibold text-slate-300">{slice.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isPrivate ? '•••' : formatMoney(slice.totalMinor, 'VND')}
                  </span>
                  <span
                    className="text-[11px] font-bold w-10 text-right"
                    style={{ color: slice.color }}
                  >
                    {slice.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(slice.percentage, 100)}%`,
                    background: slice.color,
                    boxShadow: `0 0 6px ${slice.color}66`,
                  }}
                />
              </div>
            </div>
          ))}

          {/* Liability summary row */}
          {liabilityMinor > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-rose-500" />
                  <span className="text-xs font-semibold text-slate-300">Khoản Nợ (không tính)</span>
                </div>
                <span className="text-[11px] font-bold text-rose-400 font-mono">
                  {isPrivate ? '•••' : `- ${formatMoney(liabilityMinor, 'VND')}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary footer row */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800">
        {[
          { label: 'Tổng Tài Sản', value: totalAssetsMinor, color: 'text-emerald-400' },
          { label: 'Tổng Nợ', value: liabilityMinor, color: 'text-rose-400' },
          { label: 'Tài Sản Ròng', value: netWorthMinor, color: netWorthMinor >= 0 ? 'text-emerald-400' : 'text-rose-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-950/60 rounded-2xl p-3 text-center border border-slate-800/60">
            <div className="text-[10px] text-slate-500 mb-1">{label}</div>
            <div className={`text-sm font-bold font-mono ${color}`}>
              {isPrivate ? '•••' : formatMoney(value, 'VND')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
