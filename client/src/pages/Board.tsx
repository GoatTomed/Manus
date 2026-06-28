import { useEffect, useState, useCallback } from "react";
import { ReactFlow, Node, Edge, Background, useNodesState, useEdgesState, useReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import axios from "axios";
import "./Board.css";

const ALLOWED_IP = "24.49.252.230";

const PlayerNode = ({ data }: any) => (
  <div className="premium-card player-node" onClick={() => data.onNodeClick(data.linkedId)}>
    <div className="card-badge">PLAYER</div>
    <div className="card-title">{data.label}</div>
    <div className="card-subtitle">ID: {data.robloxId}</div>
    <div className="card-footer">{data.executor || 'Active Session'}</div>
  </div>
);

const KeyNode = ({ data }: any) => (
  <div className="premium-card key-node" onClick={() => data.onNodeClick(data.linkedId)}>
    <div className="card-badge key">KEY</div>
    <div className="card-title monospace">{data.keyValue}</div>
    <div className="card-status">{data.status}</div>
    <div className="card-footer">Click to find player</div>
  </div>
);

const nodeTypes = { player: PlayerNode, key: KeyNode };

function BoardContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [search, setSearch] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const { fitView, setCenter } = useReactFlow();

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json())
      .then(data => {
        if (data.ip !== ALLOWED_IP) setAccessDenied(true);
        setAccessChecked(true);
      })
      .catch(() => {
        setAccessDenied(true);
        setAccessChecked(true);
      });
  }, []);

  const teleportToNode = useCallback((nodeId: string) => {
    if (!nodeId) return;
    const node = nodes.find(n => n.id === nodeId);
    if (node) setCenter(node.position.x + 100, node.position.y + 40, { zoom: 1.5, duration: 800 });
  }, [nodes, setCenter]);

  useEffect(() => {
    if (!accessChecked || accessDenied) return;

    const fetchData = async () => {
      try {
        console.log("Board: Fetching data (v4)...");
        const keysRes = await axios.get('/api/keys');
        
        let logsData = [];
        try {
          const logsRes = await axios.get('/api/connection-logs');
          logsData = logsRes.data || [];
        } catch (e) {
          console.warn("Board: Connection logs failed.");
        }
        
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const playersMap = new Map();
        
        logsData.forEach((l: any) => {
          if (l.roblox_id) playersMap.set(String(l.roblox_id), l);
        });

        keysRes.data.forEach((k: any, idx: number) => {
          const keyId = `key-${k.id}`;
          const visitorIdStr = String(k.visitor_id);
          const playerMatch = playersMap.get(visitorIdStr);
          const playerId = playerMatch ? `player-${visitorIdStr}` : null;
          
          // Add Key Node (Fixed position in grid)
          newNodes.push({
            id: keyId,
            type: 'key',
            position: { x: 400, y: idx * 140 },
            data: { 
              keyValue: k.key_value, 
              status: k.is_used ? 'Used' : 'Active',
              linkedId: playerId,
              onNodeClick: teleportToNode 
            },
          });

          // Add Player Node if linked (Fixed relative position)
          if (playerMatch) {
            newNodes.push({
              id: playerId!,
              type: 'player',
              position: { x: 100, y: idx * 140 },
              data: { 
                label: playerMatch.roblox_name || 'Unknown', 
                robloxId: visitorIdStr, 
                executor: playerMatch.executor,
                linkedId: keyId,
                onNodeClick: teleportToNode 
              },
            });

            newEdges.push({
              id: `e-${k.id}`,
              source: playerId!,
              target: keyId,
              animated: true,
              style: { stroke: 'rgba(59, 130, 246, 0.6)', strokeWidth: 2 }
            });
          }
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setTimeout(() => fitView({ duration: 800, padding: 0.5 }), 200);
      } catch (e: any) {
        console.error("Board: Critical failure", e);
      }
    };
    fetchData();
  }, [accessChecked, accessDenied, setNodes, setEdges, teleportToNode, fitView]);

  if (!accessChecked) return null;
  if (accessDenied) {
    return (
      <div className="access-denied">
        <h1>Access Denied</h1>
        <p>Your IP is not authorized to view this board.</p>
      </div>
    );
  }

  return (
    <div className="board-container">
      <div className="board-search-floating">
        <input 
          type="text" 
          placeholder="Search" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const found = nodes.find(n => 
                (n.data as any).keyValue?.toLowerCase().includes(search.toLowerCase()) ||
                (n.data as any).label?.toLowerCase().includes(search.toLowerCase()) ||
                (n.data as any).robloxId?.toString().includes(search)
              );
              if (found) setCenter(found.position.x + 100, found.position.y + 40, { zoom: 1.5, duration: 800 });
            }
          }}
        />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        style={{ background: '#000' }}
        colorMode="dark"
      >
        <Background color="#111" gap={20} />
      </ReactFlow>
    </div>
  );
}

export default function Board() {
  return (
    <ReactFlowProvider>
      <BoardContent />
    </ReactFlowProvider>
  );
}
