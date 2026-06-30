const ALLOWED_IP = "24.49.252.230";
const SECRET_KEY = "YouSuck-UltraSecret-9921";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// ─── Script Lua servi après validation de la clé ──────────────────────────────
// Ce script tourne côté Roblox : il vérifie le PlaceId et charge le bon script.
const LUA_SCRIPT = `local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local Player = Players.LocalPlayer

local C = {
    Surface = Color3.fromRGB(15, 15, 15),
    Border = Color3.fromRGB(38, 38, 38),
    Primary = Color3.fromRGB(1, 168, 225),
    Text = Color3.fromRGB(240, 240, 240),
    TextMid = Color3.fromRGB(150, 150, 150),
    Success = Color3.fromRGB(34, 197, 94),
    Error = Color3.fromRGB(239, 68, 68),
}

local function tw(obj, goal, t, style, dir)
    TweenService:Create(obj, TweenInfo.new(t or 0.18, style or Enum.EasingStyle.Quart, dir or Enum.EasingDirection.Out), goal):Play()
end
local function corner(p, r) local c = Instance.new("UICorner", p) c.CornerRadius = UDim.new(0, r or 6) return c end
local function stroke(p, col, thick) local s = Instance.new("UIStroke", p) s.Color = col or C.Border s.Thickness = thick or 1 return s end
local function frm(parent, props)
    local f = Instance.new("Frame", parent)
    f.BorderSizePixel = 0
    for k, v in pairs(props) do f[k] = v end
    return f
end
local function lbl(parent, props)
    local l = Instance.new("TextLabel", parent)
    l.BackgroundTransparency = 1
    l.BorderSizePixel = 0
    for k, v in pairs(props) do l[k] = v end
    return l
end

local Gui = Instance.new("ScreenGui")
Gui.Name = "ToastGui"
Gui.ResetOnSpawn = false
Gui.IgnoreGuiInset = true
Gui.DisplayOrder = 999
Gui.Parent = Player:WaitForChild("PlayerGui")

local function toast(msg, col, duration)
    col = col or C.Primary; duration = duration or 3
    local T = frm(Gui, {
        Size = UDim2.new(0, 260, 0, 44),
        Position = UDim2.new(0.5, -130, 1, 10),
        BackgroundColor3 = C.Surface,
        ZIndex = 20,
    })
    corner(T, 8); stroke(T, col, 1)
    local Acc = frm(T, {Size=UDim2.new(0,3,1,-16), Position=UDim2.new(0,7,0,8), BackgroundColor3=col, ZIndex=21})
    corner(Acc, 2)
    lbl(T, {Size=UDim2.new(1,-22,1,0), Position=UDim2.new(0,18,0,0), Text=msg, TextColor3=C.Text, TextSize=12, Font=Enum.Font.GothamBold, TextXAlignment=Enum.TextXAlignment.Left, ZIndex=22})
    tw(T, {Position=UDim2.new(0.5,-130,1,-54)}, 0.35, Enum.EasingStyle.Back)
    task.delay(duration, function()
        tw(T, {Position=UDim2.new(0.5,-130,1,10), BackgroundTransparency=1}, 0.3)
        task.delay(0.35, function() T:Destroy() end)
    end)
end

-- Table des jeux supportés : PlaceId => URL du script
local GAMES = {
    [79268393072444] = "https://pastebin.com/raw/e8cVpx8u",
    -- Ajoute d'autres jeux ici :
    -- [AUTRE_PLACE_ID] = "https://ton-autre-script.com/raw",
}

local placeId = game.PlaceId
local scriptUrl = GAMES[placeId] or "https://pastebin.com/raw/e8cVpx8u" -- Default script for all games

print("[YouSuck] Place ID: " .. tostring(placeId) .. " — Loading script...")
toast("Launching Script...", C.Success, 5)
task.wait(1)
local ok, err = pcall(function()
    loadstring(game:HttpGet(scriptUrl))()
end)
if not ok then
    warn("[YouSuck] Error loading script: " .. tostring(err))
    toast("Script load error. Check output.", C.Error, 5)
end
`;

export default async function handler(req, res) {
    try {
        const authHeader = req.headers["x-secret-auth"] || "";
        const userAgent = req.headers["user-agent"] || "";
        const clientIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
        const actualIp = typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : clientIp;

        const isRoblox = userAgent.toLowerCase().includes("roblox");
        const isMe = actualIp.includes(ALLOWED_IP);
        const isAuthorized = authHeader === SECRET_KEY || isRoblox || isMe;

        if (isAuthorized) {
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
            return res.status(200).send(LUA_SCRIPT);
        }

        // Log unauthorized attempt
        try {
            await supabase.from('page_views').insert({
                ip_hash: actualIp,
                path: '/yousuck.lua',
                user_agent: userAgent
            });
        } catch (e) {}

        const accessDeniedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Access Denied</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0f; font-family: 'Inter', sans-serif; color: #ffffff; overflow: hidden; position: relative; }
            .base-gradient { position: fixed; inset: 0; background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.08) 0%, transparent 50%), linear-gradient(to bottom, #050508 0%, #0a0a0f 100%); z-index: 0; }
            .grid-bg { position: fixed; inset: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px); background-size: 60px 60px; z-index: 1; }
            .dot-accents { position: fixed; inset: 0; background-image: radial-gradient(rgba(34, 211, 238, 0.15) 1px, transparent 1px); background-size: 60px 60px; background-position: 30px 30px; z-index: 2; }
            .vignette { position: fixed; inset: 0; background: radial-gradient(ellipse at center, transparent 0%, rgba(5, 5, 8, 0.4) 100%); z-index: 3; }
            .scanlines { position: fixed; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px); z-index: 4; }
            #particleCanvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.6; z-index: 5; }
            .container { position: relative; z-index: 10; text-align: center; animation: fadeInUp 0.7s ease-out forwards; }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(2rem); } to { opacity: 1; transform: translateY(0); } }
            .logo { width: 120px; height: 120px; margin-bottom: 1.5rem; object-fit: contain; }
            h1 { font-size: clamp(2.25rem, 5vw, 3.75rem); margin-bottom: 1.5rem; line-height: 1.2; }
            h1 .light { font-weight: 300; }
            h1 .bold { font-weight: 600; color: #22d3ee; }
            .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; text-decoration: none; transition: all 0.3s ease; border: 1px solid rgba(34, 211, 238, 0.3); background: rgba(34, 211, 238, 0.1); color: #22d3ee; }
            .btn:hover { background: rgba(34, 211, 238, 0.2); box-shadow: 0 0 20px rgba(34, 211, 238, 0.2); }
            .ip-info { position: fixed; bottom: 1rem; right: 1rem; font-size: 0.7rem; color: rgba(255, 255, 255, 0.2); z-index: 20; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="base-gradient"></div>
          <div class="grid-bg"></div>
          <div class="dot-accents"></div>
          <canvas id="particleCanvas"></canvas>
          <div class="vignette"></div>
          <div class="scanlines"></div>
          <div class="container">
            <img src="${LOGO_URL}" alt="Logo" class="logo">
            <h1><span class="light">Access </span><span class="bold">Denied</span></h1>
            <a href="https://yoursuck.vercel.app/" class="btn">Return Home</a>
          </div>
          <div class="ip-info">ID: ${actualIp}</div>
          <script>
            (function() {
              const canvas = document.getElementById('particleCanvas');
              const ctx = canvas.getContext('2d');
              let particles = [];
              function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
              function createParticles() {
                const count = Math.min(50, Math.floor(window.innerWidth / 30));
                particles = [];
                for (let i = 0; i < count; i++) {
                  particles.push({
                    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.3, speedY: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.5 + 0.1,
                    pulse: Math.random() * Math.PI * 2, pulseSpeed: Math.random() * 0.02 + 0.01
                  });
                }
              }
              function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                  p.x += p.speedX; p.y += p.speedY; p.pulse += p.pulseSpeed;
                  if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
                  if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
                  const op = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
                  ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                  ctx.fillStyle = "rgba(34, 211, 238, " + op + ")"; ctx.fill();
                });
                requestAnimationFrame(animate);
              }
              resize(); createParticles(); animate();
              window.addEventListener('resize', () => { resize(); createParticles(); });
            })();
          </script>
        </body>
        </html>`;

        res.setHeader("Content-Type", "text/html");
        return res.status(403).send(accessDeniedHtml);
    } catch (error) {
        return res.status(500).send("Internal Server Error: " + error.message);
    }
}
