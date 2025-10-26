'use client';

import { Card, Avatar, Tag, Space, Tooltip, Modal, Button } from 'antd';
import { ClockCircleOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function BoardColumn({ column, cards, onCardClick, onCardMove, projectMembers }) {
  const [dragOver, setDragOver] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const columnCards = cards.filter(card => 
    card.columnId?.toString() === column._id?.toString()
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const cardId = e.dataTransfer.getData('cardId');
    onCardMove(cardId, column._id);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      medium: 'processing',
      high: 'warning',
      urgent: 'error'
    };
    return colors[priority] || 'default';
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    const daysUntilDue = dayjs(dueDate).diff(dayjs(), 'day');
    
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue === 0) return 'today';
    if (daysUntilDue <= 3) return 'soon';
    return 'normal';
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  return (
    <>
      <div
        className={`bg-white/5 rounded-lg p-4 min-h-[500px] transition-colors ${
          dragOver ? 'border-2 border-blue-500' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: column.color }}
            />
            {column.name}
          </h3>
          <span className="text-white/60 text-sm">{columnCards.length}</span>
        </div>

        <div className="space-y-3">
          {columnCards.map((card) => {
            const dueDateStatus = getDueDateStatus(card.dueDate);
            
            return (
                             <Card
                 key={card._id?.toString() || card.id?.toString() || Math.random()}
                 hoverable
                 className="cursor-pointer"
                 onClick={() => handleCardClick(card)}
                 size="small"
                 draggable
                 onDragStart={(e) => {
                   e.dataTransfer.setData('cardId', card._id?.toString() || card.id?.toString());
                 }}
                 style={{
                   backgroundColor: 'rgba(255, 255, 255, 0.05)',
                   borderColor: 'rgba(255, 255, 255, 0.1)'
                 }}
                 bodyStyle={{ padding: '12px' }}
               >
                <Space direction="vertical" size="small" className="w-full">
                  <div className="font-medium text-white">{card.title}</div>
                  
                  {card.description && (
                    <div className="text-white/60 text-xs line-clamp-2">
                      {card.description}
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {card.priority && (
                      <Tag color={getPriorityColor(card.priority)}>
                        {card.priority}
                      </Tag>
                    )}
                    
                    {card.dueDate && (
                      <Tooltip title={dayjs(card.dueDate).format('MMM DD, YYYY')}>
                        <Tag 
                          color={
                            dueDateStatus === 'overdue' ? 'red' :
                            dueDateStatus === 'today' ? 'orange' :
                            dueDateStatus === 'soon' ? 'blue' : 'default'
                          }
                          icon={<CalendarOutlined />}
                        >
                          {dayjs(card.dueDate).fromNow()}
                        </Tag>
                      </Tooltip>
                    )}
                  </div>

                  {card.assignees && card.assignees.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Avatar.Group maxCount={3} size="small">
                        {card.assignees.map(assignee => (
                          <Avatar 
                            key={assignee._id || assignee} 
                            icon={<UserOutlined />}
                            src={assignee.avatar}
                          />
                        ))}
                      </Avatar.Group>
                    </div>
                  )}
                </Space>
              </Card>
            );
          })}
        </div>
      </div>

      <Modal
        title={selectedCard?.title}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedCard && (
          <div className="space-y-4">
            <div>
              <div className="text-gray-500 text-sm mb-1">Description</div>
              <div className="text-gray-800">
                {selectedCard.description || 'No description'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-500 text-sm mb-1">Priority</div>
                <Tag color={getPriorityColor(selectedCard.priority)}>
                  {selectedCard.priority}
                </Tag>
              </div>

              {selectedCard.dueDate && (
                <div>
                  <div className="text-gray-500 text-sm mb-1">Due Date</div>
                  <div>{dayjs(selectedCard.dueDate).format('MMM DD, YYYY')}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
