import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Resource from '@/models/Resource';
import User from '@/models/User';
import Team from '@/models/Team';
import Notification from '@/models/Notification';

// GET /api/resources - Get all resources for the user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team');
    const workspace = searchParams.get('workspace');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
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

    if (teamId) query.team = teamId;
    if (workspace) query.workspace = workspace;
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const resources = await Resource.find(query)
      .populate('createdBy', 'name email image')
      .populate('lastUpdatedBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image')
      .populate('team', 'name')
      .populate('notes.user', 'name email image')
      .populate('highlights.user', 'name email image')
      .populate('bookmarks.user', 'name email image')
      .populate('ratings.user', 'name email image')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resource.countDocuments(query);

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/resources - Create a new resource
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
      description,
      url,
      type,
      category,
      priority,
      status,
      team,
      workspace,
      visibility,
      tags,
      metadata,
      collaborators,
      sharedWith,
      relatedResources,
      relatedTodos,
      relatedGoals,
      relatedNotes,
      collections
    } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
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

    const resource = new Resource({
      title,
      description: description || '',
      url,
      type: type || 'link',
      category: category || 'other',
      priority: priority || 'medium',
      status: status || 'saved',
      team: team || null,
      workspace: workspace || 'general',
      visibility: visibility || 'team',
      tags: tags || [],
      metadata: metadata || {},
      collaborators: collaborators || [],
      sharedWith: sharedWith || [],
      relatedResources: relatedResources || [],
      relatedTodos: relatedTodos || [],
      relatedGoals: relatedGoals || [],
      relatedNotes: relatedNotes || [],
      collections: collections || [],
      createdBy: session.user.id,
      lastUpdatedBy: session.user.id
    });

    await resource.save();

    // Create notifications for shared users
    if (sharedWith && sharedWith.length > 0) {
      const notifications = sharedWith.map(share => ({
        user: share.user,
        type: 'resource_shared',
        title: 'Resource Shared',
        message: `${session.user.name} shared a resource with you: "${title}"`,
        data: {
          itemType: 'resource',
          itemId: resource._id,
          actorId: session.user.id,
          metadata: { resourceTitle: title, resourceType: type }
        }
      }));

      await Notification.insertMany(notifications);
    }

    // Populate the created resource
    const populatedResource = await Resource.findById(resource._id)
      .populate('createdBy', 'name email image')
      .populate('lastUpdatedBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image')
      .populate('team', 'name')
      .populate('notes.user', 'name email image')
      .populate('highlights.user', 'name email image')
      .populate('bookmarks.user', 'name email image')
      .populate('ratings.user', 'name email image');

    return NextResponse.json(populatedResource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
