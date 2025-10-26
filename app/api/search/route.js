import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Note from '@/models/Note';
import Todo from '@/models/Todo';
import Project from '@/models/Project';
import Team from '@/models/Team';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    await connectMongo();

    const searchRegex = new RegExp(query, 'i');

    // Search notes
    const notes = await Note.find({
      $or: [
        { owner: session.user.id },
        { collaborators: session.user.id }
      ],
      $or: [
        { title: searchRegex },
        { content: searchRegex }
      ]
    })
      .select('title content tags createdAt')
      .limit(10);

    // Search todos
    const todos = await Todo.find({
      owner: session.user.id,
      title: searchRegex
    })
      .select('title status priority dueDate createdAt')
      .limit(10);

    // Search projects - get user's teams first
    const userTeams = await Team.find({
      $or: [
        { owner: session.user.id },
        { 'members.user': session.user.id }
      ]
    }).select('_id');

    const teamIds = userTeams.map(t => t._id);
    const projects = await Project.find({
      team: { $in: teamIds },
      name: searchRegex
    })
      .select('name description team createdAt')
      .populate('team', 'name')
      .limit(10);

    return NextResponse.json({
      notes,
      todos,
      projects
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
