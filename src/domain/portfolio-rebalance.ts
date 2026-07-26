import { NetWorthOverview } from '@/domain/net-worth';

export interface TargetAllocation {
  CASH: number; // e.g. 30 (%)
  INVESTMENT: number; // e.g. 40 (%)
  REAL_ESTATE: number; // e.g. 20 (%)
  CRYPTO: number; // e.g. 5 (%)
  GOLD: number; // e.g. 5 (%)
}

export interface RebalanceCategoryItem {
  type: keyof TargetAllocation;
  typeNameVi: string;
  currentValueVND: number;
  currentPercentage: number;
  targetPercentage: number;
  targetValueVND: number;
  deltaVND: number;
  action: 'BUY' | 'SELL' | 'BALANCED';
  recommendation: string;
}

export interface RebalanceAnalysisResult {
  totalAssetsVND: number;
  netWorthVND: number;
  isBalanced: boolean;
  categories: RebalanceCategoryItem[];
  overallAdvice: string;
}

export const DEFAULT_TARGET_ALLOCATION: TargetAllocation = {
  CASH: 30,
  INVESTMENT: 40,
  REAL_ESTATE: 20,
  CRYPTO: 5,
  GOLD: 5,
};

const CATEGORY_NAMES: Record<keyof TargetAllocation, string> = {
  CASH: 'Tiền Mặt & Ngân Hàng',
  INVESTMENT: 'Chứng Khoán & Quỹ',
  REAL_ESTATE: 'Bất Động Sản',
  CRYPTO: 'Crypto & Tài Sản Số',
  GOLD: 'Vàng & Kim Loại Quý',
};

export function calculatePortfolioRebalance(
  overview: NetWorthOverview | null,
  targets: TargetAllocation = DEFAULT_TARGET_ALLOCATION
): RebalanceAnalysisResult {
  if (!overview || overview.totalAssetsMinor <= 0) {
    return {
      totalAssetsVND: 0,
      netWorthVND: 0,
      isBalanced: true,
      categories: [],
      overallAdvice: 'Chưa có dữ liệu tài sản để tính toán tái cân đối danh mục.',
    };
  }

  const totalAssetsVND = overview.totalAssetsMinor / 100;
  const netWorthVND = overview.netWorthMinor / 100;

  // Calculate current value per category
  const categoryValues: Record<keyof TargetAllocation, number> = {
    CASH: 0,
    INVESTMENT: 0,
    REAL_ESTATE: 0,
    CRYPTO: 0,
    GOLD: 0,
  };

  overview.accounts.forEach((acc) => {
    if (acc.currentBalanceMinor > 0) {
      const valVND = acc.currentBalanceMinor / 100;
      const type = acc.type as keyof TargetAllocation;
      if (categoryValues[type] !== undefined) {
        categoryValues[type] += valVND;
      } else {
        // Map unknown types to CASH or INVESTMENT
        categoryValues.CASH += valVND;
      }
    }
  });

  const categories: RebalanceCategoryItem[] = (Object.keys(DEFAULT_TARGET_ALLOCATION) as (keyof TargetAllocation)[]).map(
    (type) => {
      const currentValueVND = categoryValues[type];
      const currentPercentage = totalAssetsVND > 0 ? Number(((currentValueVND / totalAssetsVND) * 100).toFixed(1)) : 0;
      const targetPercentage = targets[type] || 0;
      const targetValueVND = Math.round((totalAssetsVND * targetPercentage) / 100);
      const deltaVND = targetValueVND - currentValueVND;

      let action: 'BUY' | 'SELL' | 'BALANCED' = 'BALANCED';
      let recommendation = 'Tỷ trọng đang ở mức tối ưu mục tiêu.';

      const absDeltaPercent = Math.abs(currentPercentage - targetPercentage);

      if (absDeltaPercent > 2) {
        if (deltaVND > 0) {
          action = 'BUY';
          recommendation = `Thiếu ${currentPercentage}% so với mục tiêu ${targetPercentage}%. Cần nạp/bổ sung thêm ${(
            deltaVND / 1000000
          ).toFixed(1)} triệu VNĐ vào nhóm này.`;
        } else {
          action = 'SELL';
          recommendation = `Vượt ${currentPercentage}% so với mục tiêu ${targetPercentage}%. Cân nhắc chốt lời hoặc rút ${(
            Math.abs(deltaVND) / 1000000
          ).toFixed(1)} triệu VNĐ để tái cơ cấu.`;
        }
      }

      return {
        type,
        typeNameVi: CATEGORY_NAMES[type],
        currentValueVND,
        currentPercentage,
        targetPercentage,
        targetValueVND,
        deltaVND,
        action,
        recommendation,
      };
    }
  );

  const unbalancedCount = categories.filter((c) => c.action !== 'BALANCED').length;
  const isBalanced = unbalancedCount === 0;

  let overallAdvice = 'Danh mục tài sản hiện tại đang tuân thủ đúng tỷ lệ an toàn mục tiêu.';
  if (unbalancedCount > 0) {
    overallAdvice = `Hệ thống phát hiện ${unbalancedCount} nhóm tài sản bị lệch tỷ trọng mục tiêu. Hãy điều chỉnh dòng tiền tích lũy hàng tháng theo khuyến nghị bên dưới.`;
  }

  return {
    totalAssetsVND,
    netWorthVND,
    isBalanced,
    categories,
    overallAdvice,
  };
}
