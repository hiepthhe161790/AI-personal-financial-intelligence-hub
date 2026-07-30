import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import BudgetModel from '@/models/Budget';
import TransactionModel from '@/models/Transaction';
import WealthGoalModel from '@/models/WealthGoal';
import AccountModel from '@/models/Account';
import { minorToMajor } from '@/domain/money';
import { getUserIdFromSession } from '@/lib/auth';

export type AlertSeverity = 'info' | 'warning' | 'danger' | 'success';

export interface FinancialAlert {
  id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  icon: string;
  createdAt: string;
}

// Milestones: 100M, 200M, 500M, 1B, 2B, 5B, 10B VND (in minor units = × 100)
const NET_WORTH_MILESTONES_MINOR = [
  10_000_000_00,   // 100M
  20_000_000_00,   // 200M
  50_000_000_00,   // 500M
  100_000_000_00,  // 1B
  200_000_000_00,  // 2B
  500_000_000_00,  // 5B
  1_000_000_000_00, // 10B
];

const LARGE_TX_THRESHOLD_MINOR = 50_000_000_00; // 500M VND
const LARGE_TX_RATIO = 0.20; // 20% of total assets
const BUDGET_WARNING_RATIO = 0.90; // 90%
const GOAL_NEAR_RATIO = 0.90;      // 90%
const STALE_ACCOUNT_DAYS = 30;

function formatMoney(minor: number): string {
  const major = minorToMajor(minor, 'VND');
  if (major >= 1_000_000_000) return `${(major / 1_000_000_000).toFixed(1)} tỷ ₫`;
  if (major >= 1_000_000) return `${(major / 1_000_000).toFixed(0)} triệu ₫`;
  return `${new Intl.NumberFormat('vi-VN').format(major)} ₫`;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserIdFromSession();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Read net worth from query param (passed from frontend to avoid extra DB call)
    const netWorthMinorParam = request.nextUrl.searchParams.get('netWorthMinor');
    const netWorthMinor = netWorthMinorParam ? parseInt(netWorthMinorParam, 10) : 0;

    // Fetch all needed data in parallel
    const [budgets, transactions, goals, accounts] = await Promise.all([
      BudgetModel.find({ userId }).lean(),
      TransactionModel.find({
        userId,
        occurredOn: { $gte: startOfMonth },
        type: 'EXPENSE',
      }).lean(),
      WealthGoalModel.find({ userId }).lean(),
      AccountModel.find({ userId, isArchived: false }).lean(),
    ]);

    const alerts: FinancialAlert[] = [];

    // ── 1. Budget overrun alerts ──────────────────────────────────────────────
    const spendByCategory = new Map<string, number>();
    for (const tx of transactions) {
      const prev = spendByCategory.get(tx.category) ?? 0;
      spendByCategory.set(tx.category, prev + tx.amountMinor);
    }

    for (const budget of budgets) {
      const spent = spendByCategory.get(budget.category) ?? 0;
      const ratio = budget.limitMinor > 0 ? spent / budget.limitMinor : 0;

      if (ratio >= 1) {
        alerts.push({
          id: `budget-over-${budget.category}`,
          type: 'BUDGET_OVERRUN',
          severity: 'danger',
          title: `🚨 Vượt ngân sách: ${budget.category}`,
          message: `Đã chi ${formatMoney(spent)} / ${formatMoney(budget.limitMinor)} (${(ratio * 100).toFixed(0)}%). Hãy kiểm soát chi tiêu!`,
          icon: '🚨',
          createdAt: now.toISOString(),
        });
      } else if (ratio >= BUDGET_WARNING_RATIO) {
        alerts.push({
          id: `budget-warn-${budget.category}`,
          type: 'BUDGET_WARNING',
          severity: 'warning',
          title: `⚠️ Sắp vượt ngân sách: ${budget.category}`,
          message: `Đã chi ${formatMoney(spent)} / ${formatMoney(budget.limitMinor)} (${(ratio * 100).toFixed(0)}%). Còn ${formatMoney(budget.limitMinor - spent)} trong tháng.`,
          icon: '⚠️',
          createdAt: now.toISOString(),
        });
      }
    }

    // ── 2. Goal progress alerts ───────────────────────────────────────────────
    for (const goal of goals) {
      const ratio =
        goal.targetAmountMinor > 0
          ? goal.currentAmountMinor / goal.targetAmountMinor
          : 0;

      if (ratio >= 1) {
        alerts.push({
          id: `goal-done-${goal._id}`,
          type: 'GOAL_COMPLETED',
          severity: 'success',
          title: `✅ Hoàn thành mục tiêu: ${goal.name}`,
          message: `Bạn đã tích lũy đủ ${formatMoney(goal.targetAmountMinor)}. Chúc mừng! 🎉`,
          icon: '✅',
          createdAt: now.toISOString(),
        });
      } else if (ratio >= GOAL_NEAR_RATIO) {
        alerts.push({
          id: `goal-near-${goal._id}`,
          type: 'GOAL_NEAR',
          severity: 'success',
          title: `🎯 Gần đạt mục tiêu: ${goal.name}`,
          message: `Đã tích lũy ${formatMoney(goal.currentAmountMinor)} / ${formatMoney(goal.targetAmountMinor)} (${(ratio * 100).toFixed(1)}%). Chỉ còn ${formatMoney(goal.targetAmountMinor - goal.currentAmountMinor)} nữa!`,
          icon: '🎯',
          createdAt: now.toISOString(),
        });
      }

      // Deadline approaching (within 30 days)
      if (goal.targetDate) {
        const daysLeft = Math.ceil(
          (new Date(goal.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysLeft > 0 && daysLeft <= 30 && ratio < 1) {
          alerts.push({
            id: `goal-deadline-${goal._id}`,
            type: 'GOAL_DEADLINE',
            severity: 'warning',
            title: `⏰ Mục tiêu sắp đến hạn: ${goal.name}`,
            message: `Còn ${daysLeft} ngày đến hạn. Tiến độ hiện tại: ${(ratio * 100).toFixed(1)}%.`,
            icon: '⏰',
            createdAt: now.toISOString(),
          });
        }
      }
    }

    // ── 3. Net Worth milestones ───────────────────────────────────────────────
    if (netWorthMinor > 0) {
      for (const milestone of NET_WORTH_MILESTONES_MINOR) {
        // Alert if net worth is within 5% above a milestone (just crossed it)
        if (
          netWorthMinor >= milestone &&
          netWorthMinor < milestone * 1.05
        ) {
          alerts.push({
            id: `milestone-${milestone}`,
            type: 'NET_WORTH_MILESTONE',
            severity: 'success',
            title: `🏆 Đạt mốc tài sản mới!`,
            message: `Tài sản ròng của bạn vừa vượt mốc ${formatMoney(milestone)}! Thành tích tuyệt vời 💪`,
            icon: '🏆',
            createdAt: now.toISOString(),
          });
          break; // only show the most recent milestone
        }
      }
    }

    // ── 4. Abnormal large transactions (last 30 days) ─────────────────────────
    const allExpenses = await TransactionModel.find({
      userId,
      occurredOn: { $gte: thirtyDaysAgo },
    })
      .sort({ amountMinor: -1 })
      .limit(1)
      .lean();

    if (allExpenses.length > 0) {
      const bigTx = allExpenses[0];
      const totalAssetsMinor = accounts
        .filter((a) => a.type !== 'LIABILITY')
        .reduce((s, a) => s + a.currentBalanceMinor, 0);

      const isAbsolLarge = bigTx.amountMinor >= LARGE_TX_THRESHOLD_MINOR;
      const isRelLarge =
        totalAssetsMinor > 0 &&
        bigTx.amountMinor / totalAssetsMinor >= LARGE_TX_RATIO;

      if (isAbsolLarge || isRelLarge) {
        alerts.push({
          id: `large-tx-${bigTx._id}`,
          type: 'LARGE_TRANSACTION',
          severity: 'warning',
          title: `⚡ Giao dịch lớn bất thường`,
          message: `Phát hiện giao dịch ${formatMoney(bigTx.amountMinor)} (danh mục: ${bigTx.category}) trong 30 ngày qua. Hãy xác nhận đây là chi tiêu hợp lệ.`,
          icon: '⚡',
          createdAt: now.toISOString(),
        });
      }
    }

    // ── 5. Stale account valuations ───────────────────────────────────────────
    const staleAccounts = accounts.filter((acc) => {
      const daysSince = Math.floor(
        (now.getTime() - new Date(acc.lastValuationAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return daysSince > STALE_ACCOUNT_DAYS;
    });

    if (staleAccounts.length > 0) {
      const names = staleAccounts
        .slice(0, 3)
        .map((a) => a.name)
        .join(', ');
      alerts.push({
        id: 'stale-accounts',
        type: 'STALE_ACCOUNTS',
        severity: 'info',
        title: `💡 ${staleAccounts.length} tài khoản chưa cập nhật`,
        message: `${names}${staleAccounts.length > 3 ? ' và các tài khoản khác' : ''} chưa được định giá trong hơn 30 ngày. Hãy cập nhật để báo cáo chính xác hơn.`,
        icon: '💡',
        createdAt: now.toISOString(),
      });
    }

    // Sort: danger first, then warning, success, info
    const SEVERITY_ORDER: Record<AlertSeverity, number> = {
      danger: 0, warning: 1, success: 2, info: 3,
    };
    alerts.sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
    );

    return NextResponse.json({ alerts, generatedAt: now.toISOString() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi tạo alerts';
    return NextResponse.json({ alerts: [], error: message }, { status: 500 });
  }
}
