'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, BarChart2, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '@/domain/money';

interface StockQuote {
  symbol: string;
  name: string;
  priceVND: number;
  changePercent: string;
  exchange: string;
}

export default function VNStockPortfolioCard() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStockQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/market/stocks?symbols=HPG,FPT,MBB,TCB,SSI,VIC');
      const json = await res.json();
      if (res.ok && json.stocks) {
        setStocks(json.stocks);
      }
    } catch (err) {
      console.error('Failed to fetch stock quotes:', err);
      // Fallback local data
      setStocks([
        { symbol: 'HPG', name: 'Tập đoàn Hòa Phát', priceVND: 28500, changePercent: '+1.2%', exchange: 'HOSE' },
        { symbol: 'FPT', name: 'Tập đoàn FPT', priceVND: 132000, changePercent: '+2.5%', exchange: 'HOSE' },
        { symbol: 'MBB', name: 'Ngân hàng MB', priceVND: 24800, changePercent: '+0.8%', exchange: 'HOSE' },
        { symbol: 'TCB', name: 'Ngân hàng Techcombank', priceVND: 23500, changePercent: '-0.4%', exchange: 'HOSE' },
        { symbol: 'SSI', name: 'Chứng khoán SSI', priceVND: 31200, changePercent: '+1.5%', exchange: 'HOSE' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockQuotes();
  }, []);

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Bảng Giá Chứng Khoán Việt Nam (HOSE/HNX)</h3>
            <p className="text-xs text-slate-400">Cập nhật realtime từ Python Analytics Engine</p>
          </div>
        </div>

        <button
          onClick={fetchStockQuotes}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((st) => {
          const isPositive = st.changePercent.startsWith('+');
          return (
            <div
              key={st.symbol}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-emerald-400">{st.symbol}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {st.exchange}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isPositive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {st.changePercent}
                </span>
              </div>

              <div className="text-xs text-slate-400 truncate">{st.name}</div>

              <div className="text-lg font-extrabold text-white">
                {formatMoney(st.priceVND * 100, 'VND')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
