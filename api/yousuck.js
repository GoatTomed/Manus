const ALLOWED_IP = "86.245.79.138"; // Ton IP
const SECRET_KEY = "YouSuck-UltraSecret-9921";

import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    const authHeader = req.headers["x-secret-auth"] || "";
    const userAgent = req.headers["user-agent"] || "";
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    
    const isRoblox = userAgent.toLowerCase().includes("roblox");
    const isMe = clientIp.includes(ALLOWED_IP);
    const isAuthorized = authHeader === SECRET_KEY || isRoblox || isMe;

    const getLuaScript = () => {
        try {
            const filePath = path.join(process.cwd(), 'yousuck.lua');
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

    const accessDeniedHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Access Denied | SIXSENSE</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0f; font-family: 'Inter', sans-serif; color: #ffffff; overflow: hidden; }
        .base-gradient { position: fixed; inset: 0; background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.08) 0%, transparent 50%), linear-gradient(to bottom, #050508 0%, #0a0a0f 100%); z-index: 0; }
        .container { position: relative; z-index: 10; text-align: center; animation: fadeInUp 0.7s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(2rem); } to { opacity: 1; transform: translateY(0); } }
        h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 1.5rem; }
        h1 .light { font-weight: 300; }
        h1 .bold { font-weight: 600; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; text-decoration: none; transition: all 0.3s ease; border: 1px solid rgba(34, 211, 238, 0.3); background: rgba(34, 211, 238, 0.1); color: #22d3ee; }
        .btn:hover { background: rgba(34, 211, 238, 0.2); box-shadow: 0 0 20px rgba(34, 211, 238, 0.2); }
      </style>
    </head>
    <body>
      <div class="base-gradient"></div>
      <div class="container">
        <h1><span class="light">Access </span><span class="bold">Denied</span></h1>
        <a href="https://yoursuck.vercel.app/" class="btn">Return Home</a>
      </div>
    </body>
    </html>`;

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(accessDeniedHtml);
}
