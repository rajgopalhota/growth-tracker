'use client';

import { useState, useEffect } from 'react';
import { Avatar, Radio, Grid } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;

export default function AvatarPicker({ value, onChange, disabled = false }) {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const screens = useBreakpoint();

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      const response = await fetch('/api/avatars');
      const data = await response.json();
      setAvatars(data.avatars || []);
    } catch (error) {
      console.error('Error fetching avatars:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitialsAvatar = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <Radio.Group
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className="w-full"
      style={{ width: '100%' }}
    >
      <div 
        className={`grid gap-3 ${
          screens.md ? 'grid-cols-4' : 'grid-cols-3'
        }`}
      >
        {avatars.map((avatar) => (
          <Radio.Button
            key={avatar.id}
            value={avatar.filename}
            className="p-3 h-auto bg-white/5 hover:bg-white/10 transition-all"
            style={{
              border: value === avatar.filename ? '2px solid #1890ff' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <Avatar
                size={screens.md ? 64 : 56}
                src={avatar.url}
                icon={!avatar.url && <UserOutlined />}
                className="border-2 transition-all"
                style={{
                  borderColor: value === avatar.filename ? '#1890ff' : 'rgba(255,255,255,0.2)'
                }}
              />
            </div>
          </Radio.Button>
        ))}
      </div>
    </Radio.Group>
  );
}
