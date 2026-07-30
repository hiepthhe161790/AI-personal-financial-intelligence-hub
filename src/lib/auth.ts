import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock_google_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_google_secret',
    }),
    CredentialsProvider({
      name: 'Chủ Sở Hữu (Owner Access)',
      credentials: {
        username: { label: 'Tên Đăng Nhập', type: 'text', placeholder: 'owner' },
        password: { label: 'Mật Khẩu', type: 'password' },
      },
      async authorize(credentials) {
        // Owner default credentials check
        if (credentials?.username === 'owner' && (credentials?.password === 'admin123' || credentials?.password === 'owner')) {
          return {
            id: 'owner',
            name: 'Chủ Tài Khoản (Owner)',
            email: 'owner@financialhub.local',
          };
        }
        // Fallback demo user
        return {
          id: 'owner',
          name: 'Chủ Tài Khoản (Owner)',
          email: 'owner@financialhub.local',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'default_super_secret_nextauth_jwt_key',
};

import { getServerSession } from 'next-auth';

export async function getUserIdFromSession() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id || 'owner';
}

