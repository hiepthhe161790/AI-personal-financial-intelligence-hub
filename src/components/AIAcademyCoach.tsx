'use client';

import { useState, useRef, useEffect } from 'react';
import { BookOpen, GraduationCap, Sparkles, Send, CheckCircle2, ShieldCheck, HelpCircle, Bot, User, Loader2 } from 'lucide-react';
import { ACADEMY_LESSONS, AcademyLesson } from '@/domain/ai-academy';
import Link from 'next/link';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

// Gemini API history format
interface GeminiHistory {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export default function AIAcademyCoach() {
  const [selectedLesson, setSelectedLesson] = useState<AcademyLesson>(ACADEMY_LESSONS[0]);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: '👋 Xin chào! Tôi là AI Financial Mentor — Trợ lý đào tạo tư duy tài chính cá nhân.\n\nHãy chọn một bài học ở bên trái, rồi đặt câu hỏi cho tôi. Tôi sẽ giải thích chi tiết và cá nhân hóa theo ngữ cảnh bài học bạn đang học.',
    },
  ]);
  const [geminiHistory, setGeminiHistory] = useState<GeminiHistory[]>([]);
  const [asking, setAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, asking]);

  // Reset chat when lesson changes
  const handleSelectLesson = (lesson: AcademyLesson) => {
    setSelectedLesson(lesson);
    setChatHistory([
      {
        sender: 'ai',
        text: `📖 Bạn đang học bài: **${lesson.title}**\n\nTôi đã đọc toàn bộ nội dung bài học này. Hãy đặt câu hỏi bất kỳ — tôi sẽ giải thích dựa trên bài học và thực tiễn tài chính!`,
      },
    ]);
    setGeminiHistory([]);
  };

  const handleAskAI = async (promptText?: string) => {
    const q = (promptText || question).trim();
    if (!q || asking) return;

    // Add user message to display
    setChatHistory((prev) => [...prev, { sender: 'user', text: q }]);
    if (!promptText) setQuestion('');
    setAsking(true);

    try {
      // Build lesson context from current lesson
      const lessonContext = `
Bài học: ${selectedLesson.title}
Danh mục: ${selectedLesson.category}
Tóm tắt: ${selectedLesson.subtitle}

Key Takeaways:
${selectedLesson.keyTakeaways.map((k, i) => `${i + 1}. ${k}`).join('\n')}

Nội dung bài học:
${selectedLesson.contentMarkdown}
      `.trim();

      const res = await fetch('/api/v1/academy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          lessonContext,
          history: geminiHistory,
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại.';

      // Update display chat
      setChatHistory((prev) => [...prev, { sender: 'ai', text: aiReply }]);

      // Update Gemini-format history for next turn
      setGeminiHistory((prev) => [
        ...prev,
        { role: 'user', parts: [{ text: q }] },
        { role: 'model', parts: [{ text: aiReply }] },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'ai', text: '⚠️ Lỗi kết nối AI. Vui lòng kiểm tra kết nối mạng và thử lại.' },
      ]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold text-xs flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              AI-Powered Academy
            </span>
            <Link href="/guide?tab=academy" title="Hướng dẫn sử dụng">
              <HelpCircle className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors" />
            </Link>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            AI Financial Academy & Mentorship Coach
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Hỏi đáp trực tiếp với AI Gemini về tư duy đầu tư, định giá doanh nghiệp và kỷ luật tài chính.
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
            Danh Sách Bài Học
          </h3>

          <div className="space-y-3">
            {ACADEMY_LESSONS.map((lesson) => {
              const isSelected = lesson.id === selectedLesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
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

                  <h4 className="text-sm font-bold text-slate-100 leading-snug">{lesson.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{lesson.subtitle}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lesson Content + Chat */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lesson Card */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <span className="text-xs text-indigo-400 font-semibold uppercase">{selectedLesson.category}</span>
              <h3 className="text-xl font-extrabold text-slate-100">{selectedLesson.title}</h3>
              <p className="text-xs text-slate-400">{selectedLesson.subtitle}</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Điểm Cốt Lõi (Key Takeaways):
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
                    disabled={asking}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-all cursor-pointer text-left disabled:opacity-50"
                  >
                    &ldquo;{q}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Chat Window */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Hỏi Đáp Trực Tiếp Với AI Gemini
              <span className="ml-auto text-[10px] font-normal text-slate-500">Powered by Gemini 2.0 Flash</span>
            </h4>

            {/* Chat messages */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scroll-smooth">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
                  }`}>
                    {msg.sender === 'user'
                      ? <User className="w-3.5 h-3.5 text-white" />
                      : <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    }
                  </div>
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-md whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-slate-100 font-medium rounded-tr-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {asking && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-indigo-400 flex items-center gap-2 rounded-tl-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    AI Gemini đang phân tích...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                placeholder={`Hỏi về bài "${selectedLesson.title}"...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAskAI()}
                disabled={asking}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={asking || !question.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-100 font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
