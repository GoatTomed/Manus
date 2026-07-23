import { NextRequest, NextResponse } from "next/server";

const avatarCache = new Map<string, any>();

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 });

  if (avatarCache.has(userId)) {
    return NextResponse.json(avatarCache.get(userId));
  }

  try {
    const response = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${encodeURIComponent(userId)}&size=150x150&format=Png&isCircular=false`
    );
    const data = await response.json();
    avatarCache.set(userId, data);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
