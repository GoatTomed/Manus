import { NextRequest, NextResponse } from "next/server";

// In-memory store for active connections (in production, use Redis or database)
const activeConnections = new Set<string>();

/**
 * AI Chat Endpoint
 * POST /api/ai/chat
 * 
 * Handles chat messages and returns AI responses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, conversationHistory, isRoblox } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Track Roblox connections
    if (isRoblox && sessionId) {
      activeConnections.add(sessionId);
      // Clean up after 5 minutes of inactivity
      setTimeout(() => activeConnections.delete(sessionId), 5 * 60 * 1000);
    }

    // Call Claude API for AI response
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: `You are an expert Roblox Lua scripting assistant. You help developers write Lua code for Roblox games.
        
You have deep knowledge of:
- Roblox Lua API and services (Players, Workspace, RunService, RemoteEvents, etc.)
- Lua programming best practices
- Common Roblox patterns and anti-patterns
- Performance optimization
- Security considerations

When answering:
1. Provide clear, concise Lua code examples
2. Explain what the code does
3. Include comments in the code
4. Suggest best practices
5. Warn about common mistakes

Always format code in markdown with \`\`\`lua blocks.`,
        messages: [
          ...conversationHistory.map((msg: any) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
          })),
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Claude API Error:", error);
      
      // Fallback response if API fails
      return NextResponse.json({
        result: {
          data: {
            response: `I'm having trouble connecting to the AI service right now. Please try again in a moment.\n\nError: ${response.status}`,
            sessionId,
            timestamp: new Date().toISOString(),
            isConnected: false,
          },
        },
      });
    }

    const data = await response.json();
    const aiResponse = data.content[0]?.text || "No response generated";

    return NextResponse.json({
      result: {
        data: {
          response: aiResponse,
          sessionId,
          timestamp: new Date().toISOString(),
          isConnected: true,
          isRobloxConnected: isRoblox ? activeConnections.has(sessionId) : false,
        },
      },
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check connection status
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  
  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId required" },
      { status: 400 }
    );
  }

  const isConnected = activeConnections.has(sessionId);
  
  return NextResponse.json({
    result: {
      data: {
        sessionId,
        isConnected,
        activeConnections: activeConnections.size,
      },
    },
  });
}
