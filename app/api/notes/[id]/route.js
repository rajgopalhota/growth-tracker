import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Note from '@/models/Note';
import User from '@/models/User';
import Team from '@/models/Team';
import Notification from '@/models/Notification';

// GET /api/notes/[id] - Get a specific note
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate note ID
    if (!params.id || params.id === 'null' || params.id === 'undefined') {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    await connectMongo();

    const note = await Note.findOne({
      _id: params.id,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id },
        { 'sharedWith.user': session.user.id },
        { visibility: 'public' }
      ]
    })
      .populate('createdBy', 'name email image')
      .populate('lastEditedBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image')
      .populate('team', 'name')
      .populate('comments.user', 'name email image')
      .populate('comments.replies.user', 'name email image');

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate note ID
    if (!params.id || params.id === 'null' || params.id === 'undefined') {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    await connectMongo();

    const note = await Note.findOne({
      _id: params.id,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id, 'collaborators.role': { $in: ['editor', 'admin'] } }
      ]
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found or no permission' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      content,
      contentHtml,
      tags,
      category,
      priority,
      visibility,
      team,
      sharedWith,
      collaborators
    } = body;

    // Save version history
    if (content !== note.content) {
      note.versionHistory.push({
        content: note.content,
        contentHtml: note.contentHtml,
        version: note.version,
        editedBy: session.user.id,
        editedAt: new Date(),
        changeDescription: 'Content updated'
      });
      note.version += 1;
    }

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (contentHtml !== undefined) note.contentHtml = contentHtml;
    if (tags !== undefined) note.tags = tags;
    if (category !== undefined) note.category = category;
    if (priority !== undefined) note.priority = priority;
    if (visibility !== undefined) note.visibility = visibility;
    if (team !== undefined) note.team = team;
    if (sharedWith !== undefined) note.sharedWith = sharedWith;
    if (collaborators !== undefined) note.collaborators = collaborators;

    note.lastEditedBy = session.user.id;

    await note.save();

    // Populate the updated note
    const updatedNote = await Note.findById(note._id)
      .populate('createdBy', 'name email image')
      .populate('lastEditedBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image')
      .populate('team', 'name');

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate note ID
    if (!params.id || params.id === 'null' || params.id === 'undefined') {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    await connectMongo();

    const note = await Note.findOne({
      _id: params.id,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id, 'collaborators.role': 'admin' }
      ]
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found or no permission' }, { status: 404 });
    }

    await Note.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
