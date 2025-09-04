import NextAuth from 'next-auth';
import { authOptions } from './options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// This export is used to get the auth session in Server Components
export const auth = () => {
  return NextAuth(authOptions);
};

// Re-export auth options for use in other files
export { authOptions };
