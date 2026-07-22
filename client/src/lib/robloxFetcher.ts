export const ROBLOX_USER_PROFILE_BASE = "https://www.roblox.com/users";
export const ROBLOX_GAME_PAGE_BASE = "https://www.roblox.com/games";
export const ROBLOX_AVATAR_THUMBNAIL_BASE = "https://thumbnails.roblox.com/v1/users/avatar-headshot";
export const ROBLOX_GAMEICON_THUMBNAIL_BASE = "https://thumbnails.roblox.com/v1/places/gameicons";
export const ROBLOX_USER_API_BASE = "https://users.roblox.com/v1/users";

export function getRobloxUserProfileUrl(userId: string) {
  return `${ROBLOX_USER_PROFILE_BASE}/${encodeURIComponent(userId)}/profile`;
}

export function getRobloxGamePageUrl(placeId: string) {
  return `${ROBLOX_GAME_PAGE_BASE}/${encodeURIComponent(placeId)}`;
}

export function getRobloxAvatarThumbnailUrl(userId: string) {
  return `${ROBLOX_AVATAR_THUMBNAIL_BASE}?userIds=${encodeURIComponent(userId)}&size=150x150&format=Png&isCircular=false`;
}

export function getRobloxGameIconThumbnailUrl(placeId: string) {
  return `${ROBLOX_GAMEICON_THUMBNAIL_BASE}?placeIds=${encodeURIComponent(placeId)}&size=150x150&format=Png&isCircular=false`;
}

export function getRobloxUserApiUrl(userId: string) {
  return `${ROBLOX_USER_API_BASE}/${encodeURIComponent(userId)}`;
}

export async function fetchRobloxUserById(userId: string) {
  const url = getRobloxUserApiUrl(userId);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  return response.json();
}

export async function fetchRobloxAvatarUrl(userId: string) {
  const url = getRobloxAvatarThumbnailUrl(userId);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.data?.[0]?.imageUrl || null;
}

export async function fetchRobloxGameIconUrl(placeId: string) {
  const url = getRobloxGameIconThumbnailUrl(placeId);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.data?.[0]?.imageUrl || null;
}
