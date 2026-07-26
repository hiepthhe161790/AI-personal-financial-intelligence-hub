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
  TrendingUp, 
  Loader2, 
  CalendarCheck 
} from 'lucide-react';
import { formatMoney } from '@/domain/money';

interface SnapshotPoint {
  date: string;
  monthLabel: string;
  totalAssetsMajor: number;
  totalLiabilitiesMajor: number;
  netWorthMajor: number;
}

export default function NetWorthHistoryChart() {
  const [history, setHistory] = useState<SnapshotPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/snapshots/history');
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setHistory(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch snapshot history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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

  const chartData = history.map((h) => ({
    name: h.monthLabel,
    'Tài Sản Ròng (Net Worth)': h.netWorthMajor,
    'Tổng Tài Sản': h.totalAssetsMajor,
    'Tổng Nợ': h.totalLiabilitiesMajor,
  }));

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Lịch Sử Biến Động Tài Sản Ròng (Net Worth History)</h3>
            <p className="text-xs text-slate-400">Ghi nhận Snapshots theo thời gian (Append-only snapshots)</p>
          </div>
        </div>

        <button
          onClick={captureSnapshotNow}
          disabled={capturing}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          {capturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          <span>Chụp Snapshot Hôm Nay</span>
        </button>
      </div>

      <div className="h-72 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Tr`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
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
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
