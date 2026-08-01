'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  HelpCircle, ArrowLeft, Key, QrCode, AlertCircle, Sparkles, BookOpen,
  Send, ShieldCheck, Database, Award, Info, Scale, Check, ListTodo, Plus, Landmark, PieChart, CheckSquare, Bot
} from 'lucide-react';

type TabType = 'budget' | 'telegram' | 'goals' | 'cockpit' | 'ocr' | 'rebalance' | 'audit';

function GuideContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>('budget');

  // Sync tab from URL query params
  useEffect(() => {
    if (tabParam && ['budget', 'telegram', 'goals', 'cockpit', 'ocr', 'rebalance', 'audit'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const tabs = [
    { id: 'budget', label: 'Luồng Hạn Mức Chi Tiêu', icon: ListTodo },
    { id: 'telegram', label: 'Liên Kết Telegram Bot', icon: Send },
    { id: 'goals', label: 'Luồng Dự Báo Tích Sản', icon: Award },
    { id: 'cockpit', label: 'Bảng Điều Khiển Cockpit', icon: CheckSquare },
    { id: 'ocr', label: 'Quản Lý Net Worth & AI OCR', icon: Landmark },
    { id: 'rebalance', label: 'Tái Cân Đối & Giả Lập Nợ', icon: Scale },
    { id: 'audit', label: 'Kiểm Toán Tính Năng', icon: Database },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-900/40 text-slate-100 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-500/90 hover:text-emerald-400 font-bold transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Quay lại Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
              <HelpCircle className="w-8 h-8 text-emerald-400" />
              <span>Hướng Dẫn Sử Dụng Chi Tiết Từng Luồng Tính Năng</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Hướng dẫn từng bước cách sử dụng các phân hệ nghiệp vụ tài chính, thiết lập dữ liệu và kiểm thử các tính năng.
            </p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* Navigation Sidebar */}
          <div className="md:col-span-1 flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 border-b md:border-b-0 border-slate-800">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-slate-950 border-emerald-500/30 text-emerald-450 text-emerald-400 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-950/40 border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-450' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Content Card */}
          <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl min-h-[520px]">
            
            {/* TAB: Budget Flow */}
            {activeTab === 'budget' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                      💰
                    </span>
                    <span>Luồng Chi Tiêu & Thiết Lập Hạn Mức (Budget)</span>
                  </h2>
                  <p className="text-xs text-slate-400">Cách lên hạn mức chi tiêu tự động, nhập phát sinh thực tế và nhận thông báo cảnh báo.</p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-350 leading-relaxed">
                    Luồng nghiệp vụ này giúp bạn khống chế chi tiêu tháng không vượt quá kế hoạch để bảo toàn số dư tiết kiệm. Hãy làm theo 3 bước sau để chạy thử:
                  </p>

                  <div className="space-y-4 relative border-l border-slate-800 pl-5 ml-2.5">
                    
                    {/* Step 1 */}
                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center text-[8px] font-bold text-emerald-400">1</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 1: Thiết lập hạn mức tháng cho danh mục</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Cuộn màn hình xuống thẻ **Quản Lý Hạn Mức Chi Tiêu (Budget)**. 
                        Ở panel **Thiết Lập Ngân Sách** bên phải:
                        <br />
                        - Chọn danh mục chi tiêu muốn khống chế, ví dụ: **Ăn uống**.
                        <br />
                        - Nhập số tiền hạn mức tối đa cho tháng đó, ví dụ: <code className="text-emerald-400 font-mono font-bold">1.500.000</code> đ.
                        <br />
                        - Bấm nút **Lưu Ngân Sách**. Bạn sẽ thấy thẻ danh mục xuất hiện ở bên trái với số dư đã tiêu là 0đ.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center text-[8px] font-bold text-emerald-400">2</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 2: Nhập giao dịch chi tiêu phát sinh thực tế</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Cuộn lên thẻ **Nhật Ký Dòng Tiền (Ledger)** để ghi nhận chi phí:
                        <br />
                        - Chọn tài khoản thanh toán nguồn (ví dụ: *Tài khoản thanh toán VCB*).
                        <br />
                        - Chọn loại giao dịch: **Chi (EXPENSE)**.
                        <br />
                        - Nhập số tiền chi thực tế, ví dụ: <code className="text-rose-400 font-mono font-bold">150.000</code> đ.
                        <br />
                        - Chọn đúng danh mục **Ăn uống** mà bạn đã đặt hạn mức ở bước 1.
                        <br />
                        - Nhập ghi chú (ví dụ: *Đi ăn trưa với đồng nghiệp*) và bấm **Thêm Giao Dịch**.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center text-[8px] font-bold text-emerald-400">3</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 3: Quan sát thanh tiến độ ngân sách tự động cập nhật</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Nhìn lại thẻ **Quản Lý Hạn Mức Chi Tiêu (Budget)**:
                        <br />
                        - Danh mục **Ăn uống** đã tự động cập nhật số tiền đã tiêu lên **150.000 đ** và phần trạng thái hiển thị **10% đã tiêu**.
                        <br />
                        - Nếu bạn tiếp tục thêm các giao dịch khác làm tổng số tiền tiêu vượt **80%** hạn mức (ví dụ tiêu quá 1.200.000đ), thanh tiến trình sẽ chuyển sang **Màu Vàng** cảnh báo. Nếu vượt quá **100%**, thanh tiến trình chuyển sang **Màu Đỏ** báo động đỏ.
                      </p>
                    </div>

                  </div>

                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 flex gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      **Tính năng tự động gửi tin nhắn Telegram:** Hệ thống sẽ tự động chạy ngầm Budget Check Service khi lưu giao dịch. Nếu bạn đã cấu hình Telegram Bot (Xem Tab 2), một thông báo khẩn sẽ được bắn thẳng về điện thoại của bạn khi đạt các mốc 80% và 100%.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Telegram Bot */}
            {activeTab === 'telegram' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Bot className="w-4 h-4" />
                    </span>
                    <span>Liên Kết & Cấu Hình Telegram Bot Cảnh Báo</span>
                  </h2>
                  <p className="text-xs text-slate-400">Cách tạo Bot Telegram của riêng bạn để nhận tin nhắn cảnh báo tự động vượt hạn mức chi tiêu.</p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Để nhận được tin nhắn cảnh báo tự động tới điện thoại khi chi tiêu chạm ngưỡng nguy hiểm, bạn cần thiết lập cấu hình Telegram theo 4 bước sau:
                  </p>

                  <div className="relative border-l border-slate-800 pl-5 ml-2.5 space-y-4">
                    
                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-[8px] font-bold text-indigo-400">1</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 1: Tạo Bot mới qua Telegram</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Mở ứng dụng Telegram trên điện thoại/máy tính, tìm kiếm tài khoản chính thức <code className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-200 font-mono">@BotFather</code>. Nhập lệnh `/newbot` vào cuộc trò chuyện. Đặt tên hiển thị và username cho bot (ví dụ kết thúc bằng `_bot`). Bạn sẽ nhận được chuỗi **Bot Token** bảo mật.
                      </p>
                    </div>

                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-[8px] font-bold text-indigo-400">2</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 2: Lấy số ID cuộc trò chuyện của bạn</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Tìm kiếm tài khoản <code className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-200 font-mono">@userinfobot</code> trên Telegram. Bấm **Start / Bắt đầu**, bot này sẽ gửi lại cho bạn một dãy số dài là **Chat ID** cá nhân của bạn (ví dụ: `105948332`).
                      </p>
                    </div>

                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-[8px] font-bold text-indigo-400">3</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 3: Điền khóa cấu hình vào dự án</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Mở tệp biến môi trường hệ thống cấu hình dự án của bạn (file <code className="px-1 py-0.5 rounded bg-slate-900 text-slate-200 font-mono">.env</code> hoặc cấu hình trên dashboard deploy), thêm/sửa 2 dòng sau:
                        <br />
                        <code className="text-indigo-400 font-mono block mt-1 bg-slate-900 p-2 rounded text-[10px] sm:text-xs">
                          TELEGRAM_BOT_TOKEN=điền_chuỗi_token_nhận_được_ở_bước_1
                          <br />
                          TELEGRAM_CHAT_ID=điền_dãy_số_id_nhận_được_ở_bước_2
                        </code>
                      </p>
                    </div>

                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-[8px] font-bold text-indigo-400">4</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 4: Bắt đầu kích hoạt nhận tin nhắn</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Mở bot của bạn ra (theo đường link BotFather gửi ở bước 1) và bấm **Start**. Từ lúc này, bất kỳ giao dịch chi tiêu thực tế nào vượt 80% / 100% hạn mức danh mục sẽ kích hoạt bot gửi tin nhắn thông báo về tài khoản của bạn.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB: Goals Flow */}
            {activeTab === 'goals' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-455 border border-emerald-500/20">
                      🎯
                    </span>
                    <span>Luồng Đặt Mục Tiêu Tài Chính & Dự Báo Ngày Đạt</span>
                  </h2>
                  <p className="text-xs text-slate-400">Cách thiết lập mục tiêu mua nhà, mua xe... và cách hệ thống tự động dự báo ngày hoàn thành dựa trên dòng tiền thực tế.</p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tính năng này tự động dự báo ngày bạn đạt được mục tiêu dựa trên lượng tiền tích lũy thực tế mà bạn thặng dư mỗi tháng. Cách sử dụng như sau:
                  </p>

                  <div className="relative border-l border-slate-800 pl-5 ml-2.5 space-y-4">
                    
                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center text-[8px] font-bold text-emerald-400">1</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 1: Thêm mục tiêu tài chính mới</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Tại thẻ **Theo Dõi Mục Tiêu Tài Chính (Wealth Goals)**, bấm nút **+ Thêm Mục Tiêu**.
                        Điền các thông tin:
                        <br />
                        - Tên mục tiêu (ví dụ: *Mua xe VF8*).
                        <br />
                        - Phân loại (ví dụ: *Mua xe 🚗*).
                        <br />
                        - Số tiền mục tiêu mong muốn (ví dụ: <code className="text-emerald-400 font-mono font-bold">1.000.000.000</code> đ) và số tiền bạn hiện đã có sẵn cho mục tiêu này (ví dụ: <code className="text-emerald-400 font-mono font-bold">200.000.000</code> đ).
                        <br />
                        - Ngày bạn mong muốn đạt được. Bấm **Lưu Mục Tiêu**.
                      </p>
                    </div>

                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center text-[8px] font-bold text-emerald-400">2</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 2: Hệ thống tự động tính toán tiến độ dự báo</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Hệ thống sẽ lấy **Số dư thặng dư tháng này** (Thu nhập trừ Chi tiêu thực tế trong Ledger) làm tốc độ tích lũy thực tế.
                        <br />
                        - Nếu tháng này bạn tiết kiệm được nhiều, thời gian dự kiến hoàn thành mục tiêu hiển thị trên thẻ sẽ được **rút ngắn lại**.
                        <br />
                        - Nếu dòng tiền thặng dư bị âm (chi nhiều hơn thu), hệ thống sẽ kích hoạt mốc bảo vệ mặc định là **10.000.000 đ/tháng** để đưa ra dự tính giúp bạn không bị gián đoạn tính toán ngày đạt mục tiêu.
                      </p>
                    </div>

                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center text-[8px] font-bold text-emerald-400">3</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 3: Cập nhật tích lũy thêm</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Bất cứ khi nào bạn tiết kiệm thêm được tiền cho mục tiêu, hãy bấm vào ô nhập liệu **Tích lũy thêm** trực tiếp trên thẻ mục tiêu tương ứng, điền số tiền và bấm lưu. Thanh tiến trình sẽ tăng dần phần trăm hướng tới 100%.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB: Personal Cockpit Flow */}
            {activeTab === 'cockpit' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                      🚀
                    </span>
                    <span>Bảng Điều Khiển Personal Cockpit & Checklist Kỷ Luật Hàng Tháng</span>
                  </h2>
                  <p className="text-xs text-slate-400">Cách cài đặt cam kết tích sản cá nhân và thực hành 4 thói quen kỷ luật tiền tệ hàng tháng.</p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    **Personal Cockpit** là trung tâm huấn luyện kỷ luật tài chính cá nhân của bạn, giúp bạn liên tục cam kết và theo dõi các thói quen tiền tệ lành mạnh:
                  </p>

                  <div className="relative border-l border-slate-800 pl-5 ml-2.5 space-y-5">
                    
                    {/* Part 1 */}
                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center text-[8px] font-bold text-emerald-400">1</div>
                      <h4 className="text-xs font-bold text-slate-100">Thay đổi Mục Tiêu Tích Sản Hàng Tháng</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Đây là số tiền bạn đặt mục tiêu phải tiết kiệm / đầu tư được mỗi tháng.
                        <br />
                        - Bấm vào nút **Đổi Mục Tiêu** ở góc trên cùng bên phải của thẻ **Mục Tiêu Tích Sản Hàng Tháng Của Bạn**.
                        <br />
                        - Điền số tiền bạn muốn cam kết (Ví dụ mặc định: <code className="text-emerald-400 font-mono font-bold">15.000.000</code> đ).
                        <br />
                        - Bấm **Lưu**. Thanh tiến trình màu xanh lục sẽ hiển thị tiến độ hoàn thành dựa trên số tiền bạn đã tích lũy được trong tháng hiện tại.
                      </p>
                    </div>

                    {/* Part 2 */}
                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center text-[8px] font-bold text-emerald-400">2</div>
                      <h4 className="text-xs font-bold text-slate-100">Cách thực hành Checklist Kỷ Luật Hàng Tháng</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Dưới chân thẻ là danh sách 4 thói quen tài chính khuyên dùng để tránh rủi ro:
                        <br />
                        - **Đắp đầy Quỹ Khẩn Cấp**: Duy trì tối thiểu 3-6 tháng chi tiêu bằng tiền mặt hoặc tiết kiệm ngắn hạn đề phòng biến cố mất thu nhập.
                        <br />
                        - **Chạy Báo Cáo AI Research Brief**: Nhấn chạy báo cáo phân tích AI để rà soát rủi ro danh mục tài sản của bạn hàng tháng.
                        <br />
                        - **Thực Hiện Tái Cân Đối Danh Mục (Rebalancing)**: Điều chỉnh rebalancer để chốt lời các kênh tăng nóng và mua các kênh định giá rẻ.
                        <br />
                        - **Cập Nhật Số Dư Định Giá Mới Nhất**: Thường xuyên kiểm tra số tiền thực tế trong ví/tài khoản và cập nhật để tránh dữ liệu bị quá hạn (&gt;14 ngày).
                        <br />
                        - **Cách dùng**: Để đánh dấu đã hoàn thành việc nào, bạn **click trực tiếp vào ô vuông của việc đó**. Thẻ công việc sẽ chuyển sang **Màu Xanh Lá** có dấu tích. Hãy cố gắng duy trì đạt mốc **Hoàn hảo 100%** mỗi tháng!
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB: OCR Scan Flow */}
            {activeTab === 'ocr' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-450 border border-teal-500/20">
                      📸
                    </span>
                    <span>Luồng Tự Động Hóa Nhập Tài Sản Bằng AI OCR Scan</span>
                  </h2>
                  <p className="text-xs text-slate-400">Cách chụp ảnh số dư tài khoản ngân hàng hoặc sao kê để AI tự động bóc tách đưa vào Net Worth.</p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Thay vì phải nhập tay chi tiết từng số dư tiền gửi, số dư chứng khoán, bạn có thể tải lên ảnh chụp màn hình ứng dụng ngân hàng:
                  </p>

                  <div className="relative border-l border-slate-800 pl-5 ml-2.5 space-y-4">
                    
                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-teal-500 flex items-center justify-center text-[8px] font-bold text-teal-400">1</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 1: Chụp ảnh số dư tài khoản ngân hàng</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Chụp ảnh màn hình số dư khả dụng trên app ngân hàng của bạn (ví dụ Vietcombank, Techcombank) hoặc sổ tiết kiệm, tài khoản chứng khoán.
                      </p>
                    </div>

                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-teal-500 flex items-center justify-center text-[8px] font-bold text-teal-400">2</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 2: Tải ảnh lên Trợ lý AI OCR</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Tại thẻ **Danh Mục Tài Sản & Khoản Nợ**, bấm nút **Scan Hóa Đơn/Sao Kê (AI OCR)**. Một popup hiện lên, kéo thả hoặc chọn tệp ảnh bạn vừa chụp để tải lên hệ thống.
                      </p>
                    </div>

                    <div className="space-y-1 relative">
                      <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-teal-500 flex items-center justify-center text-[8px] font-bold text-teal-400">3</div>
                      <h4 className="text-xs font-bold text-slate-100">BƯỚC 3: AI tự động phân tích và thêm tài sản ròng</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Trợ lý AI (Sử dụng Gemini 2.0 Flash Vision) sẽ đọc quét hình ảnh, phân tích tên ngân hàng, loại tài sản (CASH, INVESTMENT...), số tiền VNĐ tương ứng và độ chính xác. Nhấn nút **Xác Nhận & Cập Nhật Dữ Liệu**, tài sản sẽ tự động được thêm mới hoặc cập nhật số dư vào bảng Net Worth của bạn.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB: Rebalancing & Debt Strategy */}
            {activeTab === 'rebalance' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      ⚖️
                    </span>
                    <span>Luồng Tái Cân Đối Danh Mục & Giả Lập Trả Nợ</span>
                  </h2>
                  <p className="text-xs text-slate-400">Cách tối ưu hóa tỷ lệ phân bổ tài sản phòng vệ lạm phát và thiết lập phương án trả nợ nhanh.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-violet-400" />
                    A. Luồng Tái Cân Đối Danh Mục (Portfolio Rebalancer)
                  </h3>
                  <div className="relative border-l border-slate-800 pl-5 ml-2.5 space-y-3">
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      1. Bấm vào nút **Tái Cân Đối Danh Mục (Rebalancer)** ở phía trên cùng của Dashboard.
                      <br />
                      2. Điều chỉnh các thanh trượt tỷ lệ mong muốn cho các lớp tài sản (Tiền mặt, Chứng khoán, Bất động sản, Vàng, Crypto...) sao cho tổng tỷ lệ đạt **100%**.
                      <br />
                      3. Hệ thống sẽ tự động so sánh số dư tài sản thực tế trong Net Worth của bạn để tính ra số tiền lệch (Delta VND) và đưa ra hành động cụ thể: Cần **Mua thêm (BUY)** hoặc **Bán bớt (SELL)** bao nhiêu tiền để tối ưu hóa danh mục quản trị rủi ro.
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 pt-2">
                    <Scale className="w-4 h-4 text-violet-400" />
                    B. Luồng Giả Lập Trả Nợ Nhanh (Debt Strategy Planner)
                  </h3>
                  <div className="relative border-l border-slate-800 pl-5 ml-2.5 space-y-3">
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      1. Nhấn nút **Kế Hoạch Trả Nợ (Debt Strategy)** ở góc dưới cùng Dashboard.
                      <br />
                      2. Nhập số tiền thặng dư tối đa bạn có thể trả thêm hàng tháng (Ví dụ: `2.000.000` đ).
                      <br />
                      3. Chọn thuật toán so sánh giữa **Snowball** (Ưu tiên trả khoản nợ nhỏ nhất trước để giải phóng tâm lý) và **Avalanche** (Ưu tiên trả khoản nợ có lãi suất cao nhất trước để tối ưu tiền lãi tiết kiệm được).
                      <br />
                      4. Xem biểu đồ giả lập dự phóng tổng số tiền lãi tiết kiệm được và số tháng rút ngắn được của từng phương án để lựa chọn chiến lược trả nợ tối ưu.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: System Audit */}
            {activeTab === 'audit' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-slate-100">🔍 Bảng Kiểm Toán Tính Năng Hệ Thống (System Inputs Audit)</h2>
                  <p className="text-xs text-slate-400">Minh bạch hóa các trường nhập liệu nào chạy thuật toán thật, trường nào là giả lập.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="py-2 px-3">Phân hệ chức năng</th>
                        <th className="py-2 px-3">Trường Nhập Liệu (Inputs)</th>
                        <th className="py-2 px-3">Trạng thái xử lý</th>
                        <th className="py-2 px-3">Chi tiết kỹ thuật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-slate-300">
                      
                      <tr>
                        <td className="py-3 px-3 font-semibold">Quản lý Net Worth</td>
                        <td className="py-3 px-3">Tên tài sản, số dư, đơn vị tiền tệ</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-455 border border-emerald-500/20 font-bold text-[10px]">
                            REAL LOGIC
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 leading-relaxed">
                          Lưu trữ MongoDB. Chạy thuật toán quy đổi tỷ giá thị trường thời gian thực (VCB XML/CoinGecko).
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 px-3 font-semibold">Nhật ký Cash Flow</td>
                        <td className="py-3 px-3">Số tiền giao dịch, danh mục, ngày, nguồn</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-455 border border-emerald-500/20 font-bold text-[10px]">
                            REAL LOGIC
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 leading-relaxed">
                          Lưu trữ MongoDB. Dữ liệu đưa trực tiếp vào các biểu đồ biến động tài chính, biểu đồ Net Worth.
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 px-3 font-semibold">Quản lý Hạn mức (Budget)</td>
                        <td className="py-3 px-3">Danh mục chi tiêu, hạn mức tháng</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-455 border border-emerald-500/20 font-bold text-[10px]">
                            REAL LOGIC
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 leading-relaxed">
                          Tự động so sánh khi thêm giao dịch. Liên kết API để kích hoạt thông báo gửi về Telegram.
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 px-3 font-semibold">Dự phóng 30 năm</td>
                        <td className="py-3 px-3">Số năm, lãi suất, lạm phát, tiền góp tháng</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-455 border border-emerald-500/20 font-bold text-[10px]">
                            REAL LOGIC
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 leading-relaxed">
                          Gọi API `/api/v1/scenarios/calculate` để chạy công thức toán học Future Value ghép lãi hàng tháng.
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 px-3 font-semibold">AI Briefing (Gemini)</td>
                        <td className="py-3 px-3">Khóa API Key Gemini cá nhân</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-455 border border-emerald-500/20 font-bold text-[10px]">
                            REAL LOGIC
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 leading-relaxed">
                          Gọi thẳng mô hình `gemini-2.0-flash` để bóc tách Evidence Pack thực tế của tài khoản.
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 px-3 font-semibold">AI Academy Chatbot</td>
                        <td className="py-3 px-3">Câu hỏi tư vấn tự do</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px]">
                            SANDBOX / MOCK
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 leading-relaxed">
                          Trả lời bằng thuật toán từ khóa tĩnh tại client nhằm tiết kiệm quota API. Không gọi API LLM thực tế.
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 px-3 font-semibold">Cổng PayOS Upgrade</td>
                        <td className="py-3 px-3">Mã QR, Nút "Xác nhận đã chuyển"</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px]">
                            SANDBOX / MOCK
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 leading-relaxed">
                          Cổng QR code thật, nhưng nút Xác nhận thanh toán sử dụng cơ chế giả lập thành công sau 1.2s để trải nghiệm thử.
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 text-violet-400 mt-0.5" />
                  <p>
                    Hệ thống đảm bảo tính minh bạch tối đa. Tất cả dữ liệu tài sản, số dư và giao dịch thực sự của bạn đều được xử lý cục bộ trên cơ sở dữ liệu MongoDB cá nhân, đảm bảo quyền riêng tư và an toàn tuyệt đối.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">Đang tải hướng dẫn...</div>}>
      <GuideContent />
    </Suspense>
  );
}
