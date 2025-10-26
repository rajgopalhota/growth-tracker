import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Team from '@/models/Team';
import User from '@/models/User';
import Project from '@/models/Project';
import Notification from '@/models/Notification';

// GET /api/teams - Get all teams for the user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const teams = await Team.find({
      $or: [
        { owner: session.user.id },
        { 'members.user': session.user.id }
      ],
      isActive: true
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Populate projects for each team
    const teamsWithProjects = await Promise.all(
      teams.map(async (team) => {
        const projects = await Project.find({ team: team._id })
          .populate('owner', 'name email avatar')
          .sort({ updatedAt: -1 });
        
        return {
          ...team.toObject(),
          projects
        };
      })
    );

    return NextResponse.json(teamsWithProjects);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/teams - Create a new team
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const body = await request.json();
    const { name, description, settings, invitedMembers } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const team = new Team({
      name,
      description: description || '',
      owner: session.user.id,
      members: [{
        user: session.user.id,
        role: 'admin',
        permissions: {
          canCreateNotes: true,
          canCreateTodos: true,
          canCreateGoals: true,
          canInviteMembers: true,
          canManageTeam: true
        }
      }],
      invitedMembers: invitedMembers || [],
      settings: settings || {
        isPublic: false,
        allowMemberInvites: true,
        defaultPermissions: {
          canCreateNotes: true,
          canCreateTodos: true,
          canCreateGoals: true
        }
      }
    });

    await team.save();

    // Update user's teams array
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { teams: team._id }
    });

    // Send invitations to invited members
    if (invitedMembers && invitedMembers.length > 0) {
      // Find users by email and create notifications
      const users = await User.find({ email: { $in: invitedMembers.map(i => i.email) } });
      const userNotifications = users.map(notifUser => ({
        user: notifUser._id,
        type: 'team_invite',
        title: 'Team Invitation',
        message: `${session.user.name} invited you to join the team "${name}"`,
        data: {
          itemType: 'team',
          itemId: team._id,
          actorId: session.user.id,
          metadata: { teamName: name }
        }
      }));

      if (userNotifications.length > 0) {
        await Notification.insertMany(userNotifications);
      }
    }

    // Populate the created team
    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    return NextResponse.json(populatedTeam, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
