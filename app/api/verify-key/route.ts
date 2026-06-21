import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { key, robloxId } = await request.json();

    if (!key) {
      return NextResponse.json({ valid: false, error: 'No key provided' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Key accepted'
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}
