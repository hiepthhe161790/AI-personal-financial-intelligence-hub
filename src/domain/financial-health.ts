import { NetWorthOverview } from '@/domain/net-worth';
import { minorToMajor } from '@/domain/money';

export interface FinancialHealthMetric {
  score: number; // 0 - 100
  grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'CRITICAL';
  emergencyFundMonths: number;
  debtToAssetRatioPercent: number;
  liquidityRatioPercent: number;
  recommendations: string[];
}

/**
 * Evaluates personal financial health based on Net Worth composition.
 * @param netWorth NetWorthOverview object
 * @param estimatedMonthlyExpenseVNDMajor Default 20,000,000 VND/month
 */
export function evaluateFinancialHealth(
  netWorth: NetWorthOverview,
  estimatedMonthlyExpenseVNDMajor: number = 20000000
): FinancialHealthMetric {
  const totalAssetsMajor = minorToMajor(netWorth.totalAssetsMinor, 'VND');
  const totalLiabilitiesMajor = minorToMajor(netWorth.totalLiabilitiesMinor, 'VND');

  // Sum liquid assets (CASH, BANK, SAVINGS)
  const liquidAssetsMinor = netWorth.accounts
    .filter((a) => a.type === 'CASH' || a.type === 'BANK' || a.type === 'SAVINGS')
    .reduce((sum, a) => sum + a.currentBalanceMinor, 0);

  const liquidAssetsMajor = minorToMajor(liquidAssetsMinor, 'VND');

  // 1. Emergency Fund Months
  const emergencyFundMonths = estimatedMonthlyExpenseVNDMajor > 0 
    ? parseFloat((liquidAssetsMajor / estimatedMonthlyExpenseVNDMajor).toFixed(1))
    : 0;

  // 2. Debt-to-Asset Ratio
  const debtToAssetRatioPercent = totalAssetsMajor > 0 
    ? parseFloat(((totalLiabilitiesMajor / totalAssetsMajor) * 100).toFixed(1))
    : 0;

  // 3. Liquidity Ratio
  const liquidityRatioPercent = totalAssetsMajor > 0
    ? parseFloat(((liquidAssetsMajor / totalAssetsMajor) * 100).toFixed(1))
    : 0;

  // 4. Calculate Weighted Score (0 - 100)
  let score = 50;

  // Emergency Fund score component (Max +30 pts)
  if (emergencyFundMonths >= 6) score += 30;
  else if (emergencyFundMonths >= 3) score += 20;
  else if (emergencyFundMonths >= 1) score += 10;

  // Debt Ratio score component (Max +20 pts)
  if (debtToAssetRatioPercent === 0) score += 20;
  else if (debtToAssetRatioPercent <= 30) score += 15;
  else if (debtToAssetRatioPercent <= 50) score += 5;
  else score -= 15;

  score = Math.max(0, Math.min(100, score));

  // Determine Grade
  let grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'CRITICAL' = 'FAIR';
  if (score >= 85) grade = 'EXCELLENT';
  else if (score >= 70) grade = 'GOOD';
  else if (score >= 50) grade = 'FAIR';
  else grade = 'CRITICAL';

  // Recommendations
  const recommendations: string[] = [];
  if (emergencyFundMonths < 3) {
    recommendations.push('Nên gia tăng Quỹ Dự Phòng Khẩn Cấp lên tối thiểu 3 - 6 tháng chi tiêu sinh hoạt.');
  }
  if (debtToAssetRatioPercent > 30) {
    recommendations.push('Tỷ lệ nợ chiếm trên 30% tài sản, nên ưu tiên tất toán bớt khoản vay lãi suất cao.');
  }
  if (liquidityRatioPercent < 20) {
    recommendations.push('Tỷ lệ tài sản thanh khoản thấp, cần đề phòng rủi ro cần tiền mặt đột xuất.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Cấu trúc tài sản cân bằng rất tốt! Duy trì kỷ luật phân bổ tài sản hiện tại.');
  }

  return {
    score,
    grade,
    emergencyFundMonths,
    debtToAssetRatioPercent,
    liquidityRatioPercent,
    recommendations,
  };
}
