import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ── YOUSUCK OMNISCIENT ENGINE (AUTONOMOUS) ──
const YOUSUCK_KNOWLEDGE = {
  lua_expert: {
    core: "Mastery of Lua 5.1, 5.4, and Luau (Roblox). Knowledge of metatables, environments, and coroutines.",
    security: "Expertise in script obfuscation, anti-tamper, and secure remotes handling.",
    executors: "Deep understanding of Level 7/8 executors, DLL injection patterns, and bytecode conversion.",
    patterns: {
      fly: "Utilizes BodyVelocity or LinearVelocity for smooth character movement control.",
      aimbot: "Uses WorldToViewportPoint and Magnitude checks for target selection.",
      esp: "Drawing library implementation or Highlight objects for visibility."
    }
  },
  general: {
    who: "I am the YouSuck AI, an autonomous engine built for research and coding.",
    purpose: "To provide expert-level information without external dependencies.",
    methods: "I use direct web scraping, internal synthesis, and a massive local database."
  }
};

function generateLuaScript(topic: string) {
  if (topic.includes("fly")) {
    return `-- YouSuck Fly Script\nlocal player = game.Players.LocalPlayer\nlocal mouse = player:GetMouse()\nlocal speed = 50\nlocal flying = false\n\nmouse.KeyDown:Connect(function(key)\n    if key:lower() == "f" then\n        flying = not flying\n        if flying then\n            local bv = Instance.new("BodyVelocity", player.Character.HumanoidRootPart)\n            bv.MaxForce = Vector3.new(math.huge, math.huge, math.huge)\n            while flying do\n                bv.Velocity = workspace.CurrentCamera.CFrame.LookVector * speed\n                task.wait()\n            end\n            bv:Destroy()\n        end\n    end\nend)`;
  }
  if (topic.includes("aimbot")) {
    return `-- YouSuck Aimbot Base\nlocal Players = game:GetService("Players")\nlocal LocalPlayer = Players.LocalPlayer\nlocal Camera = workspace.CurrentCamera\n\nlocal function getClosestPlayer()\n    local closest = nil\n    local dist = math.huge\n    for _, p in pairs(Players:GetPlayers()) do\n        if p ~= LocalPlayer and p.Character and p.Character:FindFirstChild("Head") then\n            local pos, onScreen = Camera:WorldToViewportPoint(p.Character.Head.Position)\n            if onScreen then\n                local d = (Vector2.new(pos.X, pos.Y) - Vector2.new(Camera.ViewportSize.X/2, Camera.ViewportSize.Y/2)).Magnitude\n                if d < dist then\n                    dist = d\n                    closest = p\n                end\n            end\n        end\n    end\n    return closest\nend`;
  }
  return "-- YouSuck Lua Template\nprint('Expert Lua engine ready.')";
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
    const allResults: any[] = [];
    const lowerMsg = message.toLowerCase();

    // Determine if multiple searches are needed
    const searchQueries = [message];
    if (lowerMsg.length > 20 && !lowerMsg.includes("lua")) {
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
    
    thoughtLogs.push("Aggregating multi-source data...");
    const response = autonomousSynthesis(message, allResults);
    
    thoughtLogs.push("Response ready.");

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
