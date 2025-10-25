'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Space, 
  Tag, 
  message, 
  Spin,
  Row,
  Col,
  Typography,
  List,
  Avatar,
  Dropdown,
  Menu,
  Tooltip,
  Empty,
  Badge,
  Modal,
  Form,
  Divider,
  Timeline
} from 'antd';
import { 
  Bell,
  Search as SearchIcon,
  Filter,
  Check,
  Trash2,
  MoreHorizontal,
  CalendarDays,
  User,
  Users,
  FileText,
  SquareCheck,
  Target2,
  Link as LinkIcon,
  MessageCircle,
  Share2,
  Eye,
  EyeInvisible,
  Settings,
  X,
  CheckCircle2,
  Circle
} from 'lucide-react';

const { Search: AntSearch } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const notificationTypes = {
  'note_shared': { icon: '📝', color: '#1890ff', label: 'Note Shared' },
  'note_comment': { icon: '💬', color: '#52c41a', label: 'Note Comment' },
  'note_edit': { icon: '✏️', color: '#fa8c16', label: 'Note Edited' },
  'todo_assigned': { icon: '✅', color: '#722ed1', label: 'Todo Assigned' },
  'todo_status_update': { icon: '🔄', color: '#13c2c2', label: 'Todo Updated' },
  'todo_comment': { icon: '💬', color: '#eb2f96', label: 'Todo Comment' },
  'goal_shared': { icon: '🎯', color: '#fa541c', label: 'Goal Shared' },
  'goal_progress_update': { icon: '📈', color: '#a0d911', label: 'Goal Progress' },
  'goal_comment': { icon: '💬', color: '#2f54eb', label: 'Goal Comment' },
  'team_invite': { icon: '👥', color: '#722ed1', label: 'Team Invite' },
  'team_join': { icon: '👥', color: '#52c41a', label: 'Team Join' },
  'team_leave': { icon: '👥', color: '#f5222d', label: 'Team Leave' },
  'resource_shared': { icon: '🔗', color: '#1890ff', label: 'Resource Shared' },
  'resource_comment': { icon: '💬', color: '#52c41a', label: 'Resource Comment' },
  'system_alert': { icon: '🔔', color: '#fa8c16', label: 'System Alert' },
  'mention': { icon: '👤', color: '#13c2c2', label: 'Mention' },
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        message.error('Failed to fetch notifications');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationIds) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        message.success('Notifications marked as read');
        fetchNotifications();
        setSelectedNotifications([]);
      } else {
        message.error('Failed to mark notifications as read');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      message.error('Failed to mark notifications as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        message.success('All notifications marked as read');
        fetchNotifications();
      } else {
        message.error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      message.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Notification deleted');
        fetchNotifications();
      } else {
        message.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      message.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await handleMarkAsRead([notification._id]);
    }

    // Navigate to the relevant page
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
                      (filterRead === 'read' && notification.read) ||
                      (filterRead === 'unread' && !notification.read);
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getMenuItems = (notification) => [
    {
      key: 'mark-read',
      icon: notification.read ? '👁️‍🗨️' : '👁️',
      label: notification.read ? 'Mark as Unread' : 'Mark as Read',
      onClick: () => handleMarkAsRead([notification._id]),
    },
    {
      key: 'delete',
      icon: '🗑️',
      label: 'Delete',
      danger: true,
      onClick: () => handleDeleteNotification(notification._id),
    },
  ];

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="text-white mb-2">Notifications</Title>
          <Text className="text-gray-400">Stay updated with your team activities</Text>
        </div>
        <Space>
          <Button
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setSettingsModalVisible(true)}
          >
            Settings
          </Button>
          <Button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
        </Space>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <div className="text-2xl mb-2">🔔</div>
              <Title level={3} className="text-white mb-0">{notifications.length}</Title>
              <Text className="text-gray-400">Total Notifications</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <div className="text-2xl mb-2">👁️</div>
              <Title level={3} className="text-white mb-0">{unreadCount}</Title>
              <Text className="text-gray-400">Unread</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <Title level={3} className="text-white mb-0">
                {notifications.filter(n => n.read).length}
              </Title>
              <Text className="text-gray-400">Read</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <Title level={3} className="text-white mb-0">
                {notifications.filter(n => n.type.includes('team')).length}
              </Title>
              <Text className="text-gray-400">Team Updates</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <AntSearch
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Type"
              value={filterType}
              onChange={setFilterType}
              className="w-full"
              options={[
                { value: 'all', label: 'All Types' },
                ...Object.entries(notificationTypes).map(([key, value]) => ({
                  value: key,
                  label: value.label,
                })),
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Status"
              value={filterRead}
              onChange={setFilterRead}
              className="w-full"
              options={[
                { value: 'all', label: 'All' },
                { value: 'unread', label: 'Unread' },
                { value: 'read', label: 'Read' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterRead('all');
                }}
              >
                Clear Filters
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="bg-black/20 backdrop-blur-xl border-white/10">
          <Empty
            image={<Bell className="w-16 h-16 text-gray-400 mx-auto" />}
            description={
              <div>
                <Title level={4} className="text-white mb-2">No notifications found</Title>
                <Text className="text-gray-400">
                  {searchTerm || filterType !== 'all' || filterRead !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You\'re all caught up!'
                  }
                </Text>
              </div>
            }
          />
        </Card>
      ) : (
        <Card className="bg-black/20 backdrop-blur-xl border-white/10">
          <List
            dataSource={filteredNotifications}
            renderItem={(notification) => {
              const typeInfo = notificationTypes[notification.type] || { icon: <Bell className="w-4 h-4" />, color: '#8c8c8c', label: 'Unknown' };
              
              return (
                <List.Item
                  className={`cursor-pointer hover:bg-white/5 transition-colors ${
                    !notification.read ? 'bg-blue-500/10 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  actions={[
                    <Dropdown
                      menu={{ items: getMenuItems(notification) }}
                      trigger={['click']}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Dropdown>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="large"
                          src={notification.sender?.image}
                        />
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}
                        >
                          {typeInfo.icon}
                        </div>
                      </div>
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <Text className="text-white font-medium">
                          {notification.sender?.name || 'System'}
                        </Text>
                        <Tag color={typeInfo.color} className="text-xs">
                          {typeInfo.label}
                        </Tag>
                        {!notification.read && (
                          <Badge dot color="#1890ff" />
                        )}
                      </div>
                    }
                    description={
                      <div className="space-y-2">
                        <Paragraph className="text-gray-300 mb-0">
                          {notification.message}
                        </Paragraph>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <Space>
                            <span>📅</span>
                            <Text>{getTimeAgo(notification.createdAt)}</Text>
                          </Space>
                          {notification.link && (
                            <Space>
                              <span>👁️</span>
                              <Text>Click to view</Text>
                            </Space>
                          )}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      )}

      {/* Notification Settings Modal */}
      <Modal
        title="Notification Settings"
        open={settingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        footer={null}
      >
        <div className="space-y-4">
          <div>
            <Title level={5}>Email Notifications</Title>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text>Task Assignments</Text>
                <Button size="small" type="primary">Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <Text>Team Updates</Text>
                <Button size="small" type="primary">Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <Text>Comments & Mentions</Text>
                <Button size="small" type="primary">Enabled</Button>
              </div>
            </div>
          </div>
          
          <Divider />
          
          <div>
            <Title level={5}>Push Notifications</Title>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text>Real-time Updates</Text>
                <Button size="small" type="primary">Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <Text>Direct Messages</Text>
                <Button size="small" type="primary">Enabled</Button>
              </div>
            </div>
          </div>
          
          <Divider />
          
          <div className="text-center">
            <Button type="primary" onClick={() => setSettingsModalVisible(false)}>
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}