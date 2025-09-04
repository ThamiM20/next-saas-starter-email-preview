import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db/drizzle';
import { NextAuthOptions } from 'next-auth';
import { providers } from './providers';
import { users } from '@/lib/db/schema';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Update token data from session if triggered by update()
      if (trigger === 'update' && session) {
        token = { ...token, ...session.user };
      }
      
      return token;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/auth/error',
    signOut: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, '') : 'localhost',
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  theme: {
    colorScheme: 'light',
  },
  logger: process.env.NODE_ENV === 'development' ? {
    error(code, metadata) {
      console.error({ type: 'error', code, metadata });
    },
    warn(code) {
      console.warn({ type: 'warn', code });
    },
    debug(code, metadata) {
      console.log({ type: 'debug', code, metadata });
    },
  } : undefined,
};
