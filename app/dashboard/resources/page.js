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
  Rate,
  Progress
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
  Link,
  BookOpen,
  Video,
  FileText,
  Wrench,
  Star,
  Heart,
  Bookmark,
  Download,
  ExternalLink,
  Tag as TagIcon,
  EyeInvisible,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';

const { Search: AntSearch } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const typeIcons = {
  'link': <Link className="w-4 h-4" />,
  'document': <FileText className="w-4 h-4" />,
  'video': <Video className="w-4 h-4" />,
  'article': <BookOpen className="w-4 h-4" />,
  'tool': <Wrench className="w-4 h-4" />,
  'book': <BookOpen className="w-4 h-4" />,
  'course': <BookOpen className="w-4 h-4" />,
  'podcast': <Video className="w-4 h-4" />,
  'template': <FileText className="w-4 h-4" />,
  'other': <Link className="w-4 h-4" />,
};

const statusColors = {
  'saved': '#8c8c8c',
  'reading': '#1890ff',
  'completed': '#52c41a',
  'archived': '#fa8c16',
};

const priorityColors = {
  'low': '#52c41a',
  'medium': '#1890ff',
  'high': '#fa8c16',
  'critical': '#f5222d',
};

const categoryIcons = {
  'learning': '📚',
  'productivity': '⚡',
  'inspiration': '💡',
  'reference': '📖',
  'tool': '🔧',
  'design': '🎨',
  'development': '💻',
  'business': '💼',
  'health': '🏥',
  'finance': '💰',
  'other': '🔗',
};

export default function ResourcesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedResource, setSelectedResource] = useState(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingForm] = Form.useForm();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      } else {
        message.error('Failed to fetch resources');
        setResources([]);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      message.error('Failed to fetch resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (resourceId, newStatus) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        message.success('Status updated successfully');
        fetchResources();
      } else {
        message.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    }
  };

  const handleRating = async (values) => {
    try {
      const response = await fetch(`/api/resources/${selectedResource._id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: values.rating,
          review: values.review,
        }),
      });

      if (response.ok) {
        message.success('Rating submitted successfully');
        setRatingModalVisible(false);
        ratingForm.resetFields();
        fetchResources();
      } else {
        message.error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      message.error('Failed to submit rating');
    }
  };

  const handleBookmark = async (resourceId) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/bookmark`, {
        method: 'POST',
      });

      if (response.ok) {
        message.success('Resource bookmarked');
        fetchResources();
      } else {
        message.error('Failed to bookmark resource');
      }
    } catch (error) {
      console.error('Error bookmarking resource:', error);
      message.error('Failed to bookmark resource');
    }
  };

  const handleDelete = async (resourceId) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Resource deleted successfully');
        fetchResources();
      } else {
        message.error('Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      message.error('Failed to delete resource');
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const getMenuItems = (resource) => [
    {
      key: 'view',
      icon: <Eye className="w-4 h-4" />,
      label: 'View Details',
      onClick: () => router.push(`/dashboard/resources/${resource._id}`),
    },
    {
      key: 'open',
      icon: <ExternalLink className="w-4 h-4" />,
      label: 'Open Link',
      onClick: () => window.open(resource.url, '_blank'),
    },
    {
      key: 'bookmark',
      icon: <Bookmark className="w-4 h-4" />,
      label: 'Bookmark',
      onClick: () => handleBookmark(resource._id),
    },
    {
      key: 'rate',
      icon: <Star className="w-4 h-4" />,
      label: 'Rate & Review',
      onClick: () => {
        setSelectedResource(resource);
        setRatingModalVisible(true);
      },
    },
    {
      key: 'edit',
      icon: <Edit className="w-4 h-4" />,
      label: 'Edit',
      onClick: () => router.push(`/dashboard/resources/${resource._id}/edit`),
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
      onClick: () => handleDelete(resource._id),
    },
  ];

  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'saved': return <Bookmark className="w-4 h-4 text-gray-400" />;
      case 'reading': return <Eye className="w-4 h-4 text-blue-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'archived': return <Archive className="w-4 h-4 text-orange-400" />;
      default: return <Bookmark className="w-4 h-4 text-gray-400" />;
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
          <Title level={2} className="text-white mb-2">Resources</Title>
          <Text className="text-gray-400">Save and organize your favorite resources</Text>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => router.push('/dashboard/resources/new')}
          size="large"
        >
          Add Resource
        </Button>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <Link className="w-8 h-8 text-blue-400 mb-2" />
              <Title level={3} className="text-white mb-0">{resources.length}</Title>
              <Text className="text-gray-400">Total Resources</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <Eye className="w-8 h-8 text-green-400 mb-2" />
              <Title level={3} className="text-white mb-0">
                {resources.filter(r => r.status === 'reading').length}
              </Title>
              <Text className="text-gray-400">Currently Reading</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
              <Title level={3} className="text-white mb-0">
                {resources.filter(r => r.status === 'completed').length}
              </Title>
              <Text className="text-gray-400">Completed</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <Star className="w-8 h-8 text-yellow-400 mb-2" />
              <Title level={3} className="text-white mb-0">
                {resources.filter(r => r.ratings && r.ratings.length > 0).length}
              </Title>
              <Text className="text-gray-400">Rated Resources</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <AntSearch
              placeholder="Search resources..."
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
                { value: 'learning', label: 'Learning' },
                { value: 'productivity', label: 'Productivity' },
                { value: 'inspiration', label: 'Inspiration' },
                { value: 'reference', label: 'Reference' },
                { value: 'tool', label: 'Tool' },
                { value: 'design', label: 'Design' },
                { value: 'development', label: 'Development' },
                { value: 'business', label: 'Business' },
                { value: 'health', label: 'Health' },
                { value: 'finance', label: 'Finance' },
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
                { value: 'link', label: 'Link' },
                { value: 'document', label: 'Document' },
                { value: 'video', label: 'Video' },
                { value: 'article', label: 'Article' },
                { value: 'tool', label: 'Tool' },
                { value: 'book', label: 'Book' },
                { value: 'course', label: 'Course' },
                { value: 'podcast', label: 'Podcast' },
                { value: 'template', label: 'Template' },
                { value: 'other', label: 'Other' },
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
                { value: 'saved', label: 'Saved' },
                { value: 'reading', label: 'Reading' },
                { value: 'completed', label: 'Completed' },
                { value: 'archived', label: 'Archived' },
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

      {/* Resources Grid/List */}
      {filteredResources.length === 0 ? (
        <Card className="bg-black/20 backdrop-blur-xl border-white/10">
          <Empty
            image={<Link className="w-16 h-16 text-gray-400 mx-auto" />}
            description={
              <div>
                <Title level={4} className="text-white mb-2">No resources found</Title>
                <Text className="text-gray-400">Add your first resource to get started</Text>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/dashboard/resources/new')}
            >
              Add Resource
            </Button>
          </Empty>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredResources.map(resource => (
            <Card
              key={resource._id}
              className="bg-black/20 backdrop-blur-xl border-white/10 hover:bg-black/30 transition-all duration-200 cursor-pointer"
              hoverable
              onClick={() => router.push(`/dashboard/resources/${resource._id}`)}
              actions={[
                <Tooltip title="Open Link">
                  <ExternalLink onClick={(e) => {
                    e.stopPropagation();
                    window.open(resource.url, '_blank');
                  }} />
                </Tooltip>,
                <Tooltip title="Bookmark">
                  <Bookmark onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark(resource._id);
                  }} />
                </Tooltip>,
                <Tooltip title="Rate">
                  <Star onClick={(e) => {
                    e.stopPropagation();
                    setSelectedResource(resource);
                    setRatingModalVisible(true);
                  }} />
                </Tooltip>,
                <Dropdown
                  menu={{ items: getMenuItems(resource) }}
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
                    <span className="text-lg">{categoryIcons[resource.category]}</span>
                    {typeIcons[resource.type]}
                    {getVisibilityIcon(resource.visibility)}
                  </div>
                  <Space>
                    <Tag color={priorityColors[resource.priority]}>
                      {resource.priority}
                    </Tag>
                    <Tag color={statusColors[resource.status]}>
                      {resource.status}
                    </Tag>
                  </Space>
                </div>
                
                <Title level={4} className="text-white mb-2 line-clamp-2">
                  {resource.title}
                </Title>
                
                <Paragraph className="text-gray-300 line-clamp-3 mb-0">
                  {resource.description || 'No description provided'}
                </Paragraph>
                
                <div className="flex items-center justify-between text-sm">
                  <Space>
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <Text className="text-gray-400">
                      Added {new Date(resource.createdAt).toLocaleDateString()}
                    </Text>
                  </Space>
                  {resource.metadata?.readingTime && (
                    <Space>
                      <Clock className="w-4 h-4 text-gray-400" />
                      <Text className="text-gray-400">
                        {resource.metadata.readingTime} min read
                      </Text>
                    </Space>
                  )}
                </div>
                
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map(tag => (
                      <Tag key={tag} className="bg-green-500/20 text-green-300 border-green-500/30">
                        #{tag}
                      </Tag>
                    ))}
                    {resource.tags.length > 3 && (
                      <Tag className="bg-gray-500/20 text-gray-300 border-gray-500/30">
                        +{resource.tags.length - 3}
                      </Tag>
                    )}
                  </div>
                )}

                {resource.ratings && resource.ratings.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Rate
                      disabled
                      value={getAverageRating(resource.ratings)}
                      className="text-yellow-400"
                    />
                    <Text className="text-gray-400 text-xs">
                      ({resource.ratings.length} review{resource.ratings.length > 1 ? 's' : ''})
                    </Text>
                  </div>
                )}

                {resource.metadata?.domain && (
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-gray-400" />
                    <Text className="text-gray-400 text-xs">
                      {resource.metadata.domain}
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      <Modal
        title="Rate Resource"
        open={ratingModalVisible}
        onCancel={() => setRatingModalVisible(false)}
        footer={null}
      >
        <Form
          form={ratingForm}
          layout="vertical"
          onFinish={handleRating}
        >
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please provide a rating' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="review"
            label="Review"
          >
            <Input.TextArea
              rows={3}
              placeholder="Share your thoughts about this resource..."
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setRatingModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit Rating
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}