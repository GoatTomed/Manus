import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import "./AICoding.css";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

type AIView = "chat" | "search" | "knowledge";

const aiNav: { id: AIView; label: string; icon: string }[] = [
  { id: "chat", label: "Chat", icon: "ti-message-circle" },
  { id: "search", label: "Web Search", icon: "ti-search" },
  { id: "knowledge", label: "Knowledge Base", icon: "ti-book" },
];

const labelStyle = { color: "#71717a", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.08em", fontWeight: "700", marginBottom: "8px" };

export default function AICoding() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiView, setAIView] = useState<AIView>("chat");
  const [sessionQuery, setSessionQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [progress, setProgress] = useState<{ status: string; percent: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ai_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSession(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to load sessions:", e);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("ai_sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSession(newSession);
  };

  const deleteSession = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSession?.id === id) {
      setCurrentSession(filtered[0] || null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSession) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setLoading(true);
    setProgress({ status: "Analyzing your question...", percent: 10 });
    const userInput = input;
    setInput("");

    try {
      // Update UI with user message
      const updated = {
        ...currentSession,
        messages: [...currentSession.messages, userMessage],
        updatedAt: new Date(),
      };
      setCurrentSession(updated);
      setSessions(sessions.map(s => s.id === currentSession.id ? updated : s));

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (!prev || prev.percent >= 90) return prev;
          return { ...prev, percent: prev.percent + 5 };
        });
      }, 1000);

      // Call AI API (backend will handle search + knowledge base)
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession.id,
          message: userInput,
          conversationHistory: currentSession.messages,
        }),
      });

      clearInterval(progressInterval);
      setProgress({ status: "Generating response...", percent: 95 });

      const data = await response.json();
      const responseText = data.result?.data?.response || "Error: No response from AI";

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      const finalUpdate = {
        ...updated,
        messages: [...updated.messages, aiMessage],
        updatedAt: new Date(),
      };
      setCurrentSession(finalUpdate);
      setSessions(sessions.map(s => s.id === currentSession.id ? finalUpdate : s));

      // Update session title if it's still "New Chat"
      if (currentSession.title === "New Chat") {
        const newTitle = userInput.substring(0, 50) + (userInput.length > 50 ? "..." : "");
        setSessions(sessions.map(s =>
          s.id === currentSession.id ? { ...s, title: newTitle } : s
        ));
      }
      setProgress(null);
    } catch (error) {
      setProgress(null);
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Error: Failed to get response from AI. Please try again.",
        timestamp: new Date(),
      };
      setCurrentSession({
        ...currentSession,
        messages: [...currentSession.messages, userMessage, errorMessage],
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard!");
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filteredSessions = useMemo(() =>
    sessions.filter(s =>
      s.title.toLowerCase().includes(sessionQuery.toLowerCase()) ||
      s.messages.some(m => m.content.toLowerCase().includes(sessionQuery.toLowerCase()))
    ),
    [sessions, sessionQuery]
  );

  return (
    <div className="track-page">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="fixed-sidebar">
        <nav className="sidebar-nav">
          {aiNav.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${aiView === item.id ? "active" : ""}`}
              onClick={() => { setAIView(item.id); setSelectedMessage(null); }}
            >
              <i className={`ti ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content has-fixed-sidebar">
        <div className="view-container">
          {aiView === "chat" && (
            <div className="view active animate-slide-in">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
                <h1 style={{ fontSize: "32px", fontWeight: "900" }}>AI Chat</h1>
                <button className="btn-primary" onClick={createNewSession}>
                  <i className="ti ti-plus"></i> New Chat
                </button>
              </div>

              {!currentSession ? (
                <div style={{ textAlign: "center", color: "#71717a", padding: "60px 20px" }}>
                  <i className="ti ti-message-circle-off" style={{ fontSize: "48px", marginBottom: "16px", display: "block" }}></i>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", color: "white", marginBottom: "8px" }}>No conversation selected</h2>
                  <p>Create a new chat to get started</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "40px" }}>
                  <div>
                    <div className="glass-card" style={{ padding: "24px", marginBottom: "24px", maxHeight: "600px", overflowY: "auto" }}>
                      <div style={labelStyle}>Chat Messages</div>
                      {currentSession.messages.length === 0 && !loading ? (
                        <div style={{ textAlign: "center", color: "#71717a", padding: "40px 20px" }}>
                          <i className="ti ti-message-circle-off" style={{ fontSize: "32px", marginBottom: "8px", display: "block" }}></i>
                          <p>Start a conversation by asking a question</p>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {currentSession.messages.map(msg => (
                            <div
                              key={msg.id}
                              style={{
                                padding: "12px 16px",
                                borderRadius: "10px",
                                background: msg.role === "user" ? "rgba(0, 171, 255, 0.1)" : "rgba(255, 255, 255, 0.03)",
                                border: `1px solid ${msg.role === "user" ? "rgba(0, 171, 255, 0.2)" : "rgba(255, 255, 255, 0.05)"}`,
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onClick={() => setSelectedMessage(msg)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = msg.role === "user" ? "rgba(0, 171, 255, 0.15)" : "rgba(255, 255, 255, 0.05)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = msg.role === "user" ? "rgba(0, 171, 255, 0.1)" : "rgba(255, 255, 255, 0.03)";
                              }}
                            >
                              <div style={{ fontSize: "12px", color: msg.role === "user" ? "#00ABFF" : "#a1a1aa", fontWeight: "700", marginBottom: "4px" }}>
                                {msg.role === "user" ? "You" : "AI"}
                              </div>
                              <div style={{ fontSize: "13px", color: "white", lineHeight: "1.4" }}>
                                {msg.content.substring(0, 100)}{msg.content.length > 100 ? "..." : ""}
                              </div>
                              <div style={{ fontSize: "11px", color: "#52525b", marginTop: "8px" }}>{formatTime(msg.timestamp)}</div>
                            </div>
                          ))}
                          {loading && (
                            <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                <i className="ti ti-loader" style={{ fontSize: "14px", animation: "spin 1s linear infinite" }}></i>
                                <span style={{ fontSize: "12px", color: "#a1a1aa" }}>{progress?.status || "Processing..."}</span>
                              </div>
                              <div style={{ background: "rgba(255, 255, 255, 0.05)", height: "4px", borderRadius: "2px", overflow: "hidden" }}>
                                <div style={{ background: "#00ABFF", height: "100%", width: `${progress?.percent || 0}%`, transition: "width 0.3s" }}></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                      <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0 }}>Ask a Question</h3>
                        <button className="btn-execute" style={{ width: "auto", padding: "8px 24px" }} onClick={sendMessage} disabled={loading}>
                          Send
                        </button>
                      </div>
                      <textarea
                        className="console-textarea"
                        style={{ margin: "0", border: "none", width: "100%", height: "120px" }}
                        placeholder="Ask anything... I'll search the web and my knowledge base for answers."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            sendMessage();
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* ── RIGHT SIDEBAR (Sessions List) ── */}
                  <div className="profile-card">
                    <div style={labelStyle}>Sessions</div>
                    <div className="user-list">
                      {filteredSessions.map(session => (
                        <div
                          key={session.id}
                          className={`user-row ${currentSession?.id === session.id ? "active" : ""}`}
                          onClick={() => setCurrentSession(session)}
                        >
                          <i className="ti ti-message-circle" style={{ fontSize: "20px", color: "#00ABFF" }}></i>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "14px", fontWeight: "800" }}>{session.title}</div>
                            <div style={{ fontSize: "11px", color: "#71717a" }}>{session.messages.length} messages</div>
                          </div>
                          <button
                            className="btn-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {aiView === "search" && (
            <div className="view active animate-slide-in">
              <h1 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "40px" }}>Web Search</h1>
              <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
                <i className="ti ti-search" style={{ fontSize: "48px", color: "#00ABFF", marginBottom: "16px", display: "block" }}></i>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Search the Web</h2>
                <p style={{ color: "#71717a", marginBottom: "24px" }}>Use the chat to ask questions and I'll search the web for the most current information.</p>
                <button className="btn-primary" onClick={() => { setAIView("chat"); createNewSession(); }}>
                  <i className="ti ti-plus"></i> Start a Chat
                </button>
              </div>
            </div>
          )}

          {aiView === "knowledge" && (
            <div className="view active animate-slide-in">
              <h1 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "40px" }}>Knowledge Base</h1>
              <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
                <i className="ti ti-book" style={{ fontSize: "48px", color: "#00ABFF", marginBottom: "16px", display: "block" }}></i>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>AI Knowledge Base</h2>
                <p style={{ color: "#71717a", marginBottom: "24px" }}>I have access to a comprehensive knowledge base covering programming, technology, science, and more. Ask me anything!</p>
                <button className="btn-primary" onClick={() => { setAIView("chat"); createNewSession(); }}>
                  <i className="ti ti-plus"></i> Start a Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── RIGHT SIDEBAR (Message Details) ── */}
      {selectedMessage && (
        <div className="profile-sidebar animate-slide-in">
          <button className="btn-secondary" style={{ marginBottom: "32px" }} onClick={() => setSelectedMessage(null)}>Close</button>
          <div className="profile-card" style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "900", marginBottom: "16px" }}>
              {selectedMessage.role === "user" ? "Your Question" : "AI Response"}
            </h2>
            <span className={`status-badge ${selectedMessage.role === "user" ? "active" : "used"}`}>
              {selectedMessage.role === "user" ? "Question" : "Response"}
            </span>
          </div>
          <div style={labelStyle}>Full Message</div>
          <div className="glass-card" style={{ padding: "16px", marginBottom: "24px", maxHeight: "400px", overflowY: "auto" }}>
            <p style={{ fontSize: "13px", lineHeight: "1.6", color: "white", margin: 0 }}>
              {selectedMessage.content}
            </p>
          </div>
          <button
            className="btn-execute"
            style={{ width: "100%", padding: "12px 24px" }}
            onClick={() => copyToClipboard(selectedMessage.content)}
          >
            <i className="ti ti-copy"></i> Copy to Clipboard
          </button>
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={labelStyle}>Timestamp</div>
            <div style={{ fontSize: "13px", color: "#a1a1aa" }}>
              {selectedMessage.timestamp.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
