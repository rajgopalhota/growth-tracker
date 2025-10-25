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
  Badge
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
  Globe,
  Lock,
  FileText,
  Briefcase,
  BookOpen,
  Rocket,
  Users2,
  Lightbulb,
  Tag as TagIcon
} from 'lucide-react';

const { Search: AntSearch } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

export default function NotesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      } else {
        message.error('Failed to fetch notes');
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      message.error('Failed to fetch notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Note deleted successfully');
        fetchNotes();
      } else {
        message.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      message.error('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || note.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'personal', label: 'Personal' },
    { value: 'work', label: 'Work' },
    { value: 'learning', label: 'Learning' },
    { value: 'project', label: 'Project' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'idea', label: 'Idea' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return <Briefcase className="w-4 h-4" />;
      case 'learning': return <BookOpen className="w-4 h-4" />;
      case 'project': return <Rocket className="w-4 h-4" />;
      case 'meeting': return <Users2 className="w-4 h-4" />;
      case 'idea': return <Lightbulb className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4 text-green-400" />;
      case 'team': return <Users className="w-4 h-4 text-blue-400" />;
      case 'private': return <Lock className="w-4 h-4 text-gray-400" />;
      default: return <Lock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMenuItems = (note) => [
    {
      key: 'view',
      icon: <Eye className="w-4 h-4" />,
      label: 'View',
      onClick: () => router.push(`/dashboard/notes/${note._id}`),
    },
    {
      key: 'edit',
      icon: <Edit className="w-4 h-4" />,
      label: 'Edit',
      onClick: () => router.push(`/dashboard/notes/${note._id}/edit`),
    },
    {
      key: 'share',
      icon: <Share2 className="w-4 h-4" />,
      label: 'Share',
      onClick: () => {
        // Implement share functionality
        message.info('Share functionality coming soon');
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <Trash2 className="w-4 h-4" />,
      label: 'Delete',
      danger: true,
      onClick: () => {
        handleDelete(note._id);
      },
    },
  ];

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
          <Title level={2} className="text-white mb-2">Notes</Title>
          <Text className="text-gray-400">Capture your thoughts and ideas</Text>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => router.push('/dashboard/notes/new')}
          size="large"
        >
          New Note
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <AntSearch
              placeholder="Search notes..."
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
              options={categories}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Priority"
              value={filterPriority}
              onChange={setFilterPriority}
              className="w-full"
              options={priorities}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space className="w-full justify-end">
              <Button
                icon={<Grid3X3 className="w-4 h-4" />}
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              />
              <Button
                icon={<List className="w-4 h-4" />}
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Notes Grid/List */}
      {filteredNotes.length === 0 ? (
        <Card className="bg-black/20 backdrop-blur-xl border-white/10">
          <Empty
            image={<FileText className="w-16 h-16 text-gray-400 mx-auto" />}
            description={
              <div>
                <Title level={4} className="text-white mb-2">No notes found</Title>
                <Text className="text-gray-400">Create your first note to get started</Text>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/dashboard/notes/new')}
            >
              Create Note
            </Button>
          </Empty>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredNotes.map(note => (
            <Card
              key={note._id}
              className="bg-black/20 backdrop-blur-xl border-white/10 hover:bg-black/30 transition-all duration-200 cursor-pointer"
              hoverable
              onClick={() => router.push(`/dashboard/notes/${note._id}`)}
              actions={[
                <Tooltip title="View">
                  <Eye className="w-4 h-4" onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/notes/${note._id}`);
                  }} />
                </Tooltip>,
                <Tooltip title="Edit">
                  <Edit className="w-4 h-4" onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/notes/${note._id}/edit`);
                  }} />
                </Tooltip>,
                <Tooltip title="Share">
                  <Share2 className="w-4 h-4" onClick={(e) => {
                    e.stopPropagation();
                    message.info('Share functionality coming soon');
                  }} />
                </Tooltip>,
                <Dropdown
                  menu={{ items: getMenuItems(note) }}
                  trigger={['click']}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Dropdown>,
              ]}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <Title level={4} className="text-white mb-0 line-clamp-2">
                    {note.title}
                  </Title>
                  <Space>
                    {getVisibilityIcon(note.visibility)}
                    <Tag color={getPriorityColor(note.priority)}>
                      {note.priority}
                    </Tag>
                  </Space>
                </div>
                
                <Paragraph className="text-gray-300 line-clamp-3 mb-0">
                  {note.content}
                </Paragraph>
                
                <div className="flex items-center justify-between text-sm">
                  <Space>
                    {getCategoryIcon(note.category)}
                    <Text className="text-gray-400">{note.category}</Text>
                  </Space>
                  <Space>
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <Text className="text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </Text>
                  </Space>
                </div>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map(tag => (
                      <Tag key={tag} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        #{tag}
                      </Tag>
                    ))}
                    {note.tags.length > 3 && (
                      <Tag className="bg-gray-500/20 text-gray-300 border-gray-500/30">
                        +{note.tags.length - 3}
                      </Tag>
                    )}
                  </div>
                )}

                {note.collaborators && note.collaborators.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Avatar.Group size="small" maxCount={3}>
                      {note.collaborators.map((collaborator, index) => (
                        <Avatar key={index} src={collaborator.user?.image} />
                      ))}
                    </Avatar.Group>
                    <Text className="text-gray-400 text-xs">
                      {note.collaborators.length} collaborator{note.collaborators.length > 1 ? 's' : ''}
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}