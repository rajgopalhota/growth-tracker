import { NextResponse } from 'next/server';

// List of available avatar files
const AVAILABLE_AVATARS = [
  'avatar1.png',
  'avatar2.png',
  'avatar3.png',
  'avatar4.png',
  'avatar5.png',
  'avatar6.png',
  'avatar7.png',
  'avatar8.png',
  'avatar9.png',
  'avatar10.png',
  'avatar11.png',
  'avatar12.png'
];

export async function GET() {
  try {
    // Return manifest of available avatars
    const manifest = AVAILABLE_AVATARS.map((avatar, index) => ({
      id: index + 1,
      filename: avatar,
      url: `/avatars/${avatar}`
    }));

    return NextResponse.json(
      { avatars: manifest },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get avatars error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
