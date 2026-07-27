import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import PWARegister from '@/components/PWARegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Personal Financial Intelligence Hub',
  description: 'Hệ thống Quản lý Tài sản ròng (Net Worth), Mô phỏng kịch bản tài chính & Phân tích rủi ro AI.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Financial Hub',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen transition-colors duration-200`}>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <PWARegister />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
