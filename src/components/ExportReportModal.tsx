'use client';

import { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  Printer, 
  X, 
  FileCheck2, 
  ShieldCheck 
} from 'lucide-react';
import { NetWorthOverview } from '@/domain/net-worth';
import { generateCSVReport, downloadCSVFile } from '@/domain/export-report';
import { formatMoney } from '@/domain/money';

interface ExportReportModalProps {
  netWorthData: NetWorthOverview | null;
}

export default function ExportReportModal({ netWorthData }: ExportReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportCSV = () => {
    if (!netWorthData) return;
    const csvContent = generateCSVReport(netWorthData);
    const filename = `Financial_Report_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSVFile(filename, csvContent);
    setIsOpen(false);
  };

  const handlePrintPDF = () => {
    window.print();
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Xuất Báo Cáo (CSV/PDF)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Xuất Báo Cáo Tài Chính Cá Nhân</h3>
                  <p className="text-xs text-slate-400">Kết xuất dữ liệu minh bạch ra định dạng Excel hoặc In PDF</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {netWorthData && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>TỔNG TÀI SẢN RÒNG:</span>
                  <span className="font-bold text-emerald-400">{formatMoney(netWorthData.netWorthMinor, 'VND')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TỔNG DANH MỤC:</span>
                  <span className="text-white">{netWorthData.accounts.length} tài khoản</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleExportCSV}
                className="p-5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-500 transition-all text-left space-y-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Tải Xuống File CSV/Excel</div>
                  <div className="text-[11px] text-slate-400">Tương thích Microsoft Excel & Google Sheets</div>
                </div>
              </button>

              <button
                onClick={handlePrintPDF}
                className="p-5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-500 transition-all text-left space-y-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">In Báo Cáo PDF</div>
                  <div className="text-[11px] text-slate-400">Mở giao diện In trình duyệt để Save PDF</div>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dữ liệu báo cáo được xử lý cục bộ trên thiết bị của bạn, bảo mật tuyệt đối.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
