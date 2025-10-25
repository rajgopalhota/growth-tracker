import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Resource from '@/models/Resource';
import User from '@/models/User';
import Notification from '@/models/Notification';

// GET /api/resources/[id] - Get a specific resource
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate resource ID
    if (!params.id || params.id === 'null' || params.id === 'undefined') {
      return NextResponse.json({ error: 'Invalid resource ID' }, { status: 400 });
    }

    await connectMongo();

    const resource = await Resource.findOne({
      _id: params.id,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id },
        { 'sharedWith.user': session.user.id },
        { visibility: 'public' }
      ]
    })
      .populate('createdBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image');

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/resources/[id] - Update a resource
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate resource ID
    if (!params.id || params.id === 'null' || params.id === 'undefined') {
      return NextResponse.json({ error: 'Invalid resource ID' }, { status: 400 });
    }

    await connectMongo();

    const resource = await Resource.findOne({
      _id: params.id,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id, 'collaborators.role': { $in: ['editor', 'admin'] } }
      ]
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found or no permission' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      url,
      type,
      category,
      tags,
      visibility,
      status,
      collaborators
    } = body;

    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(url && { url }),
      ...(type && { type }),
      ...(category && { category }),
      ...(tags && { tags }),
      ...(visibility && { visibility }),
      ...(status && { status }),
      ...(collaborators && { collaborators }),
      updatedAt: new Date()
    };

    const updatedResource = await Resource.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )
      .populate('createdBy', 'name email image')
      .populate('collaborators.user', 'name email image')
      .populate('sharedWith.user', 'name email image');

    // Create notification for collaborators
    if (collaborators) {
      const collaboratorIds = collaborators.map(c => c.user);
      for (const collaboratorId of collaboratorIds) {
        if (collaboratorId !== session.user.id) {
          await Notification.create({
            user: collaboratorId,
            type: 'resource_updated',
            title: 'Resource Updated',
            message: `${session.user.name} updated the resource "${title}"`,
            data: {
              resourceId: params.id,
              actorId: session.user.id
            },
            isRead: false
          });
        }
      }
    }

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/resources/[id] - Delete a resource
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate resource ID
    if (!params.id || params.id === 'null' || params.id === 'undefined') {
      return NextResponse.json({ error: 'Invalid resource ID' }, { status: 400 });
    }

    await connectMongo();

    const resource = await Resource.findOne({
      _id: params.id,
      $or: [
        { createdBy: session.user.id },
        { 'collaborators.user': session.user.id, 'collaborators.role': 'admin' }
      ]
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found or no permission' }, { status: 404 });
    }

    await Resource.findByIdAndDelete(params.id);

    // Create notification for collaborators
    const collaboratorIds = resource.collaborators.map(c => c.user);
    for (const collaboratorId of collaboratorIds) {
      if (collaboratorId !== session.user.id) {
        await Notification.create({
          user: collaboratorId,
          type: 'resource_deleted',
          title: 'Resource Deleted',
          message: `${session.user.name} deleted the resource "${resource.title}"`,
          data: {
            resourceId: params.id,
            actorId: session.user.id
          },
          isRead: false
        });
      }
    }

    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
