import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Note from '@/models/Note';
import User from '@/models/User';
import Team from '@/models/Team';
import Notification from '@/models/Notification';

// GET /api/notes - Get all notes for the user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id },
        { 'sharedWith.user': session.user.id },
        { visibility: 'public' }
      ],
      isArchived: false
    };

    if (teamId) {
      query.team = teamId;
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    const notes = await Note.find(query)
      .populate('createdBy', 'name email image')
      .populate('lastEditedBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image')
      .populate('team', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments(query);

    return NextResponse.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notes - Create a new note
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

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
      collaborators,
      isTemplate,
      templateCategory
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Check team permissions if team is specified
    if (team) {
      const teamDoc = await Team.findOne({
        _id: team,
        $or: [
          { owner: session.user.id },
          { 'members.user': session.user.id }
        ]
      });

      if (!teamDoc) {
        return NextResponse.json({ error: 'Team not found or no permission' }, { status: 403 });
      }
    }

    const note = new Note({
      title,
      content,
      contentHtml: contentHtml || content,
      tags: tags || [],
      category: category || 'personal',
      priority: priority || 'medium',
      visibility: visibility || 'private',
      team: team || null,
      sharedWith: sharedWith || [],
      collaborators: collaborators || [],
      isTemplate: isTemplate || false,
      templateCategory: templateCategory || null,
      createdBy: session.user.id,
      lastEditedBy: session.user.id
    });

    await note.save();

    // Populate the created note
    const populatedNote = await Note.findById(note._id)
      .populate('createdBy', 'name email image')
      .populate('lastEditedBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image')
      .populate('team', 'name');

    // Create notifications for shared users
    if (sharedWith && sharedWith.length > 0) {
      const notifications = sharedWith.map(share => ({
        user: share.user,
        type: 'note_shared',
        title: 'Note Shared',
        message: `${session.user.name} shared a note with you: "${title}"`,
        data: {
          itemType: 'note',
          itemId: note._id,
          actorId: session.user.id,
          metadata: { noteTitle: title }
        }
      }));

      await Notification.insertMany(notifications);
    }

    return NextResponse.json(populatedNote, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
