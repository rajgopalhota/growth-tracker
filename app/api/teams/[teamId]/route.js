import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Team from '@/models/Team';
import Project from '@/models/Project';

// GET /api/teams/[teamId] - Get a single team with projects
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = params;
    await connectMongo();

    // Find team and verify user has access
    const team = await Team.findOne({
      _id: teamId,
      $or: [
        { owner: session.user.id },
        { 'members.user': session.user.id }
      ],
      isActive: true
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or access denied' },
        { status: 404 }
      );
    }

    // Get all projects for this team
    const projects = await Project.find({ team: teamId })
      .populate('owner', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Attach projects to team object
    const teamWithProjects = {
      ...team.toObject(),
      projects
    };

    return NextResponse.json(teamWithProjects);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[teamId] - Delete a team
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = params;
    await connectMongo();

    // Find team and verify user is owner
    const team = await Team.findById(teamId);
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (team.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the team owner can delete the team' },
        { status: 403 }
      );
    }

    // Delete all projects for this team
    await Project.deleteMany({ team: teamId });

    // Delete the team
    await Team.findByIdAndDelete(teamId);

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
