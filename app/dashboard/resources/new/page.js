'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  Form, 
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
  Divider,
  List,
  Avatar,
  Modal,
  Tooltip,
  Upload,
  Progress
} from 'antd';
import { 
  Save,
  Link,
  Upload as UploadIcon,
  Plus,
  Trash2,
  Edit,
  Eye,
  Users,
  Globe,
  Lock,
  Tag as TagIcon,
  BookOpen,
  Video,
  FileText,
  Wrench
} from 'lucide-react';
import toast from '@/lib/notifications';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function ResourceCreator() {
  const { data: session } = useSession();
  const router = useRouter();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      
      const resourceData = {
        ...values,
        tags,
        createdBy: session.user.id,
      };

      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData),
      });

      if (response.ok) {
        const savedResource = await response.json();
        message.success('Resource created successfully');
        router.push(`/dashboard/resources/${savedResource._id}`);
      } else {
        message.error('Failed to create resource');
      }
    } catch (error) {
      console.error('Error creating resource:', error);
      message.error('Failed to create resource');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    if (url) {
      // Auto-detect resource type based on URL
      let detectedType = 'link';
      let detectedCategory = 'other';

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        detectedType = 'video';
        detectedCategory = 'learning';
      } else if (url.includes('github.com')) {
        detectedType = 'tool';
        detectedCategory = 'development';
      } else if (url.includes('.pdf') || url.includes('docs.google.com')) {
        detectedType = 'document';
        detectedCategory = 'reference';
      } else if (url.includes('medium.com') || url.includes('dev.to')) {
        detectedType = 'article';
        detectedCategory = 'learning';
      }

      form.setFieldsValue({
        type: detectedType,
        category: detectedCategory,
      });
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
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
      case 'health': return '🏥';
      case 'finance': return '💰';
      default: return '🔗';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            type: 'link',
            category: 'other',
            priority: 'medium',
            status: 'saved',
            visibility: 'team',
            workspace: 'general',
          }}
        >
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <div className="flex items-center justify-between mb-6">
                <Title level={2} className="text-white mb-0">
                  Add New Resource
                </Title>
                <Button
                  type="primary"
                  icon="💾"
                  htmlType="submit"
                  loading={loading}
                >
                  Save Resource
                </Button>
              </div>
            </Col>

            <Col span={24}>
              <Form.Item
                name="title"
                label={<Text className="text-white">Title</Text>}
                rules={[{ required: true, message: 'Please enter a title' }]}
              >
                <Input
                  size="large"
                  placeholder="Enter resource title..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="url"
                label={<Text className="text-white">URL</Text>}
                rules={[
                  { required: true, message: 'Please enter a URL' },
                  { type: 'url', message: 'Please enter a valid URL' }
                ]}
              >
                <Input
                  size="large"
                  placeholder="https://example.com"
                  onChange={handleUrlChange}
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="description"
                label={<Text className="text-white">Description</Text>}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter resource description..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="type"
                label={<Text className="text-white">Type</Text>}
              >
                <Select
                  size="large"
                  className="bg-white/5 border-white/10"
                  options={[
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
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="category"
                label={<Text className="text-white">Category</Text>}
              >
                <Select
                  size="large"
                  className="bg-white/5 border-white/10"
                  options={[
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
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="priority"
                label={<Text className="text-white">Priority</Text>}
              >
                <Select
                  size="large"
                  className="bg-white/5 border-white/10"
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'critical', label: 'Critical' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="status"
                label={<Text className="text-white">Status</Text>}
              >
                <Select
                  size="large"
                  className="bg-white/5 border-white/10"
                  options={[
                    { value: 'saved', label: 'Saved' },
                    { value: 'reading', label: 'Reading' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="workspace"
                label={<Text className="text-white">Workspace</Text>}
              >
                <Input
                  size="large"
                  placeholder="Enter workspace name..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="team"
                label={<Text className="text-white">Team</Text>}
              >
                <Select
                  size="large"
                  className="bg-white/5 border-white/10"
                  placeholder="Select team"
                  allowClear
                  options={teams.map(team => ({
                    value: team._id,
                    label: team.name,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="visibility"
                label={<Text className="text-white">Visibility</Text>}
              >
                <Select
                  size="large"
                  className="bg-white/5 border-white/10"
                  options={[
                    { 
                      value: 'private', 
                      label: (
                        <Space>
                          <span>🔒</span>
                          Private
                        </Space>
                      )
                    },
                    { 
                      value: 'team', 
                      label: (
                        <Space>
                          <span>👥</span>
                          Team
                        </Space>
                      )
                    },
                    { 
                      value: 'public', 
                      label: (
                        <Space>
                          <span>🌍</span>
                          Public
                        </Space>
                      )
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <div className="mb-4">
                <Text className="text-white">Tags</Text>
                <div className="mt-2">
                  <Space wrap>
                    {tags.map(tag => (
                      <Tag
                        key={tag}
                        closable
                        onClose={() => handleRemoveTag(tag)}
                        className="bg-green-500/20 text-green-300 border-green-500/30"
                      >
                        {tag}
                      </Tag>
                    ))}
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onPressEnter={handleAddTag}
                      className="w-24 bg-white/5 border-white/10 text-white placeholder-gray-400"
                    />
                  </Space>
                </div>
              </div>
            </Col>

            <Col span={24}>
              <Divider className="border-white/10" />
              <Title level={4} className="text-white mb-4">Resource Preview</Title>
              <Card className="bg-white/5 border-white/10">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">
                    {getTypeIcon(form.getFieldValue('type') || 'link')}
                  </div>
                  <div className="flex-1">
                    <Title level={5} className="text-white mb-2">
                      {form.getFieldValue('title') || 'Resource Title'}
                    </Title>
                    <Text className="text-gray-400 mb-2 block">
                      {form.getFieldValue('url') || 'https://example.com'}
                    </Text>
                    <Text className="text-gray-300 mb-3 block">
                      {form.getFieldValue('description') || 'Resource description will appear here...'}
                    </Text>
                    <Space wrap>
                      <Tag className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {getCategoryIcon(form.getFieldValue('category') || 'other')} {form.getFieldValue('category') || 'category'}
                      </Tag>
                      <Tag className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {form.getFieldValue('type') || 'type'}
                      </Tag>
                      {tags.map(tag => (
                        <Tag key={tag} className="bg-green-500/20 text-green-300 border-green-500/30">
                          #{tag}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}
