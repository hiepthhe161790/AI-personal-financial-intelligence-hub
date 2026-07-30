'use client';

import { useState } from 'react';
import { AccountSummary } from '@/domain/net-worth';
import { formatMoney } from '@/domain/money';
import {
  Building2,
  Wallet,
  PiggyBank,
  Coins,
  LineChart,
  PieChart,
  Bitcoin,
  Package,
  CreditCard,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2
} from 'lucide-react';
import EditAccountModal from './EditAccountModal';

interface AccountListProps {
  accounts: AccountSummary[];
  loading: boolean;
  onSuccess?: () => void;
}

const TYPE_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  CASH: { icon: Wallet, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Tiền Mặt' },
  BANK: { icon: Building2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Ngân Hàng' },
  SAVINGS: { icon: PiggyBank, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20', label: 'Tiết Kiệm' },
  GOLD: { icon: Coins, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Vàng' },
  STOCK: { icon: LineChart, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', label: 'Chứng Khoán' },
  FUND: { icon: PieChart, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', label: 'Quỹ Đầu Tư' },
  CRYPTO: { icon: Bitcoin, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', label: 'Crypto' },
  OTHER_ASSET: { icon: Package, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', label: 'Tài Sản Khác' },
  LIABILITY: { icon: CreditCard, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', label: 'Khoản Nợ' },
};

export default function AccountList({ accounts, loading, onSuccess }: AccountListProps) {
  const [selectedAccount, setSelectedAccount] = useState<AccountSummary | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài sản này?')) return;
    try {
      const res = await fetch(`/api/v1/accounts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Lỗi khi xóa tài sản');
      }
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-950 dark:bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-3xl bg-slate-950 dark:bg-slate-900/40 border border-slate-800 p-8 text-center space-y-3 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <Wallet className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-100">Chưa Có Danh Mục Tài Sản Nào</h4>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Hãy bấm nút &quot;Thêm Tài Sản / Khoản Nợ&quot; phía trên để bắt đầu theo dõi tổng tài sản ròng của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {accounts.map((acc) => {
        const typeInfo = TYPE_ICONS[acc.type] || TYPE_ICONS.OTHER_ASSET;
        const IconComponent = typeInfo.icon;
        const isLiability = acc.type === 'LIABILITY';

        return (
          <div
            key={acc._id}
            className={`group rounded-2xl bg-slate-950 dark:bg-slate-900/60 border ${acc.isStale
                ? 'border-amber-500/40 bg-amber-950/10 dark:bg-amber-950/10'
                : 'border-slate-800/80 hover:border-slate-700'
              } p-4 sm:p-5 flex items-center justify-between gap-4 transition-all duration-200 shadow-md`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${typeInfo.color}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-100 truncate">{acc.name}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {typeInfo.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Định giá: {acc.daysSinceLastValuation === 0 ? 'Hôm nay' : `${acc.daysSinceLastValuation} ngày trước`}
                  </span>

                  {acc.isStale && (
                    <span className="flex items-center gap-1 text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      Cần cập nhật
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 shrink-0">
              <div className="text-right">
                <div
                  className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${
                    isLiability ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {isLiability ? '-' : ''}
                  {formatMoney(acc.currentBalanceMinor, acc.currency)}
                </div>
                {/* P&L for investment accounts */}
                {!isLiability && acc.costBasisMinor && acc.costBasisMinor > 0 && (() => {
                  const pnl = acc.currentBalanceMinor - acc.costBasisMinor;
                  const pnlPct = ((pnl / acc.costBasisMinor) * 100).toFixed(1);
                  const isProfit = pnl >= 0;
                  return (
                    <div className={`flex items-center justify-end gap-1 mt-0.5 text-xs font-semibold ${
                      isProfit ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isProfit
                        ? <TrendingUp className="w-3 h-3" />
                        : <TrendingDown className="w-3 h-3" />}
                      <span>{isProfit ? '+' : ''}{formatMoney(Math.abs(pnl), acc.currency)}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isProfit ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {isProfit ? '+' : ''}{pnlPct}%
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Edit/Delete Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 max-sm:opacity-100 transition-opacity duration-200 pl-2 border-l border-slate-800">
                <button
                  onClick={() => setSelectedAccount(acc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer shrink-0"
                  title="Chỉnh sửa tài sản"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(acc._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
                  title="Xóa tài sản"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <EditAccountModal
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        onSuccess={() => {
          if (onSuccess) onSuccess();
        }}
        account={selectedAccount}
      />
    </div>
  );
}
