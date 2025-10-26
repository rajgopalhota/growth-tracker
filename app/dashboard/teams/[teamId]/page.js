'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  Button, 
  Space, 
  message, 
  Spin,
  Typography,
  List,
  Avatar,
  Modal,
  Form,
  Input,
  Descriptions,
  Tag,
  Dropdown,
  Row,
  Col,
  Empty
} from 'antd';
import { 
  Plus,
  Users,
  Crown,
  Settings,
  Trash2,
  ArrowLeft,
  FolderKanban,
  LogOut
} from 'lucide-react';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { teamId } = params;
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [form] = Form.useForm();
  const [userRole, setUserRole] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/${teamId}`);
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
        
        // Determine user's role
        const currentUser = await fetch('/api/auth/me');
        if (currentUser.ok) {
          const userData = await currentUser.json();
          setIsOwner(data.owner._id === userData.id);
          
          // Find user's role in members array
          const member = data.members?.find(m => m.user?._id === userData.id);
          setUserRole(member?.role || null);
        }
      } else {
        message.error('Failed to fetch team');
        router.push('/dashboard/teams');
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      message.error('Failed to fetch team');
      router.push('/dashboard/teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (values) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          teamId: teamId
        })
      });

      if (response.ok) {
        message.success('Project created successfully');
        setCreateProjectModal(false);
        form.resetFields();
        fetchTeam(); // Refresh team data
      } else {
        message.error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      message.error('Failed to create project');
    }
  };

  const handleLeaveTeam = async () => {
    Modal.confirm({
      title: 'Leave Team',
      content: 'Are you sure you want to leave this team? You will lose access to all team projects.',
      okText: 'Leave',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`/api/teams/${teamId}/leave`, {
            method: 'POST',
          });
          if (response.ok) {
            message.success('You have left the team');
            router.push('/dashboard/teams');
          } else {
            const data = await response.json();
            message.error(data.error || 'Failed to leave team');
          }
        } catch (error) {
          console.error('Error leaving team:', error);
          message.error('Failed to leave team');
        }
      },
    });
  };

  const handleDeleteTeam = async () => {
    Modal.confirm({
      title: 'Delete Team',
      content: 'Are you sure you want to delete this team? This will delete all projects and cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`/api/teams/${teamId}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            message.success('Team deleted successfully');
            router.push('/dashboard/teams');
          } else {
            message.error('Failed to delete team');
          }
        } catch (error) {
          console.error('Error deleting team:', error);
          message.error('Failed to delete team');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Team not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            icon={<ArrowLeft />}
            onClick={() => router.back()}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Info */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <div className="text-center mb-4">
                <Avatar
                  size={80}
                  className="mb-2"
                  style={{
                    backgroundColor: '#ff6b35',
                    fontSize: '32px',
                    fontWeight: 'bold'
                  }}
                >
                  {team.name?.[0]?.toUpperCase() || 'T'}
                </Avatar>
                <Title level={3} className="text-white mb-1">
                  {team.name}
                </Title>
                <Text className="text-gray-400">{team.description || 'No description'}</Text>
              </div>

              <Descriptions column={1} size="small" className="mt-4">
                <Descriptions.Item label="Members" span={24}>
                  {1 + (team.members?.length || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Projects" span={24}>
                  {team.projects?.length || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Created" span={24}>
                  {new Date(team.createdAt).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2">
                {isOwner ? (
                  <Button
                    danger
                    icon={<Trash2 />}
                    onClick={handleDeleteTeam}
                    className="w-full"
                  >
                    Delete Team
                  </Button>
                ) : (
                  <Button
                    danger
                    icon={<LogOut />}
                    onClick={handleLeaveTeam}
                    className="w-full"
                  >
                    Leave Team
                  </Button>
                )}
              </div>
            </Card>

            {/* Members */}
            <Card title="Members" className="mb-6">
              <List
                dataSource={team.members || []}
                renderItem={(member) => (
                  <List.Item className="px-0">
                    <List.Item.Meta
                      avatar={
                        <Avatar>
                          {member.user?.name?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                      }
                      title={
                        <span className="text-white flex items-center gap-2">
                          {member.user?.name || 'Unknown User'}
                          {member.role === 'admin' && <Crown className="w-4 h-4 text-yellow-400" />}
                        </span>
                      }
                      description={
                        <Tag color={member.role === 'admin' ? 'gold' : 'blue'}>
                          {member.role}
                        </Tag>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>

          {/* Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <Title level={3} className="text-white mb-0">
                Projects
              </Title>
              <Button
                type="primary"
                icon={<Plus />}
                onClick={() => setCreateProjectModal(true)}
              >
                New Project
              </Button>
            </div>

            {team.projects && team.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.projects.map((project) => (
                  <Card
                    key={project._id}
                    hoverable
                    className="cursor-pointer relative"
                    onClick={() => router.push(`/dashboard/teams/${teamId}/projects/${project._id}`)}
                    actions={[
                      <Button
                        key="delete"
                        danger
                        icon={<Trash2 />}
                        onClick={(e) => {
                          e.stopPropagation();
                          Modal.confirm({
                            title: 'Delete Project',
                            content: 'Are you sure you want to delete this project? This action cannot be undone.',
                            okText: 'Delete',
                            okType: 'danger',
                            cancelText: 'Cancel',
                            onOk: async () => {
                              try {
                                const response = await fetch(`/api/projects/${project._id}`, {
                                  method: 'DELETE',
                                });
                                if (response.ok) {
                                  message.success('Project deleted successfully');
                                  fetchTeam();
                                } else {
                                  message.error('Failed to delete project');
                                }
                              } catch (error) {
                                console.error('Error deleting project:', error);
                                message.error('Failed to delete project');
                              }
                            },
                          });
                        }}
                      >
                        Delete
                      </Button>
                    ]}
                  >
                    <div className="flex items-start gap-3">
                      <FolderKanban className="w-8 h-8 text-blue-400" />
                      <div className="flex-1">
                        <Title level={5} className="text-white mb-1">
                          {project.name}
                        </Title>
                        <Text className="text-gray-400 text-sm line-clamp-2">
                          {project.description || 'No description'}
                        </Text>
                        <div className="mt-2">
                          <Tag color={project.status === 'active' ? 'green' : 'default'}>
                            {project.status}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty
                description="No projects yet"
                className="py-12"
              >
                <Button
                  type="primary"
                  icon={<Plus />}
                  onClick={() => setCreateProjectModal(true)}
                >
                  Create First Project
                </Button>
              </Empty>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        title="Create New Project"
        open={createProjectModal}
        onCancel={() => {
          setCreateProjectModal(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={4}
              placeholder="Enter project description"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Project
              </Button>
              <Button onClick={() => setCreateProjectModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
