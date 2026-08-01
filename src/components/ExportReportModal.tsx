'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  X,
  FileCheck2,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { NetWorthOverview } from '@/domain/net-worth';
import { formatMoney } from '@/domain/money';

interface ExportReportModalProps {
  netWorthData: NetWorthOverview | null;
}

type DownloadStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ExportReportModal({ netWorthData }: ExportReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [excelStatus, setExcelStatus] = useState<DownloadStatus>('idle');
  const [pdfStatus, setPdfStatus] = useState<DownloadStatus>('idle');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = async (
    type: 'excel' | 'pdf',
    setStatus: (s: DownloadStatus) => void
  ) => {
    setStatus('loading');
    try {
      const endpoint = type === 'excel' ? '/api/v1/reports/excel' : '/api/v1/reports/pdf';
      const res = await fetch(endpoint);

      if (!res.ok) throw new Error(`Server trả về lỗi ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const dateStr = new Date().toISOString().split('T')[0];
      link.download = type === 'excel'
        ? `BaoCaoTaiChinh_${dateStr}.xlsx`
        : `BaoCaoTaiChinh_${dateStr}.html`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(`Download ${type} failed:`, err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const renderButtonContent = (
    status: DownloadStatus,
    idleLabel: string,
    idleIcon: React.ReactNode
  ) => {
    if (status === 'loading') {
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <div>
            <div className="text-sm font-bold text-slate-100">Đang tạo file...</div>
            <div className="text-[11px] text-slate-400">Vui lòng chờ một vài giây</div>
          </div>
        </>
      );
    }
    if (status === 'success') {
      return (
        <>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-sm font-bold text-emerald-400">Tải xuống thành công! 🎉</div>
            <div className="text-[11px] text-slate-400">Kiểm tra thư mục Downloads của bạn</div>
          </div>
        </>
      );
    }
    if (status === 'error') {
      return (
        <>
          <X className="w-5 h-5 text-rose-400" />
          <div>
            <div className="text-sm font-bold text-rose-400">Lỗi tạo file!</div>
            <div className="text-[11px] text-slate-400">Vui lòng thử lại sau</div>
          </div>
        </>
      );
    }
    return (
      <>
        {idleIcon}
        <div>{idleLabel}</div>
      </>
    );
  };

  return (
    <>
      <button
        id="export-report-btn"
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Xuất Báo Cáo</span>
      </button>

      {mounted && isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Xuất Báo Cáo Tài Chính</h3>
                  <p className="text-xs text-slate-400">Tải về file chuyên nghiệp đầy đủ dữ liệu</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-100 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Data preview */}
            {netWorthData && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nội dung báo cáo sẽ bao gồm:
                </div>
                {[
                  ['Tài Sản Ròng (Net Worth)', formatMoney(netWorthData.netWorthMinor, 'VND')],
                  ['Số Tài Khoản', `${netWorthData.accounts.length} tài khoản`],
                  ['Giao Dịch 30 Ngày', 'Tối đa 100 giao dịch gần nhất'],
                  ['Mục Tiêu Tài Chính', 'Tất cả mục tiêu đang theo dõi'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-400">{label}:</span>
                    <span className="font-bold text-emerald-400">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Download buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Excel */}
              <button
                id="download-excel-btn"
                onClick={() => handleDownload('excel', setExcelStatus)}
                disabled={excelStatus === 'loading'}
                className="p-5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-500 transition-all text-left flex items-center gap-3 group cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                {renderButtonContent(
                  excelStatus,
                  '📊 Tải Xuống Excel',
                  <div>
                    <div className="text-sm font-bold text-slate-100">Tải File Excel (.xlsx)</div>
                    <div className="text-[11px] text-slate-400">4 sheet: Tổng quan, Tài khoản, Giao dịch, Mục tiêu</div>
                  </div>
                )}
              </button>

              {/* PDF */}
              <button
                id="download-pdf-btn"
                onClick={() => handleDownload('pdf', setPdfStatus)}
                disabled={pdfStatus === 'loading'}
                className="p-5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-500 transition-all text-left flex items-center gap-3 group cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                {renderButtonContent(
                  pdfStatus,
                  '📄 Xuất Báo Cáo HTML',
                  <div>
                    <div className="text-sm font-bold text-slate-100">Xuất File HTML (.html)</div>
                    <div className="text-[11px] text-slate-400">Mở file → In (Ctrl+P) → Lưu PDF</div>
                  </div>
                )}
              </button>
            </div>

            {/* Footer note */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dữ liệu báo cáo được xử lý cục bộ trên server của bạn. Không chia sẻ với bên thứ ba.</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
