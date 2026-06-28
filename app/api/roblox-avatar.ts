export default async function handler(req: any, res: any) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "No userId" });

  const response = await fetch(
    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
  );
  const data = await response.json();
  res.status(200).json(data);
}
