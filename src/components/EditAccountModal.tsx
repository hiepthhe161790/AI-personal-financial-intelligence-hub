'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { AccountType } from '@/models/Account';
import { minorToMajor } from '@/domain/money';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: {
    _id: string;
    name: string;
    type: AccountType;
    currency: string;
    currentBalanceMinor: number;
    ticker?: string;
    quantity?: number;
    costBasisMinor?: number;
  } | null;
}

const ACCOUNT_TYPES: { label: string; value: AccountType }[] = [
  { label: 'Ví Tiền Mặt (CASH)', value: 'CASH' },
  { label: 'Tài Khoản Ngân Hàng (BANK)', value: 'BANK' },
  { label: 'Sổ Tiết Kiệm (SAVINGS)', value: 'SAVINGS' },
  { label: 'Vàng / Nữ Trang (GOLD)', value: 'GOLD' },
  { label: 'Chứng Khoán / Cổ Phiếu (STOCK)', value: 'STOCK' },
  { label: 'Quỹ Đầu Tư / CCQ (FUND)', value: 'FUND' },
  { label: 'Tiền Mã Hóa / Crypto (CRYPTO)', value: 'CRYPTO' },
  { label: 'Tài Sản Khác (OTHER_ASSET)', value: 'OTHER_ASSET' },
  { label: 'Khoản Nợ / Vay (LIABILITY)', value: 'LIABILITY' },
];

export default function EditAccountModal({
  isOpen,
  onClose,
  onSuccess,
  account,
}: EditAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('BANK');
  const [amountMajor, setAmountMajor] = useState<string>('');
  const [currency, setCurrency] = useState('VND');
  const [notes, setNotes] = useState('');
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costBasisMajor, setCostBasisMajor] = useState('');

  const INVESTMENT_TYPES: AccountType[] = ['STOCK', 'CRYPTO', 'FUND', 'GOLD'];

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setCurrency(account.currency);
      setAmountMajor(String(minorToMajor(account.currentBalanceMinor, account.currency)));
      setTicker(account.ticker || '');
      setQuantity(account.quantity ? String(account.quantity) : '');
      setCostBasisMajor(
        account.costBasisMinor
          ? String(minorToMajor(account.costBasisMinor, account.currency))
          : ''
      );
      setNotes('');
      setError(null);
    }
  }, [account]);

  if (!isOpen || !account) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parsedAmount = parseFloat(amountMajor);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        throw new Error('Vui lòng nhập số tiền hợp lệ (không âm)');
      }

      const res = await fetch(`/api/v1/accounts/${account._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          currentBalanceMajor: parsedAmount,
          currency,
          notes,
          ticker: (type === 'GOLD' || type === 'STOCK') ? ticker.trim().toUpperCase() : undefined,
          quantity: (type === 'GOLD' || type === 'STOCK') ? parseFloat(quantity) : undefined,
          costBasisMajor: INVESTMENT_TYPES.includes(type) && costBasisMajor
            ? parseFloat(costBasisMajor)
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Lỗi khi lưu chỉnh sửa tài khoản');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Save className="w-5 h-5 text-indigo-400" />
            Chỉnh Sửa Tài Sản
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-2.5 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tên Tài Khoản / Tài Sản <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Vietcombank Tiết Kiệm, Ví Tiền Mặt..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Loại Tài Sản <span className="text-indigo-400">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Loại Tiền Tệ
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="VND">VND (Việt Nam Đồng)</option>
                <option value="USD">USD (Đô la Mỹ)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>

          {/* Conditional inputs for Stock & Gold automated valuation */}
          {(type === 'GOLD' || type === 'STOCK') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-l-2 border-indigo-500 pl-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {type === 'STOCK' ? 'Mã Cổ Phiếu (Ticker)' : 'Mã Hiệu Vàng'} <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={type === 'STOCK' ? 'VD: HPG, FPT, TCB...' : 'VD: SJC, NHAN...'}
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {type === 'STOCK' ? 'Số lượng Cổ Phiếu' : 'Số lượng (Chỉ/Lượng)'} <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={type === 'STOCK' ? 'VD: 1000' : 'VD: 5.5'}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Số Tiền Hàng / Giá Trị Hiện Tại (Đơn vị chính) <span className="text-indigo-400">*</span>
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="VD: 50000000 (Nhập 0 nếu muốn tự động đồng bộ theo Ticker & Số lượng)"
              value={amountMajor}
              onChange={(e) => setAmountMajor(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Cost Basis for investment accounts — enables P&L tracking */}
          {INVESTMENT_TYPES.includes(type) && (
            <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
              <label className="block text-xs font-semibold text-indigo-300 mb-1">
                💰 Tổng Vốn Đã Bỏ Ra / Giá Vốn (để tính Lãi/Lỗ)
              </label>
              <input
                type="number"
                step="any"
                placeholder="VD: 40000000 (để trống nếu không cần theo dõi P&L)"
                value={costBasisMajor}
                onChange={(e) => setCostBasisMajor(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Nhập tổng số tiền thực đã bỏ ra mua tài sản này. Hệ thống sẽ tự tính % lãi/lỗ so với giá trị hiện tại.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ghi Chú Thay Đổi Số Dư</label>
            <input
              type="text"
              placeholder="VD: Nhận cổ tức, cập nhật giá trị thực tế..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Lưu Cập Nhật</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
