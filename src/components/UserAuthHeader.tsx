/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, ShieldCheck, Sun, Moon, Settings, Key, X, Loader2, Check, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "./ThemeProvider";

export default function UserAuthHeader() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();

  // Settings modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/v1/user/settings");
      const json = await res.json();
      if (res.ok && json.status === "success") {
        setHasSavedKey(json.data.hasApiKey);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  // Fetch settings status
  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey }),
      });
      const json = await res.json();
      if (res.ok && json.status === "success") {
        setHasSavedKey(json.data.hasApiKey);
        setGeminiApiKey("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearKey = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa API Key này không? Hệ thống sẽ quay về dùng Key mặc định.")) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: "" }),
      });
      const json = await res.json();
      if (res.ok && json.status === "success") {
        setHasSavedKey(false);
        setGeminiApiKey("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to clear settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700/50 transition-all cursor-pointer"
        title={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      >
        {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
      </button>

      {session && session.user ? (
        <>
          {/* User Profile display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-xs font-semibold text-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="max-w-[120px] truncate">{session.user.name || session.user.email}</span>
          </div>

          {/* Settings Config Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition-all cursor-pointer"
            title="Cấu hình API Key"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout Button */}
          <button
            onClick={() => signOut()}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn()}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Đăng Nhập</span>
        </button>
      )}

      {/* Settings Modal (Gemini API Key configuration) */}
      {mounted && isSettingsOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-200">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
                <Key className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Cấu Hinh API Key Cá Nhân</h3>
                <p className="text-xs text-slate-400">Thiết lập khóa API Gemini của riêng bạn</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder={hasSavedKey ? "••••••••••••••••••••••••••••" : "Nhập API Key của bạn từ Google AI Studio"}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none text-slate-100 placeholder:text-slate-500 transition-all"
                />
              </div>

              {hasSavedKey && (
                <div className="flex items-center justify-between text-xs px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã cấu hình API Key cá nhân.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Xóa Key
                  </button>
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 flex items-start gap-1.5">
                <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Lợi ích:</strong> Điền API Key của riêng bạn để sử dụng các tính năng phân tích AI mà không bị giới hạn hạn mức chung của hệ thống. Bạn có thể lấy Key miễn phí tại{" "}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline font-semibold"
                  >
                    Google AI Studio
                  </a>.
                </span>
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl hover:bg-slate-800 text-slate-400 transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving || (!geminiApiKey && !hasSavedKey)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-slate-100 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu Cấu Hình</span>
                  )}
                </button>
              </div>
            </form>

            {showSuccess && (
              <div className="absolute bottom-4 left-4 right-4 bg-emerald-500 text-slate-950 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 animate-in slide-in-from-bottom-2 duration-300">
                <Check className="w-4 h-4" />
                <span>Cập nhật cấu hình thành công!</span>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
