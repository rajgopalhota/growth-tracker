import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongo';
import User from '@/models/User';
import { hash } from 'bcryptjs';
import { generateTokenPair } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create new user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'user',
      avatar: 'avatar1.png',
      lastSeen: new Date()
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Create response
    const response = NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        },
        accessToken
      },
      { status: 201 }
    );

    // Set HTTP-only cookie for refresh token
    response.cookies.set('token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
