export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const placeId = req.query.placeId || req.query.placeid || req.query.PlaceId;
  if (!placeId) return res.status(400).json({ error: "No placeId" });

  try {
    const url = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${encodeURIComponent(placeId)}&size=150x150&format=Png&isCircular=false`;
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
