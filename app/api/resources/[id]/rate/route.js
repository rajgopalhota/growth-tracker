import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectMongo from '@/lib/mongo';
import Resource from '@/models/Resource';

// POST /api/resources/[id]/rate - Rate a resource
export async function POST(request, { params }) {
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
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const body = await request.json();
    const { rating } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user has already rated this resource
    const existingRatingIndex = resource.ratings.findIndex(
      r => r.user.toString() === session.user.id
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      resource.ratings[existingRatingIndex].rating = rating;
      resource.ratings[existingRatingIndex].updatedAt = new Date();
    } else {
      // Add new rating
      resource.ratings.push({
        user: session.user.id,
        rating: rating,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Calculate average rating
    const totalRating = resource.ratings.reduce((sum, r) => sum + r.rating, 0);
    resource.averageRating = totalRating / resource.ratings.length;
    resource.ratingCount = resource.ratings.length;

    await resource.save();

    return NextResponse.json({ 
      averageRating: resource.averageRating,
      ratingCount: resource.ratingCount,
      userRating: rating
    });
  } catch (error) {
    console.error('Error rating resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/resources/[id]/rate - Get user's rating for a resource
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
    }).select('ratings averageRating ratingCount');

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const userRating = resource.ratings.find(
      r => r.user.toString() === session.user.id
    );

    return NextResponse.json({
      averageRating: resource.averageRating || 0,
      ratingCount: resource.ratingCount || 0,
      userRating: userRating ? userRating.rating : 0
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
