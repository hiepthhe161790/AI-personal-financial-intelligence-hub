'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell, BellRing, Plus, Trash2, CalendarClock, CreditCard,
  Home, HeartPulse, Landmark, Package, AlertTriangle, CheckCircle2,
  Send, HelpCircle
} from 'lucide-react';
import Link from 'next/link';

interface BillReminder {
  _id: string;
  name: string;
  amountMinor: number;
  currency: string;
  category: string;
  dueDayOfMonth: number;
  reminderDaysBefore: number;
  isActive: boolean;
  notes?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Vay ngân hàng': <Landmark className="w-4 h-4" />,
  'Thẻ tín dụng': <CreditCard className="w-4 h-4" />,
  'Thuê nhà': <Home className="w-4 h-4" />,
  'Bảo hiểm': <HeartPulse className="w-4 h-4" />,
  'Khác': <Package className="w-4 h-4" />,
};

const CATEGORIES = Object.keys(CATEGORY_ICONS);

function formatVND(minor: number) {
  return minor.toLocaleString('vi-VN') + ' ₫';
}

function getDaysUntilDue(dueDayOfMonth: number): number {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), dueDayOfMonth);
  if (thisMonth < now) {
    // Already passed this month → next month
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, dueDayOfMonth);
    return Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((thisMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function UrgencyBadge({ daysLeft }: { daysLeft: number }) {
  if (daysLeft <= 0) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Đến hạn hôm nay!
      </span>
    );
  }
  if (daysLeft <= 3) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Còn {daysLeft} ngày
      </span>
    );
  }
  if (daysLeft <= 7) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
        <BellRing className="w-3 h-3" /> Còn {daysLeft} ngày
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
      <CheckCircle2 className="w-3 h-3" /> Còn {daysLeft} ngày
    </span>
  );
}

export default function BillReminderManager() {
  const [bills, setBills] = useState<BillReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notifyResult, setNotifyResult] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    amountMinor: '',
    category: 'Vay ngân hàng',
    dueDayOfMonth: '15',
    reminderDaysBefore: '3',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/bills');
      const data = await res.json();
      if (data.success) setBills(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.dueDayOfMonth) return;
    setSaving(true);
    try {
      await fetch('/api/v1/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          amountMinor: Number(form.amountMinor.replace(/\D/g, '')) || 0,
          category: form.category,
          dueDayOfMonth: Number(form.dueDayOfMonth),
          reminderDaysBefore: Number(form.reminderDaysBefore),
          notes: form.notes,
        }),
      });
      setShowForm(false);
      setForm({ name: '', amountMinor: '', category: 'Vay ngân hàng', dueDayOfMonth: '15', reminderDaysBefore: '3', notes: '' });
      fetchBills();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa lịch nhắc này?')) return;
    await fetch(`/api/v1/bills/${id}`, { method: 'DELETE' });
    fetchBills();
  };

  const handleNotify = async () => {
    setSending(true);
    setNotifyResult('');
    try {
      const res = await fetch('/api/v1/bills/notify', { method: 'POST' });
      const data = await res.json();
      setNotifyResult(data.message || 'Đã xử lý.');
    } finally {
      setSending(false);
    }
  };

  // Sort bills by days until due
  const sortedBills = [...bills].sort((a, b) =>
    getDaysUntilDue(a.dueDayOfMonth) - getDaysUntilDue(b.dueDayOfMonth)
  );

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Lịch Nhắc Thanh Toán</h3>
            <p className="text-xs text-slate-500">Theo dõi & nhắc nhở tự động qua Telegram</p>
          </div>
          <Link href="/guide?tab=bills" title="Hướng dẫn sử dụng">
            <HelpCircle className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNotify}
            disabled={sending || bills.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold hover:bg-orange-500/20 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? 'Đang gửi...' : 'Gửi Telegram'}
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm
          </button>
        </div>
      </div>

      {/* Notify result toast */}
      {notifyResult && (
        <div className="mx-5 mt-4 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {notifyResult}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="mx-5 mt-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-orange-400" /> Thêm Lịch Nhắc Mới
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Tên khoản thanh toán *</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-orange-500"
                placeholder="VD: Trả nợ vay mua xe, Bảo hiểm nhân thọ..."
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Số tiền (₫)</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-orange-500"
                placeholder="5.000.000"
                value={form.amountMinor}
                onChange={e => setForm(f => ({ ...f, amountMinor: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Danh mục</label>
              <select
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ngày đến hạn hàng tháng *</label>
              <input
                type="number" min={1} max={28}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-orange-500"
                placeholder="15"
                value={form.dueDayOfMonth}
                onChange={e => setForm(f => ({ ...f, dueDayOfMonth: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Nhắc trước (ngày)</label>
              <select
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                value={form.reminderDaysBefore}
                onChange={e => setForm(f => ({ ...f, reminderDaysBefore: e.target.value }))}
              >
                {[1, 2, 3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d} ngày trước</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ghi chú</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-orange-500"
                placeholder="Ghi chú thêm (không bắt buộc)"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.dueDayOfMonth}
              className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Đang lưu...' : '✓ Lưu Lịch Nhắc'}
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

      {/* Bills List */}
      <div className="p-5 space-y-3">
        {loading ? (
          <div className="text-center text-xs text-slate-500 py-8">Đang tải...</div>
        ) : sortedBills.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CalendarClock className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Chưa có lịch nhắc nào</p>
            <p className="text-xs text-slate-600">Thêm các khoản thanh toán định kỳ để không bỏ lỡ ngày đến hạn</p>
          </div>
        ) : (
          sortedBills.map((bill) => {
            const daysLeft = getDaysUntilDue(bill.dueDayOfMonth);
            const CategoryIcon = CATEGORY_ICONS[bill.category] || CATEGORY_ICONS['Khác'];
            return (
              <div
                key={bill._id}
                className={`p-4 rounded-2xl border transition-all ${
                  daysLeft <= 3
                    ? 'bg-red-500/5 border-red-500/20'
                    : daysLeft <= 7
                    ? 'bg-orange-500/5 border-orange-500/20'
                    : 'bg-slate-800/40 border-slate-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      daysLeft <= 3 ? 'bg-red-500/20 text-red-400' :
                      daysLeft <= 7 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {CategoryIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-100 truncate">{bill.name}</span>
                        <UrgencyBadge daysLeft={daysLeft} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">{formatVND(bill.amountMinor)}</span>
                        <span>•</span>
                        <span>Ngày {bill.dueDayOfMonth} hàng tháng</span>
                        <span>•</span>
                        <span>{bill.category}</span>
                      </div>
                      {bill.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{bill.notes}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(bill._id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
