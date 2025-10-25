import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Todo from '@/models/Todo';
import User from '@/models/User';
import Team from '@/models/Team';
import Sprint from '@/models/Sprint';
import Notification from '@/models/Notification';

// GET /api/todos - Get all todos for the user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team');
    const project = searchParams.get('project');
    const sprint = searchParams.get('sprint');
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {
      $or: [
        { reporter: session.user.id },
        { assignee: session.user.id },
        { 'watchers': session.user.id },
        { team: { $in: await getTeamIds(session.user.id) } }
      ],
      isArchived: false
    };

    if (teamId) query.team = teamId;
    if (project) query.project = project;
    if (sprint) query.sprint = sprint;
    if (status) query.status = status;
    if (assignee) query.assignee = assignee;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const todos = await Todo.find(query)
      .populate('assignee', 'name email image')
      .populate('reporter', 'name email image')
      .populate('lastUpdatedBy', 'name email image')
      .populate('team', 'name')
      .populate('sprint', 'name')
      .populate('epic', 'title')
      .populate('parent', 'title')
      .populate('watchers', 'name email image')
      .populate('comments.user', 'name email image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Todo.countDocuments(query);

    return NextResponse.json({
      todos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/todos - Create a new todo
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
      acceptanceCriteria,
      definitionOfDone,
      environment
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

    const todo = new Todo({
      title,
      description: description || '',
      type: type || 'task',
      priority: priority || 'medium',
      status: status || 'todo',
      assignee: assignee || null,
      reporter: session.user.id,
      team: team || null,
      project: project || null,
      epic: epic || null,
      parent: parent || null,
      labels: labels || [],
      components: components || [],
      fixVersions: fixVersions || [],
      dueDate: dueDate || null,
      startDate: startDate || null,
      storyPoints: storyPoints || null,
      acceptanceCriteria: acceptanceCriteria || [],
      definitionOfDone: definitionOfDone || [],
      environment: environment || null,
      createdBy: session.user.id,
      lastUpdatedBy: session.user.id
    });

    await todo.save();

    // Add watchers
    if (assignee) {
      todo.watchers.push(assignee);
    }
    todo.watchers.push(session.user.id);
    await todo.save();

    // Create notification for assignee
    if (assignee && assignee !== session.user.id) {
      const assigneeUser = await User.findById(assignee);
      if (assigneeUser) {
        await Notification.create({
          user: assignee,
          type: 'task_assigned',
          title: 'Task Assigned',
          message: `${session.user.name} assigned you a task: "${title}"`,
          data: {
            itemType: 'todo',
            itemId: todo._id,
            actorId: session.user.id,
            metadata: { taskTitle: title, taskType: type }
          }
        });
      }
    }

    // Populate the created todo
    const populatedTodo = await Todo.findById(todo._id)
      .populate('assignee', 'name email image')
      .populate('reporter', 'name email image')
      .populate('lastUpdatedBy', 'name email image')
      .populate('team', 'name')
      .populate('sprint', 'name')
      .populate('epic', 'title')
      .populate('parent', 'title')
      .populate('watchers', 'name email image');

    return NextResponse.json(populatedTodo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get team IDs for a user
async function getTeamIds(userId) {
  const teams = await Team.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ]
  }).select('_id');
  
  return teams.map(team => team._id);
}
