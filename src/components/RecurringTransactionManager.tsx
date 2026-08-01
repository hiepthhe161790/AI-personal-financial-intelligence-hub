'use client';

import { useState, useEffect, useCallback } from 'react';
import { Repeat, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Play, CheckCircle2, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { formatNumericInput } from '@/domain/money';
import CategoryIcon, { getCleanCategoryName } from '@/components/CategoryIcon';
import CategorySelect from '@/components/CategorySelect';

interface Account { _id: string; name: string; type: string; }

interface RecurringTx {
  _id: string;
  accountId: string;
  type: 'INCOME' | 'EXPENSE';
  amountMinor: number;
  currency: string;
  category: string;
  notes?: string;
  dayOfMonth: number;
  isActive: boolean;
  lastExecutedMonth?: string;
}

function formatVND(minor: number) {
  return minor.toLocaleString('vi-VN') + ' ₫';
}

const INCOME_CATEGORIES = [
  "Lương & Thưởng",
  "Kinh doanh & Làm thêm",
  "Đầu tư & Lãi suất",
  "Được tặng & Quà biếu",
  "Thu nhập khác"
];
const EXPENSE_CATEGORIES = [
  "Ăn uống & Cà phê",
  "Đi chợ & Siêu thị",
  "Nhà cửa & Tiền thuê",
  "Di chuyển & Xăng xe",
  "Mua sắm & Quần áo",
  "Hóa đơn & Tiện ích",
  "Giải trí & Du lịch",
  "Y tế & Sức khỏe",
  "Giáo dục & Học tập",
  "Quà tặng & Hiếu hỷ",
  "Đầu tư & Tiết kiệm",
  "Khoản nợ & Lãi suất",
  "Chi phí khác"
];

export default function RecurringTransactionManager() {
  const [items, setItems] = useState<RecurringTx[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    accountId: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amountMinor: '',
    category: 'Nhà cửa & Tiền thuê',
    notes: '',
    dayOfMonth: '1',
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, aRes] = await Promise.all([
        fetch('/api/v1/recurring'),
        fetch('/api/v1/accounts'),
      ]);
      const rData = await rRes.json();
      const aData = await aRes.json();
      if (rData.success) setItems(rData.data);
      if (aData.status === 'success') setAccounts(aData.data.accounts || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async () => {
    if (!form.accountId || !form.amountMinor || !form.category) return;
    setSaving(true);
    try {
      await fetch('/api/v1/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: form.accountId,
          type: form.type,
          amountMinor: Number(form.amountMinor.replace(/,/g, '')),
          category: form.category,
          notes: form.notes,
          dayOfMonth: Number(form.dayOfMonth),
        }),
      });
      setShowForm(false);
      setForm({ accountId: '', type: 'EXPENSE', amountMinor: '', category: 'Tiền thuê nhà 🏠', notes: '', dayOfMonth: '1' });
      fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa giao dịch định kỳ này?')) return;
    await fetch(`/api/v1/recurring/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const handleExecute = async () => {
    setExecuting(true);
    setExecResult('');
    try {
      const res = await fetch('/api/v1/recurring/execute', { method: 'POST' });
      const data = await res.json();
      setExecResult(data.message || 'Đã xử lý.');
      fetchAll(); // refresh lastExecutedMonth
    } finally {
      setExecuting(false);
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-07"

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Repeat className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Giao Dịch Định Kỳ Tự Động</h3>
            <p className="text-xs text-slate-500">Lương, thuê nhà, trả góp... hệ thống tự ghi nhận mỗi tháng</p>
          </div>
          <Link href="/guide?tab=recurring" title="Hướng dẫn sử dụng">
            <HelpCircle className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExecute}
            disabled={executing || items.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            {executing ? 'Đang chạy...' : 'Chạy Tháng Này'}
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm
          </button>
        </div>
      </div>

      {/* Execute result */}
      {execResult && (
        <div className="mx-5 mt-4 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {execResult}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="mx-5 mt-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-indigo-400" /> Tạo Giao Dịch Định Kỳ Mới
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Loại *</label>
              <select
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                value={form.type}
                onChange={e => {
                  const t = e.target.value as 'INCOME' | 'EXPENSE';
                  setForm(f => ({ ...f, type: t, category: t === 'INCOME' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0] }));
                }}
              >
                <option value="INCOME">Thu nhập (INCOME)</option>
                <option value="EXPENSE">Chi phí (EXPENSE)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Tài khoản *</label>
              <select
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                value={form.accountId}
                onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
              >
                <option value="">-- Chọn tài khoản --</option>
                {accounts.map(a => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Số tiền (₫) *</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                placeholder="10,000,000"
                value={form.amountMinor}
                onChange={e => setForm(f => ({ ...f, amountMinor: formatNumericInput(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ngày thực hiện *</label>
              <input
                type="number" min={1} max={28}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                placeholder="1"
                value={form.dayOfMonth}
                onChange={e => setForm(f => ({ ...f, dayOfMonth: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Danh mục *</label>
              <CategorySelect
                value={form.category}
                onChange={(val) => setForm(f => ({ ...f, category: val }))}
                options={form.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES}
                className="mt-1"
                borderClass="border-slate-700 focus:border-indigo-500 text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ghi chú</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                placeholder="Ghi chú thêm (không bắt buộc)"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !form.accountId || !form.amountMinor || !form.category}
              className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Đang lưu...' : '✓ Lưu Template'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-600 transition-all cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="p-5 space-y-3">
        {loading ? (
          <div className="text-center text-xs text-slate-500 py-8">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Repeat className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Chưa có giao dịch định kỳ nào</p>
            <p className="text-xs text-slate-600">Tạo template để hệ thống tự động ghi lương, thuê nhà, trả góp mỗi tháng</p>
          </div>
        ) : (
          items.map(item => {
            const alreadyRan = item.lastExecutedMonth === currentMonth;
            const acct = accounts.find(a => a._id === item.accountId);
            return (
              <div key={item._id} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {item.type === 'INCOME'
                      ? <ArrowUpCircle className="w-4 h-4" />
                      : <ArrowDownCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        <CategoryIcon category={item.category} className="w-4 h-4 text-indigo-400" />
                        <span>{getCleanCategoryName(item.category)}</span>
                      </span>
                      {alreadyRan && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã ghi tháng này
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                      <span className={`font-bold ${item.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.type === 'INCOME' ? '+' : '-'}{formatVND(item.amountMinor)}
                      </span>
                      <span>•</span>
                      <span>Ngày {item.dayOfMonth} hàng tháng</span>
                      {acct && <><span>•</span><span>{acct.name}</span></>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
