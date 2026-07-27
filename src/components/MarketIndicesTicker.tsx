'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface MarketIndex {
  name: string;
  value: number;
  change: string;
  direction: 'UP' | 'DOWN';
  exchange: string;
}

export default function MarketIndicesTicker() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIndices = async () => {
    try {
      const res = await fetch('/api/v1/market/indices');
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setIndices(json.data?.indices || json.indices || []);
      }
    } catch (err) {
      console.error('Failed to fetch market indices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIndices();
    const interval = setInterval(fetchIndices, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Extra asset tickers to enrich the Bloomberg experience
  const extraTickers = [
    { name: 'VÀNG SJC', value: '85.50M đ', change: '+0.58%', direction: 'UP' },
    { name: 'BITCOIN (BTC)', value: '$67,420', change: '+1.24%', direction: 'UP' },
    { name: 'ETHEREUM (ETH)', value: '$3,450', change: '-0.85%', direction: 'DOWN' },
    { name: 'USD/VND', value: '25,450 đ', change: '0.00%', direction: 'EQUAL' },
  ];

  const renderTickerItems = () => {
    const list = [...indices];

    return (
      <div className="flex items-center gap-12 px-6">
        {list.map((item, idx) => {
          const isUp = item.direction === 'UP';
          return (
            <div key={`index-${idx}`} className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-slate-400 tracking-wider">{item.name}</span>
              <span className="font-mono text-white font-bold">{item.value.toLocaleString('vi-VN')}</span>
              <span className={`flex items-center gap-0.5 font-bold font-mono ${isUp ? 'text-emerald-400' : 'text-rose-450'}`}>
                {isUp ? <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" /> : <TrendingDown className="w-3 h-3 text-rose-400 shrink-0" />}
                {item.change}
              </span>
            </div>
          );
        })}

        {extraTickers.map((item, idx) => {
          const isUp = item.direction === 'UP';
          const isDown = item.direction === 'DOWN';
          const colorClass = isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-amber-400';

          return (
            <div key={`extra-${idx}`} className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-slate-400 tracking-wider">{item.name}</span>
              <span className="font-mono text-white font-bold">{item.value}</span>
              <span className={`flex items-center gap-0.5 font-bold font-mono ${colorClass}`}>
                {isUp && <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />}
                {isDown && <TrendingDown className="w-3 h-3 text-rose-400 shrink-0" />}
                {item.change}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && indices.length === 0) {
    return (
      <div className="w-full bg-slate-950 border-b border-slate-800/80 py-1.5 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
        <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
        <span>Đang kết nối sàn giao dịch chứng khoán...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 overflow-hidden relative py-2 select-none z-40">
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .ticker-scroll-wrapper {
          display: flex;
          white-space: nowrap;
          width: max-content;
          animation: ticker-scroll 45s linear infinite;
        }
        .ticker-scroll-wrapper:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="ticker-scroll-wrapper">
        {/* Render twice for continuous loop */}
        {renderTickerItems()}
        {renderTickerItems()}
      </div>
    </div>
  );
}
