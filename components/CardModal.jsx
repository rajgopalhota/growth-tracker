'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space, Timeline, Avatar, Tabs } from 'antd';
import { SaveOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export default function CardModal({ visible, card, columns, projectMembers, onClose, onSave, activities = [] }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && card) {
      form.setFieldsValue({
        title: card.title,
        description: card.description,
        columnId: card.columnId,
        priority: card.priority || 'medium',
        dueDate: card.dueDate ? dayjs(card.dueDate) : null,
        assignees: card.assignees || [],
        labels: card.labels || []
      });
    } else if (visible && !card) {
      form.resetFields();
      // Set default column to first column
      if (columns && columns.length > 0) {
        form.setFieldsValue({
          columnId: columns[0]._id || columns[0].id,
          priority: 'medium'
        });
      }
    }
  }, [visible, card, form, columns]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const cardData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toDate().toISOString() : null,
        labels: values.labels || [],
        assignees: values.assignees || [],
        createdAt: card?.createdAt || new Date().toISOString(),
        createdBy: card?.createdBy,
        _id: card?._id,
        id: card?.id
      };

      setLoading(true);
      await onSave(cardData);
      setLoading(false);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'card_created':
        return `created this card`;
      case 'card_moved':
        return `moved card from ${activity.details?.fromColumn} to ${activity.details?.toColumn}`;
      case 'card_updated':
        return `updated the card`;
      case 'comment_added':
        return `added a comment`;
      case 'assignment_changed':
        return `changed assignment`;
      default:
        return `performed an action`;
    }
  };

  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'card_created':
      case 'card_updated':
        return '📝';
      case 'card_moved':
        return '➡️';
      case 'comment_added':
        return '💬';
      case 'assignment_changed':
        return '👤';
      default:
        return '📋';
    }
  };

  return (
    <Modal
      title={card ? 'Edit Card' : 'Create Card'}
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          {card ? 'Update' : 'Create'}
        </Button>
      ]}
    >
      {card ? (
        <Tabs defaultActiveKey="details">
          <TabPane tab="Details" key="details">
            <Form
              form={form}
              layout="vertical"
              className="mt-4"
            >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="Card title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea
            rows={4}
            placeholder="Add a description..."
          />
        </Form.Item>

        <Form.Item
          name="columnId"
          label="Column"
          rules={[{ required: true, message: 'Please select a column' }]}
        >
          <Select placeholder="Select column">
            {columns?.map(column => (
              <Option key={column._id || column.id} value={column._id || column.id}>
                {column.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
            <Option value="urgent">Urgent</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="Due Date"
        >
          <DatePicker
            style={{ width: '100%' }}
            showTime
            placeholder="Select due date"
          />
        </Form.Item>

        <Form.Item
          name="assignees"
          label="Assignees"
        >
          <Select
            mode="multiple"
            placeholder="Select assignees"
            showSearch
            optionFilterProp="children"
          >
            {projectMembers?.map(member => (
              <Option key={member._id || member.id} value={member._id || member.id}>
                {member.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

              <Form.Item
                name="labels"
                label="Labels"
              >
                <Select
                  mode="tags"
                  placeholder="Add labels"
                  tokenSeparators={[',']}
                />
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="Activity" key="activity">
            <Timeline className="mt-4">
              {activities && activities.length > 0 ? (
                activities.map((activity, index) => (
                  <Timeline.Item key={index} color="blue">
                    <div className="flex items-start gap-3">
                      <Avatar
                        size="small"
                        src={activity.user?.avatar ? `/avatars/${activity.user.avatar}` : null}
                        icon={!activity.user?.avatar && <UserOutlined />}
                      />
                      <div className="flex-1">
                        <div className="text-sm text-white">
                          <span className="font-semibold">{activity.user?.name || 'Unknown'}</span>
                          {' '}
                          <span className="text-gray-400">{getActivityDescription(activity)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {dayjs(activity.createdAt).format('MMM D, YYYY h:mm A')}
                        </div>
                      </div>
                    </div>
                  </Timeline.Item>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No activity yet
                </div>
              )}
            </Timeline>
          </TabPane>
        </Tabs>
      ) : (
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Card title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={4}
              placeholder="Add a description..."
            />
          </Form.Item>

          <Form.Item
            name="columnId"
            label="Column"
            rules={[{ required: true, message: 'Please select a column' }]}
          >
            <Select placeholder="Select column">
              {columns?.map(column => (
                <Option key={column._id || column.id} value={column._id || column.id}>
                  {column.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              placeholder="Select due date"
            />
          </Form.Item>

          <Form.Item
            name="assignees"
            label="Assignees"
          >
            <Select
              mode="multiple"
              placeholder="Select assignees"
              showSearch
              optionFilterProp="children"
            >
              {projectMembers?.map(member => (
                <Option key={member._id || member.id} value={member._id || member.id}>
                  {member.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="labels"
            label="Labels"
          >
            <Select
              mode="tags"
              placeholder="Add labels"
              tokenSeparators={[',']}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
