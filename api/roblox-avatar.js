export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const userId = req.query.robloxId || req.query.robloxid || req.query.userId || req.query.userID || req.query.userid;
  if (!userId) return res.status(400).json({ error: "No userId" });

  try {
    const url = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${encodeURIComponent(
      userId
    )}&size=150x150&format=Png&isCircular=false`;
    const response = await fetch(url);
    const data = await response.json();
    const imageUrl = data?.data?.[0]?.imageUrl;
    if (imageUrl) {
      res.writeHead(307, { Location: imageUrl });
      return res.end();
    }
    res.writeHead(307, { Location: `https://via.placeholder.com/150?text=No+Avatar` });
    return res.end();
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
