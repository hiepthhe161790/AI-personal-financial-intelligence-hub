'use client';

import { useState, useEffect } from 'react';
import { 
  Globe, 
  Newspaper, 
  RefreshCw, 
  ExternalLink, 
  TrendingUp, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';
import VNStockPortfolioCard from '@/components/VNStockPortfolioCard';

interface FxRate {
  currencyCode: string;
  currencyName: string;
  buy: string;
  transfer: string;
  sell: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  published: string;
}

export default function MarketDataCards() {
  const [rates, setRates] = useState<FxRate[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceInfo, setSourceInfo] = useState('');

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/market/summary');
      const json = await res.json();

      const fxData = json.fx || json.data?.fx;
      const newsData = json.news || json.data?.news;

      if (res.ok && (fxData || newsData)) {
        setRates(fxData?.rates || []);
        setNews(newsData?.items || []);
        setSourceInfo(fxData?.source || 'Nguồn Vietcombank Portal');
      }
    } catch (err) {
      console.error('Failed to fetch market summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Realtime VN Stock Quotes Component */}
      <VNStockPortfolioCard />

      {/* FX Rates & News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FX Rates Table Card */}
        <div className="lg:col-span-1 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Tỷ Giá Ngoại Tệ (VCB)</h3>
                <p className="text-[11px] text-slate-400">{sourceInfo || 'Nguồn XML Vietcombank'}</p>
              </div>
            </div>
            <button
              onClick={fetchMarketData}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Mã</th>
                  <th className="pb-3 text-right">Mua CK</th>
                  <th className="pb-3 text-right">Bán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {rates.slice(0, 7).map((r) => (
                  <tr key={r.currencyCode} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>{r.currencyCode}</span>
                    </td>
                    <td className="py-3 text-right text-slate-200">{r.transfer}</td>
                    <td className="py-3 text-right font-semibold text-white">{r.sell}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* News Feed Card */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Tin Tức Thị Trường & Kinh Doanh</h3>
                <p className="text-[11px] text-slate-400">RSS Feeds tự động từ VnExpress & CafeF</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {news.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
                    {item.source}
                  </span>
                  <span className="text-[10px] text-slate-500">{new Date(item.published).toLocaleDateString('vi-VN')}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    <span>{item.title}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
