const ALLOWED_IP = "24.49.252.230";
const SECRET_KEY = "YouSuck-UltraSecret-9921";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import axios from "axios";

const axiosFetcher = async (url, options) => {
  try {
    const response = await axios({
      url,
      method: options.method,
      headers: options.headers,
      data: options.body,
      timeout: 10000,
      validateStatus: () => true,
    });
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      json: async () => response.data,
      text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
    };
  } catch (error) {
    throw error;
  }
};

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: axiosFetcher,
    },
  }
);

export default async function handler(req, res) {
    try {
        const authHeader = req.headers["x-secret-auth"] || "";
        const userAgent = req.headers["user-agent"] || "";
        const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
        const actualIp = typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : clientIp;
        
        console.log(`[DEBUG] IP: ${actualIp}, UA: ${userAgent}, Auth: ${authHeader}`);

        const isRoblox = userAgent.toLowerCase().includes("roblox");
        const isMe = actualIp.includes(ALLOWED_IP);
        const isAuthorized = authHeader === SECRET_KEY || isRoblox || isMe;

        if (isAuthorized) {
            try {
                const filePath = path.join(process.cwd(), 'api', 'script.lua');
                const content = fs.readFileSync(filePath, 'utf8');
                res.setHeader("Content-Type", "text/plain; charset=utf-8");
                res.setHeader("Access-Control-Allow-Origin", "*");
                return res.status(200).send(content);
            } catch (err) {
                return res.status(500).send("-- Error loading script: " + err.message);
            }
        }

        // Log unauthorized attempt
        try {
            await supabase.from('page_views').insert({
                ip_hash: actualIp,
                path: '/scripts.lua',
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
            <!-- Logo removed -->
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
        console.error("Handler error:", error);
        return res.status(500).send("Internal Server Error: " + error.message);
    }
}
