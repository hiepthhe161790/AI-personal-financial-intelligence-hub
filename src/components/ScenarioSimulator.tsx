'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Sparkles,
  Target,
  Calendar,
  Percent,
  DollarSign,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { ScenarioResult } from '@/domain/simulation';
import { formatMoney, minorToMajor, formatNumericInput } from '@/domain/money';

interface ScenarioSimulatorProps {
  currentNetWorthMinor: number;
}

export default function ScenarioSimulator({ currentNetWorthMinor }: ScenarioSimulatorProps) {
  const [initialNetWorthMajor, setInitialNetWorthMajor] = useState<string>(
    currentNetWorthMinor > 0 ? formatNumericInput(String(minorToMajor(currentNetWorthMinor, 'VND'))) : ''
  );
  const [monthlyContributionMajor, setMonthlyContributionMajor] = useState<string>('10,000,000'); // 10M VND default
  const [annualReturnRatePercent, setAnnualReturnRatePercent] = useState<number>(8.5); // 8.5% default
  const [annualInflationRatePercent, setAnnualInflationRatePercent] = useState<number>(3.0); // 3% inflation
  const [horizonYears, setHorizonYears] = useState<number>(10);
  const [targetGoalMajor, setTargetGoalMajor] = useState<string>('2,000,000,000'); // 2 Billion VND default

  const [simulationData, setSimulationData] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync initial net worth if props update
  useEffect(() => {
    if (currentNetWorthMinor > 0) {
      setInitialNetWorthMajor(formatNumericInput(String(minorToMajor(currentNetWorthMinor, 'VND'))));
    }
  }, [currentNetWorthMinor]);

  const runSimulation = useCallback(async () => {
    setLoading(true);
    try {
      const initNW = parseFloat(initialNetWorthMajor.replace(/,/g, '')) || 0;
      const monthlyCont = parseFloat(monthlyContributionMajor.replace(/,/g, '')) || 0;
      const targetG = parseFloat(targetGoalMajor.replace(/,/g, '')) || 0;
      const res = await fetch('/api/v1/scenarios/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialNetWorthMajor: initNW,
          monthlyContributionMajor: monthlyCont,
          annualReturnRatePercent,
          annualInflationRatePercent,
          horizonYears,
          targetGoalMajor: targetG > 0 ? targetG : undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setSimulationData(json.data);
      }
    } catch (err) {
      console.error('Failed to run scenario calculation:', err);
    } finally {
      setLoading(false);
    }
  }, [
    initialNetWorthMajor,
    monthlyContributionMajor,
    annualReturnRatePercent,
    annualInflationRatePercent,
    horizonYears,
    targetGoalMajor,
  ]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  // Format data points for Recharts
  const chartData = simulationData?.points.map((pt) => ({
    name: pt.yearLabel,
    'Tổng Tài Sản': minorToMajor(pt.totalAssetsMinor, 'VND'),
    'Vốn Gốc Đã Nộp': minorToMajor(pt.totalContributionsMinor, 'VND'),
    'Lãi Cộng Dồn': minorToMajor(pt.totalInterestEarnedMinor, 'VND'),
  })) || [];

  return (
    <div className="space-y-8">
      {/* Input Controls Card */}
      <div className="rounded-3xl bg-slate-950 dark:bg-slate-900/80 border border-slate-800 dark:border-emerald-500/30 p-6 sm:p-8 space-y-6 shadow-xl dark:shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">Mô Phỏng Tích Lũy & Tự Do Tài Chính</h3>
              <p className="text-xs text-slate-400">Động cơ tính toán lãi kép và sức mạnh lạm phát (Pure Math Engine)</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Deterministic Algorithm
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Initial Net Worth */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Tài Sản Khởi Điểm (VND)
            </label>
            <input
              type="text"
              value={initialNetWorthMajor}
              onChange={(e) => setInitialNetWorthMajor(formatNumericInput(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
            <div className="text-[11px] text-slate-400">
              {formatMoney(parseFloat(initialNetWorthMajor.replace(/,/g, '')) || 0, 'VND')}
            </div>
          </div>

          {/* Monthly Contribution */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Tiết Kiệm Mới / Tháng (VND)
            </label>
            <input
              type="text"
              value={monthlyContributionMajor}
              onChange={(e) => setMonthlyContributionMajor(formatNumericInput(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
            <div className="text-[11px] text-slate-400">
              {formatMoney(parseFloat(monthlyContributionMajor.replace(/,/g, '')) || 0, 'VND')}/tháng
            </div>
          </div>

          {/* Annual Return Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                Lãi Suất Kỳ Vọng (%/Năm)
              </span>
              <span className="text-emerald-400 font-bold font-mono">{annualReturnRatePercent}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="0.5"
              value={annualReturnRatePercent}
              onChange={(e) => setAnnualReturnRatePercent(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1% (Tiết kiệm)</span>
              <span>8.5% (Trung bình)</span>
              <span>25% (Tối ưu)</span>
            </div>
          </div>

          {/* Target Horizon Years */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Khung Thời Gian (Năm)
            </label>
            <select
              value={horizonYears}
              onChange={(e) => setHorizonYears(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value={3}>3 Năm (Ngắn hạn)</option>
              <option value={5}>5 Năm (Trung hạn)</option>
              <option value={10}>10 Năm (Dài hạn)</option>
              <option value={15}>15 Năm (Tích lũy)</option>
              <option value={20}>20 Năm (Nghỉ hưu)</option>
              <option value={30}>30 Năm (Tự do tài chính)</option>
            </select>
          </div>

          {/* Target Goal Amount */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Mục Tiêu Tài Sản Tới Hạn (VND)
            </label>
            <input
              type="text"
              value={targetGoalMajor}
              onChange={(e) => setTargetGoalMajor(formatNumericInput(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
            <div className="text-[11px] text-slate-400">
              {formatMoney(parseFloat(targetGoalMajor.replace(/,/g, '')) || 0, 'VND')}
            </div>
          </div>

          {/* Annual Inflation Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
              <span>Lạm Phát Dự Kiến (%/Năm)</span>
              <span className="text-amber-400 font-bold font-mono">{annualInflationRatePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={annualInflationRatePercent}
              onChange={(e) => setAnnualInflationRatePercent(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Target Goal Milestone Banner */}
      {simulationData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 p-5 space-y-1">
            <div className="text-xs font-semibold text-emerald-400 uppercase">Tổng Tài Sản Cuối Kỳ ({horizonYears} Năm)</div>
            <div className="text-2xl font-extrabold text-slate-100">
              {formatMoney(simulationData.finalAssetsMinor, 'VND')}
            </div>
            <div className="text-[11px] text-slate-400">
              Gồm {formatMoney(simulationData.totalDepositedMinor, 'VND')} tiền gốc
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/40 p-5 space-y-1">
            <div className="text-xs font-semibold text-indigo-400 uppercase">Lãi Lũy Kế Thu Được</div>
            <div className="text-2xl font-extrabold text-indigo-300">
              {formatMoney(simulationData.totalInterestEarnedMinor, 'VND')}
            </div>
            <div className="text-[11px] text-slate-400">
              Nhờ sức mạnh lãi kép qua {horizonYears} năm
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/40 p-5 space-y-1">
            <div className="text-xs font-semibold text-purple-400 uppercase flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Tiến Độ Mục Tiêu ({formatMoney(parseFloat(targetGoalMajor.replace(/,/g, '')) || 0, 'VND')})
            </div>
            {simulationData.targetGoalAchieved ? (
              <div className="text-xl font-extrabold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Đạt sau {simulationData.yearsToTargetGoal} năm</span>
              </div>
            ) : (
              <div className="text-sm font-semibold text-amber-400 mt-1">
                Chưa đạt mục tiêu trong {horizonYears} năm (Cần thêm tiết kiệm hoặc tăng lãi suất)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projection Chart Card */}
      <div className="rounded-3xl bg-slate-950 dark:bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Đồ Thị Dự Báo Tăng Trưởng Tài Sản Khai Thác Lãi Kép
          </h4>

          {loading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000000000).toFixed(1)} Tỷ`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(value: unknown) => [formatMoney(Number(value) || 0, 'VND'), '']}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="Tổng Tài Sản"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorAssets)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Vốn Gốc Đã Nộp"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorDeposits)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
