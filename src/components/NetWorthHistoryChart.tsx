'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  History,
  Camera,
  Loader2,
  Sparkles
} from 'lucide-react';
import { formatMoney, minorToMajor } from '@/domain/money';

interface SnapshotPoint {
  date: string;
  monthLabel: string;
  totalAssetsMajor: number;
  totalLiabilitiesMajor: number;
  netWorthMajor: number;
}

interface ChartDataPoint {
  name: string;
  'Tài Sản Ròng (Net Worth)'?: number;
  'Tổng Tài Sản'?: number;
  'Tổng Nợ'?: number;
  'Dự Báo (Cơ bản)'?: number;
  'Kịch Bản Tốt'?: number;
  'Kịch Bản Xấu'?: number;
}

export default function NetWorthHistoryChart() {
  const [history, setHistory] = useState<SnapshotPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [savingsRate, setSavingsRate] = useState(10000000); // Default 10M VND
  const [showForecast, setShowForecast] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/snapshots/history');
      const json = await res.json();

      let monthlySavings = 10000000;
      try {
        const goalsRes = await fetch('/api/v1/goals');
        const goalsJson = await goalsRes.json();
        if (goalsRes.ok && goalsJson.status === 'success') {
          const savingsMinor = goalsJson.data.monthlySavingsMinor;
          if (savingsMinor > 0) {
            monthlySavings = minorToMajor(savingsMinor, 'VND');
          }
        }
      } catch (err) {
        console.error('Failed to fetch savings rate for chart forecast:', err);
      }

      if (res.ok && json.status === 'success') {
        setHistory(json.data);
        setSavingsRate(monthlySavings);
      }
    } catch (err) {
      console.error('Failed to fetch snapshot history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [fetchHistory]);

  const captureSnapshotNow = async () => {
    setCapturing(true);
    try {
      const res = await fetch('/api/v1/snapshots/history', { method: 'POST' });
      if (res.ok) {
        await fetchHistory();
      }
    } catch (err) {
      console.error('Failed to capture snapshot:', err);
    } finally {
      setCapturing(false);
    }
  };

  // Build combined history and forecast chart points
  const chartData: ChartDataPoint[] = history.map((h) => ({
    name: h.monthLabel,
    'Tài Sản Ròng (Net Worth)': h.netWorthMajor,
    'Tổng Tài Sản': h.totalAssetsMajor,
    'Tổng Nợ': h.totalLiabilitiesMajor,
    'Dự Báo (Cơ bản)': undefined,
    'Kịch Bản Tốt': undefined,
    'Kịch Bản Xấu': undefined,
  }));

  // Append 12-month projections if showForecast is enabled
  if (showForecast && history.length > 0) {
    const lastPoint = history[history.length - 1];
    const lastNetWorth = lastPoint.netWorthMajor;

    // Connect forecast lines to the last history point (bridge point)
    if (chartData.length > 0) {
      chartData[chartData.length - 1]['Dự Báo (Cơ bản)'] = lastNetWorth;
      chartData[chartData.length - 1]['Kịch Bản Tốt'] = lastNetWorth;
      chartData[chartData.length - 1]['Kịch Bản Xấu'] = lastNetWorth;
    }

    const baseDate = lastPoint.date ? new Date(lastPoint.date) : new Date();

    for (let m = 1; m <= 12; m++) {
      const forecastDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + m, 1);

      const baseForecast = Math.round(lastNetWorth + m * savingsRate);
      const bestCase = Math.round(lastNetWorth * Math.pow(1 + 0.10 / 12, m) + m * savingsRate);
      const worstCase = Math.round(lastNetWorth * Math.pow(1 - 0.05 / 12, m) + m * savingsRate);

      chartData.push({
        name: forecastDate.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }) + ' (Dự báo)',
        'Tài Sản Ròng (Net Worth)': undefined,
        'Tổng Tài Sản': undefined,
        'Tổng Nợ': undefined,
        'Dự Báo (Cơ bản)': baseForecast,
        'Kịch Bản Tốt': bestCase,
        'Kịch Bản Xấu': worstCase,
      });
    }
  }

  return (
    <div className="rounded-3xl bg-slate-950 dark:bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Lịch Sử Biến Động Tài Sản Ròng (Net Worth History)</h3>
            <p className="text-xs text-slate-400">Ghi nhận Snapshots theo thời gian (Append-only snapshots)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Toggle Switch */}
          <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-900/40 hover:bg-slate-900 dark:bg-slate-950/60 dark:hover:bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 select-none transition-colors">
            <input
              type="checkbox"
              checked={showForecast}
              onChange={() => setShowForecast(!showForecast)}
              className="sr-only peer"
            />
            <div className="relative w-8 h-4.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 peer-checked:after:bg-indigo-400 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-950/80 border peer-checked:border-indigo-500/30"></div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dự báo 12 tháng</span>
            </div>
          </label>

          <button
            onClick={captureSnapshotNow}
            disabled={capturing}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {capturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>Chụp Snapshot Hôm Nay</span>
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-800)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Tr`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--slate-950)',
                  borderColor: 'var(--slate-800)',
                  borderRadius: '12px',
                  color: 'var(--slate-100)',
                }}
                formatter={(val: unknown) => [formatMoney(Number(val) || 0, 'VND'), '']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Tài Sản Ròng (Net Worth)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="Tổng Tài Sản"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="Tổng Nợ"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              {showForecast && (
                <>
                  <Line
                    type="monotone"
                    dataKey="Dự Báo (Cơ bản)"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Kịch Bản Tốt"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Kịch Bản Xấu"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
