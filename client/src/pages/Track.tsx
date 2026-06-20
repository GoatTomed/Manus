import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  User,
  ChevronDown,
  ChevronRight,
  Users,
  Server,
  Terminal,
  Settings as SettingsIcon,
  LayoutDashboard,
  FileCode,
  Wrench,
  Clock,
  Github,
  Layers,
  Search,
  Play,
  Cpu,
  Share2,
  Gamepad2,
  Info,
  BookOpen,
  Code,
  Network,
  Plug,
  type LucideIcon,
} from "lucide-react";

// ─── Static data (ported from the original dashboard) ────────────────────────

interface ClientInfo {
  name: string;
  place: string;
  av: string;
  avc: "av-blue" | "av-green" | "av-amber";
}

const CLIENTS: ClientInfo[] = [
  { name: "PlayerOne", place: "Adopt Me! — Place 920587237", av: "PO", avc: "av-blue" },
  { name: "RoUser42", place: "Murder Mystery 2 — Place 142823291", av: "RU", avc: "av-green" },
  { name: "xXDevXx", place: "Brookhaven RP — Place 4924922222", av: "xD", avc: "av-amber" },
];

const SCRIPTS = [
  { name: "ReplicatedStorage.MainModule", lines: 842, size: "34 KB" },
  { name: "ServerScriptService.GameManager", lines: 312, size: "12 KB" },
  { name: "StarterPlayer.CharController", lines: 508, size: "20 KB" },
  { name: "ReplicatedStorage.UIHandler", lines: 221, size: "9 KB" },
  { name: "ServerScriptService.DataStore", lines: 189, size: "7 KB" },
  { name: "ReplicatedStorage.RemoteEvents", lines: 97, size: "4 KB" },
  { name: "ServerScriptService.AdminCmds", lines: 634, size: "26 KB" },
  { name: "StarterPlayer.AnimationHandler", lines: 402, size: "16 KB" },
];

type LogLevel = "info" | "warn" | "err";
interface LogEntry {
  time: string;
  level: LogLevel;
  msg: string;
}

const LOGS: LogEntry[] = [
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

interface ToolDef {
  id: string;
  icon: LucideIcon;
  label: string;
  desc: string;
  params: { k: string; p: string }[];
}

const TOOLS: ToolDef[] = [
  { id: "script-grep", icon: Search, label: "Script Grep", desc: "Search across all decompiled scripts using regex or literal patterns", params: [{ k: "pattern", p: "e.g. RemoteEvent" }, { k: "literal", p: "true / false" }, { k: "max_results", p: "50" }] },
  { id: "semantic-search", icon: BookOpen, label: "Semantic Search", desc: "Find scripts by semantic similarity to a natural language query", params: [{ k: "query", p: "e.g. handles player damage" }, { k: "top_k", p: "10" }] },
  { id: "get-data", icon: Code, label: "Get Data by Code", desc: "Execute Luau and return serialized raw Lua values", params: [{ k: "code", p: "return game.PlaceId" }, { k: "timeout", p: "5000" }] },
  { id: "execute", icon: Play, label: "Execute Code", desc: "Execute Luau in the active Roblox client without returning output", params: [{ k: "code", p: 'print("hello world")' }, { k: "timeout", p: "5000" }] },
  { id: "search-instances", icon: Box, label: "Search Instances", desc: "Search Roblox instances with QueryDescendants selector syntax", params: [{ k: "selector", p: 'e.g. .ClassName == "Part"' }, { k: "root", p: "game" }] },
  { id: "console", icon: Terminal, label: "Console Output", desc: "Read recent Roblox developer console logs from the active client", params: [{ k: "limit", p: "100" }, { k: "level", p: "all" }] },
  { id: "tree", icon: Network, label: "Descendants Tree", desc: "Get a depth-limited hierarchy of descendants under a Roblox instance", params: [{ k: "path", p: "game.Workspace" }, { k: "depth", p: "3" }] },
  { id: "game-info", icon: Info, label: "Game Info", desc: "Get current Roblox place and universe metadata", params: [] },
];

// ─── Styles (dark theme, #00ABFF accent — scoped under .mcp-root) ─────────────

const STYLES = `
.mcp-root{
  --bg-primary:#16191e;
  --bg-secondary:#101318;
  --bg-tertiary:#0a0c0f;
  --bg-info:rgba(0,171,255,0.14);
  --bg-success:rgba(34,197,94,0.14);
  --bg-warning:rgba(234,179,8,0.14);
  --bg-danger:rgba(239,68,68,0.14);
  --text-primary:#e8eaed;
  --text-secondary:#9aa0a6;
  --text-tertiary:#6b7177;
  --text-info:#00ABFF;
  --text-success:#4ade80;
  --text-warning:#facc15;
  --text-danger:#f87171;
  --border:rgba(255,255,255,0.08);
  --border-md:rgba(255,255,255,0.18);
  --accent:#00ABFF;
  --radius-sm:6px;--radius-md:8px;--radius-lg:12px;
  font-size:14px;color:var(--text-primary);
  background:var(--bg-tertiary);height:100vh;overflow:hidden;display:flex;flex-direction:column;
}
.mcp-root *{box-sizing:border-box}
.mcp-root .topbar{height:48px;background:var(--bg-primary);border-bottom:0.5px solid var(--border);display:flex;align-items:center;padding:0 16px;gap:12px;flex-shrink:0;z-index:10}
.mcp-root .topbar-logo{display:flex;align-items:center;gap:7px;font-weight:500;font-size:13px;color:var(--text-secondary);text-decoration:none}
.mcp-root .topbar-sep{width:1px;height:20px;background:var(--border)}
.mcp-root .client-chip{display:flex;align-items:center;gap:6px;background:var(--bg-secondary);border:0.5px solid var(--border);border-radius:var(--radius-md);padding:5px 10px;font-size:12px;cursor:pointer;color:var(--text-secondary);transition:background .1s;user-select:none}
.mcp-root .client-chip:hover{background:var(--bg-tertiary)}
.mcp-root .topbar-right{flex:1;display:flex;align-items:center;justify-content:flex-end}
.mcp-root .topbar-section{font-size:13px;font-weight:500;color:var(--text-secondary)}
.mcp-root .layout{display:flex;flex:1;overflow:hidden}
.mcp-root .sidebar{width:204px;background:var(--bg-secondary);border-right:0.5px solid var(--border);display:flex;flex-direction:column;flex-shrink:0}
.mcp-root .sidebar-nav{padding:8px;display:flex;flex-direction:column;gap:1px;flex:1}
.mcp-root .sidebar-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:var(--radius-md);font-size:13px;color:var(--text-secondary);cursor:pointer;background:none;border:none;width:100%;text-align:left;transition:background .1s,color .1s}
.mcp-root .sidebar-item:hover{background:var(--bg-tertiary);color:var(--text-primary)}
.mcp-root .sidebar-item.active{background:var(--bg-tertiary);color:var(--text-primary);font-weight:500}
.mcp-root .sidebar-footer{padding:10px 8px;border-top:0.5px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.mcp-root .uptime-chip{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text-tertiary);font-family:var(--font-mono,monospace)}
.mcp-root .gh-link{color:var(--text-tertiary);text-decoration:none;display:flex;align-items:center;padding:4px;border-radius:var(--radius-sm);transition:color .1s}
.mcp-root .gh-link:hover{color:var(--text-primary)}
.mcp-root .main-content{flex:1;overflow-y:auto;position:relative}
.mcp-root .view{height:100%;display:flex;flex-direction:column}
.mcp-root .clients-center{display:flex;align-items:center;justify-content:center;flex:1;padding:24px}
.mcp-root .no-client-box{width:360px;text-align:center}
.mcp-root .no-client-icon{width:56px;height:56px;border-radius:var(--radius-lg);background:var(--bg-primary);border:0.5px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--text-secondary)}
.mcp-root .no-client-box h2{font-size:18px;font-weight:500;margin:0 0 6px}
.mcp-root .no-client-box p{font-size:13px;color:var(--text-secondary);margin:0 0 20px}
.mcp-root .search-field{position:relative;margin-bottom:14px}
.mcp-root .search-field .ic{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-tertiary);pointer-events:none}
.mcp-root .search-field input{width:100%;padding:8px 10px 8px 32px;background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-md);font-size:13px;color:var(--text-primary);outline:none}
.mcp-root .search-field input:focus{border-color:var(--accent)}
.mcp-root .client-list-box{border:0.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;text-align:left;background:var(--bg-primary)}
.mcp-root .client-row{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:0.5px solid var(--border);cursor:pointer;transition:background .1s}
.mcp-root .client-row:last-child{border-bottom:none}
.mcp-root .client-row:hover{background:var(--bg-secondary)}
.mcp-root .client-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;flex-shrink:0}
.mcp-root .hero-avatar{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;flex-shrink:0}
.mcp-root .av-blue{background:var(--bg-info);color:var(--text-info)}
.mcp-root .av-green{background:var(--bg-success);color:var(--text-success)}
.mcp-root .av-amber{background:var(--bg-warning);color:var(--text-warning)}
.mcp-root .client-row-meta{flex:1;min-width:0}
.mcp-root .client-row-name{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcp-root .client-row-sub{font-size:11px;color:var(--text-secondary);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcp-root .chev{color:var(--text-tertiary)}
.mcp-root .overview-wrap{padding:24px;display:flex;flex-direction:column;gap:14px}
.mcp-root .hero-card{background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:16px 18px;display:flex;align-items:center;gap:14px}
.mcp-root .hero-meta{flex:1;min-width:0}
.mcp-root .hero-meta h1{font-size:16px;font-weight:500;margin:0}
.mcp-root .hero-meta p{font-size:12px;color:var(--text-secondary);margin:2px 0 0}
.mcp-root .transport-pill{background:var(--bg-secondary);border:0.5px solid var(--border);border-radius:var(--radius-sm);padding:4px 10px;font-size:11px;font-family:var(--font-mono,monospace);color:var(--text-secondary)}
.mcp-root .cards-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.mcp-root .info-card{background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-md);padding:12px 14px}
.mcp-root .info-card-label{font-size:10px;font-weight:500;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}
.mcp-root .info-card-value{font-size:13px;font-family:var(--font-mono,monospace);color:var(--text-primary)}
.mcp-root .tiles-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.mcp-root .tile{background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:14px 16px}
.mcp-root .tile-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.mcp-root .tile-title{font-size:13px;font-weight:500}
.mcp-root .badge{font-size:11px;font-weight:500;padding:2px 8px;border-radius:var(--radius-sm)}
.mcp-root .badge-green{background:var(--bg-success);color:var(--text-success)}
.mcp-root .tile-stat{display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:3px 0}
.mcp-root .tile-stat-label{color:var(--text-secondary)}
.mcp-root .tile-stat-val{font-weight:500}
.mcp-root .scripts-wrap{padding:24px;display:flex;flex-direction:column;flex:1}
.mcp-root .scripts-header{margin-bottom:18px}
.mcp-root .scripts-header h2{font-size:16px;font-weight:500;margin:0}
.mcp-root .scripts-header p{font-size:13px;color:var(--text-secondary);margin:3px 0 0}
.mcp-root .scripts-body{display:flex;gap:14px;flex:1;min-height:0}
.mcp-root .scripts-main{flex:1;min-width:0;border:0.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--bg-primary);display:flex;flex-direction:column}
.mcp-root .scripts-toolbar{display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--bg-secondary);border-bottom:0.5px solid var(--border)}
.mcp-root .scripts-search{position:relative;flex:1}
.mcp-root .scripts-search .ic{position:absolute;left:8px;top:50%;transform:translateY(-50%);color:var(--text-tertiary);pointer-events:none}
.mcp-root .scripts-search input{width:100%;padding:6px 8px 6px 27px;font-size:12px;background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);outline:none}
.mcp-root .scripts-count{font-size:12px;color:var(--text-secondary);white-space:nowrap}
.mcp-root .scripts-col-head{display:grid;grid-template-columns:1fr 64px 64px 72px;padding:7px 14px;background:var(--bg-secondary);border-bottom:0.5px solid var(--border);font-size:10px;font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em}
.mcp-root .scripts-col-head div:not(:first-child){text-align:right}
.mcp-root .scripts-list{flex:1;overflow-y:auto}
.mcp-root .script-row{display:grid;grid-template-columns:1fr 64px 64px 72px;padding:10px 14px;border-bottom:0.5px solid var(--border);font-size:12px;align-items:center;cursor:pointer;transition:background .1s}
.mcp-root .script-row:last-child{border-bottom:none}
.mcp-root .script-row:hover{background:var(--bg-secondary)}
.mcp-root .script-row-name{font-family:var(--font-mono,monospace);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:10px}
.mcp-root .script-row div:not(:first-child){text-align:right;color:var(--text-secondary)}
.mcp-root .script-action{display:inline-flex;align-items:center;justify-content:center}
.mcp-root .action-btn{font-size:11px;background:var(--bg-secondary);border:0.5px solid var(--border);border-radius:4px;padding:2px 8px;cursor:pointer;color:var(--text-secondary);transition:background .1s}
.mcp-root .action-btn:hover{background:var(--bg-tertiary)}
.mcp-root .scripts-sidebar-panel{width:200px;flex-shrink:0;display:flex;flex-direction:column;gap:12px}
.mcp-root .sidebar-section-card{background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:14px}
.mcp-root .sidebar-sec-title{font-size:11px;font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px}
.mcp-root .progress-bar{height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;margin-bottom:8px}
.mcp-root .progress-fill{height:100%;border-radius:2px}
.mcp-root .legend-row{display:flex;align-items:center;gap:6px;font-size:11px}
.mcp-root .legend-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.mcp-root .legend-label{flex:1;color:var(--text-secondary)}
.mcp-root .legend-val{font-family:var(--font-mono,monospace);font-weight:500;font-size:10px;color:var(--text-secondary)}
.mcp-root .legend-perc{font-family:var(--font-mono,monospace);font-size:10px;color:var(--text-tertiary)}
.mcp-root .sec-footer{margin-top:10px;display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:0.5px solid var(--border)}
.mcp-root .sync-badge{font-size:10px;font-weight:500;padding:2px 7px;border-radius:var(--radius-sm);background:var(--bg-warning);color:var(--text-warning)}
.mcp-root .sync-badge.done{background:var(--bg-success);color:var(--text-success)}
.mcp-root .index-btn{font-size:11px;background:var(--accent);color:#04141d;border:none;border-radius:var(--radius-sm);padding:4px 10px;cursor:pointer;font-weight:600;transition:opacity .1s}
.mcp-root .index-btn:hover{opacity:.85}
.mcp-root .idle-label{font-size:10px;color:var(--text-tertiary)}
.mcp-root .tools-wrap{padding:24px;display:flex;gap:14px;flex:1;min-height:0;overflow:hidden}
.mcp-root .tools-main{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden}
.mcp-root .tools-card{background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;display:flex;flex-direction:column;flex:1}
.mcp-root .tool-exec-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:0.5px solid var(--border)}
.mcp-root .tool-exec-info h3{font-size:14px;font-weight:500;margin:0 0 2px}
.mcp-root .tool-exec-info p{font-size:12px;color:var(--text-secondary);margin:0}
.mcp-root .send-btn{display:flex;align-items:center;gap:6px;background:var(--accent);color:#04141d;border:none;border-radius:var(--radius-md);padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;transition:opacity .1s}
.mcp-root .send-btn:hover{opacity:.85}
.mcp-root .params-table{width:100%;border-collapse:collapse}
.mcp-root .params-table th{padding:8px 14px;font-size:10px;font-weight:500;color:var(--text-secondary);text-align:left;text-transform:uppercase;letter-spacing:.06em;background:var(--bg-secondary);border-bottom:0.5px solid var(--border)}
.mcp-root .params-table th:first-child{width:28%}
.mcp-root .params-table td{padding:0;border-bottom:0.5px solid var(--border)}
.mcp-root .params-table tr:last-child td{border-bottom:none}
.mcp-root .param-key{padding:10px 14px;font-size:12px;font-family:var(--font-mono,monospace);color:var(--text-secondary)}
.mcp-root .param-val{padding:6px 14px 6px 8px}
.mcp-root .param-val input{width:100%;padding:5px 8px;font-size:12px;background:var(--bg-secondary);border:0.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);outline:none}
.mcp-root .param-val input:focus{border-color:var(--accent)}
.mcp-root .tool-response{border-top:0.5px solid var(--border);flex:1;display:flex;flex-direction:column;min-height:0}
.mcp-root .tool-res-header{display:flex;align-items:center;justify-content:space-between;padding:9px 14px;background:var(--bg-secondary);border-bottom:0.5px solid var(--border);flex-shrink:0}
.mcp-root .tool-res-title{font-size:12px;font-weight:500}
.mcp-root .tool-res-meta{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-tertiary)}
.mcp-root .res-badge{padding:1px 7px;border-radius:4px;font-size:10px;font-weight:500;background:var(--bg-success);color:var(--text-success)}
.mcp-root .tool-res-body{padding:12px 14px;font-size:12px;font-family:var(--font-mono,monospace);color:var(--text-secondary);line-height:1.6;overflow-y:auto;flex:1;white-space:pre-wrap}
.mcp-root .tools-sidebar-panel{width:176px;flex-shrink:0}
.mcp-root .tools-sidebar-label{font-size:10px;font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
.mcp-root .tools-list{background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
.mcp-root .tool-item{display:flex;align-items:center;gap:7px;padding:9px 11px;font-size:12px;color:var(--text-secondary);cursor:pointer;border-bottom:0.5px solid var(--border);transition:background .1s;width:100%;background:none;border-left:none;border-right:none;border-top:none;text-align:left}
.mcp-root .tool-item:last-child{border-bottom:none}
.mcp-root .tool-item:hover{background:var(--bg-secondary);color:var(--text-primary)}
.mcp-root .tool-item.active{background:var(--bg-tertiary);color:var(--text-primary);font-weight:500}
.mcp-root .server-wrap{padding:24px;display:flex;flex-direction:column;gap:14px}
.mcp-root .server-wrap h2{font-size:16px;font-weight:500;margin:0}
.mcp-root .server-wrap .sub{font-size:13px;color:var(--text-secondary);margin:3px 0 0}
.mcp-root .graph-card{background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:24px;display:flex;align-items:center;justify-content:center}
.mcp-root .graph-inner{display:flex;align-items:center}
.mcp-root .g-node{display:flex;flex-direction:column;align-items:center;gap:7px}
.mcp-root .g-circle{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.mcp-root .g-label{font-size:11px;color:var(--text-secondary);white-space:nowrap}
.mcp-root .g-line{display:flex;flex-direction:column;align-items:center;padding-bottom:20px}
.mcp-root .g-track{width:52px;height:1px;background:var(--border-md)}
.mcp-root .g-dot{width:7px;height:7px;border-radius:50%;margin-top:-4px}
.mcp-root .dot-green{background:#22c55e}
.mcp-root .server-stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.mcp-root .stat-card{background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-md);padding:12px 14px}
.mcp-root .stat-label{font-size:10px;font-weight:500;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}
.mcp-root .stat-val{font-size:22px;font-weight:500}
.mcp-root .stat-val.green{color:var(--text-success)}
.mcp-root .clients-table-card{background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
.mcp-root .clients-table-head{display:flex;align-items:center;justify-content:space-between;padding:11px 16px;border-bottom:0.5px solid var(--border)}
.mcp-root .clients-table-title{font-size:13px;font-weight:500}
.mcp-root .count-pill{background:var(--bg-secondary);border:0.5px solid var(--border);border-radius:var(--radius-sm);padding:2px 8px;font-size:11px;font-family:var(--font-mono,monospace);color:var(--text-secondary)}
.mcp-root .ct-row{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:0.5px solid var(--border);font-size:13px}
.mcp-root .ct-row:last-child{border-bottom:none}
.mcp-root .status-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.mcp-root .ct-name{flex:1;font-weight:500}
.mcp-root .ct-id{font-family:var(--font-mono,monospace);font-size:11px;color:var(--text-secondary)}
.mcp-root .ct-transport{font-size:11px;color:var(--text-tertiary);margin-left:10px}
.mcp-root .logs-wrap{padding:24px;display:flex;flex-direction:column;flex:1}
.mcp-root .logs-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.mcp-root .logs-header h2{font-size:16px;font-weight:500;margin:0}
.mcp-root .logs-controls{display:flex;gap:6px}
.mcp-root .log-btn{display:flex;align-items:center;gap:5px;background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-md);padding:5px 12px;font-size:12px;cursor:pointer;color:var(--text-secondary);transition:background .1s}
.mcp-root .log-btn:hover{background:var(--bg-secondary)}
.mcp-root .live-dot{width:6px;height:6px;border-radius:50%;background:#ef4444;flex-shrink:0}
.mcp-root .logs-card{background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;flex:1;display:flex;flex-direction:column;min-height:0}
.mcp-root .logs-col-head{display:grid;grid-template-columns:155px 70px 1fr;padding:8px 14px;background:var(--bg-secondary);border-bottom:0.5px solid var(--border);font-size:10px;font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.06em;flex-shrink:0}
.mcp-root .logs-body{overflow-y:auto;flex:1}
.mcp-root .log-row{display:grid;grid-template-columns:155px 70px 1fr;padding:9px 14px;border-bottom:0.5px solid var(--border);font-size:12px;align-items:center;transition:background .1s}
.mcp-root .log-row:last-child{border-bottom:none}
.mcp-root .log-row:hover{background:var(--bg-secondary)}
.mcp-root .log-time{font-family:var(--font-mono,monospace);color:var(--text-tertiary)}
.mcp-root .log-level span{font-size:10px;font-weight:500;padding:2px 6px;border-radius:4px}
.mcp-root .lvl-info{background:var(--bg-info);color:var(--text-info)}
.mcp-root .lvl-warn{background:var(--bg-warning);color:var(--text-warning)}
.mcp-root .lvl-err{background:var(--bg-danger);color:var(--text-danger)}
.mcp-root .log-msg{color:var(--text-primary);padding-left:4px}
.mcp-root .settings-wrap{padding:24px;display:flex;flex-direction:column;gap:12px;flex:1;overflow-y:auto}
.mcp-root .settings-wrap h2{font-size:16px;font-weight:500;margin:0}
.mcp-root .settings-wrap .sub{font-size:13px;color:var(--text-secondary);margin:3px 0 6px}
.mcp-root .settings-card{background:var(--bg-primary);border:0.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
.mcp-root .settings-card-body{padding:16px}
.mcp-root .settings-card-title{font-size:14px;font-weight:500;margin-bottom:4px}
.mcp-root .settings-card-desc{font-size:12px;color:var(--text-secondary);margin-bottom:14px}
.mcp-root .settings-card-footer{padding:11px 16px;background:var(--bg-secondary);border-top:0.5px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px}
.mcp-root .settings-footer-hint{font-size:11px;color:var(--text-tertiary);flex:1}
.mcp-root .save-btn{background:var(--bg-secondary);border:0.5px solid var(--border-md);border-radius:var(--radius-md);padding:5px 14px;font-size:12px;cursor:pointer;color:var(--text-primary);transition:background .1s;white-space:nowrap}
.mcp-root .save-btn:hover{background:var(--bg-tertiary)}
.mcp-root .delete-btn{background:var(--bg-danger);border:0.5px solid rgba(248,113,113,0.3);border-radius:var(--radius-md);padding:5px 14px;font-size:12px;cursor:pointer;color:var(--text-danger);transition:opacity .1s;white-space:nowrap}
.mcp-root .delete-btn:hover{opacity:.85}
.mcp-root .provider-toggle{display:flex;gap:2px;background:var(--bg-secondary);border:0.5px solid var(--border);border-radius:var(--radius-md);padding:3px;width:fit-content}
.mcp-root .prov-btn{padding:5px 18px;border-radius:6px;font-size:12px;cursor:pointer;background:none;border:none;color:var(--text-secondary);transition:all .1s}
.mcp-root .prov-btn.active{background:var(--bg-primary);color:var(--text-primary);border:0.5px solid var(--border);font-weight:500}
.mcp-root .settings-field{margin-bottom:10px}
.mcp-root .settings-field:last-child{margin-bottom:0}
.mcp-root .settings-field label{display:block;font-size:11px;font-weight:500;color:var(--text-secondary);margin-bottom:4px}
.mcp-root .settings-field input{width:100%;padding:7px 10px;background:var(--bg-secondary);border:0.5px solid var(--border);border-radius:var(--radius-md);font-size:13px;color:var(--text-primary);outline:none}
.mcp-root .settings-field input:focus{border-color:var(--accent)}
.mcp-root .toggle-row{display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;user-select:none}
.mcp-root .toggle-track{width:36px;height:20px;background:var(--bg-tertiary);border:0.5px solid var(--border-md);border-radius:10px;position:relative;transition:background .15s;flex-shrink:0}
.mcp-root .toggle-track.on{background:#22c55e}
.mcp-root .toggle-thumb{width:14px;height:14px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:left .15s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.mcp-root .toggle-track.on .toggle-thumb{left:18px}
.mcp-root .test-btn{display:inline-flex;align-items:center;gap:6px;background:var(--bg-secondary);border:0.5px solid var(--border);border-radius:var(--radius-md);padding:7px 14px;font-size:12px;cursor:pointer;color:var(--text-primary);transition:background .1s;margin-top:4px}
.mcp-root .test-btn:hover{background:var(--bg-tertiary)}
.mcp-root .footer-actions{display:flex;align-items:center;gap:6px}
`;

// ─── Component ────────────────────────────────────────────────────────────────

type HomeView = "clients" | "server" | "logs" | "settings";
type ClientView = "overview" | "scripts" | "tools";

export default function Track() {
  const [inClientMode, setInClientMode] = useState(false);
  const [homeView, setHomeView] = useState<HomeView>("clients");
  const [clientView, setClientView] = useState<ClientView>("overview");
  const [selected, setSelected] = useState<ClientInfo | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [uptime, setUptime] = useState("00:00:00");
  const startRef = useRef(Date.now());

  // Tools
  const [activeTool, setActiveTool] = useState<ToolDef>(TOOLS[0]);
  const [toolOutput, setToolOutput] = useState("Click Send to execute the tool");
  const [resBadge, setResBadge] = useState("");
  const [resTime, setResTime] = useState("");

  // Settings
  const [provider, setProvider] = useState<"openai" | "ollama">("openai");
  const [cacheOn, setCacheOn] = useState(false);

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>(LOGS);

  useEffect(() => {
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - startRef.current) / 1000);
      const h = String(Math.floor(s / 3600)).padStart(2, "0");
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      const sec = String(s % 60).padStart(2, "0");
      setUptime(`${h}:${m}:${sec}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase();
    return CLIENTS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.place.toLowerCase().includes(q)
    );
  }, [clientSearch]);

  const placeId = selected ? (selected.place.match(/(\d+)$/)?.[1] ?? "—") : "—";

  function selectClient(c: ClientInfo) {
    setSelected(c);
    setInClientMode(true);
    setClientView("overview");
  }

  function exitClientMode() {
    setInClientMode(false);
    setHomeView("clients");
  }

  function runTool() {
    setToolOutput("Running…");
    setResBadge("");
    setResTime("");
    setTimeout(() => {
      const ms = Math.floor(Math.random() * 200 + 40);
      setResBadge("200 OK");
      setResTime(`${ms} ms`);
      setToolOutput(
        `// ${activeTool.label} result\n{\n  "status": "ok",\n  "count": ${Math.floor(
          Math.random() * 40 + 1
        )},\n  "data": []\n}`
      );
    }, 320);
  }

  const topbarSection = inClientMode
    ? clientView.charAt(0).toUpperCase() + clientView.slice(1)
    : homeView.charAt(0).toUpperCase() + homeView.slice(1);

  return (
    <div className="mcp-root">
      <style>{STYLES}</style>

      {/* Topbar */}
      <div className="topbar">
        <a className="topbar-logo" href="/">
          <Box size={16} /> roblox-mcp
        </a>
        <div className="topbar-sep" />
        <div className="client-chip" onClick={exitClientMode}>
          <User size={14} />
          <span>{selected && inClientMode ? selected.name : "Select Client"}</span>
          <ChevronDown size={14} />
        </div>
        <div className="topbar-right">
          <span className="topbar-section">{topbarSection}</span>
        </div>
      </div>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          {!inClientMode ? (
            <nav className="sidebar-nav">
              <button className={`sidebar-item${homeView === "clients" ? " active" : ""}`} onClick={() => setHomeView("clients")}><Users size={15} />Clients</button>
              <button className={`sidebar-item${homeView === "server" ? " active" : ""}`} onClick={() => setHomeView("server")}><Server size={15} />Server</button>
              <button className={`sidebar-item${homeView === "logs" ? " active" : ""}`} onClick={() => setHomeView("logs")}><Terminal size={15} />Logs</button>
              <button className={`sidebar-item${homeView === "settings" ? " active" : ""}`} onClick={() => setHomeView("settings")}><SettingsIcon size={15} />Settings</button>
            </nav>
          ) : (
            <nav className="sidebar-nav">
              <button className={`sidebar-item${clientView === "overview" ? " active" : ""}`} onClick={() => setClientView("overview")}><LayoutDashboard size={15} />Overview</button>
              <button className={`sidebar-item${clientView === "scripts" ? " active" : ""}`} onClick={() => setClientView("scripts")}><FileCode size={15} />Scripts</button>
              <button className={`sidebar-item${clientView === "tools" ? " active" : ""}`} onClick={() => setClientView("tools")}><Wrench size={15} />Tools</button>
            </nav>
          )}
          <div className="sidebar-footer">
            <div className="uptime-chip"><Clock size={12} /><span>{uptime}</span></div>
            <a className="gh-link" href="https://github.com/notpoiu/roblox-mcp" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={16} /></a>
          </div>
        </aside>

        {/* Main content */}
        <main className="main-content">
          {/* Clients */}
          {!inClientMode && homeView === "clients" && (
            <div className="view">
              <div className="clients-center">
                <div className="no-client-box">
                  <div className="no-client-icon"><Layers size={26} /></div>
                  <h2>Continue to Dashboard</h2>
                  <p>Choose a client to continue</p>
                  <div className="search-field">
                    <Search className="ic" size={14} />
                    <input
                      type="text"
                      placeholder="Find client…"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="client-list-box">
                    {filteredClients.map((c) => (
                      <div className="client-row" key={c.name} onClick={() => selectClient(c)}>
                        <div className={`client-avatar ${c.avc}`}>{c.av}</div>
                        <div className="client-row-meta">
                          <div className="client-row-name">{c.name}</div>
                          <div className="client-row-sub">{c.place.replace(" — ", " · ")}</div>
                        </div>
                        <ChevronRight className="chev" size={14} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Server */}
          {!inClientMode && homeView === "server" && (
            <div className="view">
              <div className="server-wrap">
                <div>
                  <h2>Server</h2>
                  <p className="sub">MCP server connectivity and relay topology</p>
                </div>
                <div className="graph-card">
                  <div className="graph-inner">
                    <div className="g-node">
                      <div className="g-circle" style={{ background: "var(--bg-info)", color: "var(--text-info)" }}><Cpu size={22} /></div>
                      <span className="g-label">MCP Server</span>
                    </div>
                    <div className="g-line"><div className="g-track" /><div className="g-dot dot-green" /></div>
                    <div className="g-node">
                      <div className="g-circle" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}><Share2 size={22} /></div>
                      <span className="g-label">Relay</span>
                    </div>
                    <div className="g-line"><div className="g-track" /><div className="g-dot dot-green" /></div>
                    <div className="g-node">
                      <div className="g-circle" style={{ background: "var(--bg-success)", color: "var(--text-success)" }}><Gamepad2 size={22} /></div>
                      <span className="g-label">Clients (3)</span>
                    </div>
                  </div>
                </div>
                <div className="server-stats-row">
                  <div className="stat-card"><div className="stat-label">Status</div><div className="stat-val green">Connected</div></div>
                  <div className="stat-card"><div className="stat-label">Clients</div><div className="stat-val">3</div></div>
                  <div className="stat-card"><div className="stat-label">Relay Peers</div><div className="stat-val">1</div></div>
                </div>
                <div className="clients-table-card">
                  <div className="clients-table-head">
                    <span className="clients-table-title">Connected Clients</span>
                    <span className="count-pill">3</span>
                  </div>
                  <div className="ct-row"><div className="status-dot dot-green" /><span className="ct-name">PlayerOne</span><span className="ct-id">c-4f9a2b</span><span className="ct-transport">WebSocket</span></div>
                  <div className="ct-row"><div className="status-dot dot-green" /><span className="ct-name">RoUser42</span><span className="ct-id">c-7e3c90</span><span className="ct-transport">WebSocket</span></div>
                  <div className="ct-row"><div className="status-dot dot-green" /><span className="ct-name">xXDevXx</span><span className="ct-id">c-b12f44</span><span className="ct-transport">WebSocket</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Logs */}
          {!inClientMode && homeView === "logs" && (
            <div className="view">
              <div className="logs-wrap">
                <div className="logs-header">
                  <h2>Server Logs</h2>
                  <div className="logs-controls">
                    <button className="log-btn"><div className="live-dot" />Live</button>
                    <button className="log-btn" onClick={() => setLogs([])}>Clear</button>
                  </div>
                </div>
                <div className="logs-card">
                  <div className="logs-col-head"><div>Time</div><div>Level</div><div>Message</div></div>
                  <div className="logs-body">
                    {logs.length === 0 ? (
                      <div style={{ padding: 14, fontSize: 12, color: "var(--text-tertiary)" }}>No server logs yet</div>
                    ) : (
                      logs.map((l, i) => (
                        <div className="log-row" key={i}>
                          <div className="log-time">{l.time}</div>
                          <div className="log-level">
                            <span className={l.level === "info" ? "lvl-info" : l.level === "warn" ? "lvl-warn" : "lvl-err"}>
                              {l.level.toUpperCase()}
                            </span>
                          </div>
                          <div className="log-msg">{l.msg}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {!inClientMode && homeView === "settings" && (
            <div className="view">
              <div className="settings-wrap">
                <div>
                  <h2>Settings</h2>
                  <p className="sub">Configure semantic search embedding provider</p>
                </div>

                <div className="settings-card">
                  <div className="settings-card-body">
                    <div className="settings-card-title">Embedding Provider</div>
                    <div className="settings-card-desc">Choose between OpenAI or Ollama for generating script embeddings.</div>
                    <div className="provider-toggle">
                      <button className={`prov-btn${provider === "openai" ? " active" : ""}`} onClick={() => setProvider("openai")}>OpenAI</button>
                      <button className={`prov-btn${provider === "ollama" ? " active" : ""}`} onClick={() => setProvider("ollama")}>Ollama</button>
                    </div>
                  </div>
                  <div className="settings-card-footer">
                    <span className="settings-footer-hint">Changing provider clears all cached indexes.</span>
                    <button className="save-btn">Save</button>
                  </div>
                </div>

                {provider === "openai" ? (
                  <div className="settings-card">
                    <div className="settings-card-body">
                      <div className="settings-card-title">OpenAI Configuration</div>
                      <div className="settings-card-desc">API key, base URL, and model for embeddings.</div>
                      <div className="settings-field"><label>API Key</label><input type="password" placeholder="sk-…" /></div>
                      <div className="settings-field"><label>Base URL</label><input type="text" placeholder="https://api.openai.com/v1" /></div>
                      <div className="settings-field"><label>Model</label><input type="text" placeholder="text-embedding-3-small" /></div>
                    </div>
                    <div className="settings-card-footer">
                      <span className="settings-footer-hint">Stored locally at ~/.roblox-mcp/semantic-search.json</span>
                      <button className="save-btn">Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="settings-card">
                    <div className="settings-card-body">
                      <div className="settings-card-title">Ollama Configuration</div>
                      <div className="settings-card-desc">Base URL and model for local Ollama embeddings.</div>
                      <div className="settings-field"><label>Base URL</label><input type="text" placeholder="http://localhost:11434" /></div>
                      <div className="settings-field"><label>Model</label><input type="text" placeholder="embeddinggemma" /></div>
                    </div>
                    <div className="settings-card-footer">
                      <span className="settings-footer-hint">Ensure Ollama is running locally.</span>
                      <button className="save-btn">Save</button>
                    </div>
                  </div>
                )}

                <div className="settings-card">
                  <div className="settings-card-body">
                    <div className="settings-card-title">Embedding Cache</div>
                    <div className="settings-card-desc">Reuse script embeddings after server restarts or Roblox reconnects.</div>
                    <div className="toggle-row" onClick={() => setCacheOn((v) => !v)}>
                      <div className={`toggle-track${cacheOn ? " on" : ""}`}><div className="toggle-thumb" /></div>
                      <span>Persist embeddings to disk</span>
                    </div>
                  </div>
                  <div className="settings-card-footer">
                    <span className="settings-footer-hint">Stored locally at ~/.roblox-mcp/semantic-embeddings.json</span>
                    <div className="footer-actions">
                      <button className="delete-btn">Delete Cache</button>
                      <button className="save-btn">Save</button>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-card-body">
                    <div className="settings-card-title">Test Connection</div>
                    <div className="settings-card-desc">Verify that the current embedding provider is reachable and configured correctly.</div>
                    <button className="test-btn"><Plug size={14} />Test Embedding Provider</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overview */}
          {inClientMode && clientView === "overview" && selected && (
            <div className="view">
              <div className="overview-wrap">
                <div className="hero-card">
                  <div className={`hero-avatar ${selected.avc}`}>{selected.av}</div>
                  <div className="hero-meta">
                    <h1>{selected.name}</h1>
                    <p>{selected.place}</p>
                  </div>
                  <span className="transport-pill">WS</span>
                </div>
                <div className="cards-row">
                  <div className="info-card"><div className="info-card-label">Client ID</div><div className="info-card-value">c-4f9a2b</div></div>
                  <div className="info-card"><div className="info-card-label">Place ID</div><div className="info-card-value">{placeId}</div></div>
                  <div className="info-card"><div className="info-card-label">User ID</div><div className="info-card-value">3141592</div></div>
                  <div className="info-card"><div className="info-card-label">Job ID</div><div className="info-card-value">a8d1…fc3</div></div>
                </div>
                <div className="tiles-row">
                  <div className="tile">
                    <div className="tile-head"><span className="tile-title">Connection</span><span className="badge badge-green">Active</span></div>
                    <div className="tile-stat"><span className="tile-stat-label">Transport</span><span className="tile-stat-val">WebSocket</span></div>
                  </div>
                  <div className="tile">
                    <div className="tile-head"><span className="tile-title">Activity</span></div>
                    <div className="tile-stat"><span className="tile-stat-label">Scripts Synced</span><span className="tile-stat-val">847</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scripts */}
          {inClientMode && clientView === "scripts" && (
            <div className="view">
              <div className="scripts-wrap">
                <div className="scripts-header">
                  <h2>Scripts</h2>
                  <p>Indexed scripts from the connected client</p>
                </div>
                <div className="scripts-body">
                  <div className="scripts-main">
                    <div className="scripts-toolbar">
                      <div className="scripts-search">
                        <Search className="ic" size={13} />
                        <input type="text" placeholder="Go to file…" autoComplete="off" />
                      </div>
                      <span className="scripts-count">847 scripts</span>
                    </div>
                    <div className="scripts-col-head"><div>Name</div><div>Lines</div><div>Size</div><div /></div>
                    <div className="scripts-list">
                      {SCRIPTS.map((s) => (
                        <div className="script-row" key={s.name}>
                          <div className="script-row-name">{s.name}</div>
                          <div>{s.lines}</div>
                          <div>{s.size}</div>
                          <div className="script-action"><button className="action-btn">Open</button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="scripts-sidebar-panel">
                    <div className="sidebar-section-card">
                      <div className="sidebar-sec-title">Scripts Synced</div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: "100%", background: "var(--accent)" }} /></div>
                      <div className="legend-row">
                        <div className="legend-dot" style={{ background: "var(--accent)" }} />
                        <span className="legend-label">Synced</span>
                        <span className="legend-val">847/847</span>
                        <span className="legend-perc">100%</span>
                      </div>
                      <div className="sec-footer"><span className="sync-badge done">Complete</span></div>
                    </div>
                    <div className="sidebar-section-card">
                      <div className="sidebar-sec-title">Semantic Indexing</div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: "62%", background: "#1d9e75" }} /></div>
                      <div className="legend-row">
                        <div className="legend-dot" style={{ background: "#1d9e75" }} />
                        <span className="legend-label">Indexed</span>
                        <span className="legend-val">525/847</span>
                        <span className="legend-perc">62%</span>
                      </div>
                      <div className="sec-footer">
                        <button className="index-btn">Index Game</button>
                        <span className="idle-label">Indexing…</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tools */}
          {inClientMode && clientView === "tools" && (
            <div className="view">
              <div className="tools-wrap">
                <div className="tools-main">
                  <div className="tools-card">
                    <div className="tool-exec-header">
                      <div className="tool-exec-info">
                        <h3>{activeTool.label}</h3>
                        <p>{activeTool.desc}</p>
                      </div>
                      <button className="send-btn" onClick={runTool}><span>Send</span><Play size={13} /></button>
                    </div>
                    <table className="params-table">
                      <thead><tr><th>Key</th><th>Value</th></tr></thead>
                      <tbody>
                        {activeTool.params.map((p) => (
                          <tr key={p.k}>
                            <td className="param-key">{p.k}</td>
                            <td className="param-val"><input type="text" placeholder={p.p} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="tool-response">
                      <div className="tool-res-header">
                        <span className="tool-res-title">Body</span>
                        <div className="tool-res-meta">
                          {resBadge && <span className="res-badge">{resBadge}</span>}
                          <span>{resTime}</span>
                        </div>
                      </div>
                      <div className="tool-res-body">{toolOutput}</div>
                    </div>
                  </div>
                </div>
                <div className="tools-sidebar-panel">
                  <div className="tools-sidebar-label">Collections</div>
                  <div className="tools-list">
                    {TOOLS.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          className={`tool-item${activeTool.id === t.id ? " active" : ""}`}
                          onClick={() => {
                            setActiveTool(t);
                            setToolOutput("Click Send to execute the tool");
                            setResBadge("");
                            setResTime("");
                          }}
                        >
                          <Icon size={14} />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
