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
  Table,
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
  Crown,
  Shield,
  Globe,
  Lock,
  UserPlus,
  Mail,
  Settings,
  BarChart3,
  Project,
  MessageCircle
} from 'lucide-react';

const { Search: AntSearch } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

export default function TeamsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [inviteForm] = Form.useForm();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else {
        message.error('Failed to fetch teams');
        setTeams([]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      message.error('Failed to fetch teams');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (values) => {
    try {
      const response = await fetch(`/api/teams/${selectedTeam._id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          role: values.role,
        }),
      });

      if (response.ok) {
        message.success('Invitation sent successfully');
        setInviteModalVisible(false);
        inviteForm.resetFields();
        fetchTeams();
      } else {
        message.error('Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      message.error('Failed to send invitation');
    }
  };

  const handleLeaveTeam = async (teamId) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/leave`, {
        method: 'POST',
      });

      if (response.ok) {
        message.success('Left team successfully');
        fetchTeams();
      } else {
        message.error('Failed to leave team');
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      message.error('Failed to leave team');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Team deleted successfully');
        fetchTeams();
      } else {
        message.error('Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      message.error('Failed to delete team');
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisibility = filterVisibility === 'all' || team.settings.visibility === filterVisibility;
    return matchesSearch && matchesVisibility;
  });

  const getUserRole = (team) => {
    const member = team.members.find(m => m.user._id === session?.user?.id);
    return member?.role || 'member';
  };

  const isOwner = (team) => getUserRole(team) === 'owner';
  const isAdmin = (team) => ['owner', 'admin'].includes(getUserRole(team));

  const getMenuItems = (team) => {
    const items = [
      {
        key: 'view',
        icon: '👁️',
        label: 'View Details',
        onClick: () => router.push(`/dashboard/teams/${team._id}`),
      },
    ];

    if (isAdmin(team)) {
      items.push(
        {
          key: 'edit',
          icon: '✏️',
          label: 'Edit Team',
          onClick: () => router.push(`/dashboard/teams/${team._id}/edit`),
        },
        {
          key: 'invite',
          icon: '👤➕',
          label: 'Invite Members',
          onClick: () => {
            setSelectedTeam(team);
            setInviteModalVisible(true);
          },
        },
        {
          key: 'settings',
          icon: '⚙️',
          label: 'Team Settings',
          onClick: () => router.push(`/dashboard/teams/${team._id}/settings`),
        }
      );
    }

    if (isOwner(team)) {
      items.push({
        type: 'divider',
      }, {
        key: 'delete',
        icon: '🗑️',
        label: 'Delete Team',
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: 'Delete Team',
            content: 'Are you sure you want to delete this team? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => handleDeleteTeam(team._id),
          });
        },
      });
    } else {
      items.push({
        type: 'divider',
      }, {
        key: 'leave',
        icon: '👤',
        label: 'Leave Team',
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: 'Leave Team',
            content: 'Are you sure you want to leave this team?',
            okText: 'Leave',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => handleLeaveTeam(team._id),
          });
        },
      });
    }

    return items;
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public': return '🌍';
      case 'private': return '🔒';
      default: return '🔒';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'gold';
      case 'admin': return 'red';
      case 'member': return 'blue';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="text-white mb-2">Teams</Title>
          <Text className="text-gray-400">Collaborate with your team members</Text>
        </div>
        <Button
          type="primary"
          onClick={() => router.push('/dashboard/teams/new')}
          size="large"
        >
          ➕ Create Team
        </Button>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <Title level={3} className="text-white mb-0">{teams.length}</Title>
              <Text className="text-gray-400">Total Teams</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <div className="text-2xl mb-2">👑</div>
              <Title level={3} className="text-white mb-0">
                {teams.filter(t => isOwner(t)).length}
              </Title>
              <Text className="text-gray-400">Owned Teams</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <Title level={3} className="text-white mb-0">
                {teams.reduce((acc, team) => acc + team.members.length, 0)}
              </Title>
              <Text className="text-gray-400">Total Members</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <div className="text-center">
              <div className="text-2xl mb-2">📁</div>
              <Title level={3} className="text-white mb-0">
                {teams.reduce((acc, team) => acc + (team.projects?.length || 0), 0)}
              </Title>
              <Text className="text-gray-400">Active Projects</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <AntSearch
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Visibility"
              value={filterVisibility}
              onChange={setFilterVisibility}
              className="w-full"
              options={[
                { value: 'all', label: 'All Teams' },
                { value: 'private', label: 'Private' },
                { value: 'public', label: 'Public' },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
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

      {/* Teams Grid/List */}
      {filteredTeams.length === 0 ? (
        <Card className="bg-black/20 backdrop-blur-xl border-white/10">
          <Empty
            image={<Users className="w-16 h-16 text-gray-400 mx-auto" />}
            description={
              <div>
                <Title level={4} className="text-white mb-2">No teams found</Title>
                <Text className="text-gray-400">Create your first team to get started</Text>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/dashboard/teams/new')}
            >
              Create Team
            </Button>
          </Empty>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredTeams.map(team => (
            <Card
              key={team._id}
              className="bg-black/20 backdrop-blur-xl border-white/10 hover:bg-black/30 transition-all duration-200 cursor-pointer"
              hoverable
              onClick={() => router.push(`/dashboard/teams/${team._id}`)}
              actions={[
                <Tooltip title="View Details">
                  <Eye onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/teams/${team._id}`);
                  }} />
                </Tooltip>,
                <Tooltip title="Team Settings">
                  <Settings onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/teams/${team._id}/settings`);
                  }} />
                </Tooltip>,
                <Tooltip title="Invite Members">
                  <UserPlus onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTeam(team);
                    setInviteModalVisible(true);
                  }} />
                </Tooltip>,
                <Dropdown
                  menu={{ items: getMenuItems(team) }}
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
                    <Users className="w-4 h-4 text-blue-400" />
                    {getVisibilityIcon(team.settings.visibility)}
                  </div>
                  <Tag color={getRoleColor(getUserRole(team))}>
                    {getUserRole(team)}
                  </Tag>
                </div>
                
                <Title level={4} className="text-white mb-2 line-clamp-2">
                  {team.name}
                </Title>
                
                <Paragraph className="text-gray-300 line-clamp-3 mb-0">
                  {team.description || 'No description provided'}
                </Paragraph>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Space>
                      <span className="text-gray-400">👤</span>
                      <Text className="text-gray-400">
                        {team.members.length} member{team.members.length > 1 ? 's' : ''}
                      </Text>
                    </Space>
                    <Space>
                      <span className="text-gray-400">📅</span>
                      <Text className="text-gray-400">
                        Created {new Date(team.createdAt).toLocaleDateString()}
                      </Text>
                    </Space>
                  </div>
                  
                  {team.projects && team.projects.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">📁</span>
                      <Text className="text-gray-400 text-xs">
                        {team.projects.length} active project{team.projects.length > 1 ? 's' : ''}
                      </Text>
                    </div>
                  )}
                </div>

                {/* Team Members Preview */}
                <div className="flex items-center gap-2">
                  <Avatar.Group size="small" maxCount={5}>
                    {team.members.slice(0, 5).map((member, index) => (
                      <Tooltip key={index} title={`${member.user.name} (${member.role})`}>
                        <Avatar src={member.user.image} />
                      </Tooltip>
                    ))}
                  </Avatar.Group>
                  {team.members.length > 5 && (
                    <Text className="text-gray-400 text-xs">
                      +{team.members.length - 5} more
                    </Text>
                  )}
                </div>

                {/* Pending Invitations */}
                {team.invitations && team.invitations.filter(inv => inv.status === 'pending').length > 0 && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-400" />
                    <Text className="text-orange-400 text-xs">
                      {team.invitations.filter(inv => inv.status === 'pending').length} pending invitation{team.invitations.filter(inv => inv.status === 'pending').length > 1 ? 's' : ''}
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        title="Invite Team Member"
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        footer={null}
      >
        <Form
          form={inviteForm}
          layout="vertical"
          onFinish={handleInviteMember}
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter an email address' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              options={[
                { value: 'member', label: 'Member' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setInviteModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Send Invitation
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}