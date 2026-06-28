import { useState, useEffect, useRef } from "react";
import "./AICoding.css";

type AIView = "chat" | "connect";

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

const robloxConnectScript = `local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

-- Configuration
local API_URL = "https://yoursuck.vercel.app/api/ai"
local SESSION_ID = HttpService:GenerateGUID(false)

-- Function to ask AI
function _G.askAI(question)
    local success, response = pcall(function()
        return HttpService:PostAsync(
            API_URL .. "/chat",
            HttpService:JSONEncode({
                sessionId = SESSION_ID,
                message = question,
                conversationHistory = {}
            }),
            Enum.HttpContentType.ApplicationJson
        )
    end)
    
    if success then
        local data = HttpService:JSONDecode(response)
        if data.result and data.result.data then
            print("AI Response:", data.result.data.response)
            return data.result.data.response
        end
    else
        warn("Error:", response)
    end
end

-- Example usage:
-- _G.askAI("How do I get the player character?")
-- _G.askAI("How do I create a RemoteEvent?")
print("AI Assistant ready! Use _G.askAI('your question')")`;

export default function AICoding() {
  const [view, setView] = useState<AIView>("chat");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

      // Call API
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession.id,
          message: input,
          conversationHistory: currentSession.messages,
        }),
      });

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.result?.data?.response || "Error: No response",
        timestamp: new Date(),
      };

      const finalUpdate = {
        ...updated,
        messages: [...updated.messages, aiMessage],
        updatedAt: new Date(),
      };
      setCurrentSession(finalUpdate);
      setSessions(sessions.map(s => s.id === currentSession.id ? finalUpdate : s));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
                <p>Roblox Studio Assistant</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tab-nav">
            <button
              className={`tab-btn ${view === "chat" ? "active" : ""}`}
              onClick={() => setView("chat")}
            >
              <i className="ti ti-message-circle"></i>
              <span>AI Coding Lua</span>
            </button>
            <button
              className={`tab-btn ${view === "connect" ? "active" : ""}`}
              onClick={() => setView("connect")}
            >
              <i className="ti ti-plug"></i>
              <span>Connect</span>
            </button>
          </div>

          {/* Chat View */}
          {view === "chat" && (
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
                        <h2>Welcome to AI Lua Coding Assistant</h2>
                        <p>Ask questions about Roblox Lua scripting, get code examples, and learn best practices.</p>
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
                        placeholder="Ask about Roblox Lua scripting..."
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
          )}

          {/* Connect View */}
          {view === "connect" && (
            <div className="connect-container">
              <div className="connect-header">
                <h2>Roblox Studio Connection</h2>
                <p>Copy this script into Roblox Studio to connect with the AI assistant</p>
              </div>

              <div className="script-box">
                <div className="script-header">
                  <span>Lua Script</span>
                  <button
                    className="copy-script-btn"
                    onClick={() => copyToClipboard(robloxConnectScript)}
                  >
                    <i className="ti ti-copy"></i>
                    Copy Script
                  </button>
                </div>
                <pre className="script-content">
                  <code>{robloxConnectScript}</code>
                </pre>
              </div>

              <div className="usage-guide">
                <h3>How to Use</h3>
                <ol>
                  <li>Copy the script above</li>
                  <li>Open Roblox Studio</li>
                  <li>Open the Command Bar (View → Command Bar)</li>
                  <li>Paste and execute the script</li>
                  <li>Use <code>_G.askAI("your question")</code> to query the assistant</li>
                </ol>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <i className="ti ti-code"></i>
                  <h4>Lua Syntax Highlighting</h4>
                  <p>All code snippets include proper Lua syntax highlighting</p>
                </div>
                <div className="feature-card">
                  <i className="ti ti-history"></i>
                  <h4>Persistent History</h4>
                  <p>Your chat history is saved automatically for future reference</p>
                </div>
                <div className="feature-card">
                  <i className="ti ti-plug"></i>
                  <h4>Direct Integration</h4>
                  <p>Query the AI directly from Roblox Studio via HttpService</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
