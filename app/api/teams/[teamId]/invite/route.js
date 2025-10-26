import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Team from '@/models/Team';
import User from '@/models/User';
import Notification from '@/models/Notification';

// POST /api/teams/[teamId]/invite - Invite a member to a team
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = params;
    const { email, role } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Find team and verify user has permission to invite
    const team = await Team.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is owner or admin
    const isOwner = team.owner.toString() === session.user.id;
    const isAdmin = team.members.some(
      m => m.user?.toString() === session.user.id && m.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Only team owners and admins can invite members' },
        { status: 403 }
      );
    }

    // Check if email is already invited or is a member
    const isAlreadyInvited = team.invitedMembers.some(
      inv => inv.email.toLowerCase() === email.toLowerCase()
    );

    if (isAlreadyInvited) {
      return NextResponse.json(
        { error: 'This email has already been invited' },
        { status: 400 }
      );
    }

        // Check if user exists in system
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      // Check if user is already a member
      const isAlreadyMember = team.members.some(
        m => m.user?.toString() === existingUser._id.toString()
      );
      
      if (isAlreadyMember) {
        return NextResponse.json(
          { error: 'This user is already a team member' },
          { status: 400 }
        );
      }

      // Add to invited members list
      team.invitedMembers.push({
        email: email.toLowerCase(),
        role: role || 'member',
        invitedBy: session.user.id,
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await team.save();

      // Create notification for user to accept/decline
      await Notification.create({
        user: existingUser._id,
        type: 'team_invite',
        title: 'Team Invitation',
        message: `${session.user.name || 'Someone'} invited you to join the team "${team.name}"`,
        data: {
          itemType: 'team',
          itemId: team._id,
          actorId: session.user.id,
          metadata: { 
            teamName: team.name,
            role: role || 'member'
          }
        }
      });

      return NextResponse.json({
        message: 'Invitation sent successfully'
      });
    }

    // User doesn't exist in system - add to invited members list
    team.invitedMembers.push({
      email: email.toLowerCase(),
      role: role || 'member',
      invitedBy: session.user.id,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    await team.save();

    return NextResponse.json({
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
