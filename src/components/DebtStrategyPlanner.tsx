"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Scale, ArrowRight, Zap, Target, TrendingUp, Info, HelpCircle,
  AlertTriangle, ShieldCheck, DollarSign, Calendar, RefreshCw, Lightbulb
} from "lucide-react";
import { formatMoney, minorToMajor, formatNumericInput, parseNumericInput } from "@/domain/money";

interface Account {
  _id: string;
  name: string;
  type: string;
  currency: string;
  currentBalanceMinor: number;
}

interface DebtInput {
  _id: string;
  name: string;
  balance: number; // in major unit
  interestRate: number; // annual rate in %
  minPayment: number; // monthly min payment in major unit
  currency: string;
}

export default function DebtStrategyPlanner({ accounts }: { accounts: Account[] }) {
  const liabilityAccounts = useMemo(() => {
    return accounts.filter(acc => acc.type === "LIABILITY" && acc.currentBalanceMinor > 0);
  }, [accounts]);

  const [debts, setDebts] = useState<DebtInput[]>([]);
  const [extraPayment, setExtraPayment] = useState<number>(2000000); // 2 million VND default extra payment

  // Initialize inputs when liability accounts change
  useEffect(() => {
    const initialDebts: DebtInput[] = liabilityAccounts.map(acc => {
      const balanceMajor = minorToMajor(acc.currentBalanceMinor, acc.currency);
      return {
        _id: acc._id,
        name: acc.name,
        balance: balanceMajor,
        // Set smart defaults
        interestRate: acc.name.toLowerCase().includes("tín dụng") ? 24 : 10, // Credit card defaults to 24%, bank loan to 10%
        minPayment: Math.max(500000, Math.round(balanceMajor * 0.03)), // 3% of balance or 500k VND min
        currency: acc.currency
      };
    });
    setDebts(initialDebts);
  }, [liabilityAccounts]);

  const handleDebtChange = (index: number, key: keyof DebtInput, value: number) => {
    setDebts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  // Simulation logic for Snowball and Avalanche
  const runSimulation = (strategy: "SNOWBALL" | "AVALANCHE") => {
    if (debts.length === 0) return { totalMonths: 0, totalInterest: 0, schedule: [] };

    // Clone debts to track changing balances during simulation
    let activeDebts = debts.map(d => ({ ...d, currentBalance: d.balance }));
    const currency = debts[0].currency;

    // Sorting strategy
    if (strategy === "SNOWBALL") {
      // Smallest balance first
      activeDebts.sort((a, b) => a.currentBalance - b.currentBalance);
    } else {
      // Highest interest rate first
      activeDebts.sort((a, b) => b.interestRate - a.interestRate);
    }

    let totalInterest = 0;
    let months = 0;
    const schedule: any[] = [];
    const maxMonths = 360; // 30 years limit to avoid infinite loops

    while (activeDebts.some(d => d.currentBalance > 0) && months < maxMonths) {
      months++;
      let interestThisMonth = 0;
      let requiredMinPayment = 0;

      // 1. Calculate monthly interest and subtract minimum payments
      activeDebts.forEach(d => {
        if (d.currentBalance > 0) {
          const monthlyRate = d.interestRate / 12 / 100;
          const interest = d.currentBalance * monthlyRate;
          d.currentBalance += interest;
          interestThisMonth += interest;
          requiredMinPayment += d.minPayment;
        }
      });

      totalInterest += interestThisMonth;

      // Available snowball money starts with the extra budget
      let availableExtra = extraPayment;

      // 2. Pay minimums first
      activeDebts.forEach(d => {
        if (d.currentBalance > 0) {
          const payment = Math.min(d.currentBalance, d.minPayment);
          d.currentBalance -= payment;
        }
      });

      // 3. Apply snowball (extra budget + minimums from cleared debts) to target debt
      for (let i = 0; i < activeDebts.length; i++) {
        const d = activeDebts[i];
        if (d.currentBalance > 0) {
          // Put all remaining extra money into this highest priority debt
          const extraApplied = Math.min(d.currentBalance, availableExtra);
          d.currentBalance -= extraApplied;
          availableExtra -= extraApplied;

          if (availableExtra <= 0) break; // Extra money fully used
        }
      }

      schedule.push({
        month: months,
        interest: interestThisMonth,
        remaining: activeDebts.reduce((sum, d) => sum + d.currentBalance, 0)
      });
    }

    return {
      totalMonths: months,
      totalInterest,
      currency
    };
  };

  const snowballResult = useMemo(() => runSimulation("SNOWBALL"), [debts, extraPayment]);
  const avalancheResult = useMemo(() => runSimulation("AVALANCHE"), [debts, extraPayment]);

  const interestSaved = useMemo(() => {
    return Math.max(0, snowballResult.totalInterest - avalancheResult.totalInterest);
  }, [snowballResult, avalancheResult]);

  if (debts.length === 0) {
    return (
      <div className="rounded-3xl bg-slate-950 dark:bg-slate-900/60 border border-slate-800 p-8 text-center space-y-3 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 mx-auto">
          <Scale className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-100">Không Phát Hiện Khoản Nợ Nào</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Ứng dụng không tìm thấy tài khoản nợ (Liability) nào đang có số dư dương. Chiến lược trả nợ chỉ khả dụng khi bạn có các khoản nợ cần thanh toán.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-1.5">
          <span>Công Cụ Lập Kế Hoạch Trả Nợ</span>
          <Link href="/guide?tab=rebalance" title="Xem hướng dẫn lập chiến lược trả nợ">
            <HelpCircle className="w-4 h-4 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer" />
          </Link>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Giả lập Snowball vs Avalanche
          </span>
        </h3>
        <p className="text-xs text-slate-400">Tối ưu hóa thời gian và tiền lãi khi trả dứt điểm các khoản nợ</p>
      </div>

      {/* Simulator Inputs & Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Debt inputs list */}
        <div className="lg:col-span-2 space-y-4 rounded-3xl bg-slate-950 dark:bg-slate-900/60 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Danh sách các khoản nợ ({debts.length})
            </h4>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Điền lãi suất (%) và trả tối thiểu để AI tính toán
            </span>
          </div>

          <div className="space-y-4">
            {debts.map((debt, index) => (
              <div key={debt._id} className="p-4 rounded-2xl bg-slate-900/50 dark:bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-100">{debt.name}</div>
                  <div className="text-[10px] font-mono text-amber-500">
                    Số dư nợ: {formatMoney(Math.round(debt.balance * 100), debt.currency)}
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Lãi suất năm (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={debt.interestRate}
                    onChange={(e) => handleDebtChange(index, "interestRate", parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500/50 font-mono"
                  />
                </div>

                {/* Minimum Payment */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Trả tối thiểu / tháng</label>
                  <input
                    type="text"
                    value={formatNumericInput(debt.minPayment)}
                    onChange={(e) => handleDebtChange(index, "minPayment", parseNumericInput(e.target.value))}
                    className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500/50 font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Extra payment controller */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Số tiền trả thêm hàng tháng (Extra Repayment):</span>
              <span className="text-indigo-400 font-mono">
                +{formatMoney(Math.round(extraPayment * 100), debts[0]?.currency || "VND")} / tháng
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="20000000"
              step="500000"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-[10px] text-slate-400 flex items-start gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>Đây là khoản tiền thừa ra từ ngân sách thu chi của bạn để tập trung dứt điểm nợ nhanh hơn.</span>
            </p>
          </div>
        </div>

        {/* Right Side: Side-by-side simulation comparison */}
        <div className="space-y-6">
          {/* Comparison Card */}
          <div className="rounded-3xl bg-slate-950 dark:bg-slate-900 border border-slate-800 dark:border-indigo-500/20 p-6 space-y-6 shadow-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Kết Quả Giả Lập So Sánh
            </h4>

            {/* Metrics column */}
            <div className="space-y-4">
              {/* Avalanche Box */}
              <div className="p-4 rounded-2xl bg-slate-900/50 dark:bg-slate-950/80 border border-indigo-500/30 space-y-1">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  Phương Án Avalanche (Tối Ưu Toán Học)
                </div>
                <div className="text-2xl font-black text-slate-100 mt-1">
                  {avalancheResult.totalMonths} <span className="text-xs font-normal text-slate-400">tháng</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Tổng tiền lãi: {formatMoney(Math.round(avalancheResult.totalInterest * 100), avalancheResult.currency)}
                </div>
              </div>

              {/* Snowball Box */}
              <div className="p-4 rounded-2xl bg-slate-900/50 dark:bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-slate-500" />
                  Phương Án Snowball (Động Lực Tâm Lý)
                </div>
                <div className="text-2xl font-black text-slate-100 mt-1">
                  {snowballResult.totalMonths} <span className="text-xs font-normal text-slate-400">tháng</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Tổng tiền lãi: {formatMoney(Math.round(snowballResult.totalInterest * 100), snowballResult.currency)}
                </div>
              </div>
            </div>

            {/* Savings Analysis */}
            {interestSaved > 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Tiết Kiệm Thêm Được
                </div>
                <p className="font-mono font-bold text-sm">
                  {formatMoney(Math.round(interestSaved * 100), avalancheResult.currency)}
                </p>
                <p className="text-[10px] opacity-80">
                  bằng cách trả nợ theo chiến lược **Avalanche** (trả khoản lãi cao nhất trước).
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900/40 dark:bg-slate-950/40 border border-slate-800 text-slate-400 text-xs">
                Cả 2 chiến lược trả nợ mang lại kết quả tiền lãi tương đương nhau đối với cơ cấu nợ hiện tại của bạn.
              </div>
            )}
          </div>

          {/* Methodology Advice Banner */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="font-bold text-slate-300 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Chọn Chiến Lược Nào?</span>
            </div>
            <p className="text-[10px]">
              * **Chọn Avalanche (Thác đổ):** Nếu bạn muốn tiết kiệm tối đa tiền lãi suất trả cho ngân hàng.
            </p>
            <p className="text-[10px]">
              * **Chọn Snowball (Tuyết lăn):** Nếu bạn cần động lực tâm lý. Trả dứt điểm từng khoản nợ nhỏ sẽ giúp bạn giảm căng thẳng và có cảm giác chiến thắng nhanh hơn.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
