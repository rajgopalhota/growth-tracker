// /app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectMongo from '@/lib/mongo';
import User from '@/models/User';
import { compare } from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectMongo();

        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) {
          throw new Error('Email/password login not allowed for this user.');
        }

        const isMatch = await compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error('Invalid email or password.');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
      }
      if (!token.role && token.id) {
        const existingUser = await User.findById(token.id).lean();
        token.role = existingUser?.role || "user";
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.role = token.role || "user";
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      await connectMongo();

      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        // Create new user during sign up
        return true;
      }
      return true;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
