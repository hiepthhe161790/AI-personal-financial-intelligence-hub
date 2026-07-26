import { AccountSummary, NetWorthOverview } from '@/domain/net-worth';

export type RiskTier = 'TIER_1_SAFE' | 'TIER_2_GROWTH' | 'TIER_3_SPECULATIVE' | 'TIER_4_LIABILITY';

export interface RiskTierBreakdown {
  tier: RiskTier;
  tierNameVi: string;
  badgeColor: string;
  totalValueVND: number;
  percentage: number;
  description: string;
}

export interface AssetRiskHeatmapData {
  totalAssetsVND: number;
  tiers: RiskTierBreakdown[];
  warningMessage: string | null;
  healthStatus: 'HEALTHY' | 'MODERATE_RISK' | 'HIGH_RISK';
}

export interface MonthlyWealthChecklistItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

/**
 * Classifies an account type into one of 4 Risk Tiers.
 */
export function classifyAccountRiskTier(type: string): RiskTier {
  switch (type) {
    case 'CASH':
    case 'GOLD':
      return 'TIER_1_SAFE';
    case 'INVESTMENT':
    case 'REAL_ESTATE':
      return 'TIER_2_GROWTH';
    case 'CRYPTO':
      return 'TIER_3_SPECULATIVE';
    case 'LIABILITY':
    case 'LOAN':
      return 'TIER_4_LIABILITY';
    default:
      return 'TIER_1_SAFE';
  }
}

/**
 * Calculates 4-Tier Risk Heatmap breakdown from NetWorthOverview.
 */
export function calculateAssetRiskHeatmap(overview: NetWorthOverview | null): AssetRiskHeatmapData {
  if (!overview || overview.totalAssetsMinor <= 0) {
    return {
      totalAssetsVND: 0,
      tiers: [],
      warningMessage: null,
      healthStatus: 'HEALTHY',
    };
  }

  const totalAssetsVND = overview.totalAssetsMinor / 100;

  const tierTotals: Record<RiskTier, number> = {
    TIER_1_SAFE: 0,
    TIER_2_GROWTH: 0,
    TIER_3_SPECULATIVE: 0,
    TIER_4_LIABILITY: 0,
  };

  overview.accounts.forEach((acc) => {
    if (acc.currentBalanceMinor > 0) {
      const valVND = acc.currentBalanceMinor / 100;
      const tier = classifyAccountRiskTier(acc.type);
      tierTotals[tier] += valVND;
    }
  });

  const getPercentage = (val: number) => (totalAssetsVND > 0 ? Number(((val / totalAssetsVND) * 100).toFixed(1)) : 0);

  const tier1Pct = getPercentage(tierTotals.TIER_1_SAFE);
  const tier2Pct = getPercentage(tierTotals.TIER_2_GROWTH);
  const tier3Pct = getPercentage(tierTotals.TIER_3_SPECULATIVE);
  const tier4Pct = getPercentage(tierTotals.TIER_4_LIABILITY);

  const tiers: RiskTierBreakdown[] = [
    {
      tier: 'TIER_1_SAFE',
      tierNameVi: 'Tầng 1: Siêu An Toàn (Tiền Mặt, Tiết Kiệm, Vàng)',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      totalValueVND: tierTotals.TIER_1_SAFE,
      percentage: tier1Pct,
      description: 'Tài sản thanh khoản cao, bảo vệ dòng tiền trước rủi ro biến động mạnh.',
    },
    {
      tier: 'TIER_2_GROWTH',
      tierNameVi: 'Tầng 2: Tăng Trưởng Bền Vững (Chứng Khoán, BĐS)',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      totalValueVND: tierTotals.TIER_2_GROWTH,
      percentage: tier2Pct,
      description: 'Động cơ chính tạo lãi kép & tăng trưởng tài sản dài hạn.',
    },
    {
      tier: 'TIER_3_SPECULATIVE',
      tierNameVi: 'Tầng 3: Đầu Cơ / Mạo Hiểm (Crypto, Tài Sản Số)',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      totalValueVND: tierTotals.TIER_3_SPECULATIVE,
      percentage: tier3Pct,
      description: 'Tài sản biến động biên độ lớn, tiềm năng lợi nhuận cao nhưng rủi ro tổn thất lớn.',
    },
    {
      tier: 'TIER_4_LIABILITY',
      tierNameVi: 'Tầng 4: Khoản Nợ & Nghĩa Vụ Phải Trả',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      totalValueVND: tierTotals.TIER_4_LIABILITY,
      percentage: tier4Pct,
      description: 'Các khoản nợ vay làm giảm tài sản ròng thực tế.',
    },
  ];

  let warningMessage: string | null = null;
  let healthStatus: AssetRiskHeatmapData['healthStatus'] = 'HEALTHY';

  if (tier3Pct > 25) {
    warningMessage = `CẢNH BÁO: Tài sản mạo hiểm/đầu cơ (Crypto) chiếm ${tier3Pct}% (>25% tổng tài sản). Hãy cân nhắc chốt lời bớt để hạ rủi ro danh mục!`;
    healthStatus = 'HIGH_RISK';
  } else if (tier1Pct < 15 && totalAssetsVND > 50000000) {
    warningMessage = `CẢNH BÁO: Tỷ trọng tài sản an toàn (Tiền mặt/Vàng) chỉ có ${tier1Pct}% (<15%). Bạn có thể bị thiếu thanh khoản khi cần gấp!`;
    healthStatus = 'MODERATE_RISK';
  }

  return {
    totalAssetsVND,
    tiers,
    warningMessage,
    healthStatus,
  };
}
