import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Team from '@/models/Team';
import User from '@/models/User';
import Notification from '@/models/Notification';

// POST /api/teams/invite/respond - Accept or decline team invitation
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, accept } = await request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Find team
    const team = await Team.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user has pending invitation
    const inviteIndex = team.invitedMembers.findIndex(
      inv => inv.email.toLowerCase() === session.user.email.toLowerCase()
    );

    if (inviteIndex === -1) {
      return NextResponse.json(
        { error: 'No pending invitation found' },
        { status: 400 }
      );
    }

    const invite = team.invitedMembers[inviteIndex];

    if (accept) {
      // Accept invitation - add user to team
      team.members.push({
        user: session.user.id,
        role: invite.role || 'member',
        joinedAt: new Date()
      });

      // Remove from invited list
      team.invitedMembers.splice(inviteIndex, 1);

      await team.save();

      // Create notification for team owner
      await Notification.create({
        user: team.owner,
        type: 'team_join',
        title: 'New Team Member',
        message: `${session.user.name || 'Someone'} joined the team "${team.name}"`,
        data: {
          itemType: 'team',
          itemId: team._id,
          actorId: session.user.id,
          metadata: { teamName: team.name }
        }
      });

      return NextResponse.json({
        message: 'Team invitation accepted successfully',
        team: team
      });
    } else {
      // Decline invitation - remove from invited list
      team.invitedMembers.splice(inviteIndex, 1);
      await team.save();

      // Create notification for team owner
      await Notification.create({
        user: team.owner,
        type: 'team_join',
        title: 'Invitation Declined',
        message: `${session.user.name || 'Someone'} declined the invitation to join "${team.name}"`,
        data: {
          itemType: 'team',
          itemId: team._id,
          actorId: session.user.id,
          metadata: { teamName: team.name }
        }
      });

      return NextResponse.json({
        message: 'Team invitation declined'
      });
    }
  } catch (error) {
    console.error('Error responding to invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
