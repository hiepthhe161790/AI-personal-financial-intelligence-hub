'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings, ArrowLeft, Key, Eye, EyeOff, Save,
  CheckCircle2, AlertCircle, Loader2, Moon, Sun,
  Bell, Shield, Trash2, Database, Info,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface SettingsData {
  hasApiKey: boolean;
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Gemini API Key form
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetch('/api/v1/user/settings')
      .then((r) => r.json())
      .then((j) => {
        if (j.status === 'success') setSettings(j.data as SettingsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveApiKey = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/v1/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: apiKey }),
      });
      const j = await res.json();
      if (j.status === 'success') {
        setSaveStatus('success');
        setSaveMsg('Đã lưu Gemini API Key thành công!');
        setSettings(j.data as SettingsData);
        setApiKey('');
      } else {
        setSaveStatus('error');
        setSaveMsg(j.message || 'Lỗi khi lưu');
      }
    } catch {
      setSaveStatus('error');
      setSaveMsg('Lỗi kết nối');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const handleClearApiKey = async () => {
    if (!confirm('Bạn có chắc muốn xóa Gemini API Key?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/v1/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: '' }),
      });
      const j = await res.json();
      if (j.status === 'success') {
        setSettings(j.data as SettingsData);
        setSaveStatus('success');
        setSaveMsg('Đã xóa API Key.');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Cài Đặt</h1>
              <p className="text-xs text-slate-400">Quản lý cấu hình tài khoản và ứng dụng</p>
            </div>
          </div>
        </div>

        {/* ── Giao diện ─────────────────────────────────────────────────────── */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Moon className="w-4 h-4 text-violet-400" />
            Giao Diện
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">Chủ đề sáng / tối</p>
              <p className="text-xs text-slate-400 mt-0.5">Hiện đang dùng chế độ {theme === 'dark' ? 'Tối 🌙' : 'Sáng ☀️'}</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full border transition-all cursor-pointer ${theme === 'dark'
                  ? 'bg-violet-600 border-violet-500'
                  : 'bg-slate-300 border-slate-400'
                }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full shadow-sm transition-transform flex items-center justify-center text-[10px] ${theme === 'dark' ? 'translate-x-6 bg-white' : 'translate-x-0.5 bg-white'
                }`}>
                {theme === 'dark' ? <Moon className="w-3 h-3 text-violet-600" /> : <Sun className="w-3 h-3 text-amber-500" />}
              </span>
            </button>
          </div>
        </section>

        {/* ── AI Integration ─────────────────────────────────────────────────── */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            Tích Hợp AI (Gemini)
          </h2>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tải...
            </div>
          ) : (
            <>
              {/* Status badge */}
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border ${settings?.hasApiKey
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700'
                }`}>
                {settings?.hasApiKey
                  ? <><CheckCircle2 className="w-3.5 h-3.5" /> Gemini API Key đã được cấu hình</>
                  : <><Info className="w-3.5 h-3.5" /> Chưa có Gemini API Key. Cần thiết cho tính năng AI Phân Tích.</>}
              </div>

              {/* Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  {settings?.hasApiKey ? 'Thay thế API Key mới' : 'Nhập Gemini API Key'}
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="AIza..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((p) => !p)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-100 cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lấy API Key tại{' '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                    aistudio.google.com/apikey
                  </a>. API Key được mã hóa trước khi lưu vào database.
                </p>
              </div>

              {/* Save status */}
              {saveStatus !== 'idle' && (
                <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border ${saveStatus === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                  {saveStatus === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {saveMsg}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveApiKey}
                  disabled={saving || !apiKey.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Lưu API Key
                </button>
                {settings?.hasApiKey && (
                  <button
                    onClick={handleClearApiKey}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa API Key
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        {/* ── Dữ liệu & Quyền riêng tư ────────────────────────────────────── */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Dữ Liệu & Bảo Mật
          </h2>

          <div className="space-y-3 text-xs text-slate-400">
            {[
              { icon: Database, text: 'Tất cả dữ liệu tài chính được lưu trữ trong MongoDB của bạn — không chia sẻ với bên thứ ba.' },
              { icon: Shield, text: 'Gemini API Key được mã hóa AES-256 trước khi lưu vào database.' },
              { icon: Bell, text: 'Smart Alerts chỉ chạy server-side khi bạn truy cập dashboard — không có push notification ra ngoài.' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 mt-0.5 text-slate-500 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Phiên bản ────────────────────────────────────────────────────── */}
        <section className="text-center text-[11px] text-slate-600 space-y-1 pb-6">
          <p>AI Personal Financial Intelligence Hub</p>
          <p>Sprint 31 · Phiên bản 1.31.0</p>
          <Link href="/" className="text-emerald-500/70 hover:text-emerald-400 transition-colors">
            ← Về trang chính
          </Link>
        </section>
      </div>
    </div>
  );
}
