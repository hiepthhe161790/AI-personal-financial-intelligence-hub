"use client";

import { useState, useEffect } from "react";
import { 
  PlusCircle, Trash2, ArrowUpRight, ArrowDownRight, 
  Calendar, Tag, FileText, Landmark, Loader2, AlertCircle, Sparkles 
} from "lucide-react";
import { formatMoney } from "@/domain/money";

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
  "Ăn uống 🍔",
  "Cà phê & Đi chợ ☕",
  "Nhà cửa & Tiền thuê 🏠",
  "Di chuyển & Xăng xe 🚗",
  "Mua sắm & Quần áo 🛍️",
  "Hóa đơn & Tiện ích ⚡",
  "Giải trí & Du lịch 🎬",
  "Y tế & Sức khỏe 🏥",
  "Đầu tư & Tiết kiệm 📈",
  "Khoản nợ & Lãi suất 💸",
  "Chi phí khác 🌀"
];

const INCOME_CATEGORIES = [
  "Lương thưởng 💼",
  "Kinh doanh 🏪",
  "Đầu tư & Lãi suất 📊",
  "Được tặng & Quà biếu 🎁",
  "Thu nhập khác 🪙"
];

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

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/transactions?limit=10");
      const json = await res.json();
      if (json.status === "success") {
        setTransactions(json.data.transactions);
      } else {
        setError(json.message || "Không thể tải danh sách giao dịch");
      }
    } catch (err) {
      setError("Lỗi kết nối tới máy chủ khi tải giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // Default to first account if available
    if (accounts.length > 0 && !formData.accountId) {
      setFormData(prev => ({ ...prev, accountId: accounts[0]._id }));
    }
  }, [accounts]);

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
          amountMajor: parseFloat(formData.amountMajor),
          category: formData.category,
          occurredOn: new Date(formData.occurredOn).toISOString(),
          notes: formData.notes
        })
      });

      const json = await res.json();
      if (json.status === "success") {
        // Reset form
        setFormData(prev => ({
          ...prev,
          amountMajor: "",
          notes: "",
          occurredOn: new Date().toISOString().split("T")[0]
        }));
        setShowAddForm(false);
        fetchTransactions();
        onTransactionChanged(); // Refresh net worth & accounts in parent
      } else {
        setError(json.message || "Lỗi khi lưu giao dịch");
      }
    } catch (err) {
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
        onTransactionChanged(); // Refresh net worth & accounts in parent
      } else {
        setError(json.message || "Lỗi khi xóa giao dịch");
      }
    } catch (err) {
      setError("Lỗi kết nối khi xóa giao dịch");
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>Sổ Nhật Ký Giao Dịch Vặt</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Tự động hóa số dư
            </span>
          </h3>
          <p className="text-xs text-slate-400">Ghi chép chi tiêu nhỏ để cập nhật trực tiếp vào Net Worth</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showAddForm ? "Đóng Form" : "Ghi chép thu chi ✍️"}</span>
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
        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Loại giao dịch</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange("EXPENSE")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    formData.type === "EXPENSE"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  Chi Phí (Expense)
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("INCOME")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    formData.type === "INCOME"
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
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
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
                  type="number"
                  step="any"
                  placeholder="Ví dụ: 50000"
                  value={formData.amountMajor}
                  onChange={(e) => setFormData(prev => ({ ...prev, amountMajor: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-12 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500/50"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                  {accounts.find(a => a._id === formData.accountId)?.currency || "VND"}
                </span>
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              >
                {(formData.type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Date picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Ngày giao dịch</label>
              <input
                type="date"
                value={formData.occurredOn}
                onChange={(e) => setFormData(prev => ({ ...prev, occurredOn: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
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
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
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
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Giao dịch gần đây
        </h4>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-xs">Đang tải lịch sử giao dịch...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            Chưa có giao dịch thu chi nào được ghi chép. Hãy dùng nút "Ghi chép thu chi ✍️" ở trên để ghi nhận.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {transactions.map((tx) => {
              const isExpense = tx.type === "EXPENSE";
              const accountName = typeof tx.accountId === "object" ? tx.accountId?.name : "Tài khoản";

              return (
                <div key={tx._id} className="py-3.5 flex items-center justify-between group transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isExpense 
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{tx.category}</span>
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
