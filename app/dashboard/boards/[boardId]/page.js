'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, Button, Space, notification } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import BoardColumn from '@/components/BoardColumn';
import CardModal from '@/components/CardModal';
import toast from '@/lib/notifications';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const { boardId } = params;

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);

  useEffect(() => {
    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/boards/${boardId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch board');
      }

      const data = await response.json();
      setBoard(data);
      
      // Fetch project members if project is populated
      if (data.project?.team) {
        fetchProjectMembers(data.project.team);
      }
    } catch (error) {
      console.error('Error fetching board:', error);
      toast.error('Failed to load board');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async (teamId) => {
    try {
      // For now, set empty array since we need API endpoint
      // TODO: Create API endpoint to fetch team members
      setProjectMembers([]);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleCardMove = async (cardId, newColumnId) => {
    try {
      const updatedCards = board.cards.map(card => {
        if (card._id?.toString() === cardId || card.id?.toString() === cardId) {
          return { ...card, columnId: newColumnId };
        }
        return card;
      });

      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards: updatedCards }),
      });

      if (!response.ok) {
        throw new Error('Failed to move card');
      }

      setBoard({ ...board, cards: updatedCards });
      toast.success('Card moved successfully');
    } catch (error) {
      console.error('Error moving card:', error);
      toast.error('Failed to move card');
    }
  };

  const handleCreateCard = () => {
    setSelectedCard(null);
    setModalVisible(true);
  };

  const handleCardSave = async (cardData) => {
    try {
      const updatedCards = [...board.cards, cardData];
      
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards: updatedCards }),
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      setBoard({ ...board, cards: updatedCards });
      setModalVisible(false);
      toast.success('Card created successfully');
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create card');
    }
  };

  const handleCardUpdate = async (cardId, cardData) => {
    try {
      const updatedCards = board.cards.map(card => {
        if (card._id?.toString() === cardId || card.id?.toString() === cardId) {
          return { ...card, ...cardData };
        }
        return card;
      });
      
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards: updatedCards }),
      });

      if (!response.ok) {
        throw new Error('Failed to update card');
      }

      setBoard({ ...board, cards: updatedCards });
      setModalVisible(false);
      toast.success('Card updated successfully');
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Failed to update card');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Board not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{board.name}</h1>
              {board.project && (
                <p className="text-white/60">Project: {board.project.name}</p>
              )}
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateCard}
            size="large"
          >
            Add Card
          </Button>
        </div>

        {/* Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {board.columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <BoardColumn
                key={column._id?.toString() || column.id}
                column={column}
                cards={board.cards}
                onCardClick={(card) => {
                  setSelectedCard(card);
                  setModalVisible(true);
                }}
                onCardMove={handleCardMove}
                projectMembers={projectMembers}
              />
            ))}
        </div>
      </div>

      {/* Card Modal */}
      {modalVisible && (
        <CardModal
          visible={modalVisible}
          card={selectedCard}
          columns={board.columns}
          projectMembers={projectMembers}
          onClose={() => {
            setModalVisible(false);
            setSelectedCard(null);
          }}
          onSave={selectedCard ? 
            (cardData) => handleCardUpdate(selectedCard._id || selectedCard.id, cardData) :
            handleCardSave
          }
        />
      )}
    </div>
  );
}
