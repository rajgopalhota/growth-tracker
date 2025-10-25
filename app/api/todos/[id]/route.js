import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Todo from '@/models/Todo';
import User from '@/models/User';
import Notification from '@/models/Notification';

// GET /api/todos/[id] - Get a specific todo
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const todo = await Todo.findOne({
      _id: params.id,
      $or: [
        { reporter: session.user.id },
        { assignee: session.user.id },
        { 'watchers': session.user.id },
        { team: { $in: await getTeamIds(session.user.id) } }
      ]
    })
      .populate('assignee', 'name email image')
      .populate('reporter', 'name email image')
      .populate('lastUpdatedBy', 'name email image')
      .populate('team', 'name')
      .populate('sprint', 'name')
      .populate('epic', 'title')
      .populate('parent', 'title')
      .populate('watchers', 'name email image')
      .populate('comments.user', 'name email image')
      .populate('comments.replies.user', 'name email image')
      .populate('timeTracking.workLogs.user', 'name email image')
      .populate('linkedIssues.todo', 'title status');

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/todos/[id] - Update a todo
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const todo = await Todo.findOne({
      _id: params.id,
      $or: [
        { reporter: session.user.id },
        { assignee: session.user.id },
        { 'watchers': session.user.id },
        { team: { $in: await getTeamIds(session.user.id) } }
      ]
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      priority,
      status,
      assignee,
      team,
      project,
      epic,
      parent,
      labels,
      components,
      fixVersions,
      dueDate,
      startDate,
      storyPoints,
      resolution,
      acceptanceCriteria,
      definitionOfDone,
      environment
    } = body;

    const oldAssignee = todo.assignee;
    const oldStatus = todo.status;

    // Update fields
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (type !== undefined) todo.type = type;
    if (priority !== undefined) todo.priority = priority;
    if (status !== undefined) todo.status = status;
    if (assignee !== undefined) todo.assignee = assignee;
    if (team !== undefined) todo.team = team;
    if (project !== undefined) todo.project = project;
    if (epic !== undefined) todo.epic = epic;
    if (parent !== undefined) todo.parent = parent;
    if (labels !== undefined) todo.labels = labels;
    if (components !== undefined) todo.components = components;
    if (fixVersions !== undefined) todo.fixVersions = fixVersions;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (startDate !== undefined) todo.startDate = startDate;
    if (storyPoints !== undefined) todo.storyPoints = storyPoints;
    if (resolution !== undefined) todo.resolution = resolution;
    if (acceptanceCriteria !== undefined) todo.acceptanceCriteria = acceptanceCriteria;
    if (definitionOfDone !== undefined) todo.definitionOfDone = definitionOfDone;
    if (environment !== undefined) todo.environment = environment;

    todo.lastUpdatedBy = session.user.id;

    // Set completion date if status changed to done
    if (status === 'done' && oldStatus !== 'done') {
      todo.completedAt = new Date();
    }

    // Add watchers for new assignee
    if (assignee && assignee !== oldAssignee && !todo.watchers.includes(assignee)) {
      todo.watchers.push(assignee);
    }

    await todo.save();

    // Create notifications
    const notifications = [];

    // Notification for new assignee
    if (assignee && assignee !== oldAssignee && assignee !== session.user.id) {
      notifications.push({
        user: assignee,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `${session.user.name} assigned you a task: "${todo.title}"`,
        data: {
          itemType: 'todo',
          itemId: todo._id,
          actorId: session.user.id,
          metadata: { taskTitle: todo.title, taskType: todo.type }
        }
      });
    }

    // Notification for old assignee if unassigned
    if (oldAssignee && !assignee && oldAssignee !== session.user.id) {
      notifications.push({
        user: oldAssignee,
        type: 'task_updated',
        title: 'Task Updated',
        message: `${session.user.name} unassigned you from task: "${todo.title}"`,
        data: {
          itemType: 'todo',
          itemId: todo._id,
          actorId: session.user.id,
          metadata: { taskTitle: todo.title }
        }
      });
    }

    // Notification for status change
    if (status !== oldStatus && status === 'done') {
      const watchers = todo.watchers.filter(watcher => watcher.toString() !== session.user.id);
      watchers.forEach(watcher => {
        notifications.push({
          user: watcher,
          type: 'task_completed',
          title: 'Task Completed',
          message: `${session.user.name} completed task: "${todo.title}"`,
          data: {
            itemType: 'todo',
            itemId: todo._id,
            actorId: session.user.id,
            metadata: { taskTitle: todo.title }
          }
        });
      });
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Populate the updated todo
    const updatedTodo = await Todo.findById(todo._id)
      .populate('assignee', 'name email image')
      .populate('reporter', 'name email image')
      .populate('lastUpdatedBy', 'name email image')
      .populate('team', 'name')
      .populate('sprint', 'name')
      .populate('epic', 'title')
      .populate('parent', 'title')
      .populate('watchers', 'name email image');

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const todo = await Todo.findOne({
      _id: params.id,
      $or: [
        { reporter: session.user.id },
        { team: { $in: await getTeamIds(session.user.id) } }
      ]
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found or no permission' }, { status: 404 });
    }

    await Todo.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get team IDs for a user
async function getTeamIds(userId) {
  const Team = (await import('@/models/Team')).default;
  const teams = await Team.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ]
  }).select('_id');
  
  return teams.map(team => team._id);
}
