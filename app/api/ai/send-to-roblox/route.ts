import { NextRequest, NextResponse } from "next/server";

// Store pending messages for Roblox clients
const pendingMessages = new Map<string, string[]>();

/**
 * Send message to Roblox client
 * POST /api/ai/send-to-roblox
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "sessionId and message required" },
        { status: 400 }
      );
    }

    // Store message for Roblox client to pick up
    if (!pendingMessages.has(sessionId)) {
      pendingMessages.set(sessionId, []);
    }
    pendingMessages.get(sessionId)!.push(message);

    return NextResponse.json({
      result: {
        data: {
          success: true,
          sessionId,
          messageQueued: true,
        },
      },
    });
  } catch (error) {
    console.error("Send to Roblox Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Get pending messages for Roblox client
 * GET /api/ai/send-to-roblox?sessionId=XXX
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId required" },
      { status: 400 }
    );
  }

  const messages = pendingMessages.get(sessionId) || [];
  
  // Clear messages after retrieval
  if (messages.length > 0) {
    pendingMessages.delete(sessionId);
  }

  return NextResponse.json({
    result: {
      data: {
        sessionId,
        messages,
        hasMessages: messages.length > 0,
      },
    },
  });
}
