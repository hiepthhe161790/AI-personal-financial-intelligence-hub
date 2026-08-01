'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, CheckSquare, Square, TrendingUp, Sparkles, Award, HelpCircle } from 'lucide-react';
import { formatMoney, formatNumericInput } from '@/domain/money';

interface PersonalWealthTrackerProps {
  currentNetWorthVND: number;
}

export default function PersonalWealthTracker({ currentNetWorthVND }: PersonalWealthTrackerProps) {
  const [targetMonthlySavings, setTargetMonthlySavings] = useState(15000000); // Default 15m / month
  const [currentMonthSavings, setCurrentMonthSavings] = useState(0); // Dynamically computed
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState('15,000,000');

  const [checklist, setChecklist] = useState([
    {
      id: 'chk-1',
      title: 'Đắp đầy Quỹ Khẩn Cấp (tối thiểu 3-6 tháng chi tiêu)',
      desc: 'Giữ bằng tiền mặt hoặc tiết kiệm ngắn hạn để bảo vệ trước biến cố.',
      completed: true,
    },
    {
      id: 'chk-2',
      title: 'Chạy Báo Cáo AI Research Brief',
      desc: 'Rà soát rủi ro phân bổ danh mục & loại bỏ tâm lý FOMO mạo hiểm.',
      completed: true,
    },
    {
      id: 'chk-3',
      title: 'Thực Hiện Tái Cân Đối Danh Mục (Rebalancing)',
      desc: 'Chốt lời kênh tăng quá nóng và nạp thêm tiền vào kênh đang định giá rẻ.',
      completed: false,
    },
    {
      id: 'chk-4',
      title: 'Cập Nhật Số Dư Định Giá Mới Nhất',
      desc: 'Đảm bảo dữ liệu không bị cảnh báo quá hạn (>14 ngày).',
      completed: true,
    },
  ]);

  // Load target savings & checklist from localStorage on mount
  useEffect(() => {
    const savedTarget = localStorage.getItem('target_monthly_savings');
    if (savedTarget) {
      setTargetMonthlySavings(Number(savedTarget));
      setTempTarget(formatNumericInput(savedTarget));
    }
    
    const savedChecklist = localStorage.getItem('discipline_checklist_v1');
    if (savedChecklist) {
      try {
        setChecklist(JSON.parse(savedChecklist));
      } catch (e) {
        console.error('Failed to parse checklist:', e);
      }
    }
  }, []);

  // Fetch actual monthly savings (VND major) dynamically when Net Worth changes
  useEffect(() => {
    const fetchCurrentMonthSavings = async () => {
      try {
        const res = await fetch('/api/v1/transactions?limit=100');
        const json = await res.json();
        if (json.status === 'success') {
          const txs = json.data.transactions;
          const now = new Date();
          const startOfMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          
          let netSavingsMinor = 0;
          for (const tx of txs) {
            const occurredOnStr = tx.occurredOn.slice(0, 10);
            if (occurredOnStr >= startOfMonthStr) {
              if (tx.type === 'INCOME') {
                netSavingsMinor += tx.amountMinor;
              } else {
                netSavingsMinor -= tx.amountMinor;
              }
            }
          }
          // Net savings = income - expense for this month. 
          // VND minor matches major unit since VND factor is 1
          setCurrentMonthSavings(Math.max(0, netSavingsMinor));
        }
      } catch (err) {
        console.error('Failed to calculate current month savings:', err);
      }
    };

    fetchCurrentMonthSavings();
  }, [currentNetWorthVND]);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
      localStorage.setItem('discipline_checklist_v1', JSON.stringify(next));
      return next;
    });
  };

  const progressPercent = Math.min(100, Math.round((currentMonthSavings / targetMonthlySavings) * 100));
  const completedCount = checklist.filter((c) => c.completed).length;

  const handleSaveTarget = () => {
    const cleanValue = tempTarget.replace(/,/g, '');
    const parsed = Number(cleanValue);
    if (!isNaN(parsed) && parsed > 0) {
      setTargetMonthlySavings(parsed);
      localStorage.setItem('target_monthly_savings', String(parsed));
    }
    setEditingTarget(false);
  };

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Mục Tiêu Tích Sản Hàng Tháng Của Bạn</span>
              <Link href="/guide?tab=cockpit" title="Xem hướng dẫn sử dụng Cockpit & Checklist">
                <HelpCircle className="w-4 h-4 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer" />
              </Link>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Personal Cockpit
              </span>
            </h3>
            <p className="text-xs text-slate-400">Theo dõi tiến độ tích lũy dòng tiền & kỷ luật tài chính cá nhân</p>
          </div>
        </div>

        <button
          onClick={() => {
            setTempTarget(formatNumericInput(String(targetMonthlySavings)));
            setEditingTarget(!editingTarget);
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-all cursor-pointer"
        >
          {editingTarget ? 'Hủy' : 'Đổi Mục Tiêu'}
        </button>
      </div>

      {/* Edit target form */}
      {editingTarget && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 animate-in fade-in duration-200">
          <span className="text-xs font-bold text-slate-300 shrink-0">Mục tiêu tiết kiệm tháng (VNĐ):</span>
          <input
            type="text"
            value={tempTarget}
            onChange={(e) => setTempTarget(formatNumericInput(e.target.value))}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSaveTarget}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Lưu
          </button>
        </div>
      )}

      {/* Progress Bar Card */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs text-slate-400">Đã tích lũy tháng này:</div>
            <div className="text-xl font-extrabold text-emerald-400">
              {formatMoney(currentMonthSavings, 'VND')}{' '}
              <span className="text-xs font-normal text-slate-400">
                / {formatMoney(targetMonthlySavings, 'VND')}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-extrabold text-slate-100 font-mono">{progressPercent}%</span>
            <div className="text-[10px] text-slate-400">Hoàn thành mục tiêu</div>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Monthly Discipline Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Checklist Kỷ Luật Tài Chỉ Hàng Tháng ({completedCount}/{checklist.length})
          </h4>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            {completedCount === checklist.length ? 'Hoàn hảo 100%' : `Còn ${checklist.length - completedCount} việc`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleChecklist(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                item.completed
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-400'
              }`}
            >
              {item.completed ? (
                <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className={`text-xs font-bold ${item.completed ? 'text-slate-100' : 'text-slate-300'}`}>
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
