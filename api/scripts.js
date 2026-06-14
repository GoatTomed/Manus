const PASSWORD = "YouSuckTocson";
const SECRET_KEY = "YouSuck-UltraSecret-9921";

import { Buffer } from "buffer";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    const authHeader = req.headers["x-secret-auth"] || "";
    const userAgent = req.headers["user-agent"] || "";
    const isRoblox = userAgent.toLowerCase().includes("roblox");
    const isAuthorized = authHeader === SECRET_KEY || isRoblox;

    const getLuaScript = () => {
        try {
            const filePath = path.join(process.cwd(), 'api', 'script.lua');
            return fs.readFileSync(filePath, 'utf8');
        } catch (err) {
            return "-- Error loading script: " + err.message;
        }
    };

    // SI ROBLOX OU CLÉ SECRÈTE : Accès direct
    if (isAuthorized) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.status(200).send(getLuaScript());
    }

    // GESTION DU MOT DE PASSE POUR TOI (Navigateur)
    if (req.method === "POST") {
        let body = "";
        await new Promise((resolve) => {
            req.on("data", (chunk) => { body += chunk; });
            req.on("end", resolve);
        });
        const params = new URLSearchParams(body);
        const password = params.get("password");
        if (password === PASSWORD) {
            const authValue = Buffer.from(PASSWORD).toString("base64");
            res.setHeader("Set-Cookie", "auth=" + authValue + "; Path=/; HttpOnly; Max-Age=3600");
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            return res.status(200).send(getLuaScript());
        }
    }

    const cookies = req.headers.cookie || "";
    const authCookie = Buffer.from(PASSWORD).toString("base64");
    if (cookies.indexOf("auth=" + authCookie) !== -1) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.status(200).send(getLuaScript());
    }

    // PAGE ACCESS DENIED AVEC LOGIN CACHÉ
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
        h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 2rem; }
        h1 .light { font-weight: 300; }
        h1 .bold { font-weight: 600; }
        .login-box { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 2rem; border-radius: 1.5rem; backdrop-filter: blur(10px); width: 320px; margin: 0 auto; }
        input { width: 100%; padding: 0.75rem; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(34, 211, 238, 0.2); border-radius: 0.5rem; color: white; margin-bottom: 1rem; outline: none; }
        input:focus { border-color: #22d3ee; }
        button { width: 100%; padding: 0.75rem; background: #22d3ee; border: none; border-radius: 0.5rem; color: #000; font-weight: 600; cursor: pointer; transition: 0.3s; }
        button:hover { background: #0ea5e9; transform: translateY(-2px); }
        .footer { margin-top: 2rem; font-size: 0.8rem; color: rgba(255, 255, 255, 0.3); }
      </style>
    </head>
    <body>
      <div class="base-gradient"></div>
      <div class="container">
        <h1><span class="light">Access </span><span class="bold">Denied</span></h1>
        <div class="login-box">
          <form method="POST">
            <input type="password" name="password" placeholder="Enter Admin Password" required>
            <button type="submit">Verify Identity</button>
          </form>
        </div>
        <div class="footer">Authorized Personnel Only</div>
      </div>
    </body>
    </html>`;

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(accessDeniedHtml);
}
