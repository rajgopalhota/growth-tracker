import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Activity from '@/models/Activity';

// GET /api/activities - Get activities for a card or project
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('card');
    const projectId = searchParams.get('project');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project parameter is required' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Build query
    const query = { project: projectId };
    if (cardId) {
      query.card = cardId;
    }

    // Fetch activities with user information
    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create a new activity
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const body = await request.json();
    const { project, board, card, type, details } = body;

    if (!project || !type) {
      return NextResponse.json(
        { error: 'Project and type are required' },
        { status: 400 }
      );
    }

    const activity = new Activity({
      project,
      board: board || null,
      card: card || null,
      user: session.user.id,
      type,
      details: details || {}
    });

    await activity.save();

    // Populate the created activity
    const populatedActivity = await Activity.findById(activity._id)
      .populate('user', 'name email avatar');

    return NextResponse.json(populatedActivity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
