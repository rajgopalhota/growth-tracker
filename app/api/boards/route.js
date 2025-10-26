import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Board from '@/models/Board';
import Project from '@/models/Project';

// GET /api/boards - Get all boards for a project
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Verify user has access to the project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const boards = await Board.find({ project: projectId })
      .populate('project', 'name')
      .sort({ updatedAt: -1 });

    return NextResponse.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create a new board
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const body = await request.json();
    const { name, projectId, columns } = body;

    if (!name || !projectId) {
      return NextResponse.json(
        { error: 'Name and project are required' },
        { status: 400 }
      );
    }

    // Verify user has access to the project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const board = new Board({
      name,
      project: projectId,
      columns: [
        { name: 'Todo', order: 0, color: '#3B82F6' },
        { name: 'In Progress', order: 1, color: '#F59E0B' },
        { name: 'Review', order: 2, color: '#8B5CF6' },
        { name: 'Done', order: 3, color: '#10B981' }
      ],
      cards: [],
      settings: {
        allowComments: true
      }
    });

    await board.save();

    // Populate the created board
    const populatedBoard = await Board.findById(board._id)
      .populate('project', 'name');

    return NextResponse.json(populatedBoard, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
