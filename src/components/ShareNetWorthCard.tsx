'use client';

import { useState, useRef } from 'react';
import { Share2, Download, X, Copy, CheckCircle2 } from 'lucide-react';
import { NetWorthOverview } from '@/domain/net-worth';
import { formatMoney } from '@/domain/money';

interface ShareNetWorthCardProps {
  data: NetWorthOverview | null;
  isPrivate?: boolean;
}

function fmt(minor: number): string {
  if (!minor) return '0 ₫';
  return formatMoney(minor, 'VND');
}

export default function ShareNetWorthCard({ data, isPrivate = false }: ShareNetWorthCardProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const netWorth = data.netWorthMinor;
  const assets = data.totalAssetsMinor;
  const liabilities = data.totalLiabilitiesMinor;
  const isPositive = netWorth >= 0;
  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const handleCopyText = async () => {
    const text = `📊 Tài Sản Ròng (Net Worth) của tôi tính đến ${today}:\n💰 Tổng Tài Sản: ${fmt(assets)}\n💸 Tổng Nợ: ${fmt(liabilities)}\n🏆 TÀI SẢN RÒNG: ${fmt(netWorth)}\n\n#AIFinancialHub #TàiChínhCá Nhân #NetWorth`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
        title="Chia sẻ Net Worth"
      >
        <Share2 className="w-4 h-4 text-indigo-400" />
        <span>Chia sẻ</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                Chia Sẻ Snapshot Tài Chính
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Share card preview */}
            <div
              ref={cardRef}
              className="rounded-2xl overflow-hidden border border-slate-700"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
              }}
            >
              {/* Card header */}
              <div className="px-6 pt-6 pb-3 border-b border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <span className="text-[10px] font-black text-slate-950">AI</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300">AI Financial Hub</span>
                  <span className="ml-auto text-[10px] text-slate-500">{today}</span>
                </div>
                <p className="text-[11px] text-slate-500">Personal Net Worth Snapshot</p>
              </div>

              {/* Net worth main number */}
              <div className="px-6 py-5 text-center space-y-1">
                <p className="text-[11px] text-slate-400 uppercase tracking-widest">Tài Sản Ròng</p>
                <p className={`text-3xl font-black font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPrivate ? '••••••••' : fmt(netWorth)}
                </p>
                <div className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                  isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {isPositive ? '📈 Tài sản dương' : '⚠️ Cần cải thiện'}
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-px bg-slate-700/30 border-t border-slate-700/50">
                <div className="bg-slate-900/80 px-4 py-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-0.5">Tổng Tài Sản</p>
                  <p className="text-sm font-bold font-mono text-blue-400">
                    {isPrivate ? '•••' : fmt(assets)}
                  </p>
                </div>
                <div className="bg-slate-900/80 px-4 py-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-0.5">Tổng Nợ</p>
                  <p className="text-sm font-bold font-mono text-rose-400">
                    {isPrivate ? '•••' : fmt(liabilities)}
                  </p>
                </div>
              </div>

              {/* Account count */}
              <div className="px-6 py-3 text-center border-t border-slate-700/50">
                <p className="text-[10px] text-slate-500">
                  {data.accounts.length} tài khoản • Cập nhật {today}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCopyText}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                }`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Đã sao chép!' : 'Sao chép văn bản'}
              </button>

              <button
                onClick={() => {
                  // Print-to-share: open print dialog for the card only
                  window.print();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                In / Lưu PDF
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-600">
              💡 Chụp màn hình thẻ trên để chia sẻ lên mạng xã hội
            </p>
          </div>
        </div>
      )}
    </>
  );
}
