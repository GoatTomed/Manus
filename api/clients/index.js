let activeClients = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Clean old clients (5 minutes timeout)
    activeClients = activeClients.filter(c => Date.now() - (c.lastHeartbeat || 0) < 300000);
    return res.status(200).json(activeClients);
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;

      const client = {
        id: 'c-' + Math.random().toString(36).substring(2, 9),
        name: data.robloxName || 'Player',
        place: data.gameName || 'Unknown Game',
        placeId: String(data.gameId || ''),
        av: (data.robloxName || '??').substring(0, 2).toUpperCase(),
        avc: 'av-green',
        lastHeartbeat: Date.now(),
        uptime: data.uptime || 0,
        executor: data.executor || 'Unknown',
        robloxId: data.robloxId,
      };

      const index = activeClients.findIndex(c => c.robloxId === data.robloxId);
      if (index >= 0) {
        activeClients[index] = client;
      } else {
        activeClients.push(client);
      }

      return res.status(200).json({ success: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
