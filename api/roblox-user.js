export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const userId = req.query.userId || req.query.userID || req.query.userid;
  if (!userId) return res.status(400).json({ error: "No userId" });

  try {
    const url = `https://users.roblox.com/v1/users/${encodeURIComponent(userId)}`;
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
