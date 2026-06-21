import { NextResponse } from 'next/server';

let activeClients: any[] = [];

export async function GET() {
  // Clean old clients (older than 5 minutes)
  activeClients = activeClients.filter(c => Date.now() - (c.lastHeartbeat || 0) < 300000);
  return NextResponse.json(activeClients);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const client = {
      id: "c-" + Math.random().toString(36).substring(2, 9),
      name: data.robloxName || "Player",
      place: data.gameName || "Unknown Game",
      placeId: data.gameId?.toString() || "",
      av: (data.robloxName || "??").substring(0, 2).toUpperCase(),
      avc: "av-green",
      lastHeartbeat: Date.now(),
      uptime: data.uptime || 0,
      executor: data.executor || "Unknown",
      ...data
    };

    // Update or add
    const index = activeClients.findIndex(c => c.robloxId === data.robloxId);
    if (index >= 0) {
      activeClients[index] = client;
    } else {
      activeClients.push(client);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
