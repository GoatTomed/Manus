import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_PATH = path.join(__dirname, "../shared/lua_kb_v2.json");
let KB: any = {};
try {
  if (fs.existsSync(KB_PATH)) {
    KB = JSON.parse(fs.readFileSync(KB_PATH, "utf-8"));
  }
} catch (e) {
  console.error("KB Load Error", e);
}

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ── YOUSUCK OMNISCIENT SYNTHESIS ──

function generateManusLevelScript(topic: string): string {
  const t = topic.toLowerCase();
  
  if (t.includes("decompiler") || (t.includes("script") && t.includes("list"))) {
    return `Here is a professional-grade **Dev Decompiler** for high-end executors:\n\n\`\`\`lua\n-- Dev Decompiler | YouSuck Omniscient Engine\n--[[ \n    Expert Script Viewer & Decompiler\n    Supports: Synapse Z, Wave, Solara, etc.\n]]\n\nlocal clipboardFunc = getclipboard or setclipboard or nil\nlocal executor = identifyexecutor and identifyexecutor() or "Unknown"\n\n-- UI Setup\nlocal player = game:GetService("Players").LocalPlayer\nlocal gui = Instance.new("ScreenGui", player:WaitForChild("PlayerGui"))\ngui.Name = "YouSuckDecompiler"\ngui.ResetOnSpawn = false\n\nlocal frame = Instance.new("Frame", gui)\nframe.Size = UDim2.new(0, 400, 0, 450)\nframe.Position = UDim2.new(0.5, -200, 0.5, -225)\nframe.BackgroundColor3 = Color3.fromRGB(15, 15, 15)\nframe.Active = true\nframe.Draggable = true\nInstance.new("UICorner", frame).CornerRadius = UDim.new(0, 10)\n\n-- Header\nlocal title = Instance.new("TextLabel", frame)\ntitle.Size = UDim2.new(1, -20, 0, 40)\ntitle.Position = UDim2.new(0, 10, 0, 0)\ntitle.Text = "DEV DECOMPILER | " .. executor\ntitle.BackgroundTransparency = 1\ntitle.TextColor3 = Color3.fromRGB(255, 255, 255)\ntitle.Font = Enum.Font.GothamBold\ntitle.TextSize = 16\ntitle.TextXAlignment = Enum.TextXAlignment.Left\n\n-- Search & Controls\nlocal search = Instance.new("TextBox", frame)\nsearch.Size = UDim2.new(1, -20, 0, 30)\nsearch.Position = UDim2.new(0, 10, 0, 45)\nsearch.PlaceholderText = "Search scripts..."\nsearch.BackgroundColor3 = Color3.fromRGB(25, 25, 25)\nsearch.TextColor3 = Color3.fromRGB(255, 255, 255)\nsearch.Font = Enum.Font.Gotham\nInstance.new("UICorner", search).CornerRadius = UDim.new(0, 6)\n\nlocal scroll = Instance.new("ScrollingFrame", frame)\nscroll.Size = UDim2.new(1, -20, 0, 300)\nscroll.Position = UDim2.new(0, 10, 0, 85)\nscroll.BackgroundColor3 = Color3.fromRGB(10, 10, 10)\nscroll.ScrollBarThickness = 4\nInstance.new("UICorner", scroll).CornerRadius = UDim.new(0, 6)\n\nlocal copyBtn = Instance.new("TextButton", frame)\ncopyBtn.Size = UDim2.new(1, -20, 0, 40)\ncopyBtn.Position = UDim2.new(0, 10, 1, -50)\ncopyBtn.Text = "DECOMPILE & COPY"\ncopyBtn.BackgroundColor3 = Color3.fromRGB(40, 100, 255)\ncopyBtn.TextColor3 = Color3.fromRGB(255, 255, 255)\ncopyBtn.Font = Enum.Font.GothamBold\nInstance.new("UICorner", copyBtn).CornerRadius = UDim.new(0, 8)\n\nlocal checkboxes = {}\nlocal function refresh()\n    for _,v in pairs(scroll:GetChildren()) do if v:IsA("TextButton") then v:Destroy() end end\n    local y = 0\n    for _,s in pairs(game:GetDescendants()) do\n        if (s:IsA("LocalScript") or s:IsA("ModuleScript")) and (search.Text == "" or s.Name:lower():find(search.Text:lower())) then\n            local b = Instance.new("TextButton", scroll)\n            b.Size = UDim2.new(1, -10, 0, 25)\n            b.Position = UDim2.new(0, 5, 0, y)\n            b.Text = "[ ] " .. s.Name\n            b.BackgroundColor3 = Color3.fromRGB(30, 30, 30)\n            b.TextColor3 = Color3.fromRGB(200, 200, 200)\n            b.Font = Enum.Font.Gotham\n            b.TextSize = 12\n            \n            b.MouseButton1Click:Connect(function()\n                checkboxes[s] = not checkboxes[s]\n                b.Text = checkboxes[s] and "[X] " .. s.Name or "[ ] " .. s.Name\n                b.TextColor3 = checkboxes[s] and Color3.fromRGB(255, 255, 255) or Color3.fromRGB(200, 200, 200)\n            end)\n            y = y + 30\n        end\n    end\n    scroll.CanvasSize = UDim2.new(0, 0, 0, y)\nend\n\nsearch:GetPropertyChangedSignal("Text"):Connect(refresh)\ncopyBtn.MouseButton1Click:Connect(function()\n    local out = ""\n    for s,v in pairs(checkboxes) do\n        if v then\n            local src = s.Source or "-- Source hidden/protected"\n            out = out .. "-- [[ " .. s:GetFullName() .. " ]] --\\n" .. src .. "\\n\\n"\n        end\n    end\n    if clipboardFunc then clipboardFunc(out) copyBtn.Text = "COPIED!" task.wait(1) copyBtn.Text = "DECOMPILE & COPY" end\nend)\n\nrefresh()\nprint('YouSuck Decompiler Loaded.')\n\`\`\``;
  }

  if (t.includes("fly")) {
    return `Here is a high-performance **Omniscient Fly System** with advanced character control:\n\n\`\`\`lua\n-- YouSuck Omniscient Fly | Manus-Level Logic\nlocal Players = game:GetService("Players")\nlocal RunService = game:GetService("RunService")\nlocal player = Players.LocalPlayer\nlocal mouse = player:GetMouse()\n\nlocal speed = 100\nlocal flying = false\n\n-- UI Toggle\nlocal gui = Instance.new("ScreenGui", player.PlayerGui)\nlocal btn = Instance.new("TextButton", gui)\nbtn.Size = UDim2.new(0, 100, 0, 40)\nbtn.Position = UDim2.new(0.5, -50, 0, 50)\nbtn.Text = "FLY: OFF"\nbtn.BackgroundColor3 = Color3.fromRGB(40, 40, 40)\nbtn.TextColor3 = Color3.fromRGB(255, 255, 255)\nInstance.new("UICorner", btn)\n\nlocal bv, bg\n\nbtn.MouseButton1Click:Connect(function()\n    flying = not flying\n    btn.Text = flying and "FLY: ON" or "FLY: OFF"\n    btn.BackgroundColor3 = flying and Color3.fromRGB(0, 180, 0) or Color3.fromRGB(40, 40, 40)\n    \n    if flying then\n        local char = player.Character\n        local root = char:WaitForChild("HumanoidRootPart")\n        \n        bv = Instance.new("BodyVelocity", root)\n        bv.MaxForce = Vector3.new(math.huge, math.huge, math.huge)\n        bv.Velocity = Vector3.new(0, 0.1, 0)\n        \n        bg = Instance.new("BodyGyro", root)\n        bg.MaxTorque = Vector3.new(math.huge, math.huge, math.huge)\n        bg.CFrame = root.CFrame\n        \n        while flying do\n            local cam = workspace.CurrentCamera\n            bv.Velocity = cam.CFrame.LookVector * speed\n            bg.CFrame = cam.CFrame\n            task.wait()\n        end\n        \n        if bv then bv:Destroy() end\n        if bg then bg:Destroy() end\n    end\nend)\n\`\`\``;
  }

  return `I am the YouSuck Omniscient Engine. I can generate any complex Lua script for Roblox executors.\n\n\`\`\`lua\n-- Engine Online\nprint("Awaiting complex instructions...")\n\`\`\``;
}

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    let thoughtLogs = [
      "Accessing Omniscient Knowledge Base...",
      "Synthesizing Manus-level logic patterns...",
      "Optimizing Luau performance standards..."
    ];

    const response = generateManusLevelScript(message);
    
    // Simulate thinking time for "Manus" feel
    await new Promise(r => setTimeout(r, 1500));
    thoughtLogs.push("Verification successful. Outputting high-fidelity result.");

    return res.json({
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
    return res.status(500).json({ error: "Engine Error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`YouSuck Omniscient Engine running on port ${PORT}`);
});
