'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, ChevronDown, ChevronUp, X, CheckCircle2 } from 'lucide-react';
import type { FinancialAlert, AlertSeverity } from '@/app/api/v1/alerts/route';

const SEVERITY_STYLES: Record<AlertSeverity, { border: string; bg: string; badge: string; dot: string }> = {
  danger:  { border: 'border-rose-500/40',    bg: 'bg-rose-500/10',    badge: 'bg-rose-500',    dot: 'bg-rose-400'    },
  warning: { border: 'border-amber-500/40',   bg: 'bg-amber-500/10',   badge: 'bg-amber-500',   dot: 'bg-amber-400'   },
  success: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500', dot: 'bg-emerald-400' },
  info:    { border: 'border-slate-600/60',   bg: 'bg-slate-800/50',   badge: 'bg-slate-500',   dot: 'bg-slate-400'   },
};

const DISMISSED_KEY = 'smart_alerts_dismissed';

function getDismissed(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function addDismissed(id: string) {
  const current = getDismissed();
  sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, id]));
}

interface SmartAlertsPanelProps {
  netWorthMinor?: number;
}

export default function SmartAlertsPanel({ netWorthMinor = 0 }: SmartAlertsPanelProps) {
  const [allAlerts, setAllAlerts] = useState<FinancialAlert[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/alerts?netWorthMinor=${netWorthMinor}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { alerts: FinancialAlert[] };
      setAllAlerts(data.alerts ?? []);
    } catch {
      setAllAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [netWorthMinor]);

  useEffect(() => {
    setDismissed(getDismissed());
    fetchAlerts();
  }, [fetchAlerts]);

  const visibleAlerts = allAlerts.filter((a) => !dismissed.includes(a.id));

  const handleDismiss = (id: string) => {
    addDismissed(id);
    setDismissed((prev) => [...prev, id]);
  };

  const handleDismissAll = () => {
    allAlerts.forEach((a) => addDismissed(a.id));
    setDismissed(allAlerts.map((a) => a.id));
  };

  const dangerCount = visibleAlerts.filter((a) => a.severity === 'danger').length;
  const warningCount = visibleAlerts.filter((a) => a.severity === 'warning').length;
  const urgentCount = dangerCount + warningCount;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
      {/* Header bar */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/40 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
            urgentCount > 0
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {urgentCount > 0 ? <Bell className="w-4.5 h-4.5" /> : <BellOff className="w-4.5 h-4.5" />}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Thông Báo Tài Chính Thông Minh</h3>
              {!loading && visibleAlerts.length > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                  urgentCount > 0 ? 'bg-rose-500' : 'bg-emerald-600'
                }`}>
                  {visibleAlerts.length}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {loading
                ? 'Đang phân tích...'
                : visibleAlerts.length === 0
                  ? '✅ Tài chính ổn định, không có cảnh báo mới'
                  : `${urgentCount > 0 ? `${urgentCount} cảnh báo cần chú ý • ` : ''}${visibleAlerts.length} thông báo`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {visibleAlerts.length > 0 && !collapsed && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDismissAll(); }}
              className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
            >
              Đóng tất cả
            </button>
          )}
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            : <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          }
        </div>
      </button>

      {/* Alert list */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-500 text-sm">
              <div className="w-4 h-4 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
              Đang phân tích dữ liệu tài chính...
            </div>
          ) : visibleAlerts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
              <p className="text-sm font-medium text-emerald-400">Tài chính ổn định 🟢</p>
              <p className="text-xs text-slate-500">Không có cảnh báo nào cần xử lý lúc này.</p>
            </div>
          ) : (
            visibleAlerts.map((alert) => {
              const s = SEVERITY_STYLES[alert.severity];
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border ${s.border} ${s.bg} animate-in fade-in slide-in-from-top-1 duration-200`}
                >
                  {/* Severity dot */}
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${s.dot}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white leading-snug">{alert.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{alert.message}</p>
                  </div>

                  {/* Dismiss button */}
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="shrink-0 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Đóng thông báo này"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
