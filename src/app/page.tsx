'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  BrainCircuit, 
  Database, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  Wallet,
  Sparkles,
  Globe2,
  Eye,
  EyeOff,
  GraduationCap,
  Crown,
  Camera,
  Scale
} from 'lucide-react';
import { NetWorthOverview } from '@/domain/net-worth';
import { SubscriptionTier } from '@/domain/subscription-plan';
import NetWorthCard from '@/components/NetWorthCard';
import AccountList from '@/components/AccountList';
import AddAccountModal from '@/components/AddAccountModal';
import ScenarioSimulator from '@/components/ScenarioSimulator';
import AIResearchBrief from '@/components/AIResearchBrief';
import MarketDataCards from '@/components/MarketDataCards';
import NetWorthHistoryChart from '@/components/NetWorthHistoryChart';
import ExportReportModal from '@/components/ExportReportModal';
import UserAuthHeader from '@/components/UserAuthHeader';
import FinancialHealthCard from '@/components/FinancialHealthCard';
import AIAcademyCoach from '@/components/AIAcademyCoach';
import SaaSFeaturePaywall from '@/components/SaaSFeaturePaywall';
import SmartOCRModal from '@/components/SmartOCRModal';
import PortfolioRebalanceModal from '@/components/PortfolioRebalanceModal';
import AffiliateBannerCard from '@/components/AffiliateBannerCard';
import PersonalWealthTracker from '@/components/PersonalWealthTracker';
import AssetRiskHeatmap from '@/components/AssetRiskHeatmap';

type ActiveTab = 'net-worth' | 'scenario' | 'ai-brief' | 'market' | 'ai-academy';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('net-worth');
  const [netWorthData, setNetWorthData] = useState<NetWorthOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [userTier, setUserTier] = useState<SubscriptionTier>('PRO'); // Default PRO for demo
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isRebalanceOpen, setIsRebalanceOpen] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/accounts');
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setNetWorthData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleTabClick = (tab: ActiveTab) => {
    if (tab === 'ai-academy' && userTier !== 'PRO') {
      setIsPaywallOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* SaaS Upgrade Paywall Modal */}
      <SaaSFeaturePaywall
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onUpgradeSuccess={() => {
          setUserTier('PRO');
          setActiveTab('ai-academy');
        }}
      />

      {/* Smart AI Statement OCR Modal */}
      <SmartOCRModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onSuccess={fetchAccounts}
      />

      {/* Portfolio Rebalancing Engine Modal */}
      <PortfolioRebalanceModal
        isOpen={isRebalanceOpen}
        onClose={() => setIsRebalanceOpen(false)}
        netWorthData={netWorthData}
      />

      {/* Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BrainCircuit className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                AI Financial Hub
              </span>
              <button
                onClick={() => setIsPaywallOpen(true)}
                className={`ml-2 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                  userTier === 'PRO'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Crown className="w-3 h-3" />
                <span>{userTier === 'PRO' ? 'SaaS PRO' : 'Free Tier'}</span>
              </button>
            </div>
          </div>
          
          <nav className="flex items-center space-x-3">
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title={isPrivate ? 'Hiện số tiền' : 'Ẩn số tiền bảo mật'}
            >
              {isPrivate ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
              <span className="hidden md:inline">{isPrivate ? 'Bảo mật ON' : 'Bảo mật OFF'}</span>
            </button>

            <ExportReportModal netWorthData={netWorthData} />
            <UserAuthHeader />
            
            <button
              onClick={fetchAccounts}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-all cursor-pointer disabled:opacity-50"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <Link 
              href="/api/v1/health" 
              target="_blank"
              className="text-xs px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-all flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Health Check</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => handleTabClick('net-worth')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'net-worth'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Quản Lý Net Worth</span>
            </button>

            <button
              onClick={() => handleTabClick('scenario')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'scenario'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Mô Phỏng Kịch Bản</span>
            </button>

            <button
              onClick={() => handleTabClick('ai-brief')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ai-brief'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>AI Phân Tích & Rủi Ro</span>
            </button>

            <button
              onClick={() => handleTabClick('market')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'market'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe2 className="w-4 h-4" />
              <span>Thị Trường & Tin Tức</span>
            </button>

            <button
              onClick={() => handleTabClick('ai-academy')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ai-academy'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-amber-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>AI Academy (Pro)</span>
            </button>
          </div>

          {activeTab === 'net-worth' && (
            <div className="shrink-0 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsOcrOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Camera className="w-4 h-4 text-teal-400" />
                <span>Scan Sao Kê (AI OCR) 📷</span>
              </button>

              <button
                onClick={() => setIsRebalanceOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Tái Cân Đối Danh Mục ⚖️</span>
              </button>

              <AddAccountModal onSuccess={fetchAccounts} />
            </div>
          )}
        </div>

        {/* TAB 1: Net Worth Management */}
        {activeTab === 'net-worth' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <NetWorthCard 
              data={netWorthData} 
              loading={loading} 
              isPrivate={isPrivate} 
              onTogglePrivacy={() => setIsPrivate(!isPrivate)} 
            />

            {/* Personal Wealth Goal & Discipline Checklist */}
            <PersonalWealthTracker currentNetWorthVND={(netWorthData?.netWorthMinor || 0) / 100} />

            {/* Asset Risk 4-Tier Heatmap */}
            <AssetRiskHeatmap netWorthData={netWorthData} />

            {/* Financial Health Score Evaluation */}
            <FinancialHealthCard data={netWorthData} />

            {/* Financial Partner Affiliate Deals */}
            <AffiliateBannerCard />

            {/* Historical Net Worth Timeline Chart */}
            <NetWorthHistoryChart />

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Danh Mục Tài Sản & Khoản Nợ ({netWorthData?.accounts.length || 0})
                </h2>
              </div>

              <AccountList accounts={netWorthData?.accounts || []} loading={loading} />
            </section>
          </div>
        )}

        {/* TAB 2: Financial Scenario Simulation */}
        {activeTab === 'scenario' && (
          <div className="animate-in fade-in duration-300">
            <ScenarioSimulator currentNetWorthMinor={netWorthData?.netWorthMinor || 0} />
          </div>
        )}

        {/* TAB 3: AI Research Brief */}
        {activeTab === 'ai-brief' && (
          <div className="animate-in fade-in duration-300">
            <AIResearchBrief />
          </div>
        )}

        {/* TAB 4: Market Data & News Feed */}
        {activeTab === 'market' && (
          <div className="animate-in fade-in duration-300">
            <MarketDataCards />
          </div>
        )}

        {/* TAB 5: AI Financial Academy (Pro Tier) */}
        {activeTab === 'ai-academy' && (
          <div className="animate-in fade-in duration-300">
            <AIAcademyCoach />
          </div>
        )}

        {/* System Guarantees Footer Banner */}
        <section className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Kiến Trúc Lai Hybrid Next.js Fullstack + Python Analytics Microservice
            </h4>
            <p className="text-slate-400 text-xs max-w-2xl">
              Tích hợp AI Academy Mentorship Coach, SaaS Pro Feature Gating Paywall, VNStock Realtime & Stealth Privacy Mode.
            </p>
          </div>
          <Link
            href="/api/v1/health"
            target="_blank"
            className="shrink-0 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <span>Health Check API</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-6 text-center text-slate-500 text-xs">
        <p>© 2026 AI Personal Financial Intelligence Hub. Sprint 12 Enterprise Complete.</p>
      </footer>
    </div>
  );
}
