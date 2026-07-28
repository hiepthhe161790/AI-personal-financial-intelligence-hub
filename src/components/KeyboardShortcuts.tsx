'use client';

import { useState, useEffect, useCallback } from 'react';
import { Keyboard, X, Command } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['?'], description: 'Hiển thị / ẩn bảng phím tắt này' },
  { keys: ['N'], description: 'Chuyển sang tab Tổng Quan (Net Worth)' },
  { keys: ['S'], description: 'Chuyển sang tab Mô Phỏng Kịch Bản' },
  { keys: ['A'], description: 'Chuyển sang tab AI Phân Tích & Rủi Ro' },
  { keys: ['M'], description: 'Chuyển sang tab Thị Trường & Tin Tức' },
  { keys: ['P'], description: 'Chuyển sang tab AI Academy (Pro)' },
  { keys: ['Ctrl', 'R'], description: 'Tải lại dữ liệu tài sản' },
  { keys: ['Esc'], description: 'Đóng modal / bảng phím tắt đang mở' },
];

interface KeyboardShortcutsProps {
  onTabChange?: (tab: string) => void;
  onRefresh?: () => void;
}

export default function KeyboardShortcuts({ onTabChange, onRefresh }: KeyboardShortcutsProps) {
  const [visible, setVisible] = useState(false);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

      if (e.key === 'Escape') {
        setVisible(false);
        return;
      }

      if (isInput) return; // don't intercept typing

      if (e.key === '?') {
        e.preventDefault();
        setVisible((v) => !v);
        return;
      }

      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        onRefresh?.();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n': onTabChange?.('net-worth'); break;
        case 's': onTabChange?.('scenario'); break;
        case 'a': onTabChange?.('ai-brief'); break;
        case 'm': onTabChange?.('market'); break;
        case 'p': onTabChange?.('ai-academy'); break;
      }
    },
    [onTabChange, onRefresh],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <>
      {/* Trigger button — shown in footer / corner */}
      <button
        onClick={() => setVisible((v) => !v)}
        title="Phím tắt (nhấn ?)"
        className="fixed bottom-5 right-5 z-40 w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all shadow-lg cursor-pointer flex items-center justify-center"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      {/* Modal */}
      {visible && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => e.target === e.currentTarget && setVisible(false)}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Command className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Phím Tắt Bàn Phím</h3>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="space-y-2">
              {SHORTCUTS.map(({ keys, description }) => (
                <div key={keys.join('+')} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                  <span className="text-xs text-slate-400">{description}</span>
                  <div className="flex items-center gap-1">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-600 rounded-lg shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] text-slate-400 mt-4">
              Nhấn <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-600 rounded">?</kbd> hoặc{' '}
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-600 rounded">Esc</kbd> để đóng
            </p>
          </div>
        </div>
      )}
    </>
  );
}
