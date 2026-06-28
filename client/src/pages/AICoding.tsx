import { useState, useEffect, useRef } from "react";
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

export default function AICoding() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [robloxConnected, setRobloxConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ai_sessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSession(parsed[0]);
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

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/ai/chat?sessionId=" + (currentSession?.id || "test"));
        if (response.ok) {
          const data = await response.json();
          setIsConnected(data.result?.data?.isConnected || false);
          setRobloxConnected(data.result?.data?.isRobloxConnected || false);
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 3000);
    return () => clearInterval(interval);
  }, [currentSession?.id]);

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

      // If Roblox is connected, send to Roblox
      if (robloxConnected) {
        try {
          await fetch("/api/ai/send-to-roblox", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: currentSession.id,
              message: userInput,
            }),
          });
        } catch (e) {
          console.error("Failed to send to Roblox:", e);
        }
      }

      // Call AI API
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession.id,
          message: userInput,
          conversationHistory: currentSession.messages,
          isRoblox: robloxConnected,
        }),
      });

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.result?.data?.response || "Error: No response from AI",
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
    } catch (error) {
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

  return (
    <div className="ai-page">
      <div className="layout no-padding">
        {/* Sidebar */}
        <div className={`fixed-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="sidebar-header">
            <div className="sidebar-title">
              <i className="ti ti-code"></i>
              <span>AI Lua</span>
            </div>
            <div className={`connection-badge ${isConnected ? "connected" : "disconnected"}`}>
              <span className="status-dot"></span>
              {isConnected ? "Connected" : "Offline"}
            </div>
          </div>

          <button className="new-chat-btn" onClick={createNewSession}>
            <i className="ti ti-plus"></i>
            <span>New Chat</span>
          </button>

          <div className="sessions-list">
            {sessions.length === 0 ? (
              <div className="empty-state">
                <i className="ti ti-message-circle-off"></i>
                <p>No conversations yet</p>
              </div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  className={`session-item ${currentSession?.id === session.id ? "active" : ""}`}
                  onClick={() => setCurrentSession(session)}
                >
                  <div className="session-info">
                    <div className="session-title">{session.title}</div>
                    <div className="session-meta">
                      {session.messages.length} messages • {formatTime(session.updatedAt)}
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  >
                    <i className="ti ti-trash"></i>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="sidebar-footer">
            <div className="total-sessions">Total sessions: {sessions.length}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content has-fixed-sidebar">
          {/* Header */}
          <div className="ai-header">
            <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className={`ti ti-${sidebarOpen ? "chevron-left" : "chevron-right"}`}></i>
            </button>
            <div className="header-title">
              <i className="ti ti-code"></i>
              <div>
                <h1>AI Lua Coding</h1>
                <p>Security Testing Tool</p>
              </div>
            </div>
            <div className="header-status">
              <div className={`status-indicator ${isConnected ? "online" : "offline"}`}>
                <span className="status-dot"></span>
                <span>{isConnected ? "API Online" : "API Offline"}</span>
              </div>
              {robloxConnected && (
                <div className="roblox-status">
                  <span className="status-dot roblox"></span>
                  <span>Roblox Connected</span>
                </div>
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className="chat-container">
            {!currentSession ? (
              <div className="empty-chat">
                <i className="ti ti-message-circle-off"></i>
                <h2>No conversation selected</h2>
                <p>Create a new chat to get started</p>
                <button className="create-btn" onClick={createNewSession}>
                  <i className="ti ti-plus"></i>
                  Start New Chat
                </button>
              </div>
            ) : (
              <>
                <div className="messages-area">
                  {currentSession.messages.length === 0 ? (
                    <div className="welcome-message">
                      <div className="welcome-icon">
                        <i className="ti ti-code"></i>
                      </div>
                      <h2>Welcome to AI Lua Coding</h2>
                      <p>Generate Lua code for security testing and vulnerability patching.</p>
                    </div>
                  ) : (
                    currentSession.messages.map(msg => (
                      <div key={msg.id} className={`message ${msg.role}`}>
                        <div className="message-content">
                          {msg.role === "assistant" ? (
                            <>
                              <div className="message-text">{msg.content}</div>
                              <button
                                className="copy-btn"
                                onClick={() => copyToClipboard(msg.content)}
                                title="Copy to clipboard"
                              >
                                <i className="ti ti-copy"></i>
                                <span>Copy</span>
                              </button>
                            </>
                          ) : (
                            <div className="message-text">{msg.content}</div>
                          )}
                        </div>
                        <div className="message-time">{formatTime(msg.timestamp)}</div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="input-area">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Ask about Lua scripting..."
                      disabled={loading}
                    />
                    <button onClick={sendMessage} disabled={loading || !input.trim()} className="send-btn">
                      <i className={`ti ti-${loading ? "loader" : "send"}`}></i>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
