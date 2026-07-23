import { NextRequest, NextResponse } from "next/server";

const gameIconCache = new Map<string, any>();

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId");
  if (!placeId) return NextResponse.json({ error: "No placeId" }, { status: 400 });

  if (gameIconCache.has(placeId)) {
    return NextResponse.json(gameIconCache.get(placeId));
  }

  try {
    const response = await fetch(
      `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${encodeURIComponent(placeId)}&size=150x150&format=Png&isCircular=false`
    );
    const data = await response.json();
    gameIconCache.set(placeId, data);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
