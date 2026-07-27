'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpDown, Loader2 } from 'lucide-react';
import type { DailyFlow } from '@/app/api/v1/cashflow/daily/route';
import { minorToMajor } from '@/domain/money';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function fmt(minor: number): string {
  const major = minorToMajor(minor, 'VND');
  if (major >= 1_000_000_000) return `${(major / 1_000_000_000).toFixed(1)}B`;
  if (major >= 1_000_000) return `${(major / 1_000_000).toFixed(0)}M`;
  if (major >= 1_000) return `${(major / 1_000).toFixed(0)}K`;
  return `${major}`;
}

function fmtFull(minor: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(minorToMajor(minor, 'VND')))} ₫`;
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/* ─── Custom Tooltip ───────────────────────────────────────────────────────── */
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailyFlow }>;
  label?: string;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  const topExpCats = Object.entries(d.expenseCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3.5 shadow-2xl min-w-[200px] text-xs">
      <p className="font-bold text-slate-300 mb-2">{d.date}</p>

      {d.totalIncomeMinor > 0 && (
        <div className="flex justify-between mb-1">
          <span className="text-emerald-400">📈 Thu nhập</span>
          <span className="font-bold text-emerald-400">{fmtFull(d.totalIncomeMinor)}</span>
        </div>
      )}

      {d.totalExpenseMinor > 0 && (
        <>
          <div className="flex justify-between mb-1">
            <span className="text-rose-400">📉 Chi tiêu</span>
            <span className="font-bold text-rose-400">{fmtFull(d.totalExpenseMinor)}</span>
          </div>
          {topExpCats.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-800 space-y-0.5">
              {topExpCats.map(([cat, val]) => (
                <div key={cat} className="flex justify-between text-slate-400">
                  <span className="truncate max-w-[110px]">{cat}</span>
                  <span className="text-slate-300 font-mono ml-2">{fmt(val)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {d.totalIncomeMinor === 0 && d.totalExpenseMinor === 0 && (
        <p className="text-slate-500 text-center py-1">Không có giao dịch</p>
      )}
    </div>
  );
}

/* ─── Summary Stat ─────────────────────────────────────────────────────────── */
function StatBadge({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-3 flex-1 min-w-0 text-center">
      <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-center gap-1">
        {icon}
        {label}
      </div>
      <div className={`text-sm font-bold font-mono truncate ${color}`}>{fmtFull(value)}</div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function DailyCashFlowChart() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<DailyFlow[]>([]);
  const [summary, setSummary] = useState({ totalIncomeMinor: 0, totalExpenseMinor: 0, netCashFlowMinor: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/cashflow/daily?days=${d}`);
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json() as { data: DailyFlow[]; summary: typeof summary };
      setData(json.data ?? []);
      setSummary(json.summary ?? { totalIncomeMinor: 0, totalExpenseMinor: 0, netCashFlowMinor: 0 });
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(days); }, [days, fetchData]);

  // For rendering, show every 5th tick label on 30-day view to avoid clutter
  const tickFormatter = (val: string, idx: number) => {
    if (days <= 7) return shortDate(val);
    return idx % 5 === 0 ? shortDate(val) : '';
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <ArrowUpDown className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Dòng Tiền Thu / Chi Hàng Ngày</h3>
            <p className="text-[11px] text-slate-400">{days} ngày gần nhất</p>
          </div>
        </div>

        {/* Period toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl border border-slate-700">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${days === d
                  ? 'bg-blue-500 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
                }`}
            >
              {d}N
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div style={{ height: 220 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang tải dữ liệu...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={tickFormatter}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmt}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b66' }} />
              <ReferenceLine y={0} stroke="#334155" />

              {/* Income bars */}
              <Bar dataKey="totalIncomeMinor" name="Thu nhập" maxBarSize={20} radius={[3, 3, 0, 0]}>
                {data.map((entry, idx) => (
                  <Cell
                    key={`inc-${idx}`}
                    fill={entry.totalIncomeMinor > 0 ? '#10b981' : '#1e293b'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>

              {/* Expense bars */}
              <Bar dataKey="totalExpenseMinor" name="Chi tiêu" maxBarSize={20} radius={[3, 3, 0, 0]}>
                {data.map((entry, idx) => (
                  <Cell
                    key={`exp-${idx}`}
                    fill={entry.totalExpenseMinor > 0 ? '#f43f5e' : '#1e293b'}
                    fillOpacity={0.75}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center text-[11px]">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
          Thu nhập
        </span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
          Chi tiêu
        </span>
      </div>

      {/* Summary footer */}
      <div className="flex gap-3 flex-wrap">
        <StatBadge
          label="Tổng Thu"
          value={summary.totalIncomeMinor}
          icon={<TrendingUp className="w-3 h-3 text-emerald-400" />}
          color="text-emerald-400"
        />
        <StatBadge
          label="Tổng Chi"
          value={summary.totalExpenseMinor}
          icon={<TrendingDown className="w-3 h-3 text-rose-400" />}
          color="text-rose-400"
        />
        <StatBadge
          label="Dòng Tiền Ròng"
          value={Math.abs(summary.netCashFlowMinor)}
          icon={<ArrowUpDown className="w-3 h-3" />}
          color={summary.netCashFlowMinor >= 0 ? 'text-emerald-400' : 'text-rose-400'}
        />
      </div>
    </div>
  );
}
