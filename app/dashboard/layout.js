'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Layout, Button, Space, Typography, Avatar, Dropdown, Menu } from 'antd';
import { 
  Menu as MenuIcon,
  MenuSquare,
  User,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import AntSidebar from '@/components/AntSidebar';
import { signOut } from 'next-auth/react';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User className="w-4 h-4" />,
      label: 'Profile',
      onClick: () => router.push('/dashboard/profile'),
    },
    {
      key: 'settings',
      icon: <Settings className="w-4 h-4" />,
      label: 'Settings',
      onClick: () => router.push('/dashboard/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4" />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      <AntSidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <Layout className="site-layout">
        <Header 
          className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-4"
          style={{ 
            position: 'sticky',
            top: 0,
            zIndex: 999,
            padding: '0 16px',
            height: '64px',
            lineHeight: '64px',
          }}
        >
          <div className="flex items-center justify-between h-full">
            <Space>
              <Button
                type="text"
                icon={collapsed ? <MenuSquare className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
                onClick={() => setCollapsed(!collapsed)}
                className="text-white hover:bg-white/10 border-0 lg:hidden"
              />
              <Button
                type="text"
                icon={collapsed ? <MenuSquare className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
                onClick={() => setMobileOpen(true)}
                className="text-white hover:bg-white/10 border-0 md:hidden"
              />
            </Space>

            <Space>
              <Button
                type="text"
                icon={<Bell className="w-4 h-4" />}
                className="text-white hover:bg-white/10 border-0"
                onClick={() => router.push('/dashboard/notifications')}
              />
              
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Space className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded">
                  <Avatar 
                    size={32} 
                    src={session?.user?.image} 
                    icon={<User className="w-4 h-4" />}
                    className="bg-gradient-to-br from-orange-500 to-red-500"
                  />
                  <Text className="text-white hidden sm:block">
                    {session?.user?.name}
                  </Text>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content 
          className="p-6"
          style={{
            marginLeft: collapsed ? 80 : 280,
            transition: 'margin-left 0.2s',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div className="w-full">
            {children}
          </div>
        </Content>
      </Layout>

      <style jsx global>{`
        .ant-layout-sider {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(15, 23, 42, 0.8) 100%) !important;
          backdrop-filter: blur(20px);
        }
        
        .ant-menu {
          background: transparent !important;
          border-right: none !important;
        }
        
        .ant-menu-item {
          color: rgba(255, 255, 255, 0.7) !important;
          margin: 4px 8px !important;
          border-radius: 8px !important;
        }
        
        .ant-menu-item:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .ant-menu-item-selected {
          color: white !important;
          background: linear-gradient(135deg, rgba(255, 140, 0, 0.2) 0%, rgba(255, 0, 0, 0.1) 100%) !important;
          border: 1px solid rgba(255, 140, 0, 0.3) !important;
        }
        
        .ant-menu-item-selected::after {
          display: none !important;
        }
        
        .ant-drawer-content {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(15, 23, 42, 0.8) 100%) !important;
          backdrop-filter: blur(20px);
        }
        
        .ant-drawer-header {
          background: rgba(0, 0, 0, 0.2) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .ant-drawer-title {
          color: white !important;
        }
        
        .ant-drawer-close {
          color: white !important;
        }
        
        .ant-btn-text {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        .ant-btn-text:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .ant-dropdown-menu {
          background: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .ant-dropdown-menu-item {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        .ant-dropdown-menu-item:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        @media (max-width: 768px) {
          .ant-layout-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </Layout>
  );
}
