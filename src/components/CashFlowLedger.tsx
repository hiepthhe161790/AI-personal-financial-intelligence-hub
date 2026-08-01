"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PlusCircle, Trash2, ArrowUpRight, ArrowDownRight,
  Calendar, Landmark, Loader2, AlertCircle, Sparkles,
  Search, X, Filter, ChevronDown,
} from "lucide-react";
import { formatMoney, formatNumericInput } from "@/domain/money";
import CategoryIcon, { getCleanCategoryName } from "@/components/CategoryIcon";
import CategorySelect from "@/components/CategorySelect";

interface Account {
  _id: string;
  name: string;
  type: string;
  currency: string;
}

interface Transaction {
  _id: string;
  accountId: Account | string;
  type: "INCOME" | "EXPENSE";
  amountMinor: number;
  currency: string;
  category: string;
  occurredOn: string;
  notes?: string;
  createdAt: string;
}

interface CashFlowLedgerProps {
  accounts: Account[];
  onTransactionChanged: () => void;
}

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

const INCOME_CATEGORIES = [
  "Lương & Thưởng",
  "Kinh doanh & Làm thêm",
  "Đầu tư & Lãi suất",
  "Được tặng & Quà biếu",
  "Thu nhập khác"
];

const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

export default function CashFlowLedger({ accounts, onTransactionChanged }: CashFlowLedgerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    accountId: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    amountMajor: "",
    category: EXPENSE_CATEGORIES[0],
    occurredOn: new Date().toISOString().split("T")[0],
    notes: ""
  });

  // ─── Search & Filter states ───────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/transactions?limit=50");
      const json = await res.json();
      if (json.status === "success") {
        setTransactions(json.data.transactions);
      } else {
        setError(json.message || "Không thể tải danh sách giao dịch");
      }
    } catch {
      setError("Lỗi kết nối tới máy chủ khi tải giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    if (accounts.length > 0 && !formData.accountId) {
      setFormData(prev => ({ ...prev, accountId: accounts[0]._id }));
    }
  }, [accounts]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Derived filtered list ─────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Text search: category + notes
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inCategory = tx.category.toLowerCase().includes(q);
        const inNotes = tx.notes?.toLowerCase().includes(q) ?? false;
        if (!inCategory && !inNotes) return false;
      }
      // Type filter
      if (filterType !== "ALL" && tx.type !== filterType) return false;
      // Category filter
      if (filterCategory !== "ALL" && getCleanCategoryName(tx.category) !== getCleanCategoryName(filterCategory)) return false;
      // Date from
      if (filterDateFrom && tx.occurredOn < filterDateFrom) return false;
      // Date to (inclusive)
      if (filterDateTo && tx.occurredOn.slice(0, 10) > filterDateTo) return false;
      return true;
    });
  }, [transactions, searchQuery, filterType, filterCategory, filterDateFrom, filterDateTo]);

  const hasActiveFilters =
    searchQuery || filterType !== "ALL" || filterCategory !== "ALL" || filterDateFrom || filterDateTo;

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("ALL");
    setFilterCategory("ALL");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  // Summary of filtered results
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amountMinor, 0);
  const filteredExpense = filteredTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amountMinor, 0);

  // Adjust category default when type changes
  const handleTypeChange = (type: "INCOME" | "EXPENSE") => {
    setFormData(prev => ({
      ...prev,
      type,
      category: type === "EXPENSE" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId || !formData.amountMajor || !formData.category) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch("/api/v1/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: formData.accountId,
          type: formData.type,
          amountMajor: parseFloat(formData.amountMajor.replace(/,/g, '')),
          category: formData.category,
          occurredOn: new Date(formData.occurredOn).toISOString(),
          notes: formData.notes
        })
      });

      const json = await res.json();
      if (json.status === "success") {
        setFormData(prev => ({
          ...prev,
          amountMajor: "",
          notes: "",
          occurredOn: new Date().toISOString().split("T")[0]
        }));
        setShowAddForm(false);
        fetchTransactions();
        onTransactionChanged();
      } else {
        setError(json.message || "Lỗi khi lưu giao dịch");
      }
    } catch {
      setError("Lỗi mạng khi lưu giao dịch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này? Số dư tài khoản liên kết sẽ được tự động hoàn lại.")) {
      return;
    }

    try {
      setError(null);
      const res = await fetch(`/api/v1/transactions/${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.status === "success") {
        fetchTransactions();
        onTransactionChanged();
      } else {
        setError(json.message || "Lỗi khi xóa giao dịch");
      }
    } catch {
      setError("Lỗi kết nối khi xóa giao dịch");
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <span>Sổ Nhật Ký Giao Dịch</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Tự động hóa số dư
            </span>
          </h3>
          <p className="text-xs text-slate-400">Ghi chép chi tiêu để cập nhật trực tiếp vào Net Worth</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showAddForm ? "Đóng Form" : "Ghi chép thu chi"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Transaction Entry Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900/50 dark:bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-200 shadow-inner">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Loại giao dịch</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange("EXPENSE")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${formData.type === "EXPENSE"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                >
                  Chi Phí (Expense)
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("INCOME")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${formData.type === "INCOME"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                >
                  Thu Nhập (Income)
                </button>
              </div>
            </div>

            {/* Account selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Tài khoản thanh toán</label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="" disabled>-- Chọn tài khoản --</option>
                {accounts.map(acc => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Số tiền</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: 50,000"
                  value={formData.amountMajor}
                  onChange={(e) => setFormData(prev => ({ ...prev, amountMajor: formatNumericInput(e.target.value) }))}
                  className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-12 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500/50"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                  {accounts.find(a => a._id === formData.accountId)?.currency || "VND"}
                </span>
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Danh mục</label>
              <CategorySelect
                value={formData.category}
                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                options={formData.type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES}
                className="mt-1"
                borderClass="border-slate-800 focus:border-emerald-500/50 text-xs"
              />
            </div>

            {/* Date picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Ngày giao dịch</label>
              <input
                type="date"
                value={formData.occurredOn}
                onChange={(e) => setFormData(prev => ({ ...prev, occurredOn: e.target.value }))}
                className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Ghi chú</label>
              <input
                type="text"
                placeholder="Ví dụ: Ăn sáng phở bò, Mua quà sinh nhật..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang ghi nhận...
                </>
              ) : (
                "Lưu Giao Dịch"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Transaction History List */}
      <div className="rounded-3xl bg-slate-950 dark:bg-slate-900/60 border border-slate-800 p-6 space-y-4 shadow-xl">
        {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search box */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo danh mục, ghi chú..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type filter pills */}
            <div className="flex gap-1 p-1 bg-slate-800 rounded-xl border border-slate-700">
              {(["ALL", "INCOME", "EXPENSE"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${filterType === t
                      ? t === "ALL"
                        ? "bg-slate-600 text-slate-100"
                        : t === "INCOME"
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-rose-500 text-slate-950"
                      : "text-slate-400 hover:text-slate-100"
                    }`}
                >
                  {t === "ALL" ? "Tất Cả" : t === "INCOME" ? "Thu" : "Chi"}
                </button>
              ))}
            </div>

            {/* Advanced filter toggle */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${showFilters || filterCategory !== "ALL" || filterDateFrom || filterDateTo
                  ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-100"
                }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Bộ lọc
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Xóa lọc
              </button>
            )}
          </div>

          {/* Advanced filters panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Category filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Danh mục</label>
                <CategorySelect
                  value={filterCategory}
                  onChange={(val) => setFilterCategory(val)}
                  options={["ALL", ...ALL_CATEGORIES]}
                  className="mt-1"
                  borderClass="border-slate-700 focus:border-emerald-550/50 text-xs"
                />
              </div>

              {/* Date from */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Từ ngày</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Date to */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Đến ngày</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          )}

          {/* Results summary */}
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Hiển thị <span className="text-slate-300 font-bold">{filteredTransactions.length}</span>
              {" / "}{transactions.length} giao dịch
              {hasActiveFilters && " (đã lọc)"}
            </span>
            {filteredTransactions.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-mono">
                  +{formatMoney(filteredIncome, "VND")}
                </span>
                <span className="text-rose-400 font-mono">
                  -{formatMoney(filteredExpense, "VND")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-xs">Đang tải lịch sử giao dịch...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-xs text-slate-500">
              {hasActiveFilters
                ? "Không tìm thấy giao dịch nào khớp với bộ lọc hiện tại."
                : "Chưa có giao dịch thu chi nào được ghi chép. Hãy dùng nút \"Ghi chép thu chi\" ở trên để ghi nhận."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                Xóa bộ lọc để xem tất cả →
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredTransactions.map((tx) => {
              const isExpense = tx.type === "EXPENSE";
              const accountName = typeof tx.accountId === "object" ? tx.accountId?.name : "Tài khoản";

              return (
                <div key={tx._id} className="py-3.5 flex items-center justify-between group transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isExpense
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                      {isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <CategoryIcon category={tx.category} className="w-3.5 h-3.5 text-slate-400" />
                        <span>{getCleanCategoryName(tx.category)}</span>
                        {tx.notes && (
                          <span className="text-[10px] font-normal text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {tx.notes}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Landmark className="w-3 h-3 text-slate-500" />
                          {accountName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(tx.occurredOn).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold ${isExpense ? "text-rose-400" : "text-emerald-400"}`}>
                      {isExpense ? "-" : "+"}
                      {formatMoney(tx.amountMinor, tx.currency)}
                    </span>

                    <button
                      onClick={() => handleDelete(tx._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Xóa giao dịch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
