import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import AccountModel from "@/models/Account";
import ValuationSnapshotModel from "@/models/ValuationSnapshot";
import { authOptions } from "@/lib/auth";
import { majorToMinor, minorToMajor } from "@/domain/money";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id || "owner";
}

export async function POST() {
  try {
    await connectToDatabase();
    const userId = await getUserId();

    // 1. Fetch accounts of type GOLD or STOCK that have a ticker and quantity > 0
    const accounts = await AccountModel.find({
      userId,
      isArchived: false,
      type: { $in: ["GOLD", "STOCK"] },
      ticker: { $exists: true, $ne: "" },
      quantity: { $exists: true, $gt: 0 },
    });

    if (accounts.length === 0) {
      return NextResponse.json({
        status: "success",
        message: "Không tìm thấy tài sản Vàng hoặc Chứng khoán nào cần tự động đồng bộ giá trị",
        data: { syncedCount: 0, totalDiffVND: 0, details: [] },
      });
    }

    // 2. Separate stocks and gold tickers
    const stockAccounts = accounts.filter((a) => a.type === "STOCK");
    const goldAccounts = accounts.filter((a) => a.type === "GOLD");

    const stockSymbols = stockAccounts.map((a) => a.ticker!.toUpperCase());

    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

    // 3. Fetch Stock quotes if needed
    let stockPricesMap: Record<string, number> = {};
    if (stockSymbols.length > 0) {
      try {
        const stockRes = await fetch(
          `${pythonServiceUrl}/api/v1/market/stocks?symbols=${stockSymbols.join(",")}`
        );
        if (stockRes.ok) {
          const json = await stockRes.json();
          if (json.status === "success" && json.stocks) {
            json.stocks.forEach((s: { symbol: string; priceVND: number }) => {
              stockPricesMap[s.symbol.toUpperCase()] = s.priceVND;
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch stock prices from Python sidecar:", err);
      }
    }

    // 4. Fetch Gold rates if needed
    let goldPricesList: { type: string; buyPriceVND: number; sellPriceVND: number; buy?: string; sell?: string }[] = [];
    if (goldAccounts.length > 0) {
      try {
        const goldRes = await fetch(`${pythonServiceUrl}/api/v1/market/gold`);
        if (goldRes.ok) {
          const json = await goldRes.json();
          if (json.status === "success" && json.gold) {
            goldPricesList = json.gold;
          }
        }
      } catch (err) {
        console.error("Failed to fetch gold prices from Python sidecar:", err);
      }
    }

    // Helper to find gold price by ticker keyword
    const getGoldPricePerUnit = (ticker: string): number => {
      // Look for SJC or Ring gold from SJC list
      const cleanTicker = ticker.toLowerCase().trim();
      let matchedItem;

      if (cleanTicker.includes("nhan") || cleanTicker.includes("ring")) {
        // Nhẫn trơn 99.99
        matchedItem = goldPricesList.find((g) => g.type && g.type.toLowerCase().includes("nhẫn"));
      } else {
        // Standard SJC 1L - 10L
        matchedItem = goldPricesList.find((g) => g.type && g.type.toLowerCase().includes("1l"));
      }

      if (matchedItem && matchedItem.buy) {
        // buy price is liquidation value. Parse "83,500,000" to number
        return parseFloat(matchedItem.buy.replace(/,/g, ""));
      }

      // Default fallbacks if crawler failed (values in VND per gold tael/ lượng)
      return cleanTicker.includes("nhan") ? 82000000 : 83500000;
    };

    let totalDiffVND = 0;
    const details = [];

    // 5. Update balances of accounts
    for (const account of accounts) {
      const quantity = account.quantity || 0;
      const ticker = account.ticker || "";
      let pricePerUnit = 0;

      if (account.type === "STOCK") {
        pricePerUnit = stockPricesMap[ticker.toUpperCase()] || 25000; // Fallback stock price
      } else if (account.type === "GOLD") {
        pricePerUnit = getGoldPricePerUnit(ticker);
      }

      const oldBalanceMinor = account.currentBalanceMinor;
      const newBalanceMajor = quantity * pricePerUnit;
      const newBalanceMinor = majorToMinor(newBalanceMajor, account.currency);
      const diffMinor = newBalanceMinor - oldBalanceMinor;
      totalDiffVND += minorToMajor(diffMinor, account.currency);

      // Only update if there is a change
      if (diffMinor !== 0) {
        account.currentBalanceMinor = newBalanceMinor;
        account.lastValuationAt = new Date();
        account.version += 1;
        await account.save();

        // Create Valuation Snapshot
        await ValuationSnapshotModel.create({
          userId,
          accountId: account._id,
          amountMinor: newBalanceMinor,
          currency: account.currency,
          valuationDate: new Date(),
          notes: `Đồng bộ tự động giá thị trường (${ticker.toUpperCase()}: ${pricePerUnit.toLocaleString("vi-VN")} đ/đơn vị x ${quantity})`,
        });
      }

      details.push({
        _id: account._id,
        name: account.name,
        type: account.type,
        ticker: ticker.toUpperCase(),
        quantity,
        pricePerUnit,
        oldBalance: minorToMajor(oldBalanceMinor, account.currency),
        newBalance: minorToMajor(newBalanceMinor, account.currency),
        diff: minorToMajor(diffMinor, account.currency),
      });
    }

    return NextResponse.json({
      status: "success",
      message: `Đồng bộ thành công ${accounts.length} tài sản. Tổng thay đổi giá trị tài sản ròng: ${totalDiffVND.toLocaleString("vi-VN")} VND.`,
      data: {
        syncedCount: accounts.length,
        totalDiffVND,
        details,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi đồng bộ giá thị trường";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
