import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Resource from '@/models/Resource';
import User from '@/models/User';

// POST /api/resources/[id]/bookmark - Bookmark/unbookmark a resource
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate resource ID
    if (!params.id || params.id === 'null' || params.id === 'undefined') {
      return NextResponse.json({ error: 'Invalid resource ID' }, { status: 400 });
    }

    await connectMongo();

    const resource = await Resource.findOne({
      _id: params.id,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id },
        { 'sharedWith.user': session.user.id },
        { visibility: 'public' }
      ]
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    const isBookmarked = user.bookmarkedResources.includes(params.id);

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarkedResources = user.bookmarkedResources.filter(
        id => id.toString() !== params.id
      );
      resource.bookmarkedBy = resource.bookmarkedBy.filter(
        id => id.toString() !== session.user.id
      );
    } else {
      // Add bookmark
      user.bookmarkedResources.push(params.id);
      resource.bookmarkedBy.push(session.user.id);
    }

    await user.save();
    await resource.save();

    return NextResponse.json({ 
      bookmarked: !isBookmarked,
      message: !isBookmarked ? 'Resource bookmarked' : 'Bookmark removed'
    });
  } catch (error) {
    console.error('Error bookmarking resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
