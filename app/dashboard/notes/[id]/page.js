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
  Divider,
  List,
  Avatar,
  Input,
  Modal,
  Row,
  Col,
  Tooltip,
  Dropdown,
  Menu,
  Select
} from 'antd';
import { 
  Edit,
  Share2,
  Trash2,
  User,
  Calendar,
  Eye,
  EyeInvisible,
  Users,
  Globe,
  Lock,
  MessageCircle,
  Heart,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import toast from 'react-hot-toast';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export default function NoteView() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id;

  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('read');

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
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[200px] p-4',
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
    }
  }, [note, editor]);

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
        setComments(data.comments || []);
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

  const handleEdit = () => {
    router.push(`/dashboard/notes/${noteId}/edit`);
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Delete Note',
      content: 'Are you sure you want to delete this note? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`/api/notes/${noteId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            message.success('Note deleted successfully');
            router.push('/dashboard/notes');
          } else {
            message.error('Failed to delete note');
          }
        } catch (error) {
          console.error('Error deleting note:', error);
          message.error('Failed to delete note');
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

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      message.error('Please enter a comment');
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setComments(updatedNote.comments || []);
        setNewComment('');
        message.success('Comment added successfully');
      } else {
        message.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      message.error('Failed to add comment');
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return '💼';
      case 'learning': return '📚';
      case 'project': return '🚀';
      case 'meeting': return '🤝';
      case 'idea': return '💡';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <Title level={3} className="text-white">Note not found</Title>
        <Button onClick={() => router.push('/dashboard/notes')}>
          Back to Notes
        </Button>
      </div>
    );
  }

  const canEdit = note.createdBy._id === session?.user?.id || 
                 note.collaborators.some(c => c.user._id === session?.user?.id && ['editor', 'admin'].includes(c.role));

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push('/dashboard/notes')}
              className="mb-4"
            >
              Back to Notes
            </Button>
            <Space>
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

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Title level={1} className="text-white mb-2">
                {note.title}
              </Title>
              <Space wrap className="mb-4">
                <Tag color={getPriorityColor(note.priority)}>
                  {note.priority.toUpperCase()}
                </Tag>
                <Tag className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {getCategoryIcon(note.category)} {note.category}
                </Tag>
                <Space>
                  {getVisibilityIcon(note.visibility)}
                  <Text className="text-gray-400">{note.visibility}</Text>
                </Space>
                {note.tags.map(tag => (
                  <Tag key={tag} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    #{tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <Space>
              <Space>
                <User className="w-4 h-4" />
                <Text>{note.createdBy.name}</Text>
              </Space>
              <Space>
                <Calendar className="w-4 h-4" />
                <Text>Created {new Date(note.createdAt).toLocaleDateString()}</Text>
              </Space>
              {note.lastEditedBy && (
                <Space>
                  <Edit className="w-4 h-4" />
                  <Text>Last edited by {note.lastEditedBy.name}</Text>
                </Space>
              )}
            </Space>
            <Text>Version {note.version}</Text>
          </div>
        </div>

        <Divider className="border-white/10" />

        {/* Content */}
        <div className="mb-6">
          <div className="border border-white/10 rounded-lg bg-white/5">
            <EditorContent 
              editor={editor}
              className="min-h-[200px]"
            />
          </div>
        </div>

        {/* Collaborators */}
        {note.collaborators.length > 0 && (
          <>
            <Divider className="border-white/10" />
            <div className="mb-6">
              <Title level={4} className="text-white mb-4">Collaborators</Title>
              <List
                dataSource={note.collaborators}
                renderItem={(collaborator) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={collaborator.user?.image} />}
                      title={collaborator.user?.name}
                      description={`Role: ${collaborator.role}`}
                    />
                  </List.Item>
                )}
              />
            </div>
          </>
        )}

        {/* Comments */}
        <Divider className="border-white/10" />
        <div className="mb-6">
          <Title level={4} className="text-white mb-4">
            Comments ({comments.length})
          </Title>
          
          {/* Add Comment */}
          <div className="mb-4">
            <Space.Compact className="w-full">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onPressEnter={handleAddComment}
                className="bg-white/5 border-white/10 text-white placeholder-gray-400"
              />
              <Button
                type="primary"
                icon={<MessageCircle className="w-4 h-4" />}
                onClick={handleAddComment}
              >
                Comment
              </Button>
            </Space.Compact>
          </div>

          {/* Comments List */}
          <List
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={comment.user?.image} />}
                  title={
                    <Space>
                      <Text className="text-white">{comment.user?.name}</Text>
                      <Text className="text-gray-400 text-xs">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Text>
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph className="text-gray-300 mb-2">
                        {comment.content}
                      </Paragraph>
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8">
                          {comment.replies.map((reply, index) => (
                            <div key={index} className="mb-2 p-2 bg-white/5 rounded">
                              <Space>
                                <Avatar size="small" src={reply.user?.image} />
                                <Text className="text-white text-sm">{reply.user?.name}</Text>
                                <Text className="text-gray-400 text-xs">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </Text>
                              </Space>
                              <Paragraph className="text-gray-300 text-sm mt-1 mb-0">
                                {reply.content}
                              </Paragraph>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
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
