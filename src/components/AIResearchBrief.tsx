'use client';

import { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  ShieldAlert, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  RefreshCcw
} from 'lucide-react';
import { AIResearchBrief as AIResearchBriefType } from '@/lib/ai';
import { EvidencePack } from '@/domain/evidence-pack';

export default function AIResearchBrief() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ brief: AIResearchBriefType; evidencePack: EvidencePack } | null>(null);
  const [showEvidence, setShowEvidence] = useState(false);

  const fetchBrief = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/research/brief', {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch AI brief:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (level) {
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Banner to Generate Brief */}
      {!data && !loading && (
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 p-8 sm:p-10 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <BrainCircuit className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1 max-w-xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Phân Tích Danh Mục & Đánh Giá Rủi Ro Bằng AI
            </h3>
            <p className="text-slate-400 text-sm">
              AI sẽ tổng hợp minh chứng tài sản (Evidence Pack), phân tích tỷ trọng rủi ro và đưa ra khuyến nghị quản trị cá nhân.
            </p>
          </div>

          <button
            onClick={fetchBrief}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tạo Báo Cáo Phân Tích AI Gemini</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-6 animate-pulse">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            <div className="h-6 bg-slate-800 rounded w-1/3" />
          </div>
          <div className="h-16 bg-slate-800 rounded w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-28 bg-slate-800 rounded" />
            <div className="h-28 bg-slate-800 rounded" />
          </div>
        </div>
      )}

      {/* Render Brief Results */}
      {data && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-indigo-500/30 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{data.brief.headline}</h3>
                  <p className="text-xs text-slate-400">Được khởi tạo từ Evidence Pack ngày {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <button
                onClick={fetchBrief}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Phân Tích Lại</span>
              </button>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {data.brief.summary}
            </p>
          </div>

          {/* Key Observations */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Ghi Nhận Cốt Lõi Tình Hình Tài Sản
            </h4>
            <ul className="space-y-2">
              {data.brief.keyObservations.map((obs, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risk Assessments Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Đánh Giá Rủi Ro & Khuyến Nghị Quản Trị
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.brief.riskAssessment.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskBadge(item.riskLevel)}`}>
                        MỨC RỦI RO: {item.riskLevel}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-white">{item.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.explanation}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 text-xs text-emerald-300 font-medium bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20">
                    <span className="font-bold text-emerald-400">Khuyến nghị: </span>
                    {item.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citation & Evidence Pack Accordion */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-4 space-y-3">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Minh Chứng Đầu Vào (Evidence Pack - {data.evidencePack.evidenceItems.length} nguồn trích dẫn)
              </span>
              {showEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showEvidence && (
              <div className="pt-2 space-y-2 text-xs border-t border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono">
                  Mã Citation Trích Dẫn: {data.brief.citationIds.join(', ')}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {data.evidencePack.evidenceItems.map((evd) => (
                    <div key={evd.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-indigo-400 font-mono">
                        <span>{evd.id}</span>
                        <span>{evd.source}</span>
                      </div>
                      <div className="font-bold text-slate-200">{evd.title}</div>
                      <div className="text-[11px] text-slate-400">{evd.summary}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Legal Disclaimer Banner */}
          <div className="rounded-2xl bg-slate-950 border border-amber-500/20 p-4 flex items-start gap-3 text-slate-400 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Miễn Trừ Tách Biệt Pháp Lý: </span>
              {data.brief.disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
