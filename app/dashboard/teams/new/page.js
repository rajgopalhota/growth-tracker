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
  message, 
  Spin,
  Row,
  Col,
  Typography,
  List,
  Avatar,
  Modal,
  Tooltip,
  Tag,
  Divider
} from 'antd';
import { 
  Save,
  UserPlus,
  Users,
  Mail,
  Plus,
  Trash2,
  Edit,
  User,
  Crown,
  Shield
} from 'lucide-react';
import toast from '@/lib/notifications';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function TeamCreator() {
  const { data: session } = useSession();
  const router = useRouter();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [newInvitation, setNewInvitation] = useState({ email: '', role: 'member' });
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleSave = async (values) => {
    try {
      setLoading(true);
      
      const teamData = {
        ...values,
        createdBy: session.user.id,
        invitations,
      };

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });

      if (response.ok) {
        const savedTeam = await response.json();
        message.success('Team created successfully');
        router.push(`/dashboard/teams/${savedTeam._id}`);
      } else {
        message.error('Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      message.error('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvitation = () => {
    if (newInvitation.email.trim()) {
      const invitation = {
        ...newInvitation,
        id: Date.now(),
        invitedBy: session.user.id,
        status: 'pending',
        createdAt: new Date(),
      };
      setInvitations([...invitations, invitation]);
      setNewInvitation({ email: '', role: 'member' });
      setInviteModalVisible(false);
    }
  };

  const handleRemoveInvitation = (index) => {
    setInvitations(invitations.filter((_, i) => i !== index));
  };

  const handleInviteUser = async () => {
    if (!newInvitation.email.trim()) {
      message.error('Please enter an email address');
      return;
    }

    try {
      const response = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newInvitation.email,
          role: newInvitation.role,
          teamId: null, // Will be set after team creation
        }),
      });

      if (response.ok) {
        message.success('Invitation sent successfully');
        handleAddInvitation();
      } else {
        message.error('Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      message.error('Failed to send invitation');
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
            visibility: 'private',
            allowMemberInvites: true,
          }}
        >
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <div className="flex items-center justify-between mb-6">
                <Title level={2} className="text-white mb-0">
                  Create New Team
                </Title>
                <Button
                  type="primary"
                  icon={<Save className="w-4 h-4" />}
                  htmlType="submit"
                  loading={loading}
                >
                  Create Team
                </Button>
              </div>
            </Col>

            <Col span={24}>
              <Form.Item
                name="name"
                label={<Text className="text-white">Team Name</Text>}
                rules={[{ required: true, message: 'Please enter a team name' }]}
              >
                <Input
                  size="large"
                  placeholder="Enter team name..."
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
                  placeholder="Enter team description..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
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
                          <Shield className="w-4 h-4" />
                          Private
                        </Space>
                      )
                    },
                    { 
                      value: 'public', 
                      label: (
                        <Space>
                          <Users className="w-4 h-4" />
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
                name="allowMemberInvites"
                label={<Text className="text-white">Allow Member Invites</Text>}
                valuePropName="checked"
              >
                <Select
                  size="large"
                  className="bg-white/5 border-white/10"
                  options={[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Divider className="border-white/10" />
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="text-white mb-0">
                  Team Members
                </Title>
                <Button
                  icon={<UserPlus className="w-4 h-4" />}
                  onClick={() => setInviteModalVisible(true)}
                >
                  Invite Members
                </Button>
              </div>

              {/* Current User (Owner) */}
              <List
                dataSource={[{ user: session.user, role: 'owner' }]}
                renderItem={(member) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={member.user.image} />}
                      title={
                        <Space>
                          <Text className="text-white">{member.user.name}</Text>
                          <Tag color="gold" icon={<Crown className="w-4 h-4" />}>
                            Owner
                          </Tag>
                        </Space>
                      }
                      description={member.user.email}
                    />
                  </List.Item>
                )}
              />

              {/* Invitations */}
              {invitations.length > 0 && (
                <>
                  <Divider className="border-white/10" />
                  <Title level={5} className="text-white mb-4">Pending Invitations</Title>
                  <List
                    dataSource={invitations}
                    renderItem={(invitation, index) => (
                      <List.Item
                        actions={[
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleRemoveInvitation(index)}
                          />
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<User className="w-4 h-4" />} />}
                          title={
                            <Space>
                              <Text className="text-white">{invitation.email}</Text>
                              <Tag color="blue">
                                {invitation.role === 'admin' ? 'Admin' : 'Member'}
                              </Tag>
                              <Tag color="orange">Pending</Tag>
                            </Space>
                          }
                          description="Invitation pending"
                        />
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Col>

            <Col span={24}>
              <Divider className="border-white/10" />
              <Title level={4} className="text-white mb-4">Projects</Title>
              <Card className="bg-white/5 border-white/10">
                <Text className="text-gray-400">
                  Projects can be added after team creation. You'll be able to create and manage projects from the team dashboard.
                </Text>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Invite Modal */}
      <Modal
        title="Invite Team Member"
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setInviteModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="invite" type="primary" onClick={handleInviteUser}>
            Send Invitation
          </Button>,
        ]}
      >
        <Space direction="vertical" className="w-full">
          <div>
            <Text>Email Address</Text>
            <Input
              placeholder="Enter email address"
              value={newInvitation.email}
              onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Text>Role</Text>
            <Select
              value={newInvitation.role}
              onChange={(value) => setNewInvitation({ ...newInvitation, role: value })}
              className="w-full mt-1"
              options={[
                { value: 'member', label: 'Member' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}
