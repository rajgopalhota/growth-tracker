"use client";

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Layout, Button, Space, Typography, Avatar, Dropdown, Menu, Drawer, Popconfirm, Switch } from 'antd';
import {
  Menu as MenuIcon, User, LogOut, Settings, Bell, Home, FileText, CheckSquare, Target, Users, BookOpen, BarChart3, Zap, Download, Crown, Shield, X, FolderKanban
} from 'lucide-react';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// HeadCard Component - Premium Design with User Info
const HeadCard = ({ session, onClose }) => {
  return (
    <div className="sticky top-0 z-20 bg-gradient-to-b from-gray-950 to-black/95 backdrop-blur-2xl overflow-hidden">
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-pink-900/10 pointer-events-none" />

      {/* Content */}
      <div className="relative px-6 py-4 md:py-5">
        <div className="flex items-center justify-between">
          {/* User Info Section */}
          <div className="flex items-center gap-4">
            {/* Avatar with premium glass effect */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300" />
              <div className="relative">
                <img
                  src={`/avatars/${session?.user?.avatar || 'avatar1.png'}`}
                  alt="user"
                  className="w-12 h-12 rounded-2xl ring-2 ring-white/10 object-cover backdrop-blur-sm"
                />
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 border-2 border-black rounded-full animate-pulse" />
                  <div className="absolute w-4 h-4 bg-green-500/50 rounded-full animate-ping" />
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-white text-base truncate max-w-[150px]">
                {session?.user?.name}
              </p>

              {session?.user?.role === "admin" || session?.user?.role === "superadmin" ? (
                <div className="flex items-center gap-1.5">
                  {session?.user?.role === "superadmin" ? (
                    <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span className={`
                    px-2.5 py-0.5 text-[10px] font-bold rounded-lg
                    border backdrop-blur-sm
                    ${session?.user?.role === "superadmin"
                      ? "bg-gradient-to-r from-red-500/10 to-purple-500/10 border-purple-500/30 text-purple-300"
                      : "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-300"
                    }
                  `}>
                    {session?.user?.role?.toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                    <kbd className="px-1 py-0.5 font-mono bg-white/10 rounded text-[9px] border border-white/10">
                      Ctrl
                    </kbd>
                    <span>+</span>
                    <kbd className="px-1 py-0.5 font-mono bg-white/10 rounded text-[9px] border border-white/10">
                      K
                    </kbd>
                  </div>
                  <span className="text-gray-500">to toggle</span>
                </div>
              )}
            </div>
          </div>

          {/* Premium Close Button */}
          <button
            onClick={onClose}
            className="group relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 text-gray-400 hover:text-white focus:outline-none backdrop-blur-sm"
          >
            <X className="text-lg group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Sidebar Component - Premium Design with dynamic teams
const Sidebar = ({ session, onClose, onRedirect, navItems, teams }) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-black">
      <HeadCard session={session} onClose={onClose} />

      {/* 🌀 Scrollable Nav Section */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 rounded-lg scrollbar-thin">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dashboard</span>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        </div>

        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => onRedirect(item.href)}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 text-white ${item.hoverColor} hover:translate-x-1 group focus:outline-none`}
          >
            <div className="flex items-center space-x-3">
              <item.icon
                className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`}
              />
              <span className="font-medium">{item.name}</span>
            </div>
            {item.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-blue-400 border border-blue-400 bg-blue-400/15 shadow-sm backdrop-blur-sm">
                {item.badge}
              </span>
            )}
          </button>
        ))}

        {/* Teams Section */}
        {teams && teams.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-6 px-2">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Teams</span>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            </div>

            <div className="space-y-1">
              {teams.map((team) => (
                <div key={team._id} className="space-y-1">
                  <button
                    onClick={() => onRedirect(`/dashboard/teams/${team._id}`)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${pathname === `/dashboard/teams/${team._id}`
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-300'
                      }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium flex-1 truncate">{team.name}</span>
                  </button>

                  {/* Projects */}
                  {team.projects && team.projects.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {team.projects.map((project) => (
                        <button
                          key={project._id}
                          onClick={() => onRedirect(`/dashboard/teams/${team._id}/projects/${project._id}`)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${pathname === `/dashboard/teams/${team._id}/projects/${project._id}`
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'text-gray-500 hover:bg-blue-500/10 hover:text-blue-300'
                            }`}
                        >
                          <FolderKanban className="w-3.5 h-3.5" />
                          <span className="flex-1 truncate">{project.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setDrawerVisible((prev) => !prev);
      }
      if (e.key === 'Escape' && drawerVisible) {
        setDrawerVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerVisible]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTeams();
    }
  }, [status]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleRedirect = (path) => {
    router.push(path);
    setDrawerVisible(false);
  };

  const navigation = useMemo(() => [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-blue-400', hoverColor: 'hover:bg-blue-500/15' },
    { name: 'Todos', href: '/dashboard/todos', icon: CheckSquare, color: 'text-emerald-400', hoverColor: 'hover:bg-emerald-500/15' },
    { name: 'Goals', href: '/dashboard/goals', icon: Target, color: 'text-orange-400', hoverColor: 'hover:bg-orange-500/15', badge: 'New' },
    { name: 'Teams', href: '/dashboard/teams', icon: Users, color: 'text-cyan-400', hoverColor: 'hover:bg-cyan-500/15' },
  ], []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-3 py-4">
          {/* Left side - Logo and Menu */}
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<MenuIcon className="w-5 h-5" />}
              onClick={() => setDrawerVisible(true)}
              className="text-white hover:bg-white/10 border-0"
            />
            <div className="flex items-center gap-3">
              <div className="relative group logo-container">
                <div className="relative w-10 h-10 flex items-center justify-center logo-container">
                  <img
                    src="/logo.png"
                    alt="GrowthTracker Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">
                  GrowthTracker
                </h1>
              </div>
            </div>
          </div>

          {/* Right side - Notifications and User */}
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<Bell className="w-5 h-5" />}
              className="text-white hover:bg-white/10 border-0"
              onClick={() => router.push('/dashboard/notifications')}
            />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <img
                  src={`/avatars/${session?.user?.avatar || 'avatar11.png'}`}
                  alt={session?.user?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="hidden sm:block cursor-pointer hover:opacity-80 transition-opacity"
              >
                <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                <p className="text-xs text-gray-400">{session?.user?.email}</p>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 overflow-x-hidden">
        <div className="p-1 max-w-full">
          {children}
        </div>
      </main>

      {/* Enhanced Ant Design Drawer */}
      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        closable={false}
        className="drawer-custom"
        maskClosable={true}
        keyboard={true}
        destroyOnHidden
      >
        <Sidebar
          session={session}
          onClose={() => setDrawerVisible(false)}
          onRedirect={handleRedirect}
          navItems={navigation}
          teams={teams}
        />
      </Drawer>
    </>
  );
}