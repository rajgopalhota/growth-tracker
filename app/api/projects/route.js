import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Project from '@/models/Project';
import Team from '@/models/Team';

// GET /api/projects - Get all projects for the user's teams
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    // Get teams the user belongs to
    const userTeams = await Team.find({
      $or: [
        { owner: session.user.id },
        { 'members.user': session.user.id }
      ]
    }).select('_id');

    const teamIds = userTeams.map(t => t._id);

    const projects = await Project.find({
      team: { $in: teamIds }
    })
      .populate('team', 'name')
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const body = await request.json();
    const { name, description, teamId, settings } = body;

    if (!name || !teamId) {
      return NextResponse.json(
        { error: 'Name and team are required' },
        { status: 400 }
      );
    }

    // Check if user is a member of the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is owner or member
    const isOwner = team.owner.toString() === session.user.id;
    const isMember = team.members.some(
      m => m.user.toString() === session.user.id
    );

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: 'Unauthorized to create project in this team' },
        { status: 403 }
      );
    }

    const project = new Project({
      name,
      description: description || '',
      team: teamId,
      owner: session.user.id,
      members: [{
        user: session.user.id,
        role: 'admin'
      }],
      status: 'active',
      settings: settings || {
        visibility: 'private'
      }
    });

    await project.save();

    // Populate the created project
    const populatedProject = await Project.findById(project._id)
      .populate('team', 'name')
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    return NextResponse.json(populatedProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
