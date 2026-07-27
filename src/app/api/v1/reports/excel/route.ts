import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { connectToDatabase } from '@/lib/db';
import AccountModel from '@/models/Account';
import TransactionModel from '@/models/Transaction';
import WealthGoalModel from '@/models/WealthGoal';
import { computeNetWorth } from '@/domain/net-worth';
import { minorToMajor } from '@/domain/money';

const VND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export async function GET() {
  try {
    await connectToDatabase();

    const userId = 'owner';
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all data in parallel
    const [accounts, transactions, goals] = await Promise.all([
      AccountModel.find({ userId, isArchived: false }).lean(),
      TransactionModel.find({
        userId,
        occurredOn: { $gte: thirtyDaysAgo },
      })
        .sort({ occurredOn: -1 })
        .limit(100)
        .lean(),
      WealthGoalModel.find({ userId }).sort({ createdAt: -1 }).lean(),
    ]);

    const netWorth = computeNetWorth(accounts);

    // ─── Build Workbook ──────────────────────────────────────────────────────
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AI Financial Hub';
    workbook.created = now;

    const headerFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' },
    };
    const headerFont: Partial<ExcelJS.Font> = {
      bold: true,
      color: { argb: 'FF10B981' },
      size: 11,
    };
    const valueFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };

    // ─── Sheet 1: Tổng Quan ───────────────────────────────────────────────────
    const overviewSheet = workbook.addWorksheet('📊 Tổng Quan');
    overviewSheet.columns = [
      { header: 'Chỉ Số', key: 'label', width: 35 },
      { header: 'Giá Trị', key: 'value', width: 30 },
    ];
    overviewSheet.getRow(1).font = headerFont;
    overviewSheet.getRow(1).fill = headerFill;

    const overviewRows = [
      { label: 'Ngày Xuất Báo Cáo', value: now.toLocaleDateString('vi-VN') },
      { label: 'Tổng Tài Sản', value: VND(minorToMajor(netWorth.totalAssetsMinor, 'VND')) },
      { label: 'Tổng Nợ', value: VND(minorToMajor(netWorth.totalLiabilitiesMinor, 'VND')) },
      { label: 'Tài Sản Ròng (Net Worth)', value: VND(minorToMajor(netWorth.netWorthMinor, 'VND')) },
      { label: 'Số Lượng Tài Khoản', value: `${accounts.length} tài khoản` },
      { label: 'Giao Dịch 30 Ngày Qua', value: `${transactions.length} giao dịch` },
      { label: 'Số Mục Tiêu Tài Chính', value: `${goals.length} mục tiêu` },
    ];
    overviewRows.forEach((row) => {
      const r = overviewSheet.addRow(row);
      r.fill = valueFill;
      r.font = { color: { argb: 'FFE2E8F0' } };
    });

    // ─── Sheet 2: Danh Sách Tài Khoản ────────────────────────────────────────
    const accountsSheet = workbook.addWorksheet('🏦 Tài Khoản');
    accountsSheet.columns = [
      { header: 'Tên Tài Khoản', key: 'name', width: 30 },
      { header: 'Loại', key: 'type', width: 20 },
      { header: 'Số Dư (VND)', key: 'balance', width: 25 },
      { header: 'Loại Tài Sản', key: 'assetType', width: 20 },
      { header: 'Mô Tả', key: 'description', width: 35 },
    ];
    accountsSheet.getRow(1).font = headerFont;
    accountsSheet.getRow(1).fill = headerFill;

    accounts.forEach((acc) => {
      const r = accountsSheet.addRow({
        name: acc.name,
        type: acc.type,
        balance: minorToMajor(acc.currentBalanceMinor, 'VND'),
        assetType: acc.ticker ?? '—',
        description: acc.quantity != null ? `Số lượng: ${acc.quantity}` : '—',
      });
      r.fill = valueFill;
      r.font = { color: { argb: 'FFE2E8F0' } };
      // Color-code balance cell
      const balanceCell = r.getCell('balance');
      balanceCell.numFmt = '#,##0 "đ"';
      balanceCell.font = {
        bold: true,
        color: { argb: acc.type === 'LIABILITY' ? 'FFF43F5E' : 'FF10B981' },
      };
    });

    // ─── Sheet 3: Lịch Sử Giao Dịch ──────────────────────────────────────────
    const txSheet = workbook.addWorksheet('💳 Giao Dịch 30 Ngày');
    txSheet.columns = [
      { header: 'Ngày', key: 'date', width: 18 },
      { header: 'Tên Giao Dịch', key: 'name', width: 35 },
      { header: 'Danh Mục', key: 'category', width: 22 },
      { header: 'Loại', key: 'type', width: 12 },
      { header: 'Số Tiền (VND)', key: 'amount', width: 25 },
    ];
    txSheet.getRow(1).font = headerFont;
    txSheet.getRow(1).fill = headerFill;

    transactions.forEach((tx) => {
      const isIncome = tx.type === 'INCOME';
      const r = txSheet.addRow({
        date: new Date(tx.occurredOn).toLocaleDateString('vi-VN'),
        name: tx.category,
        category: tx.notes ?? '—',
        type: isIncome ? '📈 Thu' : '📉 Chi',
        amount: minorToMajor(tx.amountMinor ?? 0, 'VND'),
      });
      r.fill = valueFill;
      r.font = { color: { argb: 'FFE2E8F0' } };
      r.getCell('amount').numFmt = '#,##0 "đ"';
      r.getCell('amount').font = {
        bold: true,
        color: { argb: isIncome ? 'FF10B981' : 'FFF43F5E' },
      };
    });

    // ─── Sheet 4: Mục Tiêu Tài Chính ─────────────────────────────────────────
    const goalsSheet = workbook.addWorksheet('🎯 Mục Tiêu');
    goalsSheet.columns = [
      { header: 'Tên Mục Tiêu', key: 'name', width: 32 },
      { header: 'Loại', key: 'category', width: 18 },
      { header: 'Mục Tiêu (VND)', key: 'target', width: 25 },
      { header: 'Đã Tích Lũy (VND)', key: 'current', width: 25 },
      { header: 'Tiến Độ (%)', key: 'progress', width: 16 },
    ];
    goalsSheet.getRow(1).font = headerFont;
    goalsSheet.getRow(1).fill = headerFill;

    goals.forEach((g) => {
      const targetVND = minorToMajor(g.targetAmountMinor, 'VND');
      const currentVND = minorToMajor(g.currentAmountMinor, 'VND');
      const progress = targetVND > 0 ? ((currentVND / targetVND) * 100).toFixed(1) : '0.0';
      const r = goalsSheet.addRow({
        name: g.name,
        category: g.category,
        target: targetVND,
        current: currentVND,
        progress: `${progress}%`,
      });
      r.fill = valueFill;
      r.font = { color: { argb: 'FFE2E8F0' } };
      r.getCell('target').numFmt = '#,##0 "đ"';
      r.getCell('current').numFmt = '#,##0 "đ"';
    });

    // Serialize to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `BaoCaoTaiChinh_${now.toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi tạo file Excel';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
