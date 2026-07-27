'use client';

import { ExternalLink, Award } from 'lucide-react';
import { AFFILIATE_OFFERS } from '@/domain/affiliate';

export default function AffiliateBannerCard() {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Đối Tác Tài Chính Khuyên Dùng</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Ưu Đãi Độc Quyền
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Mở tài khoản đầu tư & thẻ tín dụng tối ưu chi phí từ các ngân hàng uy tín</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AFFILIATE_OFFERS.map((offer) => (
          <div
            key={offer.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${offer.logoBgColor}`}>
                  {offer.badgeText}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Duyệt 100% Online</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-400 transition-colors">
                {offer.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{offer.description}</p>
            </div>

            <a
              href={offer.reflink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-extrabold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Mở Ngay Nhận Ưu Đãi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
