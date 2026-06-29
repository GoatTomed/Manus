import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import CodeBlock from "../components/CodeBlock";
import "./AICoding.css";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  logs?: string[];
  results?: any[];
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
  { id: "search", label: "Web Search", icon: "ti-world" },
  { id: "knowledge", label: "Knowledge", icon: "ti-database" },
];

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663690201156/JENZdJJc5x8KiqieXexEyT/yousuck-logo-v3-UfpH3hrPHAYBWPNbmh6WvM.webp";
const MANUS_LOGO = "https://manus.ai/favicon.ico"; // Using official favicon as logo

export default function AICoding() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiView, setAIView] = useState<AIView>("chat");
  const [sessionQuery, setSessionQuery] = useState("");
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ai_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setCurrentSession(parsed[0]);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) localStorage.setItem("ai_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, liveLogs]);

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
    setAIView("chat");
  };

  const deleteSession = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSession?.id === id) setCurrentSession(filtered[0] || null);
  };

  const sendMessage = async (overrideInput?: string) => {
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || !currentSession) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: finalInput,
      timestamp: new Date(),
    };

    setLoading(true);
    setAIView("chat"); // Always switch to chat to see progress
    setLiveLogs(["Connecting to Manus.ai...", "Analyzing request..."]);
    setInput("");

    setCurrentSession(prev => {
      if (!prev) return null;
      return { ...prev, messages: [...prev.messages, userMessage], updatedAt: new Date() };
    });

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentSession.id, message: finalInput }),
      });

      if (response.status === 504) {
         throw new Error("Timeout: Vercel server took too long. The AI is still working, please refresh in a moment.");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      
      const res = data.result?.data;
      
      if (res?.thoughtLogs) {
        setLiveLogs(prev => [...prev, ...res.thoughtLogs]);
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res?.response || "Error: No response",
        timestamp: new Date(),
        logs: res?.thoughtLogs,
        results: res?.searchResults,
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSession.id) {
          const updatedMessages = [...s.messages, userMessage, aiMessage];
          let updatedTitle = s.title;
          if (s.title === "New Chat") {
            updatedTitle = finalInput.substring(0, 40) + (finalInput.length > 40 ? "..." : "");
          }
          return { ...s, title: updatedTitle, messages: updatedMessages, updatedAt: new Date() };
        }
        return s;
      }));

      setCurrentSession(prev => {
        if (!prev) return null;
        const updatedMessages = [...prev.messages, aiMessage];
        let updatedTitle = prev.title;
        if (prev.title === "New Chat") {
          updatedTitle = finalInput.substring(0, 40) + (finalInput.length > 40 ? "..." : "");
        }
        return { ...prev, title: updatedTitle, messages: updatedMessages, updatedAt: new Date() };
      });

    } catch (error: any) {
      const errorMsg = error.message || "Something went wrong";
      toast.error(errorMsg);
      
      const aiErrorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ ${errorMsg}`,
        timestamp: new Date(),
      };

      setCurrentSession(prev => {
        if (!prev) return null;
        return { ...prev, messages: [...prev.messages, aiErrorMessage] };
      });
    } finally {
      setLoading(false);
      setLiveLogs([]);
    }
  };

  return (
    <div className="manus-layout">
      {/* ── SIDEBAR (HISTORY) ── */}
      <aside className={`manus-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="sidebar-top">
          <button className="new-chat-large" onClick={createNewSession}>
            <i className="ti ti-plus"></i> New Chat
          </button>
          <div className="search-sessions">
            <i className="ti ti-search"></i>
            <input placeholder="Search chats..." value={sessionQuery} onChange={e => setSessionQuery(e.target.value)} />
          </div>
        </div>
        <div className="sessions-list-manus">
          {sessions.filter(s => s.title.toLowerCase().includes(sessionQuery.toLowerCase())).map(session => (
            <div key={session.id} className={`session-row-manus ${currentSession?.id === session.id ? "active" : ""}`} onClick={() => setCurrentSession(session)}>
              <i className="ti ti-message"></i>
              <span className="title">{session.title}</span>
              <button className="del" onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}><i className="ti ti-trash"></i></button>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN CHAT AREA ── */}
      <main className="manus-main">
        <header className="manus-header">
          <button className="toggle-sidebar-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`ti ti-layout-sidebar-${sidebarOpen ? "left" : "right"}`}></i>
          </button>
          <div className="view-tabs">
            {aiNav.map(n => (
              <button key={n.id} className={`tab-btn-manus ${aiView === n.id ? "active" : ""}`} onClick={() => setAIView(n.id)}>
                <i className={`ti ${n.icon}`}></i> {n.label}
              </button>
            ))}
          </div>
        </header>

        <div className="chat-content-manus">
          {aiView === "chat" && (
            <div className="chat-scroller">
              {!currentSession ? (
                <div className="empty-manus">
                  <div className="logo-placeholder-manus">
                    <img src={MANUS_LOGO} alt="Manus Logo" style={{ borderRadius: "50%" }} />
                  </div>
                  <h1>How can I help you today?</h1>
                  <p>I can search the web, write code, and solve complex problems.</p>
                </div>
              ) : (
                <div className="messages-list-manus">
                  {currentSession.messages.map(msg => (
                    <div key={msg.id} className={`msg-container ${msg.role}`}>
                      <div className="msg-avatar-manus">
                        <img src={msg.role === "user" ? LOGO_URL : MANUS_LOGO} alt="Avatar" style={{ borderRadius: msg.role === "user" ? "8px" : "50%" }} />
                      </div>
                      <div className="msg-body">
                        <div className="msg-content">
                          <ReactMarkdown
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                  <CodeBlock
                                    code={String(children).replace(/\n$/, "")}
                                    language={match[1]}
                                  />
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        {msg.results && msg.results.length > 0 && (
                          <div className="search-results-mini">
                            {msg.results.slice(0, 3).map((r: any, i: number) => (
                              <a key={i} href={r.url} target="_blank" rel="noreferrer" className="res-link">
                                <i className="ti ti-link"></i> {r.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="msg-container assistant loading">
                      <div className="msg-avatar-manus">
                        <img src={MANUS_LOGO} alt="Manus Avatar" style={{ borderRadius: "50%" }} />
                      </div>
                      <div className="msg-body">
                        <div className="manus-step-indicator">
                          <div className="step-header">
                            <div className="step-title">
                              <i className="ti ti-clock"></i>
                              <span>{liveLogs[liveLogs.length - 1] || "Processing request..."}</span>
                            </div>
                            <div className="step-counter">
                              {liveLogs.length > 2 ? "2 / 3" : "1 / 3"} <i className="ti ti-chevron-down"></i>
                            </div>
                          </div>
                          <div className="live-progress-manus">
                            <div className="spinner-manus"></div>
                            <div className="logs-manus">
                              {liveLogs.map((log, i) => (
                                <div key={i} className="log-line animate-fade-in">{log}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}

          {aiView === "search" && (
            <div className="search-view-manus">
              <div className="search-hero">
                <i className="ti ti-world"></i>
                <h1>Live Web Search</h1>
                <p>Real-time browsing and data extraction in a secure sandbox.</p>
                <div className="search-bar-manus">
                  <input 
                    placeholder="Enter URL or search query..." 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyPress={e => e.key === "Enter" && sendMessage()} 
                  />
                  <button onClick={() => sendMessage()} className="search-btn-manus">
                    <i className="ti ti-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          {aiView === "knowledge" && (
            <div className="knowledge-view-manus">
              <div className="knowledge-grid">
                <div className="k-card">
                  <i className="ti ti-code"></i>
                  <h3>Programming</h3>
                  <p>Expertise in Lua, Python, JS, and 20+ other languages.</p>
                </div>
                <div className="k-card">
                  <i className="ti ti-search"></i>
                  <h3>Web Intelligence</h3>
                  <p>Deep search across news, docs, and academic papers.</p>
                </div>
                <div className="k-card">
                  <i className="ti ti-brain"></i>
                  <h3>Reasoning</h3>
                  <p>Complex problem solving and logical analysis.</p>
                </div>
                <div className="k-card">
                  <i className="ti ti-database"></i>
                  <h3>Data Processing</h3>
                  <p>Analyze, visualize and transform any dataset.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {aiView === "chat" && (
          <footer className="manus-input-area">
            <div className="input-box-manus">
              <textarea 
                placeholder="Message Manus..." 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyPress={e => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} 
              />
              <div className="input-actions-manus">
                 <button className={`send-btn ${input.trim() ? "active" : ""}`} onClick={() => sendMessage()} disabled={!input.trim() || loading}>
                   <i className={`ti ti-arrow-up ${loading ? "spin" : ""}`}></i>
                 </button>
              </div>
            </div>
            <div className="input-footer">Manus can make mistakes. Check important info.</div>
          </footer>
        )}
      </main>
    </div>
  );
}
