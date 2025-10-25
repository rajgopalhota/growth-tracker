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
  Tooltip
} from 'antd';
import { 
  Save,
  User,
  Calendar,
  Clock,
  Flag,
  Users,
  Link,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function TodoCreator() {
  const { data: session } = useSession();
  const router = useRouter();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState([]);
  const [newCriteria, setNewCriteria] = useState('');
  const [definitionOfDone, setDefinitionOfDone] = useState([]);
  const [newDefinition, setNewDefinition] = useState('');

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
      
      const todoData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        labels,
        acceptanceCriteria,
        definitionOfDone,
        reporter: session.user.id,
      };

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });

      if (response.ok) {
        const savedTodo = await response.json();
        message.success('Todo created successfully');
        router.push(`/dashboard/todos/${savedTodo._id}`);
      } else {
        message.error('Failed to create todo');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      message.error('Failed to create todo');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const handleAddCriteria = () => {
    if (newCriteria.trim()) {
      setAcceptanceCriteria([...acceptanceCriteria, newCriteria.trim()]);
      setNewCriteria('');
    }
  };

  const handleRemoveCriteria = (index) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index));
  };

  const handleAddDefinition = () => {
    if (newDefinition.trim()) {
      setDefinitionOfDone([...definitionOfDone, newDefinition.trim()]);
      setNewDefinition('');
    }
  };

  const handleRemoveDefinition = (index) => {
    setDefinitionOfDone(definitionOfDone.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-black/20 backdrop-blur-xl border-white/10">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            type: 'task',
            priority: 'medium',
            status: 'todo',
          }}
        >
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <div className="flex items-center justify-between mb-6">
                <Title level={2} className="text-white mb-0">
                  Create New Todo
                </Title>
                <Button
                  type="primary"
                  icon={<Save className="w-4 h-4" />}
                  htmlType="submit"
                  loading={loading}
                >
                  Create Todo
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
                  placeholder="Enter todo title..."
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
                  placeholder="Enter todo description..."
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
                    { value: 'task', label: 'Task' },
                    { value: 'bug', label: 'Bug' },
                    { value: 'story', label: 'Story' },
                    { value: 'epic', label: 'Epic' },
                    { value: 'subtask', label: 'Subtask' },
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
                    { value: 'lowest', label: 'Lowest' },
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'highest', label: 'Highest' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="status"
                label={<Text className="text-white">Status</Text>}
              >
                <Select
                  size="large"
                  className="bg-white/5 border-white/10"
                  options={[
                    { value: 'backlog', label: 'Backlog' },
                    { value: 'todo', label: 'To Do' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'review', label: 'Review' },
                    { value: 'done', label: 'Done' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="assignee"
                label={<Text className="text-white">Assignee</Text>}
              >
                <Select
                  size="large"
                  className="bg-white/5 border-white/10"
                  placeholder="Select assignee"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  options={users.map(user => ({
                    value: user._id,
                    label: (
                      <Space>
                        <Avatar size="small" src={user.image} />
                        {user.name}
                      </Space>
                    ),
                  }))}
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
                name="project"
                label={<Text className="text-white">Project</Text>}
              >
                <Input
                  size="large"
                  placeholder="Enter project name..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="storyPoints"
                label={<Text className="text-white">Story Points</Text>}
              >
                <InputNumber
                  size="large"
                  min={0}
                  max={100}
                  placeholder="Enter story points..."
                  className="w-full bg-white/5 border-white/10 text-white"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="dueDate"
                label={<Text className="text-white">Due Date</Text>}
              >
                <DatePicker
                  size="large"
                  className="w-full bg-white/5 border-white/10"
                  placeholder="Select due date"
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
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <div className="mb-4">
                <Text className="text-white">Labels</Text>
                <div className="mt-2">
                  <Space wrap>
                    {labels.map(label => (
                      <Tag
                        key={label}
                        closable
                        onClose={() => handleRemoveLabel(label)}
                        className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                      >
                        {label}
                      </Tag>
                    ))}
                    <Input
                      placeholder="Add label..."
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onPressEnter={handleAddLabel}
                      className="w-24 bg-white/5 border-white/10 text-white placeholder-gray-400"
                    />
                  </Space>
                </div>
              </div>
            </Col>

            <Col span={24}>
              <div className="mb-4">
                <Text className="text-white">Acceptance Criteria</Text>
                <div className="mt-2">
                  <List
                    dataSource={acceptanceCriteria}
                    renderItem={(criteria, index) => (
                      <List.Item
                        actions={[
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleRemoveCriteria(index)}
                          />
                        ]}
                      >
                        <Text className="text-gray-300">{criteria}</Text>
                      </List.Item>
                    )}
                  />
                  <Space.Compact className="w-full">
                    <Input
                      placeholder="Add acceptance criteria..."
                      value={newCriteria}
                      onChange={(e) => setNewCriteria(e.target.value)}
                      onPressEnter={handleAddCriteria}
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                    />
                    <Button
                      icon={<Plus className="w-4 h-4" />}
                      onClick={handleAddCriteria}
                    >
                      Add
                    </Button>
                  </Space.Compact>
                </div>
              </div>
            </Col>

            <Col span={24}>
              <div className="mb-4">
                <Text className="text-white">Definition of Done</Text>
                <div className="mt-2">
                  <List
                    dataSource={definitionOfDone}
                    renderItem={(definition, index) => (
                      <List.Item
                        actions={[
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleRemoveDefinition(index)}
                          />
                        ]}
                      >
                        <Text className="text-gray-300">{definition}</Text>
                      </List.Item>
                    )}
                  />
                  <Space.Compact className="w-full">
                    <Input
                      placeholder="Add definition of done..."
                      value={newDefinition}
                      onChange={(e) => setNewDefinition(e.target.value)}
                      onPressEnter={handleAddDefinition}
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                    />
                    <Button
                      icon={<Plus className="w-4 h-4" />}
                      onClick={handleAddDefinition}
                    >
                      Add
                    </Button>
                  </Space.Compact>
                </div>
              </div>
            </Col>

            <Col span={24}>
              <Form.Item
                name="environment"
                label={<Text className="text-white">Environment</Text>}
              >
                <Input
                  size="large"
                  placeholder="Enter environment (e.g., Development, Production)..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}
