import { NextResponse } from 'next/server';

let activeClients: any[] = [];

export async function GET() {
  return NextResponse.json(activeClients);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Update or add client
    const existingIndex = activeClients.findIndex(c => c.robloxId === data.robloxId);
    
    const client = {
      id: "c-" + Math.random().toString(36).substring(2, 9),
      name: data.robloxName || "Unknown",
      place: data.gameName || "Unknown Game",
      placeId: data.gameId?.toString() || "",
      av: data.robloxName ? data.robloxName.substring(0, 2).toUpperCase() : "??",
      avc: "av-green",
      lastHeartbeat: Date.now(),
      uptime: data.uptime || 0,
      executor: data.executor || "Unknown",
      ...data
    };

    if (existingIndex >= 0) {
      activeClients[existingIndex] = client;
    } else {
      activeClients.push(client);
    }

    // Optional: Remove old clients (older than 5 minutes)
    activeClients = activeClients.filter(c => Date.now() - c.lastHeartbeat < 300000);

    return NextResponse.json({ success: true, count: activeClients.length });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
