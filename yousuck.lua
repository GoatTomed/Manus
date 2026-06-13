yo make the /yousuck.lua have an ip whitelist and ip block the only ip to allow should be 24.49.252.230 else make the page of the cloud worker appear and make sure the red main color become my site blue main color  const ALLOWED_IPS = ["24.49.252.230"];

const ACCESS_DENIED_HTML = (detectedIp) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Access Denied</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
      const canvas = document.getElementById('particleCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
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
          ctx.fillStyle = 'rgba(34,211,238,' + o + ')'; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34,211,238,' + (o * 0.1) + ')'; ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
              ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = 'rgba(34,211,238,' + (0.03 * (1 - dist/150)) + ')';
              ctx.lineWidth = 0.5; ctx.stroke();
            }
          }
        }
        requestAnimationFrame(animate);
      }
      resize(); createParticles(); animate();
      window.addEventListener('resize', function() { resize(); createParticles(); });
    })();
  </script>
</body>
</html>`;

export default {
  async fetch(request) {
        let ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || request.headers.get("X-Real-IP");
    if (ip) ip = ip.split(",")[0].trim();
    else ip = "Unknown";

    if (!ALLOWED_IPS.includes(ip)) {
            return new Response(ACCESS_DENIED_HTML(ip), {
        status: 403,
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    return fetch(request);
  },
};