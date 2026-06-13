const ALLOWED_IPS = ["24.49.252.230"];
const PASSWORD = "Tocson123";

const LUA_SCRIPT_CONTENT = `
local Players = game:GetService("Players")
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

if game.PlaceId == 79268393072444 then
    print("Correct Place ID! Loading script...")
    toast("Correct Game! Launching Script...", C.Success, 5)
    task.wait(1)
    loadstring(game:HttpGet("https://pastebin.com/raw/e8cVpx8u"))()
else
    print("Wrong Place ID: " .. tostring(game.PlaceId))
    toast("Wrong Game! Not Supported.", C.Error, 5)
end
`;

const ACCESS_DENIED_HTML = (detectedIp) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Access Denied</title>
  <style>
    @import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      font-family: \'Inter\', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #ffffff;
      overflow: hidden;
      position: relative;
    }
    .base-gradient {
      position: fixed; inset: 0;
      background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.08) 0%, transparent 50%),
                  linear-gradient(to bottom, #050508 0%, #0a0a0f 100%);
      z-index: 0;
    }
    .grid-bg {
      position: fixed; inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      z-index: 1;
    }
    .dot-accents {
      position: fixed; inset: 0;
      background-image: radial-gradient(rgba(34,211,238,0.15) 1px, transparent 1px);
      background-size: 60px 60px;
      background-position: 30px 30px;
      z-index: 2;
    }
    .vignette {
      position: fixed; inset: 0;
      background: radial-gradient(ellipse at center, transparent 0%, rgba(5,5,8,0.4) 100%);
      z-index: 3;
    }
    .scanlines {
      position: fixed; inset: 0;
      pointer-events: none;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
      z-index: 4;
    }
    #particleCanvas {
      position: fixed; inset: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      opacity: 0.6;
      z-index: 5;
    }
    .top-highlight {
      position: fixed; top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent);
      box-shadow: 0 0 20px rgba(34,211,238,0.3);
      pointer-events: none;
      z-index: 6;
    }
    .container {
      position: relative; z-index: 10;
      max-width: 48rem; margin: 0 auto;
      padding: 0 1.5rem; text-align: center;
      opacity: 0; transform: translateY(2rem);
      animation: fadeInUp 0.7s ease-out forwards;
    }
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
    .badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; border-radius: 9999px;
      background: rgba(34,211,238,0.2);
      border: 1px solid rgba(34,211,238,0.3);
      margin-bottom: 1.5rem;
      box-shadow: 0 0 20px rgba(34,211,238,0.15);
    }
    .badge span {
      font-size: 0.875rem; font-weight: 600;
      letter-spacing: 0.15em; color: #22d3ee;
      text-transform: uppercase;
    }
    h1 {
      font-size: clamp(2.25rem, 5vw, 3.75rem);
      margin-bottom: 1.25rem;
      line-height: 1.2; letter-spacing: -0.025em;
    }
    h1 .light { font-weight: 300; color: #ffffff; }
    h1 .bold { font-weight: 600; color: #ffffff; }
    .description {
      font-size: clamp(1rem, 2vw, 1.125rem);
      color: #a1a1aa; max-width: 36rem;
      margin: 0 auto 2rem auto;
      font-weight: 300; line-height: 1.6;
    }
    .button-group {
      display: flex; flex-direction: column;
      gap: 0.75rem; align-items: center; justify-content: center;
    }
    @media (min-width: 640px) { .button-group { flex-direction: row; } }
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1.5rem; border-radius: 0.5rem;
      font-weight: 500; font-size: 0.875rem;
      text-decoration: none; transition: all 0.3s ease; border: 1px solid;
    }
    .btn-primary {
      background: rgba(34,211,238,0.1);
      border-color: rgba(34,211,238,0.3); color: #22d3ee;
    }
    .btn-primary:hover {
      background: rgba(34,211,238,0.2);
      box-shadow: 0 0 20px rgba(34,211,238,0.2);
    }
    .icon { width: 1rem; height: 1rem; }
  </style>
</head>
<body>
  <div class="base-gradient"></div>
  <div class="grid-bg"></div>
  <div class="dot-accents"></div>
  <canvas id="particleCanvas"></canvas>
  <div class="vignette"></div>
  <div class="scanlines"></div>
  <div class="top-highlight"></div>
  <div class="container">
    <div class="badge"><span>403 Error</span></div>
    <h1><span class="light">Access </span><span class="bold">Denied</span></h1>
    <p class="description">You don\'t have permission to access this resource. Your IP: <span id="detected-ip">${detectedIp}</span></p>
    <div class="button-group">
      <a href="https://sixsense.cloud" class="btn btn-primary">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Return Home</span>
      </a>
    </div>
  </div>
  <script>
    (function() {
      const canvas = document.getElementById(\'particleCanvas\');
      if (!canvas) return;
      const ctx = canvas.getContext(\'2d\');
      if (!ctx) return;
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
        particles.forEach(function(p) {
          p.x += p.speedX; p.y += p.speedY; p.pulse += p.pulseSpeed;
          if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
          const o = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = \'rgba(34,211,238,\' + o + \')\'; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = \'rgba(34,211,238,\' + (o * 0.1) + \')\'; ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
              ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = \'rgba(34,211,238,\' + (0.03 * (1 - dist/150)) + \')\';
              ctx.lineWidth = 0.5; ctx.stroke();
            }
          }
        }
        requestAnimationFrame(animate);
      }
      resize(); createParticles(); animate();
      window.addEventListener(\'resize\', function() { resize(); createParticles(); });
    })();
  </script>
</body>
</html>`;

const LOGIN_HTML = (detectedIp, errorMessage = \'\') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Login Required</title>
  <style>
    @import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      font-family: \'Inter\', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #ffffff;
      overflow: hidden;
      position: relative;
    }
    .base-gradient {
      position: fixed; inset: 0;
      background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.08) 0%, transparent 50%),
                  linear-gradient(to bottom, #050508 0%, #0a0a0f 100%);
      z-index: 0;
    }
    .grid-bg {
      position: fixed; inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      z-index: 1;
    }
    .dot-accents {
      position: fixed; inset: 0;
      background-image: radial-gradient(rgba(34,211,238,0.15) 1px, transparent 1px);
      background-size: 60px 60px;
      background-position: 30px 30px;
      z-index: 2;
    }
    .vignette {
      position: fixed; inset: 0;
      background: radial-gradient(ellipse at center, transparent 0%, rgba(5,5,8,0.4) 100%);
      z-index: 3;
    }
    .scanlines {
      position: fixed; inset: 0;
      pointer-events: none;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
      z-index: 4;
    }
    #particleCanvas {
      position: fixed; inset: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      opacity: 0.6;
      z-index: 5;
    }
    .top-highlight {
      position: fixed; top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent);
      box-shadow: 0 0 20px rgba(34,211,238,0.3);
      pointer-events: none;
      z-index: 6;
    }
    .container {
      position: relative; z-index: 10;
      max-width: 48rem; margin: 0 auto;
      padding: 0 1.5rem; text-align: center;
      opacity: 0; transform: translateY(2rem);
      animation: fadeInUp 0.7s ease-out forwards;
    }
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
    .badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; border-radius: 9999px;
      background: rgba(34,211,238,0.2);
      border: 1px solid rgba(34,211,238,0.3);
      margin-bottom: 1.5rem;
      box-shadow: 0 0 20px rgba(34,211,238,0.15);
    }
    .badge span {
      font-size: 0.875rem; font-weight: 600;
      letter-spacing: 0.15em; color: #22d3ee;
      text-transform: uppercase;
    }
    h1 {
      font-size: clamp(2.25rem, 5vw, 3.75rem);
      margin-bottom: 1.25rem;
      line-height: 1.2; letter-spacing: -0.025em;
    }
    h1 .light { font-weight: 300; color: #ffffff; }
    h1 .bold { font-weight: 600; color: #ffffff; }
    .description {
      font-size: clamp(1rem, 2vw, 1.125rem);
      color: #a1a1aa; max-width: 36rem;
      margin: 0 auto 2rem auto;
      font-weight: 300; line-height: 1.6;
    }
    .button-group {
      display: flex; flex-direction: column;
      gap: 0.75rem; align-items: center; justify-content: center;
    }
    @media (min-width: 640px) { .button-group { flex-direction: row; } }
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1.5rem; border-radius: 0.5rem;
      font-weight: 500; font-size: 0.875rem;
      text-decoration: none; transition: all 0.3s ease; border: 1px solid;
    }
    .btn-primary {
      background: rgba(34,211,238,0.1);
      border-color: rgba(34,211,238,0.3); color: #22d3ee;
    }
    .btn-primary:hover {
      background: rgba(34,211,238,0.2);
      box-shadow: 0 0 20px rgba(34,211,238,0.2);
    }
    .icon { width: 1rem; height: 1rem; }
    .password-form {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .password-form input[type="password"] {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(34,211,238,0.3);
      background: rgba(10,10,15,0.5);
      color: #ffffff;
      font-size: 1rem;
      width: 100%;
      max-width: 300px;
    }
    .password-form button {
      cursor: pointer;
      background: rgba(34,211,238,0.1);
      border-color: rgba(34,211,238,0.3); color: #22d3ee;
      padding: 0.75rem 1.5rem; border-radius: 0.5rem;
      font-weight: 500; font-size: 0.875rem;
      text-decoration: none; transition: all 0.3s ease; border: 1px solid;
    }
    .password-form button:hover {
      background: rgba(34,211,238,0.2);
      box-shadow: 0 0 20px rgba(34,211,238,0.2);
    }
    .error-message {
      color: #ef4444;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="base-gradient"></div>
  <div class="grid-bg"></div>
  <div class="dot-accents"></div>
  <canvas id="particleCanvas"></canvas>
  <div class="vignette"></div>
  <div class="scanlines"></div>
  <div class="top-highlight"></div>
  <div class="container">
    <div class="badge"><span>Login Required</span></div>
    <h1><span class="light">Enter </span><span class="bold">Password</span></h1>
    <p class="description">Please enter the password to access this resource. Your IP: <span id="detected-ip">${detectedIp}</span></p>
    ${errorMessage ? `<p class="error-message">${errorMessage}</p>` : \'\'}
    <form method="POST" class="password-form">
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Submit</button>
    </form>
  </div>
  <script>
    (function() {
      const canvas = document.getElementById(\'particleCanvas\');
      if (!canvas) return;
      const ctx = canvas.getContext(\'2d\');
      if (!ctx) return;
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
        particles.forEach(function(p) {
          p.x += p.speedX; p.y += p.speedY; p.pulse += p.pulseSpeed;
          if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
          const o = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = \'rgba(34,211,238,\' + o + \')\'; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = \'rgba(34,211,238,\' + (o * 0.1) + \')\'; ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
              ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = \'rgba(34,211,238,\' + (0.03 * (1 - dist/150)) + \')\';
              ctx.lineWidth = 0.5; ctx.stroke();
            }
          }
        }
        requestAnimationFrame(animate);
      }
      resize(); createParticles(); animate();
      window.addEventListener(\'resize\', function() { resize(); createParticles(); });
    })();
  </script>
</body>
</html>`;

module.exports = async (req, res) => {
  const { url, method, headers } = req;
  const { pathname } = new URL(url, `http://${headers.host}`);

  let ip = headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (ip) ip = ip.split(",")[0].trim();
  else ip = "Unknown";

  // Set cache control headers to prevent caching
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (pathname !== TARGET_PATH) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/html");
    return res.end(ACCESS_DENIED_HTML(ip));
  }

  // IP Whitelist check
  if (!ALLOWED_IPS.includes(ip)) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/html");
    return res.end(ACCESS_DENIED_HTML(ip));
  }

  let isAuthenticated = false;
  const cookieHeader = headers.cookie;
  if (cookieHeader && cookieHeader.includes(`password=${PASSWORD}`)) {
    isAuthenticated = true;
  }

  if (method === "POST") {
    let body = "";
    for await (const chunk of req) {
      body += chunk.toString();
    }
    const params = new URLSearchParams(body);
    const submittedPassword = params.get("password");

    if (submittedPassword === PASSWORD) {
      isAuthenticated = true;
      res.setHeader("Set-Cookie", `password=${PASSWORD}; Path=/; Max-Age=3600; HttpOnly; Secure`);
      res.setHeader("Content-Type", "text/plain");
      return res.end(LUA_SCRIPT_CONTENT);
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      return res.end(LOGIN_HTML(ip, "Incorrect password. Please try again."));
    }
  }

  if (isAuthenticated) {
    res.setHeader("Content-Type", "text/plain");
    return res.end(LUA_SCRIPT_CONTENT);
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    return res.end(LOGIN_HTML(ip));
  }
};
