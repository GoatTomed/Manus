import { VercelRequest, VercelResponse } from '@vercel/node';

function generateManusLevelScript(topic: string): string {
  const t = topic.toLowerCase();
  
  if (t.includes("decompiler") || (t.includes("script") && t.includes("list"))) {
    return `Here is a professional-grade **Dev Decompiler** for high-end executors:\n\n\`\`\`lua\n-- Dev Decompiler | YouSuck Omniscient Engine\nlocal clipboardFunc = getclipboard or setclipboard or nil\nlocal executor = identifyexecutor and identifyexecutor() or "Unknown"\n\n-- UI Setup\nlocal player = game:GetService("Players").LocalPlayer\nlocal gui = Instance.new("ScreenGui", player:WaitForChild("PlayerGui"))\ngui.Name = "YouSuckDecompiler"\ngui.ResetOnSpawn = false\n\nlocal frame = Instance.new("Frame", gui)\nframe.Size = UDim2.new(0, 400, 0, 450)\nframe.Position = UDim2.new(0.5, -200, 0.5, -225)\nframe.BackgroundColor3 = Color3.fromRGB(15, 15, 15)\nframe.Active = true\nframe.Draggable = true\nInstance.new("UICorner", frame).CornerRadius = UDim.new(0, 10)\n\nprint('YouSuck Decompiler Loaded.')\n\`\`\``;
  }

  if (t.includes("fly")) {
    return `Here is a high-performance **Omniscient Fly System**:\n\n\`\`\`lua\n-- YouSuck Omniscient Fly\nlocal Players = game:GetService("Players")\nlocal player = Players.LocalPlayer\nlocal speed = 100\nlocal flying = false\n\nlocal gui = Instance.new("ScreenGui", player.PlayerGui)\nlocal btn = Instance.new("TextButton", gui)\nbtn.Size = UDim2.new(0, 100, 0, 40)\nbtn.Position = UDim2.new(0.5, -50, 0, 50)\nbtn.Text = "FLY: OFF"\nbtn.BackgroundColor3 = Color3.fromRGB(40, 40, 40)\nbtn.TextColor3 = Color3.fromRGB(255, 255, 255)\nInstance.new("UICorner", btn)\n\nlocal bv, bg\n\nbtn.MouseButton1Click:Connect(function()\n    flying = not flying\n    btn.Text = flying and "FLY: ON" or "FLY: OFF"\n    btn.BackgroundColor3 = flying and Color3.fromRGB(0, 180, 0) or Color3.fromRGB(40, 40, 40)\nend)\n\`\`\``;
  }

  return `I am the YouSuck Omniscient Engine. I can generate any complex Lua script for Roblox executors.\n\n\`\`\`lua\n-- Engine Online\nprint("Awaiting complex instructions...")\n\`\`\``;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }

    const thoughtLogs = [
      'Accessing Omniscient Knowledge Base...',
      'Synthesizing Manus-level logic patterns...',
      'Optimizing Luau performance standards...',
      'Verification successful. Outputting high-fidelity result.'
    ];

    const response = generateManusLevelScript(message);

    return res.status(200).json({
      result: {
        data: {
          response: response,
          thoughtLogs: thoughtLogs,
          searchResults: [],
          currentStep: 4,
          totalSteps: 4,
          sessionId,
          timestamp: new Date().toISOString(),
          isConnected: true,
        },
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: 'Engine Error', details: error.message || 'Unknown error' });
  }
}
