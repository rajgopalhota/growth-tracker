import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import User from '@/models/User';

export default async function getUserFromSession() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return { user: null, error: 'No session found', status: 401 };
    }

    await connectMongo();
    
    const user = await User.findOne({ email: session.user.email }).lean();
    
    if (!user) {
      return { user: null, error: 'User not found', status: 404 };
    }

    return { user, error: null, status: 200 };
  } catch (error) {
    console.error('Error in getUserFromSession:', error);
    return { user: null, error: 'Internal server error', status: 500 };
  }
}
