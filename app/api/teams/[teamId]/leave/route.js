import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Team from '@/models/Team';
import Notification from '@/models/Notification';

// POST /api/teams/[teamId]/leave - Leave a team
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = params;
    await connectMongo();

    // Find team
    const team = await Team.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (team.owner.toString() === session.user.id) {
      return NextResponse.json(
        { error: 'Team owners cannot leave the team. Please delete the team instead.' },
        { status: 400 }
      );
    }

    // Check if user is a member
    const memberIndex = team.members.findIndex(
      m => m.user?.toString() === session.user.id
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'You are not a member of this team' },
        { status: 400 }
      );
    }

    // Remove user from team members
    team.members.splice(memberIndex, 1);
    await team.save();

    // Create notification for team owner
    await Notification.create({
      user: team.owner,
      type: 'team_join',
      title: 'Member Left Team',
      message: `${session.user.name || 'Someone'} left the team "${team.name}"`,
      data: {
        itemType: 'team',
        itemId: team._id,
        actorId: session.user.id,
        metadata: { teamName: team.name }
      }
    });

    return NextResponse.json({
      message: 'You have left the team successfully'
    });
  } catch (error) {
    console.error('Error leaving team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
