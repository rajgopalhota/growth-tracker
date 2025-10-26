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
        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password.');
        }

        const isMatch = await compare(credentials.password, user.passwordHash);
        if (!isMatch) {
          throw new Error('Invalid email or password.');
        }

        // Update last seen
        user.lastSeen = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        token.avatar = user.avatar;
      }
      
      // When session is updated, refresh user data from database
      if (trigger === 'update' && token.id) {
        await connectMongo();
        const existingUser = await User.findById(token.id).lean();
        if (existingUser) {
          token.role = existingUser.role || "user";
          token.avatar = existingUser.avatar;
          token.name = existingUser.name;
        }
      }
      
      if (!token.role && token.id) {
        const existingUser = await User.findById(token.id).lean();
        token.role = existingUser?.role || "user";
        token.avatar = existingUser?.avatar;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.role = token.role || "user";
        session.user.avatar = token.avatar;
        session.user.name = token.name;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 90 * 24 * 60 * 60, // 90 days in seconds
  },

  jwt: {
    maxAge: 90 * 24 * 60 * 60, // 90 days in seconds
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
