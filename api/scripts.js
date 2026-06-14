const PASSWORD = "Tocson123";
const SECRET_KEY = "YouSuck-UltraSecret-9921";

import { Buffer } from "buffer";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    const authHeader = req.headers["x-secret-auth"] || "";
    const isAuthorized = authHeader === SECRET_KEY;

    const accessDeniedHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="robots" content="noindex, nofollow">
      <title>Access Denied | SIXSENSE</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          font-family: 'Inter', sans-serif;
          color: #ffffff;
          overflow: hidden;
          position: relative;
        }
        
        .base-gradient {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.08) 0%, transparent 50%),
                      linear-gradient(to bottom, #050508 0%, #0a0a0f 100%);
          z-index: 0;
        }
        
        .grid-bg {
          position: fixed;
          inset: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 1;
        }
        
        .dot-accents {
          position: fixed;
          inset: 0;
          background-image: radial-gradient(rgba(34, 211, 238, 0.15) 1px, transparent 1px);
          background-size: 60px 60px;
          background-position: 30px 30px;
          z-index: 2;
        }
        
        .vignette {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 0%, rgba(5, 5, 8, 0.4) 100%);
          z-index: 3;
        }
        
        .scanlines {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px);
          z-index: 4;
        }
        
        #particleCanvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.6;
          z-index: 5;
        }
        
        .container {
          position: relative;
          z-index: 10;
          max-width: 48rem;
          margin: 0 auto;
          padding: 0 1.5rem;
          text-align: center;
          animation: fadeInUp 0.7s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(2rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        h1 {
          font-size: clamp(2.25rem, 5vw, 3.75rem);
          margin-bottom: 1.25rem;
          line-height: 1.2;
          letter-spacing: -0.025em;
        }
        
        h1 .light { font-weight: 300; color: #ffffff; }
        h1 .bold { font-weight: 600; color: #ffffff; }
        
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
          justify-content: center;
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 1px solid;
          background: rgba(34, 211, 238, 0.1);
          border-color: rgba(34, 211, 238, 0.3);
          color: #22d3ee;
        }
        
        .btn:hover {
          background: rgba(34, 211, 238, 0.2);
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.2);
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
      <div class="container">
        <h1>
          <span class="light">Access </span><span class="bold">Denied</span>
        </h1>
        <div class="button-group">
          <a href="https://yoursuck.vercel.app/" class="btn">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span>Return Home</span>
          </a>
        </div>
      </div>
      <script>
        (function() {
          const canvas = document.getElementById('particleCanvas');
          const ctx = canvas.getContext('2d');
          let particles = [];
          function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
          }
          function createParticles() {
            const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));
            particles = [];
            for (let i = 0; i < particleCount; i++) {
              particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.1,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01
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
              ctx.fillStyle = \`rgba(34, 211, 238, \${op})\`; ctx.fill();
            });
            requestAnimationFrame(animate);
          }
          resize(); createParticles(); animate();
          window.addEventListener('resize', () => { resize(); createParticles(); });
        })();
      </script>
    </body>
    </html>`;

    const getLuaScript = () => {
        try {
            const filePath = path.join(process.cwd(), 'api', 'script.lua');
            return fs.readFileSync(filePath, 'utf8');
        } catch (err) {
            return "-- Error loading script: " + err.message;
        }
    };

    if (isAuthorized) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.status(200).send(getLuaScript());
    }

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(accessDeniedHtml);
}
