import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Note from '@/models/Note';
import Notification from '@/models/Notification';

// POST /api/notes/[id]/comments - Add a comment to a note
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const { content, parentCommentId } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const note = await Note.findOne({
      _id: params.id,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id },
        { 'sharedWith.user': session.user.id },
        { visibility: 'public' }
      ]
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const comment = {
      user: session.user.id,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (parentCommentId) {
      // Add reply to existing comment
      const parentComment = note.comments.id(parentCommentId);
      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }

      parentComment.replies.push({
        user: session.user.id,
        content,
        createdAt: new Date()
      });
    } else {
      // Add new comment
      note.comments.push(comment);
    }

    await note.save();

    // Create notification for note owner and collaborators (except the commenter)
    const notifyUsers = [
      note.createdBy.toString(),
      ...note.collaborators.map(c => c.user.toString()),
      ...note.sharedWith.map(s => s.user.toString())
    ].filter(userId => userId !== session.user.id);

    if (notifyUsers.length > 0) {
      const notifications = notifyUsers.map(userId => ({
        user: userId,
        type: 'comment_added',
        title: 'New Comment',
        message: `${session.user.name} commented on "${note.title}"`,
        data: {
          itemType: 'note',
          itemId: note._id,
          actorId: session.user.id,
          metadata: { noteTitle: note.title, commentContent: content }
        }
      }));

      await Notification.insertMany(notifications);
    }

    // Populate the updated note
    const updatedNote = await Note.findById(note._id)
      .populate('comments.user', 'name email image')
      .populate('comments.replies.user', 'name email image');

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notes/[id]/comments/[commentId] - Update a comment
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const { content } = await request.json();
    const { id: noteId, commentId } = params;

    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const note = await Note.findOne({
      _id: noteId,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id },
        { 'sharedWith.user': session.user.id },
        { visibility: 'public' }
      ]
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const comment = note.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user can edit this comment
    if (comment.user.toString() !== session.user.id) {
      return NextResponse.json({ error: 'No permission to edit this comment' }, { status: 403 });
    }

    comment.content = content;
    comment.updatedAt = new Date();

    await note.save();

    // Populate the updated note
    const updatedNote = await Note.findById(note._id)
      .populate('comments.user', 'name email image')
      .populate('comments.replies.user', 'name email image');

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notes/[id]/comments/[commentId] - Delete a comment
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const { id: noteId, commentId } = params;

    const note = await Note.findOne({
      _id: noteId,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id },
        { 'sharedWith.user': session.user.id },
        { visibility: 'public' }
      ]
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const comment = note.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user can delete this comment
    if (comment.user.toString() !== session.user.id && note.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: 'No permission to delete this comment' }, { status: 403 });
    }

    comment.deleteOne();

    await note.save();

    // Populate the updated note
    const updatedNote = await Note.findById(note._id)
      .populate('comments.user', 'name email image')
      .populate('comments.replies.user', 'name email image');

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
