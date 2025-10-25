'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Card, 
  Button, 
  Space, 
  Tag, 
  message, 
  Spin,
  Typography,
  Avatar,
  Modal,
  Row,
  Col,
  Tooltip,
  Badge,
  Divider,
  List,
  Rate,
  Progress
} from 'antd';
import { 
  Edit,
  Share2,
  Trash2,
  Eye,
  Calendar,
  User,
  Users,
  Globe,
  Lock,
  ExternalLink,
  Bookmark,
  Star,
  MessageCircle,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

export default function ResourceView() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const resourceId = params.id;

  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('read');

  useEffect(() => {
    if (resourceId) {
      fetchResource();
    }
  }, [resourceId]);

  const fetchResource = async () => {
    if (!resourceId) {
      message.error('Invalid resource ID');
      router.push('/dashboard/resources');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/resources/${resourceId}`);
      if (response.ok) {
        const data = await response.json();
        setResource(data);
        setComments(data.comments || []);
      } else {
        message.error('Failed to fetch resource');
        router.push('/dashboard/resources');
      }
    } catch (error) {
      console.error('Error fetching resource:', error);
      message.error('Failed to fetch resource');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/resources/${resourceId}/edit`);
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Delete Resource',
      content: 'Are you sure you want to delete this resource? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`/api/resources/${resourceId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            message.success('Resource deleted successfully');
            router.push('/dashboard/resources');
          } else {
            message.error('Failed to delete resource');
          }
        } catch (error) {
          console.error('Error deleting resource:', error);
          message.error('Failed to delete resource');
        }
      },
    });
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) {
      message.error('Please enter an email address');
      return;
    }

    try {
      const response = await fetch(`/api/resources/${resourceId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: shareEmail,
          permission: sharePermission,
        }),
      });

      if (response.ok) {
        message.success('Resource shared successfully');
        setShareModalVisible(false);
        setShareEmail('');
        setSharePermission('read');
      } else {
        message.error('Failed to share resource');
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
      message.error('Failed to share resource');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      message.error('Please enter a comment');
      return;
    }

    try {
      const response = await fetch(`/api/resources/${resourceId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      if (response.ok) {
        message.success('Comment added successfully');
        setNewComment('');
        fetchResource(); // Refresh to get updated comments
      } else {
        message.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      message.error('Failed to add comment');
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/bookmark`, {
        method: 'POST',
      });

      if (response.ok) {
        message.success('Resource bookmarked successfully');
        fetchResource(); // Refresh to get updated bookmark status
      } else {
        message.error('Failed to bookmark resource');
      }
    } catch (error) {
      console.error('Error bookmarking resource:', error);
      message.error('Failed to bookmark resource');
    }
  };

  const handleRate = async (rating) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        message.success('Rating submitted successfully');
        fetchResource(); // Refresh to get updated rating
      } else {
        message.error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      message.error('Failed to submit rating');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'website': return '🌐';
      case 'video': return '🎥';
      case 'document': return '📄';
      case 'article': return '📖';
      case 'tool': return '🔧';
      default: return '🔗';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'learning': return '📚';
      case 'productivity': return '⚡';
      case 'development': return '💻';
      case 'design': return '🎨';
      case 'business': return '💼';
      case 'marketing': return '📈';
      case 'research': return '🔬';
      default: return '📁';
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public': return '🌍';
      case 'team': return '👥';
      case 'private': return '🔒';
      default: return '🔒';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'archived': return 'gray';
      case 'pending': return 'orange';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-12">
        <Title level={3} className="text-white">Resource not found</Title>
        <Button onClick={() => router.push('/dashboard/resources')}>
          Back to Resources
        </Button>
      </div>
    );
  }

  const canEdit = resource.createdBy._id === session?.user?.id || 
                 resource.collaborators.some(c => c.user._id === session?.user?.id && ['editor', 'admin'].includes(c.role));

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push('/dashboard/resources')}
              className="mb-4"
            >
              Back to Resources
            </Button>
            <Space>
              <Button
                icon={<ExternalLink className="w-4 h-4" />}
                onClick={() => window.open(resource.url, '_blank')}
              >
                Open Link
              </Button>
              <Button
                icon={<Bookmark className="w-4 h-4" />}
                onClick={handleBookmark}
                type={resource.bookmarked ? 'primary' : 'default'}
              >
                {resource.bookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button
                icon={<Share2 className="w-4 h-4" />}
                onClick={() => setShareModalVisible(true)}
              >
                Share
              </Button>
              {canEdit && (
                <>
                  <Button
                    icon={<Edit className="w-4 h-4" />}
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                  <Button
                    danger
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Space>
          </div>

          {/* Resource Title and Meta */}
          <div className="mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">
                {getTypeIcon(resource.type)}
              </div>
              <div className="flex-1">
                <Title level={1} className="text-white mb-2">
                  {resource.title}
                </Title>
                <div className="flex items-center gap-4 mb-4">
                  <Space>
                    <Tag color="blue">{getCategoryIcon(resource.category)} {resource.category}</Tag>
                    <Tag color="green">{getTypeIcon(resource.type)} {resource.type}</Tag>
                    <Tag color={getStatusColor(resource.status)}>{resource.status}</Tag>
                    <Tag color="purple">{getVisibilityIcon(resource.visibility)} {resource.visibility}</Tag>
                  </Space>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <Space>
                    <User className="w-4 h-4" />
                    <Text>By {resource.createdBy.name}</Text>
                  </Space>
                  <Space>
                    <Calendar className="w-4 h-4" />
                    <Text>{new Date(resource.createdAt).toLocaleDateString()}</Text>
                  </Space>
                  {resource.updatedAt !== resource.createdAt && (
                    <Space>
                      <Text>Updated {new Date(resource.updatedAt).toLocaleDateString()}</Text>
                    </Space>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Content */}
        <div className="mb-8">
          <Title level={3} className="text-white mb-4">Description</Title>
          <Paragraph className="text-gray-300 text-lg leading-relaxed">
            {resource.description || 'No description provided.'}
          </Paragraph>
        </div>

        {/* Resource URL */}
        <div className="mb-8">
          <Title level={3} className="text-white mb-4">Link</Title>
          <Card className="bg-gray-800/50 border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-blue-400" />
                <Text className="text-blue-400 break-all">
                  {resource.url}
                </Text>
              </div>
              <Button
                type="primary"
                icon={<ExternalLink className="w-4 h-4" />}
                onClick={() => window.open(resource.url, '_blank')}
              >
                Open
              </Button>
            </div>
          </Card>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="mb-8">
            <Title level={3} className="text-white mb-4">Tags</Title>
            <Space wrap>
              {resource.tags.map((tag, index) => (
                <Tag key={index} color="blue">#{tag}</Tag>
              ))}
            </Space>
          </div>
        )}

        {/* Rating */}
        <div className="mb-8">
          <Title level={3} className="text-white mb-4">Rating</Title>
          <div className="flex items-center gap-4">
            <Rate
              value={resource.averageRating || 0}
              onChange={handleRate}
              allowHalf
            />
            <Text className="text-gray-400">
              ({resource.ratingCount || 0} ratings)
            </Text>
          </div>
        </div>

        {/* Comments */}
        <div className="mb-8">
          <Title level={3} className="text-white mb-4">Comments</Title>
          
          {/* Add Comment */}
          <Card className="bg-gray-800/50 border-gray-700 mb-4">
            <div className="flex gap-3">
              <Avatar size="small" src={session?.user?.image} />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-transparent border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <Button
                type="primary"
                icon={<MessageCircle className="w-4 h-4" />}
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Comment
              </Button>
            </div>
          </Card>

          {/* Comments List */}
          {comments.length > 0 ? (
            <List
              dataSource={comments}
              renderItem={(comment) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={comment.user.image} />}
                    title={
                      <div className="flex items-center gap-2">
                        <Text className="text-white font-medium">
                          {comment.user.name}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                    }
                    description={
                      <Text className="text-gray-300">
                        {comment.content}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div className="text-center py-8">
              <Text className="text-gray-400">No comments yet. Be the first to comment!</Text>
            </div>
          )}
        </div>
      </Card>

      {/* Share Modal */}
      <Modal
        title="Share Resource"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setShareModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="share" type="primary" onClick={handleShare}>
            Share
          </Button>,
        ]}
      >
        <Space direction="vertical" className="w-full">
          <div>
            <Text>Email Address</Text>
            <input
              type="email"
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="w-full mt-1 bg-transparent border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <Text>Permission</Text>
            <select
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value)}
              className="w-full mt-1 bg-transparent border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="read">Read Only</option>
              <option value="comment">Comment</option>
              <option value="edit">Edit</option>
            </select>
          </div>
        </Space>
      </Modal>
    </div>
  );
}
