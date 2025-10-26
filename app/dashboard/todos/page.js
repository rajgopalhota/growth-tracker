'use client';

import {
  Button,
  Card,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Typography,
  message
} from 'antd';
import dayjs from 'dayjs';
import {
  Calendar,
  CheckCircle,
  MoreHorizontal,
  Plus,
  Trash2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function TodosPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (response.ok) {
        const data = await response.json();
        setTodos(data.todos || []);
      } else {
        message.error('Failed to fetch todos');
        setTodos([]);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      message.error('Failed to fetch todos');
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDone = async (todoId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'done' ? 'todo' : 'done';
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTodos();
      } else {
        message.error('Failed to update todo');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update todo');
    }
  };

  const handleDelete = async (todoId) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Todo deleted');
        fetchTodos();
      } else {
        message.error('Failed to delete todo');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      message.error('Failed to delete todo');
    }
  };

  const handleSaveTodo = async (values) => {
    try {
      const todoData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        reporter: session.user.id,
        status: values.status || 'todo',
      };

      const response = await fetch('/api/todos', {
        method: selectedTodo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTodo ? { ...todoData, _id: selectedTodo._id } : todoData),
      });

      if (response.ok) {
        message.success(selectedTodo ? 'Todo updated' : 'Todo created');
        setModalVisible(false);
        setSelectedTodo(null);
        form.resetFields();
        fetchTodos();
      } else {
        message.error('Failed to save todo');
      }
    } catch (error) {
      console.error('Error saving todo:', error);
      message.error('Failed to save todo');
    }
  };

  const handleOpenModal = (todo = null) => {
    setSelectedTodo(todo);
    if (todo) {
      form.setFieldsValue({
        ...todo,
        dueDate: todo.dueDate ? dayjs(todo.dueDate) : null,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const pendingTodos = todos.filter(todo => todo.status !== 'done');
  const completedTodos = todos.filter(todo => todo.status === 'done');

  const getMenuItems = (todo) => [
    {
      key: 'delete',
      icon: <Trash2 className="w-4 h-4" />,
      label: 'Delete',
      danger: true,
      onClick: () => handleDelete(todo._id),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 mb-6">
        <div className="mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Title level={1} className="text-white mb-0 text-3xl font-bold">
                To-dos
              </Title>
              <Text className="text-gray-400 text-sm">
                {pendingTodos.length} {pendingTodos.length === 1 ? 'task' : 'tasks'}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto px-4 md:px-6">
        {/* Pending Todos */}
        {pendingTodos.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingTodos.map((todo) => (
                <div
                  key={todo._id}
                  className="group relative bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-800/50 rounded-3xl p-6 hover:border-orange-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-orange-500/10"
                  onClick={() => handleToggleDone(todo._id, todo.status)}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
                  
                  <div className="relative flex items-start gap-4">
                    {/* Checkbox circle */}
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-600 group-hover:border-orange-500 transition-all duration-300 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Text className="text-white text-lg font-semibold block mb-2 line-clamp-2 leading-tight">
                        {todo.title}
                      </Text>
                      {todo.description && (
                        <Text className="text-gray-400 text-sm mt-2 block line-clamp-2 leading-relaxed">
                          {todo.description}
                        </Text>
                      )}
                      {todo.dueDate && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800/50">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <Text className="text-gray-400 text-sm font-medium">
                            {dayjs(todo.dueDate).format('MMM DD, YYYY')}
                          </Text>
                        </div>
                      )}
                    </div>
                    
                    {/* More menu */}
                    <Dropdown
                      menu={{ items: getMenuItems(todo) }}
                      trigger={['click']}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="text"
                        icon={<MoreHorizontal className="w-5 h-5" />}
                        className="text-gray-500 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-800/50 rounded-lg p-2"
                      />
                    </Dropdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Todos */}
        {completedTodos.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800 to-gray-800"></div>
              <Text className="text-gray-500 text-sm font-semibold px-4">
                Completed ({completedTodos.length})
              </Text>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-800 to-gray-800"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTodos.map((todo) => (
                <div
                  key={todo._id}
                  className="group relative bg-gradient-to-br from-gray-200/20 to-gray-100/20 border border-gray-800/30 rounded-3xl p-6 hover:border-gray-700/50 transition-all duration-300 cursor-pointer opacity-70 hover:opacity-90"
                  onClick={() => handleToggleDone(todo._id, todo.status)}
                >
                  <div className="relative flex items-start gap-4">
                    {/* Checked circle */}
                    <div className="mt-1 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Text className="text-white text-lg font-semibold block mb-2 line-clamp-2 leading-tight line-through decoration-2 decoration-gray-600">
                        {todo.title}
                      </Text>
                      {todo.description && (
                        <Text className="text-gray-500 text-sm mt-2 block line-clamp-2 leading-relaxed line-through decoration-1 decoration-gray-700">
                          {todo.description}
                        </Text>
                      )}
                    </div>
                    
                    {/* More menu */}
                    <Dropdown
                      menu={{ items: getMenuItems(todo) }}
                      trigger={['click']}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="text"
                        icon={<MoreHorizontal className="w-5 h-5" />}
                        className="text-gray-600 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-800/50 rounded-lg p-2"
                      />
                    </Dropdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todos.length === 0 && !loading && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 border border-gray-800 mb-6">
              <CheckCircle className="w-10 h-10 text-gray-600" />
            </div>
            <Text className="text-gray-400 text-lg block mb-8 font-medium">
              No tasks yet
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => handleOpenModal()}
              className="bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600 h-14 px-8 rounded-full text-base font-semibold shadow-lg shadow-orange-500/20"
            >
              Create your first task
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center transition-all duration-300 z-50 hover:scale-110 active:scale-95"
        aria-label="Add new todo"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      {/* Create/Edit Todo Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <Text className="text-white text-xl font-semibold">
              {selectedTodo ? 'Edit Task' : 'New Task'}
            </Text>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedTodo(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveTodo}
          className="mt-2"
        >
          <Form.Item
            name="title"
            label={<Text className="text-white text-sm font-semibold mb-2 block">Title</Text>}
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input
              size="large"
              placeholder="What needs to be done?"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text className="text-white text-sm font-semibold mb-2 block">Description</Text>}
          >
            <TextArea
              rows={4}
              placeholder="Add more details..."
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label={<Text className="text-white text-sm font-semibold mb-2 block">Priority</Text>}
          >
            <Select
              size="large"
              placeholder="Select priority"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label={<Text className="text-white text-sm font-semibold mb-2 block">Due Date</Text>}
          >
            <DatePicker
              size="large"
              className="w-full bg-gray-900 border-gray-700 rounded-xl hover:border-orange-500/50"
              placeholder="Set a due date"
            />
          </Form.Item>

          <div className="flex gap-3 mt-8">
            <Button
              className="flex-1 h-12 bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 rounded-xl font-semibold"
              onClick={() => {
                setModalVisible(false);
                setSelectedTodo(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold shadow-lg shadow-orange-500/20"
            >
              {selectedTodo ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}