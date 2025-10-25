'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Menu as MenuIcon,
  MenuSquare,
  Home,
  FileText,
  CheckSquare,
  Target,
  Users,
  Link as LinkIcon,
  Bell,
  BarChart3,
  Settings,
  Plus,
  User
} from 'lucide-react';
import { Layout, Menu, Button, Drawer, Avatar, Typography, Space, Badge } from 'antd';
import { useSession } from 'next-auth/react';

const { Sider } = Layout;
const { Text } = Typography;

const navigation = [
  { 
    key: '/dashboard', 
    icon: <Home className="w-4 h-4" />, 
    label: 'Dashboard',
    path: '/dashboard'
  },
  { 
    key: '/dashboard/notes', 
    icon: <FileText className="w-4 h-4" />, 
    label: 'Notes',
    path: '/dashboard/notes'
  },
  { 
    key: '/dashboard/todos', 
    icon: <CheckSquare className="w-4 h-4" />, 
    label: 'Todos',
    path: '/dashboard/todos'
  },
  { 
    key: '/dashboard/goals', 
    icon: <Target className="w-4 h-4" />, 
    label: 'Goals',
    path: '/dashboard/goals'
  },
  { 
    key: '/dashboard/teams', 
    icon: <Users className="w-4 h-4" />, 
    label: 'Teams',
    path: '/dashboard/teams'
  },
  { 
    key: '/dashboard/resources', 
    icon: <LinkIcon className="w-4 h-4" />, 
    label: 'Resources',
    path: '/dashboard/resources'
  },
  { 
    key: '/dashboard/notifications', 
    icon: <Bell className="w-4 h-4" />, 
    label: 'Notifications',
    path: '/dashboard/notifications'
  },
  { 
    key: '/dashboard/analytics', 
    icon: <BarChart3 className="w-4 h-4" />, 
    label: 'Analytics',
    path: '/dashboard/analytics'
  },
  { 
    key: '/dashboard/settings', 
    icon: <Settings className="w-4 h-4" />, 
    label: 'Settings',
    path: '/dashboard/settings'
  },
];

const quickActions = [
  {
    key: 'new-note',
    icon: <FileText className="w-4 h-4" />,
    label: 'New Note',
    path: '/dashboard/notes/new',
    color: '#1890ff'
  },
  {
    key: 'new-todo',
    icon: <CheckSquare className="w-4 h-4" />,
    label: 'New Todo',
    path: '/dashboard/todos/new',
    color: '#52c41a'
  },
  {
    key: 'new-goal',
    icon: <Target className="w-4 h-4" />,
    label: 'New Goal',
    path: '/dashboard/goals/new',
    color: '#722ed1'
  },
  {
    key: 'new-resource',
    icon: <LinkIcon className="w-4 h-4" />,
    label: 'New Resource',
    path: '/dashboard/resources/new',
    color: '#fa8c16'
  },
  {
    key: 'new-team',
    icon: <Users className="w-4 h-4" />,
    label: 'New Team',
    path: '/dashboard/teams/new',
    color: '#13c2c2'
  },
];

export default function AntSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadCount] = useState(5); // This would come from API

  const handleMenuClick = ({ key }) => {
    const item = navigation.find(nav => nav.key === key);
    if (item) {
      window.location.href = item.path;
    }
  };

  const handleQuickAction = (action) => {
    window.location.href = action.path;
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b border-white/10">
        <Space className="w-full">
          <Avatar 
            size={40} 
            src={session?.user?.image} 
            icon={<User className="w-5 h-5" />}
            className="bg-gradient-to-br from-orange-500 to-red-500"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <Text className="text-white font-medium block truncate">
                {session?.user?.name}
              </Text>
              <Text className="text-gray-400 text-xs block truncate">
                {session?.user?.email}
              </Text>
            </div>
          )}
        </Space>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-white/10">
        <Text className="text-gray-400 text-xs font-medium mb-2 block">
          QUICK ACTIONS
        </Text>
        <Space direction="vertical" className="w-full" size="small">
          {quickActions.map(action => (
            <Button
              key={action.key}
              type="text"
              icon={action.icon}
              className="w-full text-left justify-start h-8 text-gray-300 hover:text-white hover:bg-white/10 border-0"
              onClick={() => handleQuickAction(action)}
            >
              {!collapsed && action.label}
            </Button>
          ))}
        </Space>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          className="bg-transparent border-0 text-white"
          items={navigation.map(item => ({
            key: item.key,
            icon: item.key === '/dashboard/notifications' && unreadCount > 0 ? (
              <Badge count={unreadCount} size="small">
                {item.icon}
              </Badge>
            ) : item.icon,
            label: item.label,
          }))}
          onClick={handleMenuClick}
        />
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/10">
          <Text className="text-gray-500 text-xs">
            Growth Tracker v1.0
          </Text>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-black/20 backdrop-blur-xl border-r border-white/10"
        width={280}
        collapsedWidth={80}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          height: '100vh',
        }}
      >
        {sidebarContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Space>
            <Avatar 
              size={32} 
              src={session?.user?.image} 
              icon={<User className="w-4 h-4" />}
              className="bg-gradient-to-br from-orange-500 to-red-500"
            />
            <Text className="text-white font-medium">
              {session?.user?.name}
            </Text>
          </Space>
        }
        placement="left"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        width={280}
        className="mobile-sidebar-drawer"
        styles={{
          body: { 
            padding: 0,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(15, 23, 42, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
          },
          header: {
            background: 'rgba(0, 0, 0, 0.2)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
