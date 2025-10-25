import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Goal from '@/models/Goal';
import User from '@/models/User';
import Team from '@/models/Team';
import Notification from '@/models/Notification';

// GET /api/goals - Get all goals for the user
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
    const type = searchParams.get('type');
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
    if (category) query.category = category;
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const goals = await Goal.find(query)
      .populate('createdBy', 'name email image')
      .populate('lastUpdatedBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image')
      .populate('team', 'name')
      .populate('relatedTodos', 'title status')
      .populate('relatedNotes', 'title')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Goal.countDocuments(query);

    return NextResponse.json({
      goals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/goals - Create a new goal
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
      category,
      type,
      priority,
      status,
      targetDate,
      startDate,
      team,
      collaborators,
      sharedWith,
      milestones,
      metrics,
      habits,
      tags,
      relatedTodos,
      relatedNotes,
      visibility,
      isTemplate,
      templateCategory
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
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

    const goal = new Goal({
      title,
      description: description || '',
      category: category || 'personal',
      type: type || 'short-term',
      priority: priority || 'medium',
      status: status || 'not-started',
      targetDate: targetDate || null,
      startDate: startDate || new Date(),
      team: team || null,
      collaborators: collaborators || [],
      sharedWith: sharedWith || [],
      milestones: milestones || [],
      metrics: metrics || [],
      habits: habits || [],
      tags: tags || [],
      relatedTodos: relatedTodos || [],
      relatedNotes: relatedNotes || [],
      visibility: visibility || 'private',
      isTemplate: isTemplate || false,
      templateCategory: templateCategory || null,
      createdBy: session.user.id,
      lastUpdatedBy: session.user.id
    });

    await goal.save();

    // Create notifications for shared users
    if (sharedWith && sharedWith.length > 0) {
      const notifications = sharedWith.map(share => ({
        user: share.user,
        type: 'goal_shared',
        title: 'Goal Shared',
        message: `${session.user.name} shared a goal with you: "${title}"`,
        data: {
          itemType: 'goal',
          itemId: goal._id,
          actorId: session.user.id,
          metadata: { goalTitle: title, goalType: type }
        }
      }));

      await Notification.insertMany(notifications);
    }

    // Populate the created goal
    const populatedGoal = await Goal.findById(goal._id)
      .populate('createdBy', 'name email image')
      .populate('lastUpdatedBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image')
      .populate('team', 'name')
      .populate('relatedTodos', 'title status')
      .populate('relatedNotes', 'title');

    return NextResponse.json(populatedGoal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
