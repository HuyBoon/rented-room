import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
import dbConnect from './mongodb';
import User from '@/modules/users/model';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        matKhau: { label: 'Mật khẩu', type: 'password' }
      },
      async authorize(credentials) {
        const passwordField = credentials?.password || credentials?.matKhau;
        
        if (!credentials?.email || !passwordField) {
          return null;
        }

        try {
          await dbConnect();
          
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase(),
            status: { $in: ['active', 'hoatDong'] }
          }).select('+password');

          if (!user) {
            return null;
          }

          // Support both legacy and new field names for password check
          const passwordHash = user.password || (user as any).matKhau;
          const isPasswordValid = await compare(passwordField, passwordHash);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || (user as any).ten,
            role: user.role || (user as any).vaiTro,
            phone: user.phoneNumber || (user as any).soDienThoai,
            avatar: user.avatar || (user as any).anhDaiDien,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/dang-nhap',
    error: '/dang-nhap',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
