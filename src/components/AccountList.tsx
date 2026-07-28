'use client';

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
  AlertTriangle
} from 'lucide-react';

interface AccountListProps {
  accounts: AccountSummary[];
  loading: boolean;
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

export default function AccountList({ accounts, loading }: AccountListProps) {
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

            <div className="text-right shrink-0">
              <div
                className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${isLiability ? 'text-rose-400' : 'text-emerald-400'
                  }`}
              >
                {isLiability ? '-' : ''}
                {formatMoney(acc.currentBalanceMinor, acc.currency)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
