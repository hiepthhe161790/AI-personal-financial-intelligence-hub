'use client';

import { useState } from 'react';
import { Camera, UploadCloud, CheckCircle2, Sparkles, AlertCircle, X, Loader2, ArrowRight } from 'lucide-react';
import { StatementExtractionResult, ParsedItem } from '@/domain/statement-parser';
import { formatMoney } from '@/domain/money';

interface SmartOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SmartOCRModal({ isOpen, onClose, onSuccess }: SmartOCRModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<StatementExtractionResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError('');
      setResult(null);

      if (selected.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleParseDocument = async () => {
    if (!file) {
      setError('Vui lòng chọn file hóa đơn hoặc sao kê');
      return;
    }

    setParsing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/ocr/parse-statement', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setResult(json.data);
      } else {
        setError(json.message || 'Không thể bóc tách tài liệu. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Lỗi kết nối khi gửi tài liệu phân tích.');
    } finally {
      setParsing(false);
    }
  };

  const handleImportAccounts = async () => {
    if (!result || result.items.length === 0) return;

    setSaving(true);
    setError('');

    try {
      for (const item of result.items) {
        await fetch('/api/v1/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.accountName,
            type: item.accountType,
            amountMinor: Math.round(item.amountVND * 100),
            currency: 'VND',
            institution: item.description || 'Smart AI OCR Import',
          }),
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Import accounts error:', err);
      setError('Lỗi khi tự động tạo tài sản vào danh mục.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Smart AI Statement OCR</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Gemini Vision
                </span>
              </h3>
              <p className="text-xs text-slate-400">Tự động bóc tách tài sản từ ảnh sao kê ngân hàng & chứng từ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Dropzone */}
        {!result && (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-slate-700 hover:border-teal-500 bg-slate-950/50 hover:bg-slate-950/80 transition-all cursor-pointer p-4 text-center">
              {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-teal-400 mx-auto flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {file ? file.name : 'Tải lên hoặc kéo thả ảnh sao kê/hóa đơn vào đây'}
                  </div>
                  <p className="text-xs text-slate-400">Hỗ trợ JPG, PNG, PDF (Sao kê Vietcombank, Techcombank, Chứng khoán...)</p>
                </div>
              )}
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
            </label>

            <button
              onClick={handleParseDocument}
              disabled={!file || parsing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {parsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini Vision AI Đang Bóc Tách...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Phân Tích & Bóc Tách Tài Sản</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* AI OCR Result Preview */}
        {result && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Bóc tách AI hoàn tất
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-emerald-500/30">
                  Độ tin cậy {result.confidenceScore}%
                </span>
              </div>
              <p className="text-xs text-slate-300">{result.summary}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Danh sách tài sản nhận diện ({result.items.length})
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {result.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="font-bold text-sm text-slate-100 truncate">{item.accountName}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Loại: <span className="text-teal-400 font-semibold">{item.accountType}</span> • {item.description}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-emerald-400">
                        {formatMoney(Math.round(item.amountVND * 100), 'VND')}
                      </div>
                      {item.date && <div className="text-[10px] text-slate-500">{item.date}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setResult(null)}
                className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Chọn File Khác
              </button>
              <button
                onClick={handleImportAccounts}
                disabled={saving}
                className="w-2/3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang Tạo Tài Sản...</span>
                  </>
                ) : (
                  <>
                    <span>Tạo Tất Cả Tài Sản Này Vốn Vào Net Worth</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
