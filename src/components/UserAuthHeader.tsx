'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { User, LogIn, LogOut, ShieldCheck } from 'lucide-react';

export default function UserAuthHeader() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />;
  }

  if (session && session.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-xs font-semibold text-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{session.user.name || session.user.email}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
    >
      <LogIn className="w-3.5 h-3.5" />
      <span>Đăng Nhập</span>
    </button>
  );
}
