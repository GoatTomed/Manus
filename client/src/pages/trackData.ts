export type Client = {
  id: string;
  name: string;
  place: string;
  placeId: string;
  av: string;
  avc: "av-blue" | "av-green" | "av-amber";
};

export const clients: Client[] = [
  {
    id: "c-4f9a2b",
    name: "PlayerOne",
    place: "Adopt Me! — Place 920587237",
    placeId: "920587237",
    av: "PO",
    avc: "av-blue",
  },
  {
    id: "c-7e3c90",
    name: "RoUser42",
    place: "Murder Mystery 2 — Place 142823291",
    placeId: "142823291",
    av: "RU",
    avc: "av-green",
  },
  {
    id: "c-b12f44",
    name: "xXDevXx",
    place: "Brookhaven RP — Place 4924922222",
    placeId: "4924922222",
    av: "xD",
    avc: "av-amber",
  },
];

export type ScriptEntry = { name: string; lines: number; size: string };

export const scriptData: ScriptEntry[] = [
  { name: "ReplicatedStorage.MainModule", lines: 842, size: "34 KB" },
  { name: "ServerScriptService.GameManager", lines: 312, size: "12 KB" },
  { name: "StarterPlayer.CharController", lines: 508, size: "20 KB" },
  { name: "ReplicatedStorage.UIHandler", lines: 221, size: "9 KB" },
  { name: "ServerScriptService.DataStore", lines: 189, size: "7 KB" },
  { name: "ReplicatedStorage.RemoteEvents", lines: 97, size: "4 KB" },
  { name: "ServerScriptService.AdminCmds", lines: 634, size: "26 KB" },
  { name: "StarterPlayer.AnimationHandler", lines: 402, size: "16 KB" },
];

export type LogEntry = { time: string; level: "info" | "warn" | "err"; msg: string };

export const logData: LogEntry[] = [
  { time: "2026-06-19 14:22:01", level: "info", msg: "Client c-4f9a2b connected via WebSocket" },
  { time: "2026-06-19 14:22:03", level: "info", msg: "Script sync started — 847 scripts queued" },
  { time: "2026-06-19 14:22:08", level: "warn", msg: "Relay peer latency spike: 240 ms" },
  { time: "2026-06-19 14:22:12", level: "info", msg: "Semantic index started: 847 chunks" },
  { time: "2026-06-19 14:22:45", level: "err", msg: "Embedding request timeout after 5000 ms" },
  { time: "2026-06-19 14:23:01", level: "info", msg: "Client c-7e3c90 connected via WebSocket" },
  { time: "2026-06-19 14:23:15", level: "info", msg: "Client c-b12f44 connected via WebSocket" },
  { time: "2026-06-19 14:23:22", level: "warn", msg: "Script decompile failed: obfuscated bytecode" },
  { time: "2026-06-19 14:23:50", level: "info", msg: "Semantic index complete: 525/847 chunks" },
];

export type ToolParam = { k: string; p: string };
export type ToolDef = {
  id: string;
  icon: string;
  label: string;
  desc: string;
  params: ToolParam[];
};

export const toolDefs: ToolDef[] = [
  {
    id: "script-grep",
    icon: "ti-search",
    label: "Script Grep",
    desc: "Search across all decompiled scripts using regex or literal patterns",
    params: [
      { k: "pattern", p: "e.g. RemoteEvent" },
      { k: "literal", p: "true / false" },
      { k: "max_results", p: "50" },
    ],
  },
  {
    id: "semantic-search",
    icon: "ti-book",
    label: "Semantic Search",
    desc: "Find scripts by semantic similarity to a natural language query",
    params: [
      { k: "query", p: "e.g. handles player damage" },
      { k: "top_k", p: "10" },
    ],
  },
  {
    id: "get-data",
    icon: "ti-code",
    label: "Get Data by Code",
    desc: "Execute Luau and return serialized raw Lua values",
    params: [
      { k: "code", p: "return game.PlaceId" },
      { k: "timeout", p: "5000" },
    ],
  },
  {
    id: "execute",
    icon: "ti-player-play",
    label: "Execute Code",
    desc: "Execute Luau in the active Roblox client without returning output",
    params: [
      { k: "code", p: 'print("hello world")' },
      { k: "timeout", p: "5000" },
    ],
  },
  {
    id: "search-instances",
    icon: "ti-box",
    label: "Search Instances",
    desc: "Search Roblox instances with QueryDescendants selector syntax",
    params: [
      { k: "selector", p: 'e.g. .ClassName == "Part"' },
      { k: "root", p: "game" },
    ],
  },
  {
    id: "console",
    icon: "ti-terminal",
    label: "Console Output",
    desc: "Read recent Roblox developer console logs from the active client",
    params: [
      { k: "limit", p: "100" },
      { k: "level", p: "all" },
    ],
  },
  {
    id: "tree",
    icon: "ti-sitemap",
    label: "Descendants Tree",
    desc: "Get a depth-limited hierarchy of descendants under a Roblox instance",
    params: [
      { k: "path", p: "game.Workspace" },
      { k: "depth", p: "3" },
    ],
  },
  {
    id: "game-info",
    icon: "ti-info-circle",
    label: "Game Info",
    desc: "Get current Roblox place and universe metadata",
    params: [],
  },
];
