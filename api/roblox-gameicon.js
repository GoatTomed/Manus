export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const placeId = req.query.placeId || req.query.placeid || req.query.PlaceId;
  if (!placeId) return res.status(400).json({ error: "No placeId" });

  try {
    // lightweight in-memory cache
    if (!global._manus_gameicon_cache) global._manus_gameicon_cache = {};
    const cache = global._manus_gameicon_cache;
    if (cache[placeId]) {
      res.writeHead(307, { Location: cache[placeId] });
      return res.end();
    }
    const url = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${encodeURIComponent(placeId)}&size=150x150&format=Png&isCircular=false`;
    const response = await fetch(url);
    const data = await response.json();
    const imageUrl = data?.data?.[0]?.imageUrl;
    const finalUrl = imageUrl || `https://via.placeholder.com/150?text=No+Icon`;
    cache[placeId] = finalUrl;
    res.writeHead(307, { Location: finalUrl });
    return res.end();
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
