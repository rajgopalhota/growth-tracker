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
  DatePicker,
  InputNumber,
  Progress,
  Drawer
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
  Flag,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Bug,
  Rocket,
  BookOpen,
  Wrench,
  Crown,
  Shield,
  Star,
  Link,
  MessageCircle,
  Paperclip
} from 'lucide-react';
import dayjs from 'dayjs';

const { Search: AntSearch } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const statusColumns = [
  { key: 'backlog', title: 'Backlog', color: '#8c8c8c', icon: <Clock className="w-4 h-4" /> },
  { key: 'todo', title: 'To Do', color: '#1890ff', icon: <CheckCircle className="w-4 h-4" /> },
  { key: 'in-progress', title: 'In Progress', color: '#fa8c16', icon: <PlayCircle className="w-4 h-4" /> },
  { key: 'review', title: 'Review', color: '#722ed1', icon: <PauseCircle className="w-4 h-4" /> },
  { key: 'done', title: 'Done', color: '#52c41a', icon: <CheckCircle className="w-4 h-4" /> },
];

const priorityColors = {
  'lowest': '#8c8c8c',
  'low': '#52c41a',
  'medium': '#1890ff',
  'high': '#fa8c16',
  'highest': '#f5222d',
};

const typeIcons = {
  'task': <CheckCircle className="w-4 h-4" />,
  'bug': <Bug className="w-4 h-4" />,
  'story': <BookOpen className="w-4 h-4" />,
  'epic': <Rocket className="w-4 h-4" />,
  'subtask': <Wrench className="w-4 h-4" />,
};

export default function TodosPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('board');
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchTodos();
    fetchUsers();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (response.ok) {
        const data = await response.json();
        setTodos(data.todos || []);
      } else {
        message.error('Failed to fetch todos');
        setTodos([]);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      message.error('Failed to fetch todos');
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleStatusChange = async (todoId, newStatus) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        message.success('Status updated successfully');
        fetchTodos();
      } else {
        message.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    }
  };

  const handleAssigneeChange = async (todoId, newAssignee) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee: newAssignee }),
      });

      if (response.ok) {
        message.success('Assignee updated successfully');
        fetchTodos();
      } else {
        message.error('Failed to update assignee');
      }
    } catch (error) {
      console.error('Error updating assignee:', error);
      message.error('Failed to update assignee');
    }
  };

  const handleDelete = async (todoId) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Todo deleted successfully');
        fetchTodos();
      } else {
        message.error('Failed to delete todo');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      message.error('Failed to delete todo');
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssignee = filterAssignee === 'all' || todo.assignee?._id === filterAssignee;
    const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
    const matchesType = filterType === 'all' || todo.type === filterType;
    return matchesSearch && matchesAssignee && matchesPriority && matchesType;
  });

  const todosByStatus = statusColumns.reduce((acc, column) => {
    acc[column.key] = filteredTodos.filter(todo => todo.status === column.key);
    return acc;
  }, {});

  const getMenuItems = (todo) => [
    {
      key: 'view',
      icon: <Eye className="w-4 h-4" />,
      label: 'View Details',
      onClick: () => {
        setSelectedTodo(todo);
        setDrawerVisible(true);
      },
    },
    {
      key: 'edit',
      icon: <Edit className="w-4 h-4" />,
      label: 'Edit',
      onClick: () => router.push(`/dashboard/todos/${todo._id}/edit`),
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
      onClick: () => handleDelete(todo._id),
    },
  ];

  const TodoCard = ({ todo }) => (
    <Card
      size="small"
      className="mb-3 cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={() => {
        setSelectedTodo(todo);
        setDrawerVisible(true);
      }}
      actions={[
        <Dropdown
          menu={{ items: getMenuItems(todo) }}
          trigger={['click']}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Dropdown>,
      ]}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {typeIcons[todo.type]}
            <Text className="text-gray-400 text-xs">#{todo._id.slice(-6)}</Text>
          </div>
          <Tag color={priorityColors[todo.priority]} className="text-xs">
            {todo.priority}
          </Tag>
        </div>
        
        <Title level={5} className="text-white mb-2 line-clamp-2">
          {todo.title}
        </Title>
        
        {todo.description && (
          <Paragraph className="text-gray-300 text-sm line-clamp-2 mb-2">
            {todo.description}
          </Paragraph>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {todo.assignee ? (
              <Avatar size="small" src={todo.assignee.image} />
            ) : (
              <Avatar size="small" icon={<User className="w-3 h-3" />} />
            )}
            <Text className="text-gray-400">
              {todo.assignee?.name || 'Unassigned'}
            </Text>
          </div>
          {todo.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <Text className="text-gray-400">
                {dayjs(todo.dueDate).format('MMM DD')}
              </Text>
            </div>
          )}
        </div>
        
        {todo.storyPoints && (
          <div className="flex items-center gap-2">
            <Star className="w-3 h-3 text-gray-400" />
            <Text className="text-gray-400 text-xs">{todo.storyPoints} pts</Text>
          </div>
        )}
        
        {todo.labels && todo.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {todo.labels.slice(0, 2).map(label => (
              <Tag key={label} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                {label}
              </Tag>
            ))}
            {todo.labels.length > 2 && (
              <Tag className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                +{todo.labels.length - 2}
              </Tag>
            )}
          </div>
        )}
      </div>
    </Card>
  );

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
          <Title level={2} className="text-white mb-2">Todos</Title>
          <Text className="text-gray-400">Manage your tasks and track progress</Text>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => router.push('/dashboard/todos/new')}
          size="large"
        >
          New Todo
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <AntSearch
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Assignee"
              value={filterAssignee}
              onChange={setFilterAssignee}
              className="w-full"
              options={[
                { value: 'all', label: 'All Assignees' },
                ...users.map(user => ({
                  value: user._id,
                  label: user.name,
                })),
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Priority"
              value={filterPriority}
              onChange={setFilterPriority}
              className="w-full"
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'lowest', label: 'Lowest' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'highest', label: 'Highest' },
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
                { value: 'task', label: 'Task' },
                { value: 'bug', label: 'Bug' },
                { value: 'story', label: 'Story' },
                { value: 'epic', label: 'Epic' },
                { value: 'subtask', label: 'Subtask' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Space className="w-full justify-end">
              <Button
                icon={<Grid3X3 className="w-4 h-4" />}
                type={viewMode === 'board' ? 'primary' : 'default'}
                onClick={() => setViewMode('board')}
              >
                Board
              </Button>
              <Button
                icon={<List className="w-4 h-4" />}
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statusColumns.map(column => (
            <Card
              key={column.key}
              className="bg-black/20 backdrop-blur-xl border-white/10"
              title={
                <div className="flex items-center gap-2">
                  <span style={{ color: column.color }}>{column.icon}</span>
                  <Text className="text-white">{column.title}</Text>
                  <Badge count={todosByStatus[column.key]?.length || 0} />
                </div>
              }
            >
              <div className="min-h-[400px]">
                {todosByStatus[column.key]?.map(todo => (
                  <TodoCard key={todo._id} todo={todo} />
                ))}
                {(!todosByStatus[column.key] || todosByStatus[column.key].length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <Text>No todos in this status</Text>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card className="bg-black/20 backdrop-blur-xl border-white/10">
          <List
            dataSource={filteredTodos}
            renderItem={todo => (
              <List.Item
                actions={[
                <Dropdown
                  menu={{ items: getMenuItems(todo) }}
                  trigger={['click']}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Dropdown>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className="flex items-center gap-2">
                      {typeIcons[todo.type]}
                      <Tag color={priorityColors[todo.priority]}>
                        {todo.priority}
                      </Tag>
                    </div>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <Text className="text-white">#{todo._id.slice(-6)}</Text>
                      <Text className="text-white">{todo.title}</Text>
                    </div>
                  }
                  description={
                    <div className="space-y-2">
                      <Paragraph className="text-gray-300 mb-0">
                        {todo.description}
                      </Paragraph>
                      <div className="flex items-center gap-4 text-sm">
                        <Space>
                          <User className="w-4 h-4 text-gray-400" />
                          <Text className="text-gray-400">
                            {todo.assignee?.name || 'Unassigned'}
                          </Text>
                        </Space>
                        <Space>
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <Text className="text-gray-400">
                            {todo.dueDate ? dayjs(todo.dueDate).format('MMM DD, YYYY') : 'No due date'}
                          </Text>
                        </Space>
                        {todo.storyPoints && (
                          <Space>
                            <Star className="w-4 h-4 text-gray-400" />
                            <Text className="text-gray-400">{todo.storyPoints} pts</Text>
                          </Space>
                        )}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Todo Details Drawer */}
      <Drawer
        title="Todo Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {selectedTodo && (
          <div className="space-y-6">
            <div>
              <Title level={3} className="text-white mb-2">
                {selectedTodo.title}
              </Title>
              <div className="flex items-center gap-2 mb-4">
                <Tag color={priorityColors[selectedTodo.priority]}>
                  {selectedTodo.priority}
                </Tag>
                <Tag>{selectedTodo.type}</Tag>
                <Tag color="blue">#{selectedTodo._id.slice(-6)}</Tag>
              </div>
            </div>

            <div>
              <Title level={5} className="text-white mb-2">Description</Title>
              <Paragraph className="text-gray-300">
                {selectedTodo.description || 'No description provided'}
              </Paragraph>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Title level={5} className="text-white mb-2">Assignee</Title>
                <div className="flex items-center gap-2">
                  {selectedTodo.assignee ? (
                    <>
                      <Avatar src={selectedTodo.assignee.image} />
                      <Text className="text-gray-300">{selectedTodo.assignee.name}</Text>
                    </>
                  ) : (
                    <Text className="text-gray-400">Unassigned</Text>
                  )}
                </div>
              </div>
              <div>
                <Title level={5} className="text-white mb-2">Reporter</Title>
                <div className="flex items-center gap-2">
                  <Avatar src={selectedTodo.reporter?.image} />
                  <Text className="text-gray-300">{selectedTodo.reporter?.name}</Text>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Title level={5} className="text-white mb-2">Due Date</Title>
                <Text className="text-gray-300">
                  {selectedTodo.dueDate ? dayjs(selectedTodo.dueDate).format('MMM DD, YYYY') : 'No due date'}
                </Text>
              </div>
              <div>
                <Title level={5} className="text-white mb-2">Story Points</Title>
                <Text className="text-gray-300">
                  {selectedTodo.storyPoints || 'Not estimated'}
                </Text>
              </div>
            </div>

            {selectedTodo.labels && selectedTodo.labels.length > 0 && (
              <div>
                <Title level={5} className="text-white mb-2">Labels</Title>
                <div className="flex flex-wrap gap-1">
                  {selectedTodo.labels.map(label => (
                    <Tag key={label} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {label}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                icon={<Edit className="w-4 h-4" />}
                onClick={() => router.push(`/dashboard/todos/${selectedTodo._id}/edit`)}
              >
                Edit
              </Button>
              <Button
                icon={<Share2 className="w-4 h-4" />}
                onClick={() => message.info('Share functionality coming soon')}
              >
                Share
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}