"use client";

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Layout, Button, Space, Typography, Avatar, Dropdown, Menu, Drawer, Popconfirm, Switch } from 'antd';
import {
  Menu as MenuIcon, User, LogOut, Settings, Bell, Home, FileText, CheckSquare, Target, Users, BookOpen, BarChart3, Zap, Download, Crown, Shield, X
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
                  src={session?.user?.image}
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

// Sidebar Component - Premium Design
const Sidebar = ({ session, onClose, onRedirect, onLogout, navItems, animationsEnabled, toggleAnimations }) => {
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

        {/* Settings */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-6 px-2">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</span>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
          </div>

          <button
            onClick={() => onRedirect("/dashboard/settings")}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-white hover:bg-orange-500/15 hover:translate-x-1 group focus:outline-none"
          >
            <Settings className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Account Settings</span>
          </button>

          {/* Custom Export */}
          <button
            onClick={() => onRedirect("/dashboard/export")}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-white hover:bg-red-500/15 hover:translate-x-1 group focus:outline-none"
          >
            <Download className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Custom Export</span>
          </button>

          {/* User Management (Admin/Superadmin only) */}
          {(session?.user?.role === "admin" || session?.user?.role === "superadmin") && (
            <button
              onClick={() => onRedirect("/dashboard/users")}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-white hover:bg-cyan-500/15 hover:translate-x-1 group focus:outline-none"
            >
              <Users className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Users</span>
            </button>
          )}

          {/* ⚡ Performance Mode Toggle */}
          <div
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl mt-2 cursor-pointer hover:bg-orange-500/15 hover:translate-x-1 transition-all duration-200"
            onClick={() => toggleAnimations()}
          >
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-white">Animations</span>
            </div>
            <Switch
              checked={animationsEnabled}
              checkedChildren="On"
              unCheckedChildren="Off"
            />
          </div>
        </div>
      </div>

      {/* 🔻 Sticky Footer (Logout) - Enhanced */}
      <div className="sticky bottom-0 bg-gradient-to-r from-purple-800/10 to-pink-500/10 backdrop-blur-sm">
        <Popconfirm
          title="Sign out of your account?"
          description="You'll need to sign in again to access your data."
          onConfirm={onLogout}
          okText="Sign Out"
          cancelText="Cancel"
        >
          <button className="relative w-full group focus:outline-none overflow-hidden">
            {/* Glass background with border */}
            <div className="relative flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-br from-red-500/5 to-red-500/[0.02] backdrop-blur-sm transition-all duration-300 group-hover:bg-red-500/15 group-hover:shadow-lg group-hover:shadow-red-500/15">
              {/* Subtle animated gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon with enhanced container */}
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/15 border border-red-500/20 group-hover:bg-red-500/20 group-hover:border-red-500/30 transition-all duration-300">
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 group-hover:scale-110 transition-all duration-300" />
                {/* Subtle glow */}
                <div className="absolute inset-0 rounded-lg bg-red-500/20 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </div>
              
              <span className="relative font-semibold text-red-300 group-hover:text-red-200 transition-colors duration-300">
                Sign Out
              </span>

              {/* Danger indicator dot */}
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>

              {/* Light refraction edge */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />
            </div>
          </button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

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

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleRedirect = (path) => {
    router.push(path);
    setDrawerVisible(false);
  };

  const toggleAnimations = () => {
    setAnimationsEnabled(!animationsEnabled);
  };

  const navigation = useMemo(() => [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-blue-400', hoverColor: 'hover:bg-blue-500/15' },
    { name: 'Notes', href: '/dashboard/notes', icon: FileText, color: 'text-purple-400', hoverColor: 'hover:bg-purple-500/15' },
    { name: 'Todos', href: '/dashboard/todos', icon: CheckSquare, color: 'text-emerald-400', hoverColor: 'hover:bg-emerald-500/15' },
    { name: 'Goals', href: '/dashboard/goals', icon: Target, color: 'text-orange-400', hoverColor: 'hover:bg-orange-500/15', badge: 'New' },
    { name: 'Teams', href: '/dashboard/teams', icon: Users, color: 'text-cyan-400', hoverColor: 'hover:bg-cyan-500/15' },
    { name: 'Resources', href: '/dashboard/resources', icon: BookOpen, color: 'text-indigo-400', hoverColor: 'hover:bg-indigo-500/15' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, color: 'text-pink-400', hoverColor: 'hover:bg-pink-500/15', badge: 'Beta' },
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
        <div className="flex items-center justify-between px-6 py-4">
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
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                <p className="text-xs text-gray-400">{session?.user?.email}</p>
              </div>
              <Button
                type="text"
                icon={<LogOut className="w-4 h-4" />}
                className="text-white hover:bg-white/10 border-0"
                onClick={handleLogout}
                title="Sign out"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 overflow-x-hidden">
        <div className="p-6 max-w-full">
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
        destroyOnClose
        width={320}
        bodyStyle={{ padding: 0, background: 'transparent' }}
      >
        <Sidebar
          session={session}
          onClose={() => setDrawerVisible(false)}
          onRedirect={handleRedirect}
          onLogout={handleLogout}
          navItems={navigation}
          animationsEnabled={animationsEnabled}
          toggleAnimations={toggleAnimations}
        />
      </Drawer>

      <style jsx global>{`
        /* Ant Design Drawer Styling */
        .drawer-custom .ant-drawer-content {
          background: transparent !important;
        }

        .drawer-custom .ant-drawer-body {
          padding: 0 !important;
          background: transparent !important;
        }

        .drawer-custom .ant-drawer-header {
          display: none !important;
        }

        .drawer-custom .ant-drawer-wrapper-body {
          background: transparent !important;
        }

        .ant-btn-text {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        .ant-btn-text:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .ant-popconfirm .ant-popover-inner {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-popconfirm .ant-popover-title {
          color: white !important;
        }

        .ant-popconfirm .ant-popover-inner-content {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-switch-checked {
          background-color: #f97316 !important;
        }

        /* Premium Switch Styling */
        .premium-switch .ant-switch-handle {
          background: linear-gradient(135deg, #ffffff, #f8fafc) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
        }

        .premium-switch .ant-switch-handle::before {
          background: linear-gradient(135deg, #ffffff, #f8fafc) !important;
        }

        /* Premium Popconfirm Styling */
        .ant-popconfirm .ant-popover-inner {
          background: rgba(0, 0, 0, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          backdrop-filter: blur(20px) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
        }

        .ant-popconfirm .ant-popover-title {
          color: white !important;
          font-weight: 600 !important;
        }

        .ant-popconfirm .ant-popover-inner-content {
          color: rgba(255, 255, 255, 0.9) !important;
        }

        .ant-popconfirm .ant-btn-primary {
          background: linear-gradient(135deg, #f97316, #dc2626) !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3) !important;
        }

        .ant-popconfirm .ant-btn-default {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }

        /* Clean Drawer Styling */
        .drawer-custom .ant-drawer-content {
          background: transparent !important;
        }

        /* Ensure logo background is transparent */
        img[alt="GrowthTracker Logo"] {
          background: transparent !important;
        }

        /* Remove any background from logo containers */
        .logo-container {
          background: transparent !important;
        }

        /* Custom scrollbar for sidebar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
}