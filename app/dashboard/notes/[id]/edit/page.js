'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Tag, 
  Upload, 
  message, 
  Spin,
  Row,
  Col,
  Typography,
  Divider,
  Tooltip,
  Modal,
  List,
  Avatar,
  Input as AntInput
} from 'antd';
import { 
  SaveOutlined, 
  ShareAltOutlined, 
  UserAddOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined,
  TagOutlined,
  PaperClipOutlined,
  TeamOutlined,
  GlobalOutlined,
  LockOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import toast from 'react-hot-toast';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function NoteEdit() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(null);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('read');
  const [collaborators, setCollaborators] = useState([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 hover:text-blue-300 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  useEffect(() => {
    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  useEffect(() => {
    if (note && editor) {
      editor.commands.setContent(note.contentHtml || note.content);
      form.setFieldsValue({
        title: note.title,
        category: note.category,
        priority: note.priority,
        visibility: note.visibility,
        team: note.team?._id,
      });
      setTags(note.tags || []);
      setCollaborators(note.collaborators || []);
    }
  }, [note, editor, form]);

  const fetchNote = async () => {
    if (!noteId) {
      message.error('Invalid note ID');
      router.push('/dashboard/notes');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/notes/${noteId}`);
      if (response.ok) {
        const data = await response.json();
        setNote(data);
      } else {
        message.error('Failed to fetch note');
        router.push('/dashboard/notes');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      message.error('Failed to fetch note');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      const content = editor?.getHTML() || '';
      const textContent = editor?.getText() || '';

      const noteData = {
        ...values,
        content: textContent,
        contentHtml: content,
        tags,
        collaborators,
      };

      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        message.success('Note updated successfully');
        router.push(`/dashboard/notes/${noteId}`);
      } else {
        message.error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      message.error('Failed to update note');
    } finally {
      setSaving(false);
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

  const handleShare = async () => {
    if (!shareEmail.trim()) {
      message.error('Please enter an email address');
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: shareEmail,
          permission: sharePermission,
        }),
      });

      if (response.ok) {
        message.success('Note shared successfully');
        setShareModalVisible(false);
        setShareEmail('');
        setSharePermission('read');
      } else {
        message.error('Failed to share note');
      }
    } catch (error) {
      console.error('Error sharing note:', error);
      message.error('Failed to share note');
    }
  };

  const handleAddCollaborator = async () => {
    if (!shareEmail.trim()) {
      message.error('Please enter an email address');
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}/collaborate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: shareEmail,
          role: sharePermission,
        }),
      });

      if (response.ok) {
        const collaborator = await response.json();
        setCollaborators([...collaborators, collaborator]);
        message.success('Collaborator added successfully');
        setShareEmail('');
        setSharePermission('viewer');
      } else {
        message.error('Failed to add collaborator');
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      message.error('Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/collaborate/${collaboratorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCollaborators(collaborators.filter(c => c._id !== collaboratorId));
        message.success('Collaborator removed successfully');
      } else {
        message.error('Failed to remove collaborator');
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      message.error('Failed to remove collaborator');
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
    <div className="max-w-6xl mx-auto">
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            category: 'personal',
            priority: 'medium',
            visibility: 'private',
          }}
        >
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <div className="flex items-center justify-between mb-6">
                <Title level={2} className="text-white mb-0">
                  Edit Note
                </Title>
                <Space>
                  <Button
                    icon={<ShareAltOutlined />}
                    onClick={() => setShareModalVisible(true)}
                  >
                    Share
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={saving}
                  >
                    Update
                  </Button>
                </Space>
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
                  placeholder="Enter note title..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="category"
                label={<Text className="text-white">Category</Text>}
              >
                <Select
                  size="large"
                  className="bg-white/5 border-white/10"
                  options={[
                    { value: 'personal', label: 'Personal' },
                    { value: 'work', label: 'Work' },
                    { value: 'learning', label: 'Learning' },
                    { value: 'project', label: 'Project' },
                    { value: 'meeting', label: 'Meeting' },
                    { value: 'idea', label: 'Idea' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
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
                    { value: 'urgent', label: 'Urgent' },
                  ]}
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
                          <LockOutlined />
                          Private
                        </Space>
                      )
                    },
                    { 
                      value: 'team', 
                      label: (
                        <Space>
                          <TeamOutlined />
                          Team
                        </Space>
                      )
                    },
                    { 
                      value: 'public', 
                      label: (
                        <Space>
                          <GlobalOutlined />
                          Public
                        </Space>
                      )
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="team"
                label={<Text className="text-white">Team (Optional)</Text>}
              >
                <Select
                  size="large"
                  className="bg-white/5 border-white/10"
                  placeholder="Select team"
                  allowClear
                >
                  {/* Teams would be populated from API */}
                </Select>
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
                        className="bg-orange-500/20 text-orange-300 border-orange-500/30"
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
              <div className="mb-4">
                <Text className="text-white">Content</Text>
                <div className="mt-2 border border-white/10 rounded-lg bg-white/5">
                  <EditorContent 
                    editor={editor}
                    className="min-h-[400px]"
                  />
                </div>
              </div>
            </Col>

            {collaborators.length > 0 && (
              <Col span={24}>
                <Divider className="border-white/10" />
                <div className="mb-4">
                  <Text className="text-white">Collaborators</Text>
                  <List
                    dataSource={collaborators}
                    renderItem={(collaborator) => (
                      <List.Item
                        actions={[
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveCollaborator(collaborator._id)}
                          />
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={collaborator.user?.image} />}
                          title={collaborator.user?.name}
                          description={`Role: ${collaborator.role}`}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </Col>
            )}
          </Row>
        </Form>
      </Card>

      {/* Share Modal */}
      <Modal
        title="Share Note"
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
            <Input
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Text>Permission</Text>
            <Select
              value={sharePermission}
              onChange={setSharePermission}
              className="w-full mt-1"
              options={[
                { value: 'read', label: 'Read Only' },
                { value: 'comment', label: 'Comment' },
                { value: 'edit', label: 'Edit' },
              ]}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}
