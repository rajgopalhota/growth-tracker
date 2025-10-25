import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Goal from '@/models/Goal';
import User from '@/models/User';
import Notification from '@/models/Notification';

// GET /api/goals/[id] - Get a specific goal
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const goal = await Goal.findOne({
      _id: params.id,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id },
        { 'sharedWith.user': session.user.id },
        { visibility: 'public' }
      ]
    })
      .populate('createdBy', 'name email image')
      .populate('lastUpdatedBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image')
      .populate('team', 'name')
      .populate('relatedTodos', 'title status')
      .populate('relatedNotes', 'title')
      .populate('comments.user', 'name email image')
      .populate('comments.replies.user', 'name email image');

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/goals/[id] - Update a goal
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const goal = await Goal.findOne({
      _id: params.id,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id, 'collaborators.role': { $in: ['contributor', 'owner'] } }
      ]
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found or no permission' }, { status: 404 });
    }

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
      progress,
      milestones,
      metrics,
      habits,
      tags,
      relatedTodos,
      relatedNotes,
      visibility,
      collaborators,
      sharedWith
    } = body;

    const oldProgress = goal.progress;
    const oldStatus = goal.status;

    // Update fields
    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (category !== undefined) goal.category = category;
    if (type !== undefined) goal.type = type;
    if (priority !== undefined) goal.priority = priority;
    if (status !== undefined) goal.status = status;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (startDate !== undefined) goal.startDate = startDate;
    if (progress !== undefined) goal.progress = progress;
    if (milestones !== undefined) goal.milestones = milestones;
    if (metrics !== undefined) goal.metrics = metrics;
    if (habits !== undefined) goal.habits = habits;
    if (tags !== undefined) goal.tags = tags;
    if (relatedTodos !== undefined) goal.relatedTodos = relatedTodos;
    if (relatedNotes !== undefined) goal.relatedNotes = relatedNotes;
    if (visibility !== undefined) goal.visibility = visibility;
    if (collaborators !== undefined) goal.collaborators = collaborators;
    if (sharedWith !== undefined) goal.sharedWith = sharedWith;

    goal.lastUpdatedBy = session.user.id;

    // Set completion date if status changed to completed
    if (status === 'completed' && oldStatus !== 'completed') {
      goal.completedAt = new Date();
    }

    // Add progress history if progress changed
    if (progress !== undefined && progress !== oldProgress) {
      goal.progressHistory.push({
        progress,
        note: `Progress updated to ${progress}%`,
        updatedBy: session.user.id
      });
    }

    await goal.save();

    // Create notifications for milestone achievements
    if (milestones) {
      const completedMilestones = milestones.filter(m => m.completed && !goal.milestones.find(gm => gm._id.toString() === m._id?.toString() && gm.completed));
      
      if (completedMilestones.length > 0) {
        const notifications = goal.collaborators.map(collaborator => ({
          user: collaborator.user,
          type: 'milestone_reached',
          title: 'Milestone Achieved',
          message: `${session.user.name} completed milestone: "${completedMilestones[0].title}"`,
          data: {
            itemType: 'goal',
            itemId: goal._id,
            actorId: session.user.id,
            metadata: { goalTitle: goal.title, milestoneTitle: completedMilestones[0].title }
          }
        }));

        await Notification.insertMany(notifications);
      }
    }

    // Populate the updated goal
    const updatedGoal = await Goal.findById(goal._id)
      .populate('createdBy', 'name email image')
      .populate('lastUpdatedBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image')
      .populate('team', 'name')
      .populate('relatedTodos', 'title status')
      .populate('relatedNotes', 'title');

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/goals/[id] - Delete a goal
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const goal = await Goal.findOne({
      _id: params.id,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id, 'collaborators.role': 'owner' }
      ]
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found or no permission' }, { status: 404 });
    }

    await Goal.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
