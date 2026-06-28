let activeClients = [];
const commandQueue = {};

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET /api/clients - list clients
  if (req.method === "GET" && !req.query.commands) {
    activeClients = activeClients.filter(c => Date.now() - (c.lastHeartbeat || 0) < 300000);
    return res.status(200).json(activeClients);
  }

  // GET /api/clients?commands=1&robloxId=xxx - poll commands (called by Lua)
  if (req.method === "GET" && req.query.commands) {
    const { robloxId } = req.query;
    const cmds = commandQueue[robloxId] || [];
    commandQueue[robloxId] = [];
    return res.status(200).json({ commands: cmds });
  }

  // POST /api/clients - heartbeat
  if (req.method === "POST" && !req.query.command) {
    try {
      const data = req.body;
      const client = {
        id: "c-" + Math.random().toString(36).substring(2, 9),
        name: data.robloxName || "Player",
        place: data.gameName || "Unknown Game",
        placeId: String(data.gameId || ""),
        av: (data.robloxName || "??").substring(0, 2).toUpperCase(),
        avc: "av-green",
        lastHeartbeat: Date.now(),
        uptime: data.uptime || 0,
        executor: data.executor || "Unknown",
        executorVersion: data.executorVersion || "",
        robloxId: data.robloxId,
      };
      const index = activeClients.findIndex(c => c.robloxId === data.robloxId);
      if (index >= 0) { activeClients[index] = client; } else { activeClients.push(client); }
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // POST /api/clients?command=1 - send command to client
  if (req.method === "POST" && req.query.command) {
    const { robloxId, type, script } = req.body;
    if (!robloxId) return res.status(400).json({ error: "No robloxId" });
    if (!commandQueue[robloxId]) commandQueue[robloxId] = [];
    commandQueue[robloxId].push({ type, script: script || "", ts: Date.now() });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
