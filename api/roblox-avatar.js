export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const userId = req.query.robloxId || req.query.robloxid || req.query.userId || req.query.userID || req.query.userid;
  if (!userId) return res.status(400).json({ error: "No userId" });

  try {
    if (!global._manus_avatar_cache) global._manus_avatar_cache = {};
    const cache = global._manus_avatar_cache;
    if (cache[userId]) {
      res.writeHead(307, { Location: cache[userId] });
      return res.end();
    }
    const url = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${encodeURIComponent(
      userId
    )}&size=150x150&format=Png&isCircular=false`;
    const response = await fetch(url);
    const data = await response.json();
    const imageUrl = data?.data?.[0]?.imageUrl;
    const finalUrl = imageUrl || `https://via.placeholder.com/150?text=No+Avatar`;
    cache[userId] = finalUrl;
    res.writeHead(307, { Location: finalUrl });
    return res.end();
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
