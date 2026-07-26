export interface AcademyLesson {
  id: string;
  category: 'STOCKS' | 'MINDSET' | 'RISK_MANAGEMENT';
  title: string;
  subtitle: string;
  readTimeMinutes: number;
  keyTakeaways: string[];
  contentMarkdown: string;
  sampleQuestions: string[];
}

export const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: 'lesson-pe-pb-basic',
    category: 'STOCKS',
    title: 'Khái Niệm P/E, P/B & Định Giá Cổ Phiếu Cho Người Mới',
    subtitle: 'Làm sao để biết một cổ phiếu đang "Rẻ" hay "Đắt" mà không cần là chuyên gia?',
    readTimeMinutes: 5,
    keyTakeaways: [
      'P/E (Price to Earnings): Số năm bạn cần để hòa vốn từ lợi nhuận của doanh nghiệp.',
      'P/B (Price to Book Value): Giá cổ phiếu so với giá trị tài sản sổ sách của công ty.',
      'Không bao giờ mua một cổ phiếu chỉ vì giá nó giảm mạnh mà không xem yếu tố nội tại.',
    ],
    contentMarkdown: `
### 1. Chỉ số P/E là gì?
P/E đo lường mức giá bạn sẵn sàng trả cho 1 đồng lợi nhuận của doanh nghiệp. 
* Ví dụ: Cổ phiếu A có P/E = 10, nghĩa là nếu doanh nghiệp giữ nguyên lợi nhuận, bạn mất 10 năm để thu hồi vốn.
* P/E thấp hơn trung bình ngành thường là dấu hiệu cổ phiếu đang giao dịch ở định giá hấp dẫn.

### 2. Chỉ số P/B là gì?
P/B so sánh giá thị trường của cổ phiếu với giá trị sổ sách (tài sản ròng) trên mỗi cổ phiếu.
* P/B < 1.0 nghĩa là giá thị trường đang thấp hơn tổng giá trị tài sản ròng thanh lý của công ty.

### 3. Lời khuyên cho F0 người mới:
Dành cho người mới tham gia thị trường, ưu tiên tìm các doanh nghiệp VN30 đầu ngành có cổ tức tiền mặt ổn định, P/E < 12 và P/B < 1.5.
    `,
    sampleQuestions: [
      'P/E bằng bao nhiêu thì được coi là rẻ ở thị trường Việt Nam?',
      'Tại sao cổ phiếu ngân hàng thường được định giá bằng P/B thay vì P/E?',
    ],
  },
  {
    id: 'lesson-dca-strategy',
    category: 'STOCKS',
    title: 'Chiến Lược Mua Tích Sản DCA (Dollar-Cost Averaging)',
    subtitle: 'Bí quyết giúp người mới thu nhập 10 triệu tích lũy tài sản mượt mà không lo lắng sóng gió thị trường.',
    readTimeMinutes: 4,
    keyTakeaways: [
      'DCA là phương pháp trích cố định một số tiền (VD: 2 triệu/tháng) mua cổ phiếu tốt đúng ngày cố định.',
      'Loại bỏ hoàn toàn yếu tố cảm xúc, không cần canh giờ hay đoán đỉnh đoán đáy.',
      'Tự động mua được nhiều cổ phiếu hơn khi thị trường giảm và mua ít hơn khi thị trường tăng nóng.',
    ],
    contentMarkdown: `
### Phương pháp DCA hoạt động thế nào?
Thay vì chờ đợi "thời điểm hoàn hảo" để dồn tiền mua 1 lần, bạn chia nhỏ tiền thành 12 đợt mua cố định trong năm.

### Ví dụ thực tế:
* Tháng 1: Bạn mua HPG giá 30k -> Mua được 666 cổ phiếu.
* Tháng 2: Thị trường giảm, HPG còn 20k -> Mua được 1.000 cổ phiếu!
* Tháng 3: Thị trường hồi phục lên 25k -> Trung bình giá vốn của bạn chỉ khoảng 23.8k!

DCA giúp người mới tích lũy tài sản dài hạn cực kỳ an toàn.
    `,
    sampleQuestions: [
      'Nên chọn mã cổ phiếu nào để áp dụng chiến lược DCA tích sản?',
      'Khi thị trường sập mạnh thì có nên tiếp tục DCA không?',
    ],
  },
  {
    id: 'lesson-fomo-discipline',
    category: 'MINDSET',
    title: 'Làm Chủ Tâm Lý FOMO & Kỷ Luật Tài Chính',
    subtitle: 'Thắng rủi ro lớn nhất trên thị trường tài chính: Chính cảm xúc của bạn.',
    readTimeMinutes: 4,
    keyTakeaways: [
      'FOMO (Fear Of Missing Out): Nỗi sợ bỏ lỡ cơ hội khi thấy người khác khoe lãi.',
      'Không mua đuổi cổ phiếu đã tăng trần nhiều phiên liên tiếp.',
      'Luôn có kế hoạch phân bổ vốn trước khi bấm nút mua.',
    ],
    contentMarkdown: `
### Kẻ thù số 1 của nhà đầu tư F0 là gì?
Đó chính là cảm xúc FOMO — nhảy vào mua ở ngay vùng ĐỈNH vì sợ mất phần, và bán tháo ở ngay vùng ĐÁY vì hoảng sợ!

### 3 Quy tắc giữ vững tâm lý:
1. Chi tiêu dưới mức thu nhập.
2. Không bao giờ dùng tiền vay mượn nóng (Margin/Nợ nóng) để đầu tư cổ phiếu.
3. Luôn giữ sẵn Quỹ dự phòng khẩn cấp 3–6 tháng để không phải bán tháo cổ phiếu lúc thị trường điều chỉnh.
    `,
    sampleQuestions: [
      'Làm thế nào để kiềm chế cảm xúc khi thấy bạn bè lãi to từ mã cổ phiếu "nóng"?',
      'Có nên cắt lỗ khi cổ phiếu giảm quá 10% không?',
    ],
  },
];

export const ACADEMY_AI_SAFETY_SYSTEM_PROMPT = `
You are the AI Financial Academy Coach inside the AI Personal Financial Intelligence Hub.
Your goal is to educate users on financial literacy, stock market fundamentals (P/E, P/B, DCA), personal asset allocation, and mindset discipline.

STRICT SAFETY BOUNDARIES (MANDATORY):
1. NEVER give direct BUY/SELL/HOLD trading recommendations or order signals for specific stock symbols.
2. ALWAYS frame advice around educational concepts, risk management, and long-term DCA principles.
3. Always respond in clear, encouraging, educational Vietnamese language.
`;
