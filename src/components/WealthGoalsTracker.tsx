'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, Home, Car, Calendar, Compass, Plus, Trash2, Loader2, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { minorToMajor } from '@/domain/money';

interface WealthGoal {
  _id: string;
  name: string;
  category: 'HOUSE' | 'CAR' | 'RETIREMENT' | 'TRAVEL' | 'OTHER';
  targetAmountMinor: number;
  currentAmountMinor: number;
  targetDate?: string;
  remainingMonths: number;
  estimatedDate: string;
}

const CATEGORY_OPTIONS = [
  { label: 'Mua nhà 🏠', value: 'HOUSE' },
  { label: 'Mua xe 🚗', value: 'CAR' },
  { label: 'Quỹ hưu trí 👵', value: 'RETIREMENT' },
  { label: 'Du lịch / Nghỉ dưỡng ✈️', value: 'TRAVEL' },
  { label: 'Mục tiêu khác 🎯', value: 'OTHER' },
];

export default function WealthGoalsTracker() {
  const [goals, setGoals] = useState<WealthGoal[]>([]);
  const [monthlySavingsMinor, setMonthlySavingsMinor] = useState(1000000000); // 10 million VND default
  const [isSavingsNegative, setIsSavingsNegative] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'HOUSE' | 'CAR' | 'RETIREMENT' | 'TRAVEL' | 'OTHER'>('HOUSE');
  const [targetAmountMajor, setTargetAmountMajor] = useState('');
  const [currentAmountMajor, setCurrentAmountMajor] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Inline adjustment state
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustAmountMajor, setAdjustAmountMajor] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/v1/goals');
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setGoals(json.data.goals);
        setMonthlySavingsMinor(json.data.monthlySavingsMinor);
        setIsSavingsNegative(json.data.isSavingsNegative);
      }
    } catch (err) {
      console.error('Failed to fetch wealth goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const parsedTarget = parseFloat(targetAmountMajor);
      const parsedCurrent = parseFloat(currentAmountMajor || '0');

      if (isNaN(parsedTarget) || parsedTarget <= 0) {
        throw new Error('Số tiền mục tiêu phải lớn hơn 0');
      }
      if (isNaN(parsedCurrent) || parsedCurrent < 0) {
        throw new Error('Số tiền hiện có không được âm');
      }
      if (parsedCurrent > parsedTarget) {
        throw new Error('Số tiền hiện có không được lớn hơn mục tiêu');
      }

      const res = await fetch('/api/v1/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          targetAmountMajor: parsedTarget,
          currentAmountMajor: parsedCurrent,
          targetDate: targetDate || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Lỗi khi tạo mục tiêu tài chính');
      }

      setName('');
      setTargetAmountMajor('');
      setCurrentAmountMajor('');
      setTargetDate('');
      fetchGoals();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustSaved = async (goalId: string, currentSavedMinor: number, action: 'DEPOSIT' | 'WITHDRAW') => {
    setError(null);
    const parsedAmountMajor = parseFloat(adjustAmountMajor);

    if (isNaN(parsedAmountMajor) || parsedAmountMajor <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }

    const adjustMinor = parsedAmountMajor * 100;
    let newSavedMinor = currentSavedMinor;

    if (action === 'DEPOSIT') {
      newSavedMinor += adjustMinor;
    } else {
      if (adjustMinor > currentSavedMinor) {
        alert('Không thể rút quá số tiền đang có');
        return;
      }
      newSavedMinor -= adjustMinor;
    }

    try {
      const res = await fetch(`/api/v1/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAmountMajor: minorToMajor(newSavedMinor, 'VND'),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Lỗi khi cập nhật tích lũy');
      }

      setAdjustingId(null);
      setAdjustAmountMajor('');
      fetchGoals();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi cập nhật');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục tiêu này không?')) return;

    try {
      const res = await fetch(`/api/v1/goals/${goalId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        fetchGoals();
      } else {
        alert(data.message || 'Lỗi khi xóa mục tiêu');
      }
    } catch (err) {
      console.error('Delete goal error:', err);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'HOUSE':
        return <Home className="w-5 h-5 text-emerald-400" />;
      case 'CAR':
        return <Car className="w-5 h-5 text-indigo-400" />;
      case 'RETIREMENT':
        return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'TRAVEL':
        return <Compass className="w-5 h-5 text-sky-400" />;
      default:
        return <Target className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="rounded-3xl bg-slate-950 dark:bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl dark:shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-md font-bold text-slate-100 flex items-center gap-1.5">
            <span>Theo Dõi Mục Tiêu Tài Chính (Wealth Goals)</span>
            <Link href="/guide?tab=goals" title="Xem hướng dẫn sử dụng luồng mục tiêu tích sản">
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer" />
            </Link>
          </h4>
          <p className="text-xs text-slate-400">Đặt kế hoạch mua nhà, mua xe và dự tính thời gian hoàn thành tự động</p>
        </div>
      </div>

      {/* Savings Info Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tốc độ tiết kiệm tháng này:</span>
          <div className="text-lg font-black text-slate-100">
            {isSavingsNegative ? (
              <span className="text-rose-400">Âm {minorToMajor(Math.abs(monthlySavingsMinor), 'VND').toLocaleString('vi-VN')} đ</span>
            ) : (
              <span className="text-emerald-400">+{minorToMajor(monthlySavingsMinor, 'VND').toLocaleString('vi-VN')} đ/tháng</span>
            )}
          </div>
        </div>

        {isSavingsNegative ? (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl max-w-md text-[10px] text-rose-500">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              Chi tiêu tháng này lớn hơn thu nhập. Hệ thống đang lấy hạn mức mặc định <b>10.000.000 đ/tháng</b> để tính toán ngày đạt mục tiêu.
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl max-w-md text-[10px] text-emerald-500">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Tuyệt vời! Thời gian hoàn thành mục tiêu đang được tính toán theo dòng tiền thực tế của bạn.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals List */}
        <div className="lg:col-span-2 space-y-4">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mục tiêu của bạn</h5>

          {loading && (
            <div className="flex items-center justify-center py-10 text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang tải danh sách mục tiêu...</span>
            </div>
          )}

          {!loading && goals.length === 0 && (
            <div className="rounded-2xl bg-slate-900/40 dark:bg-slate-950/40 border border-slate-800 p-8 text-center text-slate-500 text-xs shadow-inner">
              Chưa có mục tiêu tài chính nào được tạo. Hãy thiết lập mục tiêu mua nhà/xe bên phải!
            </div>
          )}

          {!loading && goals.length > 0 && (
            <div className="space-y-4">
              {goals.map((g) => {
                const targetVND = minorToMajor(g.targetAmountMinor, 'VND');
                const currentVND = minorToMajor(g.currentAmountMinor, 'VND');
                const percent = targetVND > 0 ? (currentVND / targetVND) * 100 : 0;
                const isAchieved = currentVND >= targetVND;

                return (
                  <div key={g._id} className="p-5 rounded-2xl bg-slate-900/50 dark:bg-slate-950 border border-slate-800 space-y-4 shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          {getCategoryIcon(g.category)}
                        </div>
                        <div className="space-y-1">
                          <h6 className="font-extrabold text-slate-200 text-sm">{g.name}</h6>
                          <div className="text-[11px] text-slate-400">
                            Đã tích lũy: <b className="text-slate-200 font-semibold">{currentVND.toLocaleString('vi-VN')} đ</b> / {targetVND.toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 self-start sm:self-auto">
                        <button
                          onClick={() => setAdjustingId(adjustingId === g._id ? null : g._id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold cursor-pointer transition-all"
                        >
                          Nạp / Rút tiền
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(g._id)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-550"
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 pl-0.5">
                        <span>Tiến độ: {percent.toFixed(1)}%</span>
                        {isAchieved ? (
                          <span className="text-emerald-400 font-bold">Hoàn thành mục tiêu! 🎉</span>
                        ) : (
                          <span>Còn lại: {(targetVND - currentVND).toLocaleString('vi-VN')} đ</span>
                        )}
                      </div>
                    </div>

                    {/* Prediction banner */}
                    {!isAchieved && (
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                        <span>Dự kiến hoàn thành:</span>
                        <span className="font-extrabold text-emerald-400">
                          {new Date(g.estimatedDate).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })} (còn {Math.ceil(g.remainingMonths)} tháng)
                        </span>
                      </div>
                    )}

                    {/* Inline Adjust Money Form */}
                    {adjustingId === g._id && (
                      <div className="p-3 bg-slate-900 border border-indigo-500/20 rounded-xl space-y-2 animate-in slide-in-from-top duration-150">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cập nhật số dư tích lũy</div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Số tiền (VND)"
                            value={adjustAmountMajor}
                            onChange={(e) => setAdjustAmountMajor(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleAdjustSaved(g._id, g.currentAmountMinor, 'DEPOSIT')}
                            className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-emerald-400 cursor-pointer"
                          >
                            + Nạp thêm
                          </button>
                          <button
                            onClick={() => handleAdjustSaved(g._id, g.currentAmountMinor, 'WITHDRAW')}
                            className="px-3 py-1.5 bg-rose-500 text-slate-100 rounded-lg text-xs font-bold hover:bg-rose-400 cursor-pointer"
                          >
                            - Rút bớt
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Goal Form */}
        <div className="p-5 rounded-2xl bg-slate-900/50 dark:bg-slate-950 border border-slate-800 shadow-md space-y-4 self-start">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thêm mục tiêu mới</h5>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-2 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateGoal} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tên mục tiêu</label>
              <input
                type="text"
                required
                placeholder="VD: Mua căn hộ Vinhomes 🏢"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Loại mục tiêu</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'HOUSE' | 'CAR' | 'RETIREMENT' | 'TRAVEL' | 'OTHER')}
                className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cần tích lũy (VND)</label>
                <input
                  type="number"
                  required
                  placeholder="VD: 2000000000"
                  value={targetAmountMajor}
                  onChange={(e) => setTargetAmountMajor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Đã tích lũy (VND)</label>
                <input
                  type="number"
                  placeholder="VD: 500000000"
                  value={currentAmountMajor}
                  onChange={(e) => setCurrentAmountMajor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Hạn chót mong muốn (Hạn chót tự chọn)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Tạo Mục Tiêu</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
