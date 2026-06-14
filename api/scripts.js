const PASSWORD = "Tocson123";
const SECRET_KEY = "YouSuck-UltraSecret-9921"; // Ta clé secrète

import { Buffer } from "buffer";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    const authHeader = req.headers["x-secret-auth"] || "";
    const isAuthorized = authHeader === SECRET_KEY;

    const loginHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login Required</title>
        <style>
            body { background: #0a0a0f; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #15151a; padding: 2rem; border-radius: 10px; border: 1px solid #333; text-align: center; width: 300px; }
            input { width: 100%; padding: 10px; margin: 10px 0; background: #000; border: 1px solid #444; color: white; box-sizing: border-box; }
            button { width: 100%; padding: 10px; background: #22d3ee; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
            a { color: #888; text-decoration: none; font-size: 12px; margin-top: 20px; display: block; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Enter Password</h2>
            <form method="POST">
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Submit</button>
            </form>
            <a href="https://yoursuck.vercel.app">Return Home</a>
        </div>
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

    // SI LA CLÉ SECRÈTE EST PRÉSENTE : On envoie le script direct
    if (isAuthorized) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.status(200).send(getLuaScript());
    }

    // SI NAVIGATEUR : Gestion classique avec mot de passe
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
        } else {
            return res.status(401).send("Incorrect password.");
        }
    }

    const cookies = req.headers.cookie || "";
    const authCookie = Buffer.from(PASSWORD).toString("base64");
    if (cookies.indexOf("auth=" + authCookie) !== -1) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.status(200).send(getLuaScript());
    }

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(loginHtml);
}
