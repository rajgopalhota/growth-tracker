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
  Progress,
  Statistic,
  Timeline,
  Modal,
  Form,
  Slider,
  DatePicker
} from 'antd';
import { 
  Plus,
  Search as SearchIcon,
  Filter,
  Grid3X3,
  List as ListIcon,
  Edit,
  Share2,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  User,
  Users,
  Target,
  Trophy,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Star,
  Flag,
  Flame,
  Zap,
  Heart,
  BookOpen,
  DollarSign,
  Lightbulb,
  Users2,
  Crown,
  Shield
} from 'lucide-react';
import dayjs from 'dayjs';

const { Search: AntSearch } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const statusColors = {
  'not-started': '#8c8c8c',
  'in-progress': '#1890ff',
  'completed': '#52c41a',
  'paused': '#fa8c16',
  'cancelled': '#f5222d',
};

const priorityColors = {
  'low': '#52c41a',
  'medium': '#1890ff',
  'high': '#fa8c16',
  'critical': '#f5222d',
};

const typeIcons = {
  'short-term': <Clock className="w-4 h-4" />,
  'long-term': <Target className="w-4 h-4" />,
  'milestone': <Trophy className="w-4 h-4" />,
  'habit': <Flame className="w-4 h-4" />,
};

const categoryIcons = {
  'personal': <User className="w-4 h-4" />,
  'professional': <Crown className="w-4 h-4" />,
  'health': <Heart className="w-4 h-4" />,
  'learning': <BookOpen className="w-4 h-4" />,
  'financial': <DollarSign className="w-4 h-4" />,
  'fitness': <Zap className="w-4 h-4" />,
  'creative': <Lightbulb className="w-4 h-4" />,
  'social': <Users2 className="w-4 h-4" />,
  'spiritual': <Shield className="w-4 h-4" />,
  'other': <Target className="w-4 h-4" />,
};

export default function GoalsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [progressForm] = Form.useForm();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      } else {
        message.error('Failed to fetch goals');
        setGoals([]);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      message.error('Failed to fetch goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (values) => {
    try {
      const response = await fetch(`/api/goals/${selectedGoal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress: values.progress,
          progressNote: values.note,
        }),
      });

      if (response.ok) {
        message.success('Progress updated successfully');
        setProgressModalVisible(false);
        progressForm.resetFields();
        fetchGoals();
      } else {
        message.error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      message.error('Failed to update progress');
    }
  };

  const handleDelete = async (goalId) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Goal deleted successfully');
        fetchGoals();
      } else {
        message.error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      message.error('Failed to delete goal');
    }
  };

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
    const matchesType = filterType === 'all' || goal.type === filterType;
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const getMenuItems = (goal) => [
    {
      key: 'view',
      icon: <Eye className="w-4 h-4" />,
      label: 'View Details',
      onClick: () => router.push(`/dashboard/goals/${goal._id}`),
    },
    {
      key: 'edit',
      icon: <Edit className="w-4 h-4" />,
      label: 'Edit',
      onClick: () => router.push(`/dashboard/goals/${goal._id}/edit`),
    },
    {
      key: 'progress',
      icon: <PlayCircle className="w-4 h-4" />,
      label: 'Update Progress',
      onClick: () => {
        setSelectedGoal(goal);
        progressForm.setFieldsValue({ progress: goal.progress });
        setProgressModalVisible(true);
      },
    },
    {
      key: 'share',
      icon: <Share2 className="w-4 h-4" />,
      label: 'Share',
      onClick: () => message.info('Share functionality coming soon'),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <Trash2 className="w-4 h-4" />,
      label: 'Delete',
      danger: true,
      onClick: () => handleDelete(goal._id),
    },
  ];

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#52c41a';
    if (progress >= 60) return '#1890ff';
    if (progress >= 40) return '#fa8c16';
    return '#f5222d';
  };

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const days = dayjs(targetDate).diff(dayjs(), 'day');
    return days > 0 ? days : 0;
  };

  const isOverdue = (targetDate, status) => {
    if (!targetDate || status === 'completed') return false;
    return dayjs().isAfter(dayjs(targetDate));
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
          <Title level={2} className="text-white mb-2">Goals</Title>
          <Text className="text-gray-400">Track your progress and achieve your dreams</Text>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => router.push('/dashboard/goals/new')}
          size="large"
        >
          New Goal
        </Button>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <Statistic
              title={<Text className="text-gray-400">Total Goals</Text>}
              value={goals.length}
              valueStyle={{ color: '#fff' }}
              prefix={<Target className="w-4 h-4" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <Statistic
              title={<Text className="text-gray-400">Completed</Text>}
              value={goals.filter(g => g.status === 'completed').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircle className="w-4 h-4" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <Statistic
              title={<Text className="text-gray-400">In Progress</Text>}
              value={goals.filter(g => g.status === 'in-progress').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PlayCircle className="w-4 h-4" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <Statistic
              title={<Text className="text-gray-400">Overdue</Text>}
              value={goals.filter(g => isOverdue(g.targetDate, g.status)).length}
              valueStyle={{ color: '#f5222d' }}
              prefix={<Clock className="w-4 h-4" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <AntSearch
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Category"
              value={filterCategory}
              onChange={setFilterCategory}
              className="w-full"
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'personal', label: 'Personal' },
                { value: 'professional', label: 'Professional' },
                { value: 'health', label: 'Health' },
                { value: 'learning', label: 'Learning' },
                { value: 'financial', label: 'Financial' },
                { value: 'fitness', label: 'Fitness' },
                { value: 'creative', label: 'Creative' },
                { value: 'social', label: 'Social' },
                { value: 'spiritual', label: 'Spiritual' },
                { value: 'other', label: 'Other' },
              ]}
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
                { value: 'short-term', label: 'Short-term' },
                { value: 'long-term', label: 'Long-term' },
                { value: 'milestone', label: 'Milestone' },
                { value: 'habit', label: 'Habit' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Status"
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'not-started', label: 'Not Started' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'paused', label: 'Paused' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Space className="w-full justify-end">
              <Button
                icon={<Grid3X3 className="w-4 h-4" />}
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                icon={<ListIcon className="w-4 h-4" />}
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Goals Grid/List */}
      {filteredGoals.length === 0 ? (
        <Card className="bg-black/20 backdrop-blur-xl border-white/10">
          <Empty
            image={<Target className="w-16 h-16 text-gray-400 mx-auto" />}
            description={
              <div>
                <Title level={4} className="text-white mb-2">No goals found</Title>
                <Text className="text-gray-400">Create your first goal to get started</Text>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/dashboard/goals/new')}
            >
              Create Goal
            </Button>
          </Empty>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredGoals.map(goal => (
            <Card
              key={goal._id}
              className="bg-black/20 backdrop-blur-xl border-white/10 hover:bg-black/30 transition-all duration-200 cursor-pointer"
              hoverable
              onClick={() => router.push(`/dashboard/goals/${goal._id}`)}
              actions={[
                <Tooltip title="View Details">
                  <Eye onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/goals/${goal._id}`);
                  }} />
                </Tooltip>,
                <Tooltip title="Update Progress">
                  <PlayCircle onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGoal(goal);
                    progressForm.setFieldsValue({ progress: goal.progress });
                    setProgressModalVisible(true);
                  }} />
                </Tooltip>,
                <Tooltip title="Edit">
                  <Edit onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/goals/${goal._id}/edit`);
                  }} />
                </Tooltip>,
                <Dropdown
                  menu={{ items: getMenuItems(goal) }}
                  trigger={['click']}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Dropdown>,
              ]}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {categoryIcons[goal.category]}
                    {typeIcons[goal.type]}
                  </div>
                  <Space>
                    <Tag color={priorityColors[goal.priority]}>
                      {goal.priority}
                    </Tag>
                    <Tag color={statusColors[goal.status]}>
                      {goal.status.replace('-', ' ')}
                    </Tag>
                  </Space>
                </div>
                
                <Title level={4} className="text-white mb-2 line-clamp-2">
                  {goal.title}
                </Title>
                
                <Paragraph className="text-gray-300 line-clamp-3 mb-0">
                  {goal.description}
                </Paragraph>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Text className="text-gray-400 text-sm">Progress</Text>
                    <Text className="text-white text-sm font-medium">{goal.progress}%</Text>
                  </div>
                  <Progress
                    percent={goal.progress}
                    strokeColor={getProgressColor(goal.progress)}
                    showInfo={false}
                    size="small"
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <Space>
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <Text className="text-gray-400">
                      {goal.targetDate ? dayjs(goal.targetDate).format('MMM DD, YYYY') : 'No target date'}
                    </Text>
                  </Space>
                  {goal.targetDate && (
                    <Space>
                      <Clock className="w-4 h-4 text-gray-400" />
                      <Text className={`text-sm ${isOverdue(goal.targetDate, goal.status) ? 'text-red-400' : 'text-gray-400'}`}>
                        {getDaysRemaining(goal.targetDate) > 0 ? `${getDaysRemaining(goal.targetDate)} days left` : 'Overdue'}
                      </Text>
                    </Space>
                  )}
                </div>
                
                {goal.tags && goal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {goal.tags.slice(0, 3).map(tag => (
                      <Tag key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        #{tag}
                      </Tag>
                    ))}
                    {goal.tags.length > 3 && (
                      <Tag className="bg-gray-500/20 text-gray-300 border-gray-500/30">
                        +{goal.tags.length - 3}
                      </Tag>
                    )}
                  </div>
                )}

                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-gray-400" />
                    <Text className="text-gray-400 text-xs">
                      {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Progress Update Modal */}
      <Modal
        title="Update Progress"
        open={progressModalVisible}
        onCancel={() => setProgressModalVisible(false)}
        footer={null}
      >
        <Form
          form={progressForm}
          layout="vertical"
          onFinish={handleProgressUpdate}
        >
          <Form.Item
            name="progress"
            label="Progress (%)"
            rules={[{ required: true, message: 'Please enter progress' }]}
          >
            <Slider
              min={0}
              max={100}
              marks={{
                0: '0%',
                25: '25%',
                50: '50%',
                75: '75%',
                100: '100%',
              }}
            />
          </Form.Item>
          <Form.Item
            name="note"
            label="Progress Note"
          >
            <Input.TextArea
              rows={3}
              placeholder="Add a note about your progress..."
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setProgressModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Progress
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}