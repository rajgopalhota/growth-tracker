import { NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import connectMongo from './mongo';
import User from '@/models/User';

/**
 * Middleware to authenticate requests
 * Checks for JWT in Authorization header or cookies
 */
export async function authenticateRequest(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    // If no token in header, try cookies
    if (!token) {
      const cookies = request.headers.get('cookie');
      if (cookies) {
        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (tokenMatch) {
          token = decodeURIComponent(tokenMatch[1]);
        }
      }
    }

    if (!token) {
      return {
        error: NextResponse.json(
          { error: 'No token provided' },
          { status: 401 }
        )
      };
    }

    // Verify token
    const decoded = verifyToken(token);

    // Connect to database
    await connectMongo();

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -passwordHash');
    
    if (!user) {
      return {
        error: NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        )
      };
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    return { user };
  } catch (error) {
    console.error('Authentication error:', error.message);
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired token', details: error.message },
        { status: 401 }
      )
    };
  }
}

/**
 * Wrapper function to protect API routes
 */
export function withAuth(handler) {
  return async (request, context) => {
    const authResult = await authenticateRequest(request);
    
    if (authResult.error) {
      return authResult.error;
    }

    // Add user to request object
    request.user = authResult.user;
    
    return handler(request, context);
  };
}

export default { authenticateRequest, withAuth };
