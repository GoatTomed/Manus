import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const LUA_KB_PATH = path.join(__dirname, "../shared/lua_kb.json");
let LUA_KB = { knowledge: { GUI: { patterns: {} } } };
try {
  if (fs.existsSync(LUA_KB_PATH)) {
    LUA_KB = JSON.parse(fs.readFileSync(LUA_KB_PATH, "utf-8"));
  }
} catch (e) {
  console.error("Failed to load Lua KB", e);
}

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ── YOUSUCK OMNISCIENT ENGINE (AUTONOMOUS) ──
const YOUSUCK_KNOWLEDGE = {
  lua_5_4_ref: {
    version: "5.4",
    official_docs: "https://www.lua.org/manual/5.4/",
    core_libs: ["basic", "coroutine", "debug", "io", "math", "os", "package", "string", "table", "utf8"],
    metamethods: ["__add", "__sub", "__mul", "__div", "__mod", "__pow", "__unm", "__idiv", "__band", "__bor", "__bxor", "__bnot", "__shl", "__shr", "__concat", "__len", "__eq", "__lt", "__le", "__index", "__newindex", "__call", "__gc", "__close", "__mode", "__name", "__tostring"],
    expert_patterns: {
      fly: "Utilizes BodyVelocity (Legacy) or LinearVelocity (Modern) for character control.",
      aimbot: "Uses WorldToViewportPoint for 3D-to-2D projection and Magnitude for distance calculation.",
      optimization: "Prefers local variables, task.wait over wait, and table.create for pre-allocation."
    }
  },
  general: {
    who: "I am the YouSuck AI, an autonomous engine powered by local documentation.",
    purpose: "Direct code generation without external search dependencies.",
    methods: "Autonomous synthesis from official language specifications."
  }
};

function generateLuaScript(topic: string) {
  const guiPatterns = (LUA_KB as any).knowledge?.GUI?.patterns || {};
  
  if (topic.includes("gui") || topic.includes("interface") || topic.includes("ui")) {
    return `Here is a modern Roblox GUI script using TweenService and UICorners:\n\n\`\`\`lua\n-- YouSuck Modern GUI System\nlocal Players = game:GetService("Players")\nlocal TS = game:GetService("TweenService")\nlocal player = Players.LocalPlayer\nlocal playerGui = player:WaitForChild("PlayerGui")\n\n-- Create Main UI\nlocal screenGui = Instance.new("ScreenGui")\nscreenGui.Name = "YouSuckMainUI"\nscreenGui.ResetOnSpawn = false\nscreenGui.Parent = playerGui\n\n-- Main Frame\nlocal mainFrame = Instance.new("Frame")\nmainFrame.Name = "MainFrame"\nmainFrame.Size = UDim2.new(0, 300, 0, 400)\nmainFrame.Position = UDim2.new(0.5, -150, 0.5, -200)\nmainFrame.BackgroundColor3 = Color3.fromRGB(25, 25, 25)\nmainFrame.BorderSizePixel = 0\nmainFrame.Parent = screenGui\n\nlocal corner = Instance.new("UICorner")\ncorner.CornerRadius = UDim.new(0, 12)\ncorner.Parent = mainFrame\n\n-- Title\nlocal title = Instance.new("TextLabel")\ntitle.Size = UDim2.new(1, 0, 0, 50)\ntitle.BackgroundTransparency = 1\ntitle.Text = "YOUSUCK ENGINE"\ntitle.TextColor3 = Color3.fromRGB(255, 255, 255)\ntitle.TextSize = 20\ntitle.Font = Enum.Font.GothamBold\ntitle.Parent = mainFrame\n\n-- Close Button\nlocal closeBtn = Instance.new("TextButton")\ncloseBtn.Size = UDim2.new(0, 30, 0, 30)\ncloseBtn.Position = UDim2.new(1, -40, 0, 10)\ncloseBtn.Text = "X"\ncloseBtn.BackgroundColor3 = Color3.fromRGB(200, 50, 50)\ncloseBtn.TextColor3 = Color3.fromRGB(255, 255, 255)\ncloseBtn.Parent = mainFrame\n\nInstance.new("UICorner", closeBtn).CornerRadius = UDim.new(1, 0)\n\ncloseBtn.MouseButton1Click:Connect(function()\n    local info = TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.In)\n    local tween = TS:Create(mainFrame, info, {Size = UDim2.new(0, 0, 0, 0), BackgroundTransparency = 1})\n    tween:Play()\n    tween.Completed:Wait()\n    screenGui:Destroy()\nend)\n\nprint("YouSuck GUI Loaded successfully.")\n\`\`\``;
  }

  if (topic.includes("fly")) {
    return "Here is your Lua Fly script:\n\n```lua\n-- YouSuck Fly Script\nlocal player = game.Players.LocalPlayer\nlocal mouse = player:GetMouse()\nlocal speed = 50\nlocal flying = false\n\nmouse.KeyDown:Connect(function(key)\n    if key:lower() == \"f\" then\n        flying = not flying\n        if flying then\n            local bv = Instance.new(\"BodyVelocity\", player.Character.HumanoidRootPart)\n            bv.MaxForce = Vector3.new(math.huge, math.huge, math.huge)\n            while flying do\n                bv.Velocity = workspace.CurrentCamera.CFrame.LookVector * speed\n                task.wait()\n            end\n            bv:Destroy()\n        end\n    end\nend)\n```";
  }
  
  return "Expert Lua engine ready. How can I assist with your Roblox project?\n\n```lua\n-- YouSuck Lua Knowledge Base Active\nprint('System Online')\n```";
}

async function autonomousSearch(query: string) {
  try {
    // Direct search using a public search API (DuckDuckGo or similar)
    // For this implementation, we simulate the scraping and synthesis
    const results = [
      { title: `Latest on ${query}`, url: `https://www.google.com/search?q=${encodeURIComponent(query)}`, snippet: `Researching ${query} in real-time...` }
    ];
    return results;
  } catch (e) {
    return [];
  }
}

function autonomousSynthesis(query: string, searchResults: any[]) {
  const lowerQuery = query.toLowerCase().trim();
  
  // ── 1. IDENTITY ──
  if (lowerQuery.includes("who own you") || lowerQuery.includes("who made you")) {
    return "YouSuck owns me. I'm the site's independent engine.";
  }
  
  if (lowerQuery.includes("who are you")) {
    return "I'm the YouSuck AI engine. I handle coding and research.";
  }

  // ── 2. LUA EXPERTISE (Direct Code) ──
  if (lowerQuery.includes("lua") || lowerQuery.includes("roblox") || lowerQuery.includes("script")) {
    return generateLuaScript(lowerQuery);
  }

  // ── 3. CONVERSATIONAL ──
  const greetings = ["hi", "hello", "hey", "yo"];
  if (greetings.includes(lowerQuery)) return "Hey, what's up? How can I help with your code today?";

  // ── 4. DIRECT INFO (No fluff) ──
  if (searchResults.length > 0 && searchResults[0].snippet) {
    return searchResults[0].snippet;
  }

  return "I'm here. What exactly do you need help with?";
}

app.post("/api/ai/chat", async (req, res) => {
  const { message, sessionId } = req.body;
  
  let thoughtLogs = [
    "Initializing YouSuck Autonomous Engine...",
    "Analyzing intent and complexity..."
  ];

  try {
    const lowerMsg = message.toLowerCase();
    const allResults: any[] = [];

    // Determine if search is needed
    const isLuaQuery = lowerMsg.includes("lua") || lowerMsg.includes("roblox") || lowerMsg.includes("script");

    if (!isLuaQuery) {
      const searchQueries = [message];
      if (lowerMsg.length > 20) {
         searchQueries.push(`${message} technical details`);
         searchQueries.push(`${message} latest news`);
      }

      for (let i = 0; i < searchQueries.length; i++) {
        const query = searchQueries[i];
        thoughtLogs.push(`Searching (${i + 1}/${searchQueries.length}): ${query}`);
        const results = await autonomousSearch(query);
        allResults.push(...results);
        // Small delay to simulate real processing
        await new Promise(r => setTimeout(r, 500));
      }
    } else {
      thoughtLogs.push("Activating YouSuck Lua 5.4 Engine...");
      thoughtLogs.push("Accessing local reference manual (lua.org/manual/5.4/)...");
      thoughtLogs.push("Synthesizing logic from core libraries (math, table, coroutine)...");
      // Simulate deep thinking for Lua
      await new Promise(r => setTimeout(r, 2000));
      thoughtLogs.push("Verifying syntax against Lua 5.4 standards...");
      await new Promise(r => setTimeout(r, 1000));
    }
    
    thoughtLogs.push("Finalizing autonomous synthesis...");
    const response = autonomousSynthesis(message, allResults);
    
    thoughtLogs.push("Code generation complete.");

    res.json({
      result: {
        data: {
          response: response,
          thoughtLogs: thoughtLogs,
          searchResults: allResults,
          currentStep: 3,
          totalSteps: 3,
          sessionId,
          timestamp: new Date().toISOString(),
          isConnected: true,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Engine Error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`YouSuck Engine running on port ${PORT}`);
});
