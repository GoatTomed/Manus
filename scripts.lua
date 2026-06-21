-- YouSuck Key System & Script Delivery
-- Secure key validation and IP-based access control

const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(",") || ["127.0.0.1", "localhost"];
const VALID_KEYS = {
  "ys_key_a1b2c3d4e5f6": { owner: "PlayerOne", roblox_id: "123456789", created: "2026-06-20", status: "active" },
  "ys_key_f6e5d4c3b2a1": { owner: "RoUser42", roblox_id: "987654321", created: "2026-06-19", status: "active" },
  "ys_key_9z8y7x6w5v4u": { owner: "xXDevXx", roblox_id: "555666777", created: "2026-06-18", status: "active" },
  "ys_key_demo_test": { owner: "DemoUser", roblox_id: "111222333", created: "2026-06-21", status: "demo" },
};

const ROBLOX_SCRIPT = `
-- YouSuck Roblox Executor Script v1.0
-- Secure key-based execution system

local KEY = "{KEY}"
local API_URL = "{API_URL}"
local HEARTBEAT_INTERVAL = 10 -- seconds

-- Validate key format
if not KEY or KEY:len() < 10 then
  error("Invalid key provided")
end

-- Get player info
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local Character = LocalPlayer.Character or LocalPlayer.CharacterAdded:Wait()

-- Get current game info
local PlaceId = game.PlaceId
local GameName = game:GetService("MarketplaceService"):GetProductInfo(PlaceId).Name or "Unknown Game"

-- Initialize heartbeat tracking
local LastHeartbeat = tick()

-- Send heartbeat to server
local function SendHeartbeat()
  local success, result = pcall(function()
    local HttpService = game:GetService("HttpService")
    local data = {
      key = KEY,
      roblox_id = LocalPlayer.UserId,
      roblox_name = LocalPlayer.Name,
      game_id = PlaceId,
      game_name = GameName,
      timestamp = os.time(),
      character_position = Character and Character:FindFirstChild("HumanoidRootPart") and Character.HumanoidRootPart.Position or Vector3.new(0, 0, 0),
    }
    
    local response = HttpService:PostAsync(
      API_URL .. "/api/heartbeat",
      HttpService:JSONEncode(data),
      Enum.HttpContentType.ApplicationJson
    )
    
    return response
  end)
  
  if not success then
    warn("[YouSuck] Heartbeat failed: " .. tostring(result))
  end
  
  LastHeartbeat = tick()
end

-- Send initial heartbeat
SendHeartbeat()

-- Setup periodic heartbeat
local HeartbeatConnection
HeartbeatConnection = game:GetService("RunService").Heartbeat:Connect(function()
  if tick() - LastHeartbeat >= HEARTBEAT_INTERVAL then
    SendHeartbeat()
  end
end)

-- Cleanup on player leave
Players.PlayerRemoving:Connect(function(player)
  if player == LocalPlayer then
    if HeartbeatConnection then
      HeartbeatConnection:Disconnect()
    end
  end
end)

print("[YouSuck] Executor initialized with key: " .. KEY:sub(1, 8) .. "...")
print("[YouSuck] Game: " .. GameName .. " (ID: " .. PlaceId .. ")")
print("[YouSuck] Player: " .. LocalPlayer.Name .. " (ID: " .. LocalPlayer.UserId .. ")")
`;

const KEY_VALIDATION_HTML = (key, keyData) => \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YouSuck - Key Validation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
      font-family: 'Space Grotesk', monospace;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      background: rgba(15, 15, 25, 0.8);
      border: 1px solid rgba(34, 211, 238, 0.3);
      border-radius: 12px;
      padding: 40px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(34, 211, 238, 0.1);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 30px;
    }
    .logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #00abff, #0088cc);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 20px;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .status {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }
    .status.active {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.5);
    }
    .status.demo {
      background: rgba(168, 85, 247, 0.2);
      color: #a855f7;
      border: 1px solid rgba(168, 85, 247, 0.5);
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-item {
      background: rgba(34, 211, 238, 0.05);
      border: 1px solid rgba(34, 211, 238, 0.2);
      border-radius: 8px;
      padding: 15px;
    }
    .info-label {
      font-size: 12px;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .info-value {
      font-size: 14px;
      color: #00abff;
      font-weight: 600;
      word-break: break-all;
    }
    .script-section {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(34, 211, 238, 0.2);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .script-title {
      font-size: 12px;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .script-code {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(34, 211, 238, 0.1);
      border-radius: 6px;
      padding: 12px;
      font-size: 11px;
      color: #00ff00;
      font-family: 'Courier New', monospace;
      overflow-x: auto;
      max-height: 200px;
      overflow-y: auto;
      line-height: 1.4;
    }
    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }
    .btn {
      flex: 1;
      padding: 12px 20px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }
    .btn-primary {
      background: linear-gradient(135deg, #00abff, #0088cc);
      color: white;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(34, 211, 238, 0.3);
    }
    .btn-secondary {
      background: rgba(34, 211, 238, 0.1);
      color: #00abff;
      border: 1px solid rgba(34, 211, 238, 0.3);
    }
    .btn-secondary:hover {
      background: rgba(34, 211, 238, 0.2);
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #a1a1aa;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">YS</div>
      <h1>YouSuck</h1>
    </div>
    
    <div class="status \${keyData.status}">\${keyData.status.toUpperCase()}</div>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Owner</div>
        <div class="info-value">\${keyData.owner}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Roblox ID</div>
        <div class="info-value">\${keyData.roblox_id}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Created</div>
        <div class="info-value">\${keyData.created}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Key Status</div>
        <div class="info-value">\${keyData.status === 'active' ? '✓ Active' : '◉ Demo'}</div>
      </div>
    </div>
    
    <div class="script-section">
      <div class="script-title">Roblox Executor Script</div>
      <div class="script-code" id="script-code"></div>
    </div>
    
    <div class="button-group">
      <button class="btn btn-primary" onclick="copyScript()">Copy Script</button>
      <button class="btn btn-secondary" onclick="downloadScript()">Download</button>
    </div>
    
    <div class="footer">
      <p>Key: \${key.substring(0, 12)}...</p>
      <p>Status: Valid & Active</p>
    </div>
  </div>
  
  <script>
    const scriptCode = \`${ROBLOX_SCRIPT.replace(/`/g, '\\`').replace(/"/g, '\\"')}\`;
    document.getElementById('script-code').textContent = scriptCode;
    
    function copyScript() {
      navigator.clipboard.writeText(scriptCode).then(() => {
        alert('Script copied to clipboard!');
      });
    }
    
    function downloadScript() {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(scriptCode));
      element.setAttribute('download', 'yousuck_executor.lua');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  </script>
</body>
</html>
\`;

const INVALID_KEY_HTML = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YouSuck - Invalid Key</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
      font-family: 'Space Grotesk', monospace;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      background: rgba(15, 15, 25, 0.8);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      padding: 40px;
      backdrop-filter: blur(10px);
      text-align: center;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #ef4444;
    }
    p {
      color: #a1a1aa;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #00abff, #0088cc);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(34, 211, 238, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✗</div>
    <h1>Invalid Key</h1>
    <p>The key you provided is not valid or has expired. Please check your key and try again.</p>
    <a href="/" class="btn">Return Home</a>
  </div>
</body>
</html>
\`;

export default function handler(req, res) {
  const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const { key } = req.query;

  // IP validation
  const isAllowedIP = ALLOWED_IPS.includes(clientIP) || ALLOWED_IPS.includes("*");
  
  // Key validation
  const keyData = VALID_KEYS[key];
  const isValidKey = !!keyData;

  if (!isAllowedIP) {
    return res.status(403).send(KEY_VALIDATION_HTML(key || "unknown", { owner: "Unknown", roblox_id: "N/A", created: "N/A", status: "invalid" }));
  }

  if (!isValidKey) {
    return res.status(400).send(INVALID_KEY_HTML);
  }

  // Return validated script with key injected
  const script = ROBLOX_SCRIPT.replace("{KEY}", key).replace("{API_URL}", process.env.API_URL || "http://localhost:3000");
  
  res.status(200).send(KEY_VALIDATION_HTML(key, keyData));
}
