'use client';

import { NetWorthOverview } from '@/domain/net-worth';
import { formatMoney } from '@/domain/money';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface NetWorthCardProps {
  data: NetWorthOverview | null;
  loading: boolean;
  isPrivate?: boolean;
  onTogglePrivacy?: () => void;
}

export default function NetWorthCard({ data, loading, isPrivate = false, onTogglePrivacy }: NetWorthCardProps) {
  if (loading) {
    return (
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/4" />
        <div className="h-10 bg-slate-800 rounded w-1/2" />
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="h-16 bg-slate-800 rounded" />
          <div className="h-16 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { netWorthMinor, totalAssetsMinor, totalLiabilitiesMinor, currency, staleCount } = data;

  const displayAmount = (minor: number) => {
    if (isPrivate) return '•••••••• VNĐ';
    return formatMoney(minor, currency);
  };

  return (
    <div className="space-y-4">
      {/* Stale Data Warning Banner */}
      {staleCount > 0 && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center gap-3 text-amber-300 shadow-lg">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <div className="text-sm font-medium">
            Có <span className="font-bold underline">{staleCount} danh mục tài sản</span> chưa được cập nhật định giá quá <span className="font-bold">14 ngày</span>. Hãy kiểm tra và cập nhật lại số dư.
          </div>
        </div>
      )}

      {/* Main Net Worth Glassmorphism Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-emerald-950/40 border border-emerald-500/30 p-8 space-y-6 shadow-2xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Tổng Tài Sản Ròng (Net Worth)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onTogglePrivacy && (
              <button
                onClick={onTogglePrivacy}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-all cursor-pointer"
                title={isPrivate ? 'Hiện số tiền' : 'Ẩn số tiền (Bảo mật)'}
              >
                {isPrivate ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
              </button>
            )}

            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700">
              {currency}
            </span>
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
            {displayAmount(netWorthMinor)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Được tính toán bằng cách tổng hợp tất cả tài sản trừ đi các khoản nợ.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Tổng Tài Sản (Assets)</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {displayAmount(totalAssetsMinor)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Tổng Nợ (Liabilities)</div>
              <div className="text-lg font-bold text-rose-400 mt-0.5">
                {displayAmount(totalLiabilitiesMinor)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
