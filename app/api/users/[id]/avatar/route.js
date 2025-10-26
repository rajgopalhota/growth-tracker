import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import User from '@/models/User';

const AVAILABLE_AVATARS = [
  'avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png',
  'avatar5.png', 'avatar6.png', 'avatar7.png', 'avatar8.png',
  'avatar9.png', 'avatar10.png', 'avatar11.png', 'avatar12.png'
];

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { avatar } = await request.json();

    // Check if user can update their own avatar
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Validate avatar against manifest
    if (!AVAILABLE_AVATARS.includes(avatar)) {
      return NextResponse.json(
        { error: 'Invalid avatar' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      id,
      { avatar },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Avatar updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update avatar error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
