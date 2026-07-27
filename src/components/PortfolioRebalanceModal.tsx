'use client';

import { useState, useMemo } from 'react';
import { Scale, X, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { NetWorthOverview } from '@/domain/net-worth';
import { calculatePortfolioRebalance, DEFAULT_TARGET_ALLOCATION, TargetAllocation } from '@/domain/portfolio-rebalance';
import { formatMoney } from '@/domain/money';

interface PortfolioRebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  netWorthData: NetWorthOverview | null;
}

export default function PortfolioRebalanceModal({
  isOpen,
  onClose,
  netWorthData,
}: PortfolioRebalanceModalProps) {
  const [targets, setTargets] = useState<TargetAllocation>(DEFAULT_TARGET_ALLOCATION);

  const totalTargetPercent = useMemo(() => {
    return Object.values(targets).reduce((sum, val) => sum + val, 0);
  }, [targets]);

  const analysis = useMemo(() => {
    return calculatePortfolioRebalance(netWorthData, targets);
  }, [netWorthData, targets]);

  if (!isOpen) return null;

  const handleSliderChange = (key: keyof TargetAllocation, value: number) => {
    setTargets((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Động Cơ Tái Cân Đối Danh Mục (Portfolio Rebalancer)</span>
              </h3>
              <p className="text-xs text-slate-400">Tối ưu hóa tỷ trọng quản trị rủi ro & tính toán quy mô dòng tiền</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Status Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            analysis.isBalanced
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}
        >
          {analysis.isBalanced ? (
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <div className="font-bold text-sm">
              {analysis.isBalanced ? 'Danh Mục Đang Ở Vị Thế Cân Bằng Tối Ưu' : 'Cảnh Báo Lệch Tỷ Trọng Danh Mục'}
            </div>
            <div className="text-xs opacity-90">{analysis.overallAdvice}</div>
          </div>
        </div>

        {/* Target Allocation Sliders Section */}
        <div className="space-y-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Tỷ lệ mục tiêu phân bổ tài sản (% Target)
            </h4>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                totalTargetPercent === 100
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              Tổng = {totalTargetPercent}% {totalTargetPercent !== 100 && '(Nên đạt đúng 100%)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(DEFAULT_TARGET_ALLOCATION) as (keyof TargetAllocation)[]).map((type) => (
              <div key={type} className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    {type === 'CASH'
                      ? 'Tiền mặt'
                      : type === 'INVESTMENT'
                      ? 'Chứng khoán'
                      : type === 'REAL_ESTATE'
                      ? 'Bất động sản'
                      : type === 'CRYPTO'
                      ? 'Crypto'
                      : 'Vàng'}
                  </span>
                  <span className="font-mono font-bold text-amber-400">{targets[type]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={targets[type]}
                  onChange={(e) => handleSliderChange(type, Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Category Analysis Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Phân Tích Từng Nhóm Tài Sản ({analysis.categories.length})
          </h4>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {analysis.categories.map((cat) => {
              const isBuy = cat.action === 'BUY';
              const isSell = cat.action === 'SELL';

              return (
                <div
                  key={cat.type}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{cat.typeNameVi}</span>
                      <span className="text-xs font-mono text-slate-400">
                        ({cat.currentPercentage}% hiện tại / {cat.targetPercentage}% mục tiêu)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isBuy && (
                        <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          NẠP THÊM
                        </span>
                      )}
                      {isSell && (
                        <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          RÚT/CHỐT LỜI
                        </span>
                      )}
                      {!isBuy && !isSell && (
                        <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          CÂN BẰNG
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span>Giá trị hiện tại: {formatMoney(Math.round(cat.currentValueVND * 100), 'VND')}</span>
                    <span className="text-slate-400">
                      Mục tiêu: {formatMoney(Math.round(cat.targetValueVND * 100), 'VND')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800/60">
                    💡 <span className="text-slate-300 font-semibold">{cat.recommendation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
