import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Team from '@/models/Team';
import User from '@/models/User';
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
        { 'members.user': session.user.id },
        { 'invitedMembers.email': session.user.email }
      ],
      isActive: true
    })
      .populate('owner', 'name email image')
      .populate('members.user', 'name email image')
      .sort({ updatedAt: -1 });

    return NextResponse.json(teams);
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
      const notifications = invitedMembers.map(invite => ({
        user: invite.email, // This will need to be looked up by email
        type: 'team_invite',
        title: 'Team Invitation',
        message: `${session.user.name} invited you to join the team "${name}"`,
        data: {
          itemType: 'team',
          itemId: team._id,
          actorId: session.user.id,
          metadata: { teamName: name, role: invite.role }
        }
      }));

      // Find users by email and create notifications
      const users = await User.find({ email: { $in: invitedMembers.map(i => i.email) } });
      const userNotifications = users.map(user => ({
        user: user._id,
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
      .populate('owner', 'name email image')
      .populate('members.user', 'name email image');

    return NextResponse.json(populatedTeam, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
