import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Resource from '@/models/Resource';
import Notification from '@/models/Notification';

// POST /api/resources/[id]/comments - Add a comment to a resource
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

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const comment = {
      user: session.user.id,
      content: content.trim(),
      createdAt: new Date()
    };

    resource.comments.push(comment);
    await resource.save();

    // Create notification for resource owner and collaborators
    const notifyUsers = [resource.createdBy];
    resource.collaborators.forEach(c => {
      if (!notifyUsers.some(u => u.toString() === c.user.toString())) {
        notifyUsers.push(c.user);
      }
    });

    for (const userId of notifyUsers) {
      if (userId.toString() !== session.user.id) {
        await Notification.create({
          user: userId,
          type: 'resource_comment',
          title: 'New Comment',
          message: `${session.user.name} commented on the resource "${resource.title}"`,
          data: {
            resourceId: params.id,
            actorId: session.user.id,
            commentId: comment._id
          },
          isRead: false
        });
      }
    }

    // Get the newly added comment with user data
    const populatedResource = await Resource.findById(params.id)
      .populate('createdBy', 'name email image');

    const newComment = populatedResource.comments[populatedResource.comments.length - 1];
    
    // Manually populate the user data for the new comment
    if (newComment && newComment.user) {
      const User = (await import('@/models/User')).default;
      const user = await User.findById(newComment.user).select('name email image');
      newComment.user = user;
    }

    return NextResponse.json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/resources/[id]/comments - Get comments for a resource
export async function GET(request, { params }) {
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
    })
      .select('comments');

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json(resource.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
