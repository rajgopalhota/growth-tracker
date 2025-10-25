import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Note from '@/models/Note';
import Todo from '@/models/Todo';
import Goal from '@/models/Goal';
import Resource from '@/models/Resource';
import Team from '@/models/Team';
import Notification from '@/models/Notification';

// GET /api/dashboard - Get dashboard analytics and overview
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const userId = session.user.id;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get user's teams
    const teams = await Team.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ],
      isActive: true
    }).select('name members');

    const teamIds = teams.map(team => team._id);

    // Build base queries
    const userQuery = {
      $or: [
        { createdBy: userId },
        { 'collaborators.user': userId },
        { 'sharedWith.user': userId },
        { visibility: 'public' }
      ],
      isArchived: false
    };

    const teamQuery = {
      $or: [
        { team: { $in: teamIds } },
        { createdBy: userId },
        { 'collaborators.user': userId },
        { 'sharedWith.user': userId },
        { visibility: 'public' }
      ],
      isArchived: false
    };

    // Get counts
    const [
      totalNotes,
      totalTodos,
      totalGoals,
      totalResources,
      recentNotes,
      recentTodos,
      recentGoals,
      recentResources,
      unreadNotifications,
      todosByStatus,
      goalsByStatus,
      goalsByType,
      notesByCategory,
      resourcesByType,
      weeklyActivity,
      monthlyActivity
    ] = await Promise.all([
      // Total counts
      Note.countDocuments(userQuery),
      Todo.countDocuments({
        $or: [
          { reporter: userId },
          { assignee: userId },
          { 'watchers': userId },
          { team: { $in: teamIds } }
        ],
        isArchived: false
      }),
      Goal.countDocuments(userQuery),
      Resource.countDocuments(userQuery),

      // Recent items
      Note.find(userQuery)
        .populate('createdBy', 'name email image')
        .populate('team', 'name')
        .sort({ updatedAt: -1 })
        .limit(5),
      Todo.find({
        $or: [
          { reporter: userId },
          { assignee: userId },
          { 'watchers': userId },
          { team: { $in: teamIds } }
        ],
        isArchived: false
      })
        .populate('assignee', 'name email image')
        .populate('reporter', 'name email image')
        .populate('team', 'name')
        .sort({ updatedAt: -1 })
        .limit(5),
      Goal.find(userQuery)
        .populate('createdBy', 'name email image')
        .populate('team', 'name')
        .sort({ updatedAt: -1 })
        .limit(5),
      Resource.find(userQuery)
        .populate('createdBy', 'name email image')
        .populate('team', 'name')
        .sort({ updatedAt: -1 })
        .limit(5),

      // Notifications
      Notification.countDocuments({ user: userId, isRead: false }),

      // Status distributions
      Todo.aggregate([
        {
          $match: {
            $or: [
              { reporter: userId },
              { assignee: userId },
              { 'watchers': userId },
              { team: { $in: teamIds } }
            ],
            isArchived: false
          }
        },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Goal.aggregate([
        {
          $match: userQuery
        },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Goal.aggregate([
        {
          $match: userQuery
        },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Note.aggregate([
        {
          $match: userQuery
        },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Resource.aggregate([
        {
          $match: userQuery
        },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),

      // Activity data
      getActivityData(userId, teamIds, startOfWeek, now),
      getActivityData(userId, teamIds, startOfMonth, now)
    ]);

    // Calculate completion rates
    const completedTodos = todosByStatus.find(item => item._id === 'done')?.count || 0;
    const totalActiveTodos = todosByStatus.reduce((sum, item) => sum + item.count, 0);
    const todoCompletionRate = totalActiveTodos > 0 ? (completedTodos / totalActiveTodos) * 100 : 0;

    const completedGoals = goalsByStatus.find(item => item._id === 'completed')?.count || 0;
    const totalActiveGoals = goalsByStatus.reduce((sum, item) => sum + item.count, 0);
    const goalCompletionRate = totalActiveGoals > 0 ? (completedGoals / totalActiveGoals) * 100 : 0;

    // Calculate overdue items
    const overdueTodos = await Todo.countDocuments({
      $or: [
        { reporter: userId },
        { assignee: userId },
        { 'watchers': userId },
        { team: { $in: teamIds } }
      ],
      dueDate: { $lt: now },
      status: { $nin: ['done', 'cancelled'] },
      isArchived: false
    });

    const overdueGoals = await Goal.countDocuments({
      $or: [
        { createdBy: userId },
        { 'collaborators.user': userId },
        { 'sharedWith.user': userId }
      ],
      targetDate: { $lt: now },
      status: { $nin: ['completed', 'cancelled'] },
      isArchived: false
    });

    return NextResponse.json({
      overview: {
        totalNotes,
        totalTodos,
        totalGoals,
        totalResources,
        unreadNotifications,
        teams: teams.length,
        todoCompletionRate: Math.round(todoCompletionRate),
        goalCompletionRate: Math.round(goalCompletionRate),
        overdueTodos,
        overdueGoals
      },
      recent: {
        notes: recentNotes,
        todos: recentTodos,
        goals: recentGoals,
        resources: recentResources
      },
      analytics: {
        todosByStatus,
        goalsByStatus,
        goalsByType,
        notesByCategory,
        resourcesByType,
        weeklyActivity,
        monthlyActivity
      },
      teams
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get activity data
async function getActivityData(userId, teamIds, startDate, endDate) {
  const activityData = [];

  // Notes activity
  const notesActivity = await Note.aggregate([
    {
      $match: {
        $or: [
          { createdBy: userId },
          { 'collaborators.user': userId },
          { 'sharedWith.user': userId },
          { visibility: 'public' }
        ],
        createdAt: { $gte: startDate, $lte: endDate },
        isArchived: false
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    }
  ]);

  // Todos activity
  const todosActivity = await Todo.aggregate([
    {
      $match: {
        $or: [
          { reporter: userId },
          { assignee: userId },
          { 'watchers': userId },
          { team: { $in: teamIds } }
        ],
        createdAt: { $gte: startDate, $lte: endDate },
        isArchived: false
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    }
  ]);

  // Goals activity
  const goalsActivity = await Goal.aggregate([
    {
      $match: {
        $or: [
          { createdBy: userId },
          { 'collaborators.user': userId },
          { 'sharedWith.user': userId },
          { visibility: 'public' }
        ],
        createdAt: { $gte: startDate, $lte: endDate },
        isArchived: false
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    }
  ]);

  // Resources activity
  const resourcesActivity = await Resource.aggregate([
    {
      $match: {
        $or: [
          { createdBy: userId },
          { 'collaborators.user': userId },
          { 'sharedWith.user': userId },
          { visibility: 'public' }
        ],
        createdAt: { $gte: startDate, $lte: endDate },
        isArchived: false
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    notes: notesActivity,
    todos: todosActivity,
    goals: goalsActivity,
    resources: resourcesActivity
  };
}
