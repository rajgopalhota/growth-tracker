'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Space, Spin, Typography, Empty, message } from 'antd';
import { ArrowLeft, Plus, FolderKanban } from 'lucide-react';
import BoardColumn from '@/components/BoardColumn';
import CardModal from '@/components/CardModal';

const { Title } = Typography;

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { teamId, projectId } = params;

  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardActivities, setCardActivities] = useState([]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
        
        // Fetch boards for this project
        const boardsResponse = await fetch(`/api/boards?projectId=${projectId}`);
        if (boardsResponse.ok) {
          const boardsData = await boardsResponse.json();
          setBoards(boardsData);
          
          // Select first board or create default board if none exists
          if (boardsData.length === 0) {
            createDefaultBoard();
          } else {
            setSelectedBoard(boardsData[0]);
          }
        }
      } else {
        message.error('Failed to fetch project');
        router.push(`/dashboard/teams/${teamId}`);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      message.error('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultBoard = async () => {
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Main Board',
          projectId: projectId
        })
      });

      if (response.ok) {
        const board = await response.json();
        setBoards([board]);
        setSelectedBoard(board);
        message.success('Default board created');
      }
    } catch (error) {
      console.error('Error creating default board:', error);
    }
  };

  const handleCardMove = async (cardId, newColumnId) => {
    try {
      // Find the card being moved
      const movedCard = selectedBoard.cards.find(card => card._id?.toString() === cardId);
      if (!movedCard) return;

      // Find the old and new columns
      const oldColumn = selectedBoard.columns.find(col => 
        col._id?.toString() === movedCard.columnId?.toString()
      );
      const newColumn = selectedBoard.columns.find(col => 
        col._id?.toString() === newColumnId
      );

      const updatedCards = selectedBoard.cards.map(card => {
        if (card._id?.toString() === cardId) {
          return { ...card, columnId: newColumnId };
        }
        return card;
      });

      const response = await fetch(`/api/boards/${selectedBoard._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: updatedCards }),
      });

      if (response.ok) {
        setSelectedBoard({ ...selectedBoard, cards: updatedCards });
        message.success('Card moved successfully');
        
        // Create activity for card movement
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project: projectId,
            board: selectedBoard._id,
            card: cardId,
            type: 'card_moved',
            details: {
              fromColumn: oldColumn?.name || 'Unknown',
              toColumn: newColumn?.name || 'Unknown',
              cardTitle: movedCard.title
            }
          })
        });
      }
    } catch (error) {
      console.error('Error moving card:', error);
      message.error('Failed to move card');
    }
  };

  const fetchCardActivities = async (cardId) => {
    try {
      const response = await fetch(`/api/activities?card=${cardId}&project=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setCardActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleCreateCard = () => {
    setSelectedCard(null);
    setCardActivities([]);
    setModalVisible(true);
  };

  const handleCardClick = async (card) => {
    setSelectedCard(card);
    setModalVisible(true);
    // Fetch activities for this card
    await fetchCardActivities(card._id);
  };

  const handleCardSave = async (cardData) => {
    try {
      const updatedCards = [...selectedBoard.cards, {
        ...cardData,
        createdAt: new Date().toISOString()
      }];

      const response = await fetch(`/api/boards/${selectedBoard._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: updatedCards }),
      });

      if (response.ok) {
        const board = await response.json();
        setSelectedBoard(board);
        setModalVisible(false);
        message.success('Card created successfully');
        
        // Get the newly created card
        const newCard = board.cards[board.cards.length - 1];
        
        // Create activity for card creation
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project: projectId,
            board: selectedBoard._id,
            card: newCard._id,
            type: 'card_created',
            details: {
              cardTitle: cardData.title
            }
          })
        });
      }
    } catch (error) {
      console.error('Error creating card:', error);
      message.error('Failed to create card');
    }
  };

  const handleCardUpdate = async (cardId, cardData) => {
    try {
      const updatedCards = selectedBoard.cards.map(card => {
        if (card._id?.toString() === cardId) {
          return { ...card, ...cardData };
        }
        return card;
      });

      const response = await fetch(`/api/boards/${selectedBoard._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: updatedCards }),
      });

      if (response.ok) {
        setSelectedBoard({ ...selectedBoard, cards: updatedCards });
        setModalVisible(false);
        message.success('Card updated successfully');
      }
    } catch (error) {
      console.error('Error updating card:', error);
      message.error('Failed to update card');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!project || !selectedBoard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Empty description="Project not found" />
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
              icon={<ArrowLeft />}
              onClick={() => router.push(`/dashboard/teams/${teamId}`)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Back
            </Button>
            <div>
              <Title level={2} className="text-white mb-0">
                {project.name}
              </Title>
              <p className="text-white/60 text-sm">{project.description || 'No description'}</p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<Plus />}
            onClick={handleCreateCard}
            size="large"
          >
            Add Card
          </Button>
        </div>

        {/* Board */}
        {selectedBoard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedBoard.columns
              .sort((a, b) => a.order - b.order)
              .map((column) => (
                <BoardColumn
                  key={column._id}
                  column={column}
                  cards={selectedBoard.cards}
                  onCardClick={handleCardClick}
                  onCardMove={handleCardMove}
                  projectMembers={[]}
                />
              ))}
          </div>
        )}
      </div>

      {/* Card Modal */}
      {modalVisible && (
        <CardModal
          visible={modalVisible}
          card={selectedCard}
          columns={selectedBoard?.columns || []}
          projectMembers={[]}
          activities={cardActivities}
          onClose={() => {
            setModalVisible(false);
            setSelectedCard(null);
            setCardActivities([]);
          }}
          onSave={selectedCard ?
            (cardData) => handleCardUpdate(selectedCard._id, cardData) :
            handleCardSave
          }
        />
      )}
    </div>
  );
}
