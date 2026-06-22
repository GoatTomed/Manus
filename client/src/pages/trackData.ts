// trackData.ts
export type Client = {
  id: string;
  name: string;
  place: string;
  placeId: string;
  av: string;
  avc: "av-blue" | "av-green" | "av-amber";
  robloxId?: string;
  lastHeartbeat?: number;
  uptime?: number;
  executor?: string;
};

export type ScriptEntry = { 
  name: string; 
  lines: number; 
  size: string;
};

export const scriptData: ScriptEntry[] = [
  { name: "ReplicatedStorage.MainModule", lines: 842, size: "34 KB" },
  { name: "ServerScriptService.GameManager", lines: 312, size: "12 KB" },
  { name: "StarterPlayer.CharController", lines: 508, size: "20 KB" },
];

export type LogEntry = { 
  time: string; 
  level: "info" | "warn" | "err"; 
  msg: string; 
};

export const logData: LogEntry[] = [];
export const toolDefs: any[] = [];
