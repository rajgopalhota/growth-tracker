'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  CheckSquare, 
  Target, 
  Users, 
  Link as LinkIcon, 
  TrendingUp, 
  Plus,
  Bell,
  Calendar,
  Clock,
  Activity,
  BarChart3,
  Zap,
  Star,
  Eye,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'New Note',
      description: 'Capture your thoughts and ideas',
      icon: FileText,
      href: '/dashboard/notes/new',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Add Todo',
      description: 'Create a new task',
      icon: CheckSquare,
      href: '/dashboard/todos/new',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Set Goal',
      description: 'Define a new objective',
      icon: Target,
      href: '/dashboard/goals/new',
      color: 'from-purple-500 to-violet-500',
    },
    {
      title: 'Share Resource',
      description: 'Add a helpful link or resource',
      icon: LinkIcon,
      href: '/dashboard/resources/new',
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Create Team',
      description: 'Start collaborating with others',
      icon: Users,
      href: '/dashboard/teams/new',
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': case 'critical': case 'highest': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': case 'lowest': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': case 'done': return 'text-green-400';
      case 'in-progress': return 'text-blue-400';
      case 'paused': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400' };
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-400' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-400' };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'text-blue-400' };
    return { text: d.toLocaleDateString(), color: 'text-gray-400' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const overview = dashboardData?.overview || {};
  const recent = dashboardData?.recent || {};
  const analytics = dashboardData?.analytics || {};
  const teams = dashboardData?.teams || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <GlassCard delay={0}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                Welcome back, {session?.user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-gray-400">
                Ready to continue your growth journey? Let's make today productive.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Today's Progress</p>
                <p className="text-2xl font-bold text-green-400">
                  {Math.round((overview.todoCompletionRate + overview.goalCompletionRate) / 2)}%
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard delay={0.1}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white/10">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{overview.totalNotes || 0}</p>
                <p className="text-sm text-gray-400">Total Notes</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white/10">
                <CheckSquare className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{overview.totalTodos || 0}</p>
                <p className="text-sm text-gray-400">Active Todos</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.3}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white/10">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{overview.totalGoals || 0}</p>
                <p className="text-sm text-gray-400">Goals in Progress</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.4}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white/10">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{overview.teams || 0}</p>
                <p className="text-sm text-gray-400">Teams</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Alerts */}
      {(overview.overdueTodos > 0 || overview.overdueGoals > 0 || overview.unreadNotifications > 0) && (
        <GlassCard delay={0.5}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              Alerts & Notifications
            </h2>
            <div className="space-y-3">
              {overview.unreadNotifications > 0 && (
                <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <Bell className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-white font-medium">{overview.unreadNotifications} unread notifications</p>
                    <p className="text-gray-400 text-sm">Check your notifications for updates</p>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/notifications')}
                    className="ml-auto px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded hover:bg-orange-500/30 transition-colors"
                  >
                    View
                  </button>
                </div>
              )}
              {overview.overdueTodos > 0 && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-medium">{overview.overdueTodos} overdue todos</p>
                    <p className="text-gray-400 text-sm">Some tasks need your attention</p>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/todos')}
                    className="ml-auto px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded hover:bg-red-500/30 transition-colors"
                  >
                    View
                  </button>
                </div>
              )}
              {overview.overdueGoals > 0 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">{overview.overdueGoals} overdue goals</p>
                    <p className="text-gray-400 text-sm">Review your goal deadlines</p>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/goals')}
                    className="ml-auto px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded hover:bg-yellow-500/30 transition-colors"
                  >
                    View
                  </button>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Quick Actions */}
      <GlassCard delay={0.6}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            <Zap className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group block p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-orange-300 transition-colors">
                      {action.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard delay={0.7}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Notes</h2>
              <Link href="/dashboard/notes" className="text-orange-400 hover:text-orange-300 text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recent.notes?.length > 0 ? recent.notes.slice(0, 5).map((note) => (
                <div key={note._id} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                     onClick={() => router.push(`/dashboard/notes/${note._id}`)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1 line-clamp-1">{note.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">{note.content}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(note.priority)}`}>
                        {note.priority}
                      </span>
                      {note.visibility === 'public' ? (
                        <Eye className="w-3 h-3 text-green-400" />
                      ) : note.visibility === 'team' ? (
                        <Users className="w-3 h-3 text-blue-400" />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{note.createdBy.name}</span>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent notes</p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.8}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Todos</h2>
              <Link href="/dashboard/todos" className="text-orange-400 hover:text-orange-300 text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recent.todos?.length > 0 ? recent.todos.slice(0, 5).map((todo) => (
                <div key={todo._id} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                     onClick={() => router.push(`/dashboard/todos/${todo._id}`)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1 line-clamp-1">{todo.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">{todo.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
                        {todo.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      {todo.assignee ? (
                        <span>{todo.assignee.name}</span>
                      ) : (
                        <span className="text-gray-500">Unassigned</span>
                      )}
                      {todo.dueDate && (
                        <span className={formatDate(todo.dueDate).color}>
                          {formatDate(todo.dueDate).text}
                        </span>
                      )}
                    </div>
                    {todo.comments?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{todo.comments.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent todos</p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Teams Overview */}
      {teams.length > 0 && (
        <GlassCard delay={0.9}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Teams</h2>
              <Link href="/dashboard/teams" className="text-orange-400 hover:text-orange-300 text-sm">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.slice(0, 6).map((team) => (
                <div key={team._id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                     onClick={() => router.push(`/dashboard/teams/${team._id}`)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{team.name}</h3>
                      <p className="text-sm text-gray-400">{team.members.length} members</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{team.description}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Analytics Overview */}
      <GlassCard delay={1.0}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Analytics Overview</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{overview.todoCompletionRate || 0}%</div>
              <p className="text-sm text-gray-400">Todo Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">{overview.goalCompletionRate || 0}%</div>
              <p className="text-sm text-gray-400">Goal Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{overview.totalResources || 0}</div>
              <p className="text-sm text-gray-400">Resources Shared</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">{overview.teams || 0}</div>
              <p className="text-sm text-gray-400">Active Teams</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
