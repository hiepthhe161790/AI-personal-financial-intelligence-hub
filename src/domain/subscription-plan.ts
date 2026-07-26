export type SubscriptionTier = 'FREE' | 'PRO';

export type SaaSFeatureKey = 
  | 'NET_WORTH_MANAGEMENT'
  | 'SCENARIO_SIMULATION'
  | 'AI_RESEARCH_BRIEF'
  | 'MARKET_STOCKS_REALTIME'
  | 'EXPORT_PDF_REPORTS'
  | 'AI_ACADEMY_COACH';

export interface SaaSPlanDefinition {
  tier: SubscriptionTier;
  name: string;
  priceVNDMonthly: number;
  features: SaaSFeatureKey[];
  description: string;
}

export const SAAS_PLANS: Record<SubscriptionTier, SaaSPlanDefinition> = {
  FREE: {
    tier: 'FREE',
    name: 'Gói Căn Bản (Free Tier)',
    priceVNDMonthly: 0,
    features: ['NET_WORTH_MANAGEMENT', 'SCENARIO_SIMULATION', 'AI_RESEARCH_BRIEF'],
    description: 'Dành cho cá nhân mới bắt đầu quản lý tài sản và theo dõi Net Worth.',
  },
  PRO: {
    tier: 'PRO',
    name: 'Gói Chuyên Nghiệp (Pro SaaS)',
    priceVNDMonthly: 199000,
    features: [
      'NET_WORTH_MANAGEMENT',
      'SCENARIO_SIMULATION',
      'AI_RESEARCH_BRIEF',
      'MARKET_STOCKS_REALTIME',
      'EXPORT_PDF_REPORTS',
      'AI_ACADEMY_COACH',
    ],
    description: 'Mở khóa Học viện AI Đào tạo Đầu tư Chứng khoán, Bảng giá Realtime & Xuất báo cáo PDF.',
  },
};

/**
 * Checks if a subscription tier has access to a specific SaaS feature.
 */
export function hasFeatureAccess(tier: SubscriptionTier, feature: SaaSFeatureKey): boolean {
  return SAAS_PLANS[tier].features.includes(feature);
}
