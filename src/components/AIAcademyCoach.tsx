'use client';

import { useState } from 'react';
import { BookOpen, GraduationCap, Sparkles, Send, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { ACADEMY_LESSONS, AcademyLesson } from '@/domain/ai-academy';

export default function AIAcademyCoach() {
  const [selectedLesson, setSelectedLesson] = useState<AcademyLesson>(ACADEMY_LESSONS[0]);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ Lý Huấn Luyện AI Financial Academy. Bạn có thắc mắc gì về chỉ số P/E, P/B hay phương pháp mua tích sản DCA không?',
    },
  ]);
  const [asking, setAsking] = useState(false);

  const handleAskAI = (promptText?: string) => {
    const q = promptText || question;
    if (!q.trim() || asking) return;

    const userMsg = q;
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    if (!promptText) setQuestion('');
    setAsking(true);

    // Simulate AI Coach Response with Safety Boundaries
    setTimeout(() => {
      let aiReply = `Dựa trên bài học "${selectedLesson.title}", việc tìm hiểu chỉ số giúp bạn có cái nhìn khách quan. `;
      if (userMsg.toLowerCase().includes('mua') || userMsg.toLowerCase().includes('bán') || userMsg.toLowerCase().includes('mã')) {
        aiReply += `LƯU Ý: AI Coach chỉ giải thích tư duy định giá và nguyên lý DCA, không phát lệnh mua/bán mã cổ phiếu cụ thể. Bạn nên thực hiện mua tích sản định kỳ (DCA) các cổ phiếu thuộc chỉ số VN30 để quản trị rủi ro tốt nhất.`;
      } else {
        aiReply += `Theo nguyên lý DCA, bạn trích 15-20% thu nhập hàng tháng để mua tích sản cố định vào một ngày trong tháng mà không cần lo lắng về sự trồi sụt ngắn hạn của thị trường.`;
      }

      setChatHistory((prev) => [...prev, { sender: 'ai', text: aiReply }]);
      setAsking(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold text-xs flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              Gói SaaS Pro Feature
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Financial Academy & Mentorship Coach
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Hệ thống đào tạo tư duy đầu tư chứng khoán, định giá doanh nghiệp và kiểm soát rủi ro tâm lý chuẩn F0.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Bảo vệ rủi ro: Không phát lệnh mua/bán mạo hiểm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lesson List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Danh Sách Bài Học Đầu Tư
          </h3>

          <div className="space-y-3">
            {ACADEMY_LESSONS.map((lesson) => {
              const isSelected = lesson.id === selectedLesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400">
                      {lesson.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{lesson.readTimeMinutes} phút đọc</span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{lesson.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{lesson.subtitle}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Lesson Reader & AI Coach Interactive Chat */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lesson Main Content Card */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <span className="text-xs text-indigo-400 font-semibold uppercase">{selectedLesson.category}</span>
              <h3 className="text-xl font-extrabold text-white">{selectedLesson.title}</h3>
              <p className="text-xs text-slate-400">{selectedLesson.subtitle}</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Điểm Cốt Lõi Cần Ghi Nhớ (Key Takeaways):
              </h4>
              <ul className="space-y-1.5 pl-6 text-xs text-slate-300 list-disc">
                {selectedLesson.keyTakeaways.map((kt, i) => (
                  <li key={i}>{kt}</li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-3 whitespace-pre-line font-normal">
              {selectedLesson.contentMarkdown}
            </div>

            {/* Sample Questions */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                Câu Hỏi Gợi Ý Cho AI Coach:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedLesson.sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskAI(q)}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-all cursor-pointer text-left"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Mentorship Coach Chat Window */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Hỏi Đáp Trực Tiếp Với AI Coach:
            </h4>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-xl ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-indigo-600 text-white font-medium'
                      : 'bg-slate-950 border border-slate-800 text-slate-300'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {asking && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-indigo-400 animate-pulse">
                  AI Coach đang suy nghĩ và phân tích...
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Đặt câu hỏi về bài học hoặc tư duy đầu tư..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={asking || !question.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
