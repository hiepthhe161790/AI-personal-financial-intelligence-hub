'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, AlertCircle, HelpCircle, Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { minorToMajor } from '@/domain/money';

interface Budget {
  _id: string;
  category: string;
  limitMinor: number;
  currency: string;
  period: string;
  spentMinor: number;
}

const CATEGORY_OPTIONS = [
  'Ăn uống 🍔',
  'Di chuyển 🚗',
  'Mua sắm 🛍️',
  'Nhà cửa 🏠',
  'Giải trí 🎮',
  'Sức khỏe 🏥',
  'Học tập 📚',
  'Khác 💸'
];

export default function BudgetManager() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Form states
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [limitMajor, setLimitMajor] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleQuickEdit = (cat: string, limitVnd: number) => {
    setCategory(cat);
    setLimitMajor(String(limitVnd));
    const input = document.getElementById('budget-limit-input');
    if (input) {
      input.focus();
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hạn mức chi tiêu này không?')) return;
    try {
      const res = await fetch(`/api/v1/budgets/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Lỗi khi xóa hạn mức');
      }
      fetchBudgets();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa');
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/v1/budgets');
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setBudgets(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const parsedLimit = parseFloat(limitMajor);
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        throw new Error('Vui lòng nhập hạn mức hợp lệ (lớn hơn hoặc bằng 0)');
      }

      const res = await fetch('/api/v1/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          limitMajor: parsedLimit,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Lỗi khi lưu hạn mức ngân sách');
      }

      setLimitMajor('');
      fetchBudgets();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-rose-500';
    if (percent >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="rounded-3xl bg-slate-950 dark:bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl dark:shadow-2xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-md font-bold text-slate-100 flex items-center gap-1.5">
              <span>Quản Lý Hạn Mức Chi Tiêu (Budget)</span>
              <Link href="/guide?tab=budget" title="Xem hướng dẫn sử dụng luồng hạn mức">
                <HelpCircle className="w-4 h-4 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer" />
              </Link>
            </h4>
            <p className="text-xs text-slate-400">Thiết lập giới hạn chi tiêu từng danh mục & tự động cảnh báo Telegram</p>
          </div>
        </div>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs font-semibold text-slate-400 hover:text-slate-100 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Hướng dẫn Bot Telegram</span>
        </button>
      </div>

      {/* Telegram Guide Banner */}
      {showGuide && (
        <div className="rounded-2xl bg-indigo-950/20 border border-indigo-500/20 p-4 text-xs text-slate-300 space-y-2 animate-in slide-in-from-top duration-200">
          <p className="font-bold text-indigo-400">🤖 Hướng dẫn cấu hình nhận cảnh báo qua Telegram Bot:</p>
          <ol className="list-decimal pl-4 space-y-1 text-slate-400">
            <li>Tìm kiếm bot <code className="text-slate-200">@BotFather</code> trên Telegram để tạo Bot mới và nhận <code className="text-slate-200">Token</code>.</li>
            <li>Tìm kiếm bot <code className="text-slate-200">@userinfobot</code> trên Telegram để lấy <code className="text-slate-200">Chat ID</code> của bạn.</li>
            <li>Thêm các khóa <code className="text-slate-200">TELEGRAM_BOT_TOKEN</code> và <code className="text-slate-200">TELEGRAM_CHAT_ID</code> vào biến môi trường của dự án (file <code className="text-slate-200">.env</code> hoặc Vercel Dashboard).</li>
            <li>Nhấn Chat với Bot của bạn để bắt đầu nhận cảnh báo tự động khi chi tiêu vượt 80% / 100%!</li>
          </ol>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Budgets List */}
        <div className="lg:col-span-2 space-y-4">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hạn mức danh mục hiện tại</h5>

          {loading && (
            <div className="flex items-center justify-center py-10 text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang tải danh sách ngân sách...</span>
            </div>
          )}

          {!loading && budgets.length === 0 && (
            <div className="rounded-2xl bg-slate-900/40 dark:bg-slate-950/40 border border-slate-800 p-8 text-center text-slate-500 text-xs">
              Chưa có hạn mức chi tiêu nào được thiết lập. Hãy thêm hạn mức đầu tiên bên phải!
            </div>
          )}

          {!loading && budgets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {budgets.map((b) => {
                const limitVND = minorToMajor(b.limitMinor, b.currency);
                const spentVND = minorToMajor(b.spentMinor, b.currency);
                const percent = limitVND > 0 ? (spentVND / limitVND) * 100 : 0;

                return (
                  <div key={b._id} className="p-4 rounded-2xl bg-slate-900/50 dark:bg-slate-950 border border-slate-800 space-y-2.5 flex flex-col justify-between shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-sm">{b.category}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickEdit(b.category, limitVND)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                            title="Sửa hạn mức"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(b._id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            title="Xóa hạn mức"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-slate-900 border border-slate-800 text-slate-400">
                            {percent.toFixed(0)}% đã tiêu
                          </span>
                        </div>
                      </div>

                      {/* Budget Limit figures */}
                      <div className="flex items-baseline justify-between text-xs pt-1">
                        <span className="text-slate-400">Đã tiêu: <b className="text-slate-200 font-semibold">{spentVND.toLocaleString('vi-VN')} đ</b></span>
                        <span className="text-slate-400">Hạn mức: <b className="text-indigo-400 font-bold">{limitVND.toLocaleString('vi-VN')} đ</b></span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-550 ${getProgressColor(percent)}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>

                      {percent >= 100 ? (
                        <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 pl-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          Đã vượt ngân sách chi tiêu!
                        </span>
                      ) : percent >= 80 ? (
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 pl-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          Chi tiêu sắp chạm hạn mức.
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 pl-0.5">Ngân sách nằm trong tầm kiểm soát.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Set/Update Budget Form */}
        <div className="p-5 rounded-2xl bg-slate-900/50 dark:bg-slate-950 border border-slate-800 shadow-md space-y-4 self-start">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thiết lập ngân sách</h5>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-2 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Chọn Danh Mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Hạn mức chi tiêu tháng (VND)</label>
              <input
                id="budget-limit-input"
                type="number"
                required
                placeholder="VD: 3000000"
                value={limitMajor}
                onChange={(e) => setLimitMajor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-100 text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Lưu Ngân Sách</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
