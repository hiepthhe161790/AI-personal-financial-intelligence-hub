import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import AccountModel from '@/models/Account';
import TransactionModel from '@/models/Transaction';
import WealthGoalModel from '@/models/WealthGoal';
import { computeNetWorth } from '@/domain/net-worth';
import { minorToMajor } from '@/domain/money';

const VND = (amount: number) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} ₫`;

export async function GET() {
  try {
    await connectToDatabase();

    const userId = 'owner';
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [accounts, transactions, goals] = await Promise.all([
      AccountModel.find({ userId, isArchived: false }).lean(),
      TransactionModel.find({ userId, occurredOn: { $gte: thirtyDaysAgo } })
        .sort({ occurredOn: -1 })
        .limit(20)
        .lean(),
      WealthGoalModel.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const netWorth = computeNetWorth(accounts);
    const dateStr = now.toLocaleDateString('vi-VN');

    // Build HTML that browsers can print-to-PDF cleanly
    const accountRows = accounts
      .map(
        (acc) => `
      <tr>
        <td>${acc.name}</td>
        <td>${acc.type}</td>
        <td class="${acc.type === 'LIABILITY' ? 'red' : 'green'}">${VND(minorToMajor(acc.currentBalanceMinor, 'VND'))}</td>
        <td>${acc.ticker ?? '—'}${acc.quantity != null ? ` (x${acc.quantity})` : ''}</td>
      </tr>`
      )
      .join('');

    const txRows = transactions
      .map(
        (tx) => `
      <tr>
        <td>${new Date(tx.occurredOn).toLocaleDateString('vi-VN')}</td>
        <td>${tx.category}</td>
        <td>${tx.notes ?? '—'}</td>
        <td class="${tx.type === 'INCOME' ? 'green' : 'red'}">${tx.type === 'INCOME' ? '+' : '-'}${VND(minorToMajor(tx.amountMinor, 'VND'))}</td>
      </tr>`
      )
      .join('');

    const goalRows = goals
      .map((g) => {
        const targetVND = minorToMajor(g.targetAmountMinor, 'VND');
        const currentVND = minorToMajor(g.currentAmountMinor, 'VND');
        const pct = targetVND > 0 ? ((currentVND / targetVND) * 100).toFixed(1) : '0.0';
        return `
      <tr>
        <td>${g.name}</td>
        <td>${g.category}</td>
        <td>${VND(currentVND)}</td>
        <td>${VND(targetVND)}</td>
        <td class="green">${pct}%</td>
      </tr>`;
      })
      .join('');

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"/>
<title>Báo Cáo Tài Chính Cá Nhân</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; font-size: 13px; }
  h1 { color: #10b981; font-size: 28px; margin-bottom: 4px; }
  .subtitle { color: #64748b; font-size: 12px; margin-bottom: 32px; }
  h2 { color: #10b981; font-size: 15px; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #1e293b; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #1e293b; color: #10b981; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
  td { padding: 8px 12px; border-bottom: 1px solid #1e293b; color: #cbd5e1; }
  tr:hover td { background: #1e293b44; }
  .green { color: #10b981; font-weight: 700; }
  .red { color: #f43f5e; font-weight: 700; }
  .overview-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .metric-card { background: #1e293b; border-radius: 12px; padding: 16px; }
  .metric-label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
  .metric-value { font-size: 18px; font-weight: 700; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #1e293b; color: #475569; font-size: 11px; text-align: center; }
  @media print { body { background: white; color: #1e293b; } .metric-card { border: 1px solid #e2e8f0; } th { background: #f1f5f9; color: #0f172a; } }
</style>
</head>
<body>
<h1>Báo Cáo Tài Chính Cá Nhân</h1>
<p class="subtitle">Xuất ngày: ${dateStr} &nbsp;|&nbsp; AI Personal Financial Intelligence Hub</p>

<div class="overview-grid">
  <div class="metric-card">
    <div class="metric-label">Tổng Tài Sản</div>
    <div class="metric-value green">${VND(minorToMajor(netWorth.totalAssetsMinor, 'VND'))}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Tổng Nợ</div>
    <div class="metric-value red">${VND(minorToMajor(netWorth.totalLiabilitiesMinor, 'VND'))}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Tài Sản Ròng (Net Worth)</div>
    <div class="metric-value ${netWorth.netWorthMinor >= 0 ? 'green' : 'red'}">${VND(minorToMajor(netWorth.netWorthMinor, 'VND'))}</div>
  </div>
</div>

<h2>🏦 Danh Sách Tài Khoản (${accounts.length} tài khoản)</h2>
<table>
  <thead><tr><th>Tên Tài Khoản</th><th>Loại</th><th>Số Dư</th><th>Loại Tài Sản</th></tr></thead>
  <tbody>${accountRows || '<tr><td colspan="4">Chưa có tài khoản nào</td></tr>'}</tbody>
</table>

<h2>💳 Giao Dịch 30 Ngày Qua (${transactions.length} giao dịch)</h2>
<table>
  <thead><tr><th>Ngày</th><th>Tên Giao Dịch</th><th>Danh Mục</th><th>Số Tiền</th></tr></thead>
  <tbody>${txRows || '<tr><td colspan="4">Chưa có giao dịch nào trong 30 ngày qua</td></tr>'}</tbody>
</table>

<h2>🎯 Tiến Độ Mục Tiêu Tài Chính (${goals.length} mục tiêu)</h2>
<table>
  <thead><tr><th>Tên Mục Tiêu</th><th>Loại</th><th>Đã Tích Lũy</th><th>Mục Tiêu</th><th>Tiến Độ</th></tr></thead>
  <tbody>${goalRows || '<tr><td colspan="5">Chưa có mục tiêu nào được thiết lập</td></tr>'}</tbody>
</table>

<div class="footer">Báo cáo được tạo tự động bởi AI Personal Financial Intelligence Hub &nbsp;•&nbsp; ${now.toLocaleString('vi-VN')}</div>
</body>
</html>`;

    const filename = `BaoCaoTaiChinh_${now.toISOString().split('T')[0]}.html`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi tạo báo cáo';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
