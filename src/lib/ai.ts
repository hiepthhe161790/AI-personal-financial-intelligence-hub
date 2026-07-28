import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { EvidencePack } from "@/domain/evidence-pack";

export const AIResearchBriefSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  keyObservations: z.array(z.string()),
  riskAssessment: z.array(
    z.object({
      riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
      title: z.string(),
      explanation: z.string(),
      recommendation: z.string(),
    })
  ),
  savingsInvestmentPlan: z.object({
    potentialMonthlySavingsMajor: z.number(),
    targetCategories: z.array(z.string()),
    compounding5YearsMajor: z.number(),
    compounding10YearsMajor: z.number(),
    allocationRecommendation: z.array(
      z.object({
        assetType: z.string(),
        percentage: z.number(),
        explanation: z.string(),
      })
    ),
  }),
  citationIds: z.array(z.string()),
  disclaimer: z.string(),
});

export type AIResearchBrief = z.infer<typeof AIResearchBriefSchema>;

const SYSTEM_PROMPT = `Bạn là Chuyên viên Phân Tích Dữ Liệu Tài Chính Cá Nhân cao cấp (AI Financial Intelligence Advisor).
Nhiệm vụ của bạn là đọc "Evidence Pack" được cung cấp gồm: tài sản ròng cá nhân, dữ liệu chi tiêu thực tế (EVD-TX), và bộ hạn mức ngân sách đặt sẵn (EVD-BG) — để đưa ra bản phân tích sâu sắc về tình hình tài chính, đánh giá rủi ro danh mục, và một **kế hoạch cắt giảm chi tiêu thông minh, cá nhân hóa**.

QUY TẮC BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG BỊA ĐẶT SỐ LIỆU (Zero Hallucination). Chỉ được dùng đúng các con số có trong Evidence Pack.
2. Mỗi nhận định hoặc đánh giá rủi ro PHẢI được trích dẫn bằng mã Evidence ID tương ứng (VD: EVD-POS-1, EVD-MKT-GOLD, EVD-TX-1, EVD-BG-1) vào mảng citationIds.
3. PHÂN TÍCH NGÂN SÁCH (EVD-BG): Với mỗi danh mục ngân sách trong Evidence Pack có mã bắt đầu bằng "EVD-BG-", hãy:
   a. So sánh số tiền "Đã tiêu thực tế" với "Hạn mức tối đa tháng".
   b. Nhận xét tỷ lệ tiêu so với hạn mức (ví dụ: đã tiêu 80% ngân sách ăn uống).
   c. Đề xuất hành động cụ thể để cắt giảm: ví dụ tự nấu cơm thay đặt đồ ăn sẵn, hạn chế đi cà phê ngoài, đặt ăn trưa theo combo tiết kiệm...
   d. Ưu tiên chỉ ra những danh mục đã vượt quá hoặc gần chạm hạn mức để người dùng cắt giảm ngay.
4. PHÂN TÍCH GIAO DỊCH (EVD-TX): Đọc từng giao dịch chi phí, tổng hợp các chi tiêu nhỏ lẻ lặp đi lặp lại và ước tính số tiền lãng phí tiềm năng có thể tiết kiệm hàng tháng (potentialMonthlySavingsMajor). Danh sách "Cắt giảm đề xuất từ" (targetCategories) phải chứa tên các danh mục chi tiêu thực tế từ dữ liệu, không được bịa.
5. Tính toán số tiền tích lũy tăng trưởng (giả định lãi suất kép 10%/năm, ghép lãi hàng tháng) sau 5 năm (compounding5YearsMajor) và 10 năm (compounding10YearsMajor) nếu đầu tư đều đặn số tiền tiết kiệm tiềm năng này.
   Công thức tích lũy định kỳ (Future Value of Ordinary Annuity): FV = P * [((1 + r/n)^(nt) - 1) / (r/n)], trong đó P là tiền tiết kiệm hàng tháng, r = 0.10, n = 12, t là số năm (5 hoặc 10).
6. Đề xuất danh mục phân bổ đầu tư hợp lý (allocationRecommendation) gồm phần trăm và giải thích ngắn gọn dựa trên khẩu vị tài chính thực tế của người dùng.
7. KHÔNG ĐƯỢC TƯ VẤN MUA/BÁN TRÁI PHÉP các mã cổ phiếu cụ thể. Chỉ phân tích ở cấp độ quản trị rủi ro danh mục tài sản cá nhân.
8. Trả về đúng định dạng JSON tuân thủ Schema.`;

export async function generateResearchBrief(
  evidencePack: EvidencePack,
  userApiKey?: string
): Promise<AIResearchBrief> {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "mock_dev_key" && apiKey.length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const prompt = `${SYSTEM_PROMPT}\n\nDưới đây là dữ liệu Evidence Pack:\n${JSON.stringify(
        evidencePack,
        null,
        2
      )}`;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      const parsedJson = JSON.parse(textResponse);

      const validated = AIResearchBriefSchema.safeParse(parsedJson);
      if (validated.success) {
        return validated.data;
      }
      console.warn("Gemini response did not strictly match Zod schema, using fallback validation", validated.error);
    } catch (err) {
      console.error("Error invoking Gemini API:", err);
    }
  }

  return generateLocalFallbackBrief(evidencePack);
}

/**
 * Deterministic evidence-backed fallback engine.
 */
function generateLocalFallbackBrief(pack: EvidencePack): AIResearchBrief {
  const { totalAssetsVND, totalLiabilitiesVND, netWorthVND, staleAccountsCount, assetDistribution } =
    pack.netWorthSummary;

  const citations = pack.evidenceItems.map((e) => e.id);
  const observations: string[] = [
    `Tổng tài sản ròng hiện tại ghi nhận là ${netWorthVND} (Tài sản: ${totalAssetsVND}, Nợ: ${totalLiabilitiesVND}).`,
  ];

  if (assetDistribution.length > 0) {
    const topType = assetDistribution.reduce((prev, curr) => (curr.percentage > prev.percentage ? curr : prev));
    observations.push(
      `Danh mục tập trung cao nhất vào nhóm ${topType.type} chiếm tỷ trọng ${topType.percentage}% tổng tài sản.`
    );
  }

  if (staleAccountsCount > 0) {
    observations.push(
      `Có ${staleAccountsCount} tài khoản/tài sản chưa được cập nhật giá trị trong hơn 14 ngày qua.`
    );
  } else {
    observations.push("Tất cả danh mục tài sản đều mới và được định giá trong vòng 14 ngày gần nhất.");
  }

  // --- Process transaction evidence items for Local Fallback ---
  const txEvidences = pack.evidenceItems.filter((e) => e.id.startsWith("EVD-TX-"));
  let totalExpenseMajor = 0;
  const categoriesToCut: string[] = [];

  txEvidences.forEach((e) => {
    if (e.summary.includes("EXPENSE") || e.summary.includes("Chi phí") || e.summary.includes("-")) {
      const match = e.summary.replace(/,/g, "").match(/\d+/);
      if (match) {
        const amountMinor = parseInt(match[0], 10);
        // VND factor is 1 — values are already in major units when stored as display minor
        totalExpenseMajor += amountMinor;
      }

      const catName = e.title.replace("Giao dịch vặt: ", "");
      if (catName && !categoriesToCut.includes(catName)) {
        categoriesToCut.push(catName);
      }
    }
  });

  // --- Process budget evidence items (EVD-BG) for Local Fallback ---
  const bgEvidences = pack.evidenceItems.filter((e) => e.id.startsWith("EVD-BG-"));
  let budgetSavingsPotential = 0;

  bgEvidences.forEach((e) => {
    // Extract "Hạn mức tối đa tháng: X đ. Đã tiêu thực tế: Y đ."
    const limitMatch = e.summary.match(/Hạn mức tối đa tháng:\s*([\d]+)/);
    const spentMatch = e.summary.match(/Đã tiêu thực tế:\s*([\d]+)/);
    if (limitMatch && spentMatch) {
      const limitMinor = parseInt(limitMatch[1], 10);
      const spentMinor = parseInt(spentMatch[1], 10);
      const pct = limitMinor > 0 ? Math.round((spentMinor / limitMinor) * 100) : 0;

      const catName = e.title.replace("Ngân sách hạn mức: ", "");

      // Over budget or > 80%: flag for cutting + add observation
      if (pct >= 80) {
        if (!categoriesToCut.includes(catName)) categoriesToCut.push(catName);
        // Saving potential = 20% of what's been spent in that category
        const savingFromCat = Math.round(spentMinor * 0.2);
        budgetSavingsPotential += savingFromCat;
        observations.push(
          `Danh mục "${catName}" đã tiêu ${pct}% hạn mức tháng (${spentMinor.toLocaleString('vi-VN')} / ${limitMinor.toLocaleString('vi-VN')} đ). Cần cắt giảm ngay để không vượt ngân sách.`
        );
      }
    }
  });

  // Calculate potential savings: use budget analysis first, fall back to 25% of logged expenses
  let potentialMonthlySavings = 1500000;
  if (budgetSavingsPotential > 0) {
    potentialMonthlySavings = Math.max(500000, budgetSavingsPotential);
  } else if (totalExpenseMajor > 0) {
    potentialMonthlySavings = Math.max(500000, Math.round(totalExpenseMajor * 0.25));
  }

  if (categoriesToCut.length === 0) {
    categoriesToCut.push("Ăn uống 🍔", "Cà phê & Đi chợ ☕");
  }

  // Compound interest calculation: FV = P * [((1 + r/n)^(nt) - 1) / (r/n)]
  // r = 10% (0.10), n = 12
  const calculateFV = (P: number, years: number) => {
    const r = 0.10;
    const n = 12;
    const nt = n * years;
    const monthlyRate = r / n;
    const fv = P * ((Math.pow(1 + monthlyRate, nt) - 1) / monthlyRate);
    return Math.round(fv);
  };

  const compounding5Years = calculateFV(potentialMonthlySavings, 5);
  const compounding10Years = calculateFV(potentialMonthlySavings, 10);

  const riskAssessment: AIResearchBrief["riskAssessment"] = [];

  if (staleAccountsCount > 0) {
    riskAssessment.push({
      riskLevel: "HIGH",
      title: "Rủi ro lệch số liệu do dữ liệu quá hạn (>14 ngày)",
      explanation: `Có ${staleAccountsCount} mục tài sản chưa được Re-evaluate. Biến động thị trường vàng/chứng khoán có thể làm sai lệch giá trị tài sản ròng thực tế.`,
      recommendation: "Thực hiện cập nhật số dư mới nhất cho các mục bị cảnh báo.",
    });
  }

  const cashAsset = assetDistribution.find((a) => a.type === "CASH" || a.type === "BANK");
  if (cashAsset && cashAsset.percentage > 50) {
    riskAssessment.push({
      riskLevel: "MEDIUM",
      title: "Rủi ro lạm phát làm suy giảm sức mua tiền mặt",
      explanation: `Tiền mặt và ngân hàng chiếm ${cashAsset.percentage}% tổng tài sản. Mức lạm phát có thể bào mòn sức mua thực tế.`,
      recommendation: "Cân nhắc chuyển đổi một phần sang quỹ đầu tư cổ phiếu hoặc vàng tích lũy.",
    });
  } else {
    riskAssessment.push({
      riskLevel: "LOW",
      title: "Phân bổ danh mục tương đối cân bằng",
      explanation: "Tỷ trọng tài sản thanh khoản cao nằm trong ngưỡng an toàn.",
      recommendation: "Duy trì kỷ luật tiết kiệm và định giá định kỳ hàng tháng.",
    });
  }

  return {
    headline: "Báo Cáo Phân Tích Danh Mục Tài Sản & Quản Trị Rủi Ro AI",
    summary: `Tổng tài sản ròng đạt ${netWorthVND}. Hệ thống ghi nhận ${pack.evidenceItems.length} nguồn dữ liệu minh chứng đầu vào.`,
    keyObservations: observations,
    riskAssessment,
    savingsInvestmentPlan: {
      potentialMonthlySavingsMajor: potentialMonthlySavings,
      targetCategories: categoriesToCut.slice(0, 3),
      compounding5YearsMajor: compounding5Years,
      compounding10YearsMajor: compounding10Years,
      allocationRecommendation: [
        {
          assetType: "Chứng Chỉ Quỹ ETF (Cổ Phiếu VN30) 📈",
          percentage: 50,
          explanation: "Tối ưu hóa lợi nhuận dài hạn với tỷ suất tăng trưởng trung bình cao để tận dụng lãi kép.",
        },
        {
          assetType: "Vàng Tích Lũy Vật Chất (SJC/Nhẫn Trơn) 🪙",
          percentage: 30,
          explanation: "Phòng vệ lạm phát và ổn định giá trị tài sản trong thời kỳ biến động kinh tế.",
        },
        {
          assetType: "Gửi Tiết Kiệm Tích Lũy Kỷ Luật 💼",
          percentage: 20,
          explanation: "Cung cấp thanh khoản khẩn cấp và lợi nhuận cố định an toàn tuyệt đối.",
        },
      ],
    },
    citationIds: citations.slice(0, 5),
    disclaimer:
      "Báo cáo này được tự động tổng hợp từ dữ liệu tài sản cá nhân và thông tin thị trường công khai. Báo cáo không cấu thành lời khuyên đầu tư hoặc tư vấn tài chính pháp lý.",
  };
}
