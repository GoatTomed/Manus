import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const ALLOWED_IP = "86.245.79.138";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";

export default async function handler(req, res) {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    
    // Sécurité : Seul toi peux voir cette page
    if (!clientIp.includes(ALLOWED_IP)) {
        res.setHeader("Content-Type", "text/html");
        return res.status(403).send("<h1>Access Denied</h1>");
    }

    try {
        // Récupérer les IPs uniques depuis la table page_views
        // On filtre sur les chemins des scripts pour voir qui a essayé d'y accéder
        const { data, error } = await supabase
            .from('page_views')
            .select('ip_hash, created_at')
            .or('path.eq./scripts.lua,path.eq./yousuck.lua')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Filtrer pour n'avoir que des IPs uniques (ip_hash contient l'IP ou son hash)
        const uniqueIps = Array.from(new Set(data.map(v => v.ip_hash)));

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>IP Logs | SIXSENSE</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=JetBrains+Mono&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { min-height: 100vh; background: #0a0a0f; font-family: 'Inter', sans-serif; color: #ffffff; overflow-x: hidden; position: relative; padding: 4rem 2rem; }
            .base-gradient { position: fixed; inset: 0; background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.08) 0%, transparent 50%), linear-gradient(to bottom, #050508 0%, #0a0a0f 100%); z-index: 0; }
            .grid-bg { position: fixed; inset: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px); background-size: 60px 60px; z-index: 1; }
            .container { position: relative; z-index: 10; max-width: 800px; margin: 0 auto; text-align: center; }
            .logo { width: 80px; height: 80px; margin-bottom: 1.5rem; }
            h1 { font-size: 2.5rem; margin-bottom: 2rem; font-weight: 300; }
            h1 b { font-weight: 600; color: #22d3ee; }
            .ip-list { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1.5rem; backdrop-filter: blur(10px); padding: 1.5rem; text-align: left; }
            .ip-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-family: 'JetBrains Mono', monospace; }
            .ip-item:last-child { border-bottom: none; }
            .ip-address { color: #22d3ee; font-size: 1.1rem; }
            .status { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; background: rgba(34, 211, 238, 0.1); color: #22d3ee; padding: 0.3rem 0.6rem; border-radius: 0.4rem; }
            .empty { text-align: center; color: rgba(255, 255, 255, 0.3); padding: 2rem; }
          </style>
        </head>
        <body>
          <div class="base-gradient"></div>
          <div class="grid-bg"></div>
          <div class="container">
            <img src="${LOGO_URL}" alt="Logo" class="logo">
            <h1>IP <b>Logs</b></h1>
            <div class="ip-list">
              ${uniqueIps.length > 0 ? uniqueIps.map(ip => `
                <div class="ip-item">
                  <span class="ip-address">${ip}</span>
                  <span class="status">Unauthorized Attempt</span>
                </div>
              `).join('') : '<div class="empty">No unauthorized attempts logged yet.</div>'}
            </div>
          </div>
        </body>
        </html>`;

        res.setHeader("Content-Type", "text/html");
        return res.status(200).send(html);
    } catch (err) {
        return res.status(500).send("Error fetching IPs: " + err.message);
    }
}
