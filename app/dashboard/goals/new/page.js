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
  DatePicker,
  InputNumber,
  Divider,
  List,
  Avatar,
  Modal,
  Tooltip,
  Progress,
  Slider
} from 'antd';
import { 
  Save,
  User,
  Calendar,
  Target,
  Flag,
  Users,
  Plus,
  Trash2,
  Edit,
  Trophy,
  Clock
} from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function GoalCreator() {
  const { data: session } = useSession();
  const router = useRouter();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', targetDate: null });
  const [metrics, setMetrics] = useState([]);
  const [newMetric, setNewMetric] = useState({ name: '', unit: '', targetValue: 0 });
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState({ name: '', frequency: 'daily', targetCount: 1 });

  useEffect(() => {
    fetchTeams();
    fetchUsers();
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
      
      const goalData = {
        ...values,
        targetDate: values.targetDate ? values.targetDate.toISOString() : null,
        startDate: values.startDate ? values.startDate.toISOString() : new Date().toISOString(),
        tags,
        milestones: milestones.map((milestone, index) => ({
          ...milestone,
          targetDate: milestone.targetDate ? milestone.targetDate.toISOString() : null,
          order: index,
        })),
        metrics,
        habits,
        createdBy: session.user.id,
      };

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });

      if (response.ok) {
        const savedGoal = await response.json();
        message.success('Goal created successfully');
        router.push(`/dashboard/goals/${savedGoal._id}`);
      } else {
        message.error('Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      message.error('Failed to create goal');
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

  const handleAddMilestone = () => {
    if (newMilestone.title.trim()) {
      setMilestones([...milestones, { ...newMilestone, id: Date.now() }]);
      setNewMilestone({ title: '', description: '', targetDate: null });
    }
  };

  const handleRemoveMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleAddMetric = () => {
    if (newMetric.name.trim()) {
      setMetrics([...metrics, { ...newMetric, id: Date.now() }]);
      setNewMetric({ name: '', unit: '', targetValue: 0 });
    }
  };

  const handleRemoveMetric = (index) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const handleAddHabit = () => {
    if (newHabit.name.trim()) {
      setHabits([...habits, { ...newHabit, id: Date.now() }]);
      setNewHabit({ name: '', frequency: 'daily', targetCount: 1 });
    }
  };

  const handleRemoveHabit = (index) => {
    setHabits(habits.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            category: 'personal',
            type: 'short-term',
            priority: 'medium',
            status: 'not-started',
            progress: 0,
          }}
        >
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <div className="flex items-center justify-between mb-6">
                <Title level={2} className="text-white mb-0">
                  Create New Goal
                </Title>
                <Button
                  type="primary"
                  icon={<Save className="w-4 h-4" />}
                  htmlType="submit"
                  loading={loading}
                >
                  Create Goal
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
                  placeholder="Enter goal title..."
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
                  placeholder="Enter goal description..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
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
                    { value: 'personal', label: 'Personal' },
                    { value: 'professional', label: 'Professional' },
                    { value: 'health', label: 'Health' },
                    { value: 'learning', label: 'Learning' },
                    { value: 'financial', label: 'Financial' },
                    { value: 'fitness', label: 'Fitness' },
                    { value: 'creative', label: 'Creative' },
                    { value: 'social', label: 'Social' },
                    { value: 'spiritual', label: 'Spiritual' },
                    { value: 'other', label: 'Other' },
                  ]}
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
                    { value: 'short-term', label: 'Short-term' },
                    { value: 'long-term', label: 'Long-term' },
                    { value: 'milestone', label: 'Milestone' },
                    { value: 'habit', label: 'Habit' },
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
                name="targetDate"
                label={<Text className="text-white">Target Date</Text>}
              >
                <DatePicker
                  size="large"
                  className="w-full bg-white/5 border-white/10"
                  placeholder="Select target date"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="startDate"
                label={<Text className="text-white">Start Date</Text>}
              >
                <DatePicker
                  size="large"
                  className="w-full bg-white/5 border-white/10"
                  placeholder="Select start date"
                  defaultValue={dayjs()}
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
                    { value: 'private', label: 'Private' },
                    { value: 'team', label: 'Team' },
                    { value: 'public', label: 'Public' },
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
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30"
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
              <Title level={4} className="text-white mb-4">Milestones</Title>
              <div className="mb-4">
                <List
                  dataSource={milestones}
                  renderItem={(milestone, index) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleRemoveMilestone(index)}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        title={milestone.title}
                        description={
                          <div>
                            <Text className="text-gray-300">{milestone.description}</Text>
                            {milestone.targetDate && (
                              <div className="mt-1">
                                <Text className="text-gray-400 text-sm">
                                  Target: {milestone.targetDate.format('MMM DD, YYYY')}
                                </Text>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
                <Card className="bg-white/5 border-white/10 mb-4">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Input
                        placeholder="Milestone title..."
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                      />
                    </Col>
                    <Col span={12}>
                      <DatePicker
                        placeholder="Target date"
                        value={newMilestone.targetDate}
                        onChange={(date) => setNewMilestone({ ...newMilestone, targetDate: date })}
                        className="w-full bg-white/5 border-white/10"
                      />
                    </Col>
                    <Col span={24}>
                      <TextArea
                        placeholder="Milestone description..."
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                      />
                    </Col>
                    <Col span={24}>
                      <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={handleAddMilestone}
                        disabled={!newMilestone.title.trim()}
                      >
                        Add Milestone
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </div>
            </Col>

            <Col span={24}>
              <Divider className="border-white/10" />
              <Title level={4} className="text-white mb-4">Metrics</Title>
              <div className="mb-4">
                <List
                  dataSource={metrics}
                  renderItem={(metric, index) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleRemoveMetric(index)}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        title={metric.name}
                        description={
                          <Text className="text-gray-300">
                            Target: {metric.targetValue} {metric.unit}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
                <Card className="bg-white/5 border-white/10 mb-4">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Input
                        placeholder="Metric name..."
                        value={newMetric.name}
                        onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                      />
                    </Col>
                    <Col span={8}>
                      <Input
                        placeholder="Unit..."
                        value={newMetric.unit}
                        onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        placeholder="Target value"
                        value={newMetric.targetValue}
                        onChange={(value) => setNewMetric({ ...newMetric, targetValue: value })}
                        className="w-full bg-white/5 border-white/10 text-white"
                      />
                    </Col>
                    <Col span={24}>
                      <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={handleAddMetric}
                        disabled={!newMetric.name.trim()}
                      >
                        Add Metric
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </div>
            </Col>

            <Col span={24}>
              <Divider className="border-white/10" />
              <Title level={4} className="text-white mb-4">Habits</Title>
              <div className="mb-4">
                <List
                  dataSource={habits}
                  renderItem={(habit, index) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleRemoveHabit(index)}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        title={habit.name}
                        description={
                          <Text className="text-gray-300">
                            {habit.frequency} - Target: {habit.targetCount}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
                <Card className="bg-white/5 border-white/10 mb-4">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Input
                        placeholder="Habit name..."
                        value={newHabit.name}
                        onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                      />
                    </Col>
                    <Col span={8}>
                      <Select
                        placeholder="Frequency"
                        value={newHabit.frequency}
                        onChange={(value) => setNewHabit({ ...newHabit, frequency: value })}
                        className="w-full bg-white/5 border-white/10"
                        options={[
                          { value: 'daily', label: 'Daily' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'monthly', label: 'Monthly' },
                        ]}
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        placeholder="Target count"
                        value={newHabit.targetCount}
                        onChange={(value) => setNewHabit({ ...newHabit, targetCount: value })}
                        className="w-full bg-white/5 border-white/10 text-white"
                      />
                    </Col>
                    <Col span={24}>
                      <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={handleAddHabit}
                        disabled={!newHabit.name.trim()}
                      >
                        Add Habit
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}
