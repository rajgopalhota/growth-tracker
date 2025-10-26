'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  message,
  Spin,
  Typography,
  Divider,
  Space,
  Tabs
} from 'antd';
import {
  User,
  Lock,
  Bell,
  Save,
  Upload
} from 'lucide-react';
import AvatarPicker from '@/components/AvatarPicker';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Password } = Input;

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (session?.user) {
      profileForm.setFieldsValue({
        name: session.user.name,
        email: session.user.email
      });
    }
  }, [session, profileForm]);

  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('Profile updated successfully');
        update();
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (values) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('Password updated successfully');
        passwordForm.resetFields();
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      message.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (avatar) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${session.user.id}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar })
      });

      if (response.ok) {
        // Wait for session update to complete
        await update();
        message.success('Avatar updated successfully');
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to update avatar');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      message.error('Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Title level={2} className="text-white mb-2">Settings</Title>
          <Text className="text-gray-400">Manage your account settings</Text>
        </div>

        <Card 
          className="mb-6 bg-black/40 backdrop-blur-xl border-white/10"
          bodyStyle={{ padding: '32px' }}
        >
          {/* Avatar Section */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <Avatar
                size={120}
                src={`/avatars/${session.user.avatar || 'avatar1.png'}`}
                className="border-4 border-white/20"
              />
            </div>
            <Text className="text-white text-xl font-semibold block mb-2">
              {session.user.name}
            </Text>
            <Text className="text-gray-400 block mb-6">
              {session.user.email}
            </Text>
            <div className="max-w-2xl mx-auto">
              <Text className="text-white text-sm mb-3 block">Choose Avatar:</Text>
              <AvatarPicker
                value={session.user.avatar || 'avatar1.png'}
                onChange={handleAvatarChange}
                disabled={loading}
              />
            </div>
          </div>

          <Divider className="bg-white/10" />

          <Tabs defaultActiveKey="profile" className="settings-tabs">
            <TabPane
              tab={
                <span>
                  <User className="w-4 h-4 inline mr-2" />
                  Profile
                </span>
              }
              key="profile"
            >
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleProfileUpdate}
                className="max-w-xl"
              >
                <Form.Item
                  name="name"
                  label={<span className="text-white">Name</span>}
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input
                    size="large"
                    placeholder="Your name"
                    prefix={<User className="w-4 h-4" />}
                    className="bg-white/5 border-white/10"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<span className="text-white">Email</span>}
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="your.email@example.com"
                    disabled
                    className="bg-white/5 border-white/10"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<Save />}
                    loading={loading}
                    className="w-full"
                  >
                    Update Profile
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <Lock className="w-4 h-4 inline mr-2" />
                  Security
                </span>
              }
              key="security"
            >
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordUpdate}
                className="max-w-xl"
              >
                <Form.Item
                  name="currentPassword"
                  label={<span className="text-white">Current Password</span>}
                  rules={[{ required: true, message: 'Please enter current password' }]}
                >
                  <Password
                    size="large"
                    placeholder="Enter current password"
                    prefix={<Lock className="w-4 h-4" />}
                    className="bg-white/5 border-white/10"
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label={<span className="text-white">New Password</span>}
                  rules={[
                    { required: true, message: 'Please enter new password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Password
                    size="large"
                    placeholder="Enter new password"
                    prefix={<Lock className="w-4 h-4" />}
                    className="bg-white/5 border-white/10"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label={<span className="text-white">Confirm New Password</span>}
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm new password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      }
                    })
                  ]}
                >
                  <Password
                    size="large"
                    placeholder="Confirm new password"
                    prefix={<Lock className="w-4 h-4" />}
                    className="bg-white/5 border-white/10"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<Lock />}
                    loading={loading}
                    className="w-full"
                  >
                    Update Password
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
