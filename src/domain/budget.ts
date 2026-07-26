export interface BudgetCategory {
  name: string;
  allocatedVNDMajor: number;
  spentVNDMajor: number;
}

export interface BudgetStatus {
  totalAllocatedVNDMajor: number;
  totalSpentVNDMajor: number;
  remainingVNDMajor: number;
  spentPercentage: number;
  statusLevel: 'NORMAL' | 'WARNING' | 'OVERBUDGET';
  categories: Array<BudgetCategory & { spentPercentage: number }>;
}

/**
 * Evaluates monthly spending limits and budget status.
 */
export function evaluateMonthlyBudget(
  categories: BudgetCategory[]
): BudgetStatus {
  const totalAllocated = categories.reduce((sum, c) => sum + c.allocatedVNDMajor, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spentVNDMajor, 0);
  const remaining = totalAllocated - totalSpent;
  const spentPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  let statusLevel: 'NORMAL' | 'WARNING' | 'OVERBUDGET' = 'NORMAL';
  if (spentPercentage >= 100) statusLevel = 'OVERBUDGET';
  else if (spentPercentage >= 80) statusLevel = 'WARNING';

  const categoryStatuses = categories.map((c) => ({
    ...c,
    spentPercentage: c.allocatedVNDMajor > 0 ? parseFloat(((c.spentVNDMajor / c.allocatedVNDMajor) * 100).toFixed(1)) : 0,
  }));

  return {
    totalAllocatedVNDMajor: totalAllocated,
    totalSpentVNDMajor: totalSpent,
    remainingVNDMajor: remaining,
    spentPercentage: parseFloat(spentPercentage.toFixed(1)),
    statusLevel,
    categories: categoryStatuses,
  };
}
