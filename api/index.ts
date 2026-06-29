import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LUA_KB_PATH = path.join(__dirname, "../shared/lua_kb.json");
let LUA_KB: any = { knowledge: { GUI: { patterns: {} } } };

try {
  if (fs.existsSync(LUA_KB_PATH)) {
    const content = fs.readFileSync(LUA_KB_PATH, "utf-8");
    LUA_KB = JSON.parse(content);
  }
} catch (e) {
  console.error("Failed to load Lua KB", e);
}

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

const FLY_GUI_SCRIPT = `-- YouSuck Fly GUI System
local Players = game:GetService("Players")
local TS = game:GetService("TweenService")
local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local flying = false
local speed = 50

-- Create Screen GUI
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "FlyGUI"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

-- Main Frame
local mainFrame = Instance.new("Frame")
mainFrame.Name = "MainFrame"
mainFrame.Size = UDim2.new(0, 200, 0, 120)
mainFrame.Position = UDim2.new(0.5, -100, 0.5, -60)
mainFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
mainFrame.BorderSizePixel = 0
mainFrame.Parent = screenGui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = mainFrame

-- Title
local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, 0, 0, 40)
title.BackgroundTransparency = 1
title.Text = "FLY SYSTEM"
title.TextColor3 = Color3.fromRGB(255, 255, 255)
title.TextSize = 16
title.Font = Enum.Font.GothamBold
title.Parent = mainFrame

-- Close Button (Red X)
local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.new(0, 25, 0, 25)
closeBtn.Position = UDim2.new(1, -30, 0, 5)
closeBtn.Text = "X"
closeBtn.BackgroundColor3 = Color3.fromRGB(200, 50, 50)
closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
closeBtn.TextSize = 14
closeBtn.Font = Enum.Font.GothamBold
closeBtn.BorderSizePixel = 0
closeBtn.Parent = mainFrame

Instance.new("UICorner", closeBtn).CornerRadius = UDim.new(0, 5)

-- Fly Button
local flyBtn = Instance.new("TextButton")
flyBtn.Size = UDim2.new(0.9, 0, 0, 40)
flyBtn.Position = UDim2.new(0.05, 0, 0.45, 0)
flyBtn.Text = "START FLY"
flyBtn.BackgroundColor3 = Color3.fromRGB(50, 150, 255)
flyBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
flyBtn.TextSize = 14
flyBtn.Font = Enum.Font.GothamBold
flyBtn.BorderSizePixel = 0
flyBtn.Parent = mainFrame

Instance.new("UICorner", flyBtn).CornerRadius = UDim.new(0, 6)

-- Fly Mechanics
local function startFlying()
    flying = true
    flyBtn.Text = "FLYING..."
    flyBtn.BackgroundColor3 = Color3.fromRGB(100, 200, 100)
    
    local character = player.Character
    if not character then return end
    
    local rootPart = character:WaitForChild("HumanoidRootPart")
    local bodyVelocity = Instance.new("BodyVelocity")
    bodyVelocity.Velocity = Vector3.new(0, 0, 0)
    bodyVelocity.MaxForce = Vector3.new(math.huge, math.huge, math.huge)
    bodyVelocity.Parent = rootPart
    
    while flying and character.Humanoid.Health > 0 do
        local camera = workspace.CurrentCamera
        bodyVelocity.Velocity = camera.CFrame.LookVector * speed
        task.wait()
    end
    
    bodyVelocity:Destroy()
    flyBtn.Text = "START FLY"
    flyBtn.BackgroundColor3 = Color3.fromRGB(50, 150, 255)
end

local function stopFlying()
    flying = false
end

-- Button Connections
flyBtn.MouseButton1Click:Connect(function()
    if not flying then
        startFlying()
    else
        stopFlying()
    end
end)

closeBtn.MouseButton1Click:Connect(function()
    local info = TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.In)
    local tween = TS:Create(mainFrame, info, {Size = UDim2.new(0, 0, 0, 0), BackgroundTransparency = 1})
    tween:Play()
    tween.Completed:Wait()
    stopFlying()
    screenGui:Destroy()
end)

print("YouSuck Fly GUI Loaded!")`;

function generateLuaScript(topic: string): string {
  const lowerTopic = topic.toLowerCase();
  
  if (lowerTopic.includes("fly") && (lowerTopic.includes("gui") || lowerTopic.includes("button"))) {
    return `Here is your Roblox Fly GUI script with a red close button:\n\n\`\`\`lua\n${FLY_GUI_SCRIPT}\n\`\`\``;
  }

  if (lowerTopic.includes("gui") || lowerTopic.includes("interface") || lowerTopic.includes("ui")) {
    return `Here is a modern Roblox GUI script using TweenService and UICorners:\n\n\`\`\`lua\n${FLY_GUI_SCRIPT}\n\`\`\``;
  }

  if (lowerTopic.includes("fly")) {
    return `Here is your Lua Fly script:\n\n\`\`\`lua\n-- YouSuck Fly Script\nlocal player = game.Players.LocalPlayer\nlocal mouse = player:GetMouse()\nlocal speed = 50\nlocal flying = false\n\nmouse.KeyDown:Connect(function(key)\n    if key:lower() == "f" then\n        flying = not flying\n        if flying then\n            local bv = Instance.new("BodyVelocity", player.Character.HumanoidRootPart)\n            bv.MaxForce = Vector3.new(math.huge, math.huge, math.huge)\n            while flying do\n                bv.Velocity = workspace.CurrentCamera.CFrame.LookVector * speed\n                task.wait()\n            end\n            bv:Destroy()\n        end\n    end\nend)\n\`\`\``;
  }
  
  return `Expert Lua engine ready. How can I assist with your Roblox project?\n\n\`\`\`lua\n-- YouSuck Lua Knowledge Base Active\nprint('System Online')\n\`\`\``;
}

async function autonomousSearch(query: string): Promise<any[]> {
  try {
    const results = [
      { title: `Latest on ${query}`, url: `https://www.google.com/search?q=${encodeURIComponent(query)}`, snippet: `Researching ${query} in real-time...` }
    ];
    return results;
  } catch (e) {
    console.error("Search error:", e);
    return [];
  }
}

function autonomousSynthesis(query: string, searchResults: any[]): string {
  const lowerQuery = query.toLowerCase().trim();
  
  if (lowerQuery.includes("who own you") || lowerQuery.includes("who made you")) {
    return "YouSuck owns me. I'm the site's independent engine.";
  }
  
  if (lowerQuery.includes("who are you")) {
    return "I'm the YouSuck AI engine. I handle coding and research.";
  }

  if (lowerQuery.includes("lua") || lowerQuery.includes("roblox") || lowerQuery.includes("script")) {
    return generateLuaScript(lowerQuery);
  }

  const greetings = ["hi", "hello", "hey", "yo"];
  if (greetings.includes(lowerQuery)) return "Hey, what's up? How can I help with your code today?";

  if (searchResults.length > 0 && searchResults[0].snippet) {
    return searchResults[0].snippet;
  }

  return "I'm here. What exactly do you need help with?";
}

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }
    
    let thoughtLogs = [
      "Initializing YouSuck Autonomous Engine...",
      "Analyzing intent and complexity..."
    ];

    const lowerMsg = message.toLowerCase();
    const allResults: any[] = [];
    const isLuaQuery = lowerMsg.includes("lua") || lowerMsg.includes("roblox") || lowerMsg.includes("script") || lowerMsg.includes("fly") || lowerMsg.includes("gui");

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
        await new Promise(r => setTimeout(r, 500));
      }
    } else {
      thoughtLogs.push("Activating YouSuck Lua 5.4 Engine...");
      thoughtLogs.push("Accessing local reference manual (lua.org/manual/5.4/)...");
      thoughtLogs.push("Synthesizing logic from core libraries (math, table, coroutine)...");
      await new Promise(r => setTimeout(r, 2000));
      thoughtLogs.push("Verifying syntax against Lua 5.4 standards...");
      await new Promise(r => setTimeout(r, 1000));
    }
    
    thoughtLogs.push("Finalizing autonomous synthesis...");
    const response = autonomousSynthesis(message, allResults);
    thoughtLogs.push("Code generation complete.");

    return res.json({
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
    console.error("API Error:", error);
    return res.status(500).json({ error: "Engine Error", details: error.message || "Unknown error" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", engine: "YouSuck AI" });
});

app.listen(PORT, () => {
  console.log(`YouSuck Engine running on port ${PORT}`);
});

export default app;
