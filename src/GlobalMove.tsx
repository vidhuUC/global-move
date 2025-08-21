import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Settings,
  Globe,
  Truck,
  Home,
  FileText,
  Bot,
  User,
  Send,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  DollarSign,
} from "lucide-react";
import "./styles.css";

const GlobalMoveAG2Framework = () => {
  const [activeAgent, setActiveAgent] = useState("coordinator");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [activePipeline, setActivePipeline] = useState("discovery");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [moveProject, setMoveProject] = useState({
    id: "MV-2025-001",
    client: "Sarah Johnson",
    from: "New York, USA",
    to: "London, UK",
    status: "planning",
    progress: 35,
  });
  const [chatMode, setChatMode] = useState("single"); // "single" or "group"
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const clientId = useRef(`client_${Date.now()}`);

  // Backend configuration
  const BACKEND_URL = "http://localhost:8000";
  const WS_URL = "ws://localhost:8000";

  const agents = [
    {
      id: "coordinator",
      name: "Move Coordinator",
      icon: Users,
      color: "bg-blue-500",
      status: "active",
    },
    {
      id: "logistics",
      name: "Logistics Agent",
      icon: Truck,
      color: "bg-green-500",
      status: "active",
    },
    {
      id: "housing",
      name: "Housing Agent",
      icon: Home,
      color: "bg-purple-500",
      status: "active",
    },
    {
      id: "legal",
      name: "Legal Agent",
      icon: FileText,
      color: "bg-orange-500",
      status: "busy",
    },
    {
      id: "finance",
      name: "Finance Agent",
      icon: DollarSign,
      color: "bg-red-500",
      status: "idle",
    },
  ];

  const pipelines = [
    {
      id: "discovery",
      name: "Discovery & Planning",
      progress: 80,
      status: "active",
    },
    {
      id: "documentation",
      name: "Documentation",
      progress: 45,
      status: "active",
    },
    {
      id: "logistics",
      name: "Logistics Coordination",
      progress: 20,
      status: "pending",
    },
    {
      id: "settlement",
      name: "Settlement Support",
      progress: 0,
      status: "pending",
    },
  ];

  const tasks = [
    {
      id: 1,
      title: "Visa application review",
      agent: "legal",
      status: "in-progress",
      priority: "high",
    },
    {
      id: 2,
      title: "Pet relocation arrangements",
      agent: "logistics",
      status: "completed",
      priority: "medium",
    },
    {
      id: 3,
      title: "School enrollment for children",
      agent: "coordinator",
      status: "pending",
      priority: "high",
    },
    {
      id: 4,
      title: "Banking setup in destination",
      agent: "finance",
      status: "pending",
      priority: "medium",
    },
  ];

  // WebSocket connection management
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(`${WS_URL}/ws/${clientId.current}`);

      ws.onopen = () => {
        console.log("Connected to AG2 backend");
        setIsConnected(true);
        wsRef.current = ws;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "agent_response") {
            const newMessage = {
              id: data.id,
              sender: data.sender,
              senderName:
                agents.find((a) => a.id === data.sender)?.name || data.sender,
              content: data.content,
              timestamp: new Date(data.timestamp),
              type: "agent",
            };
            setMessages((prev) => [...prev, newMessage]);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("Disconnected from AG2 backend");
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      setIsConnected(false);
    }
  };

  // REST API functions
  const sendChatMessage = async (message, agentId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          agent_id: agentId,
          project_id: moveProject.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Error sending chat message:", error);
      return null;
    }
  };

  const sendGroupChatMessage = async (message) => {
    try {
      const response = await fetch(`${BACKEND_URL}/group-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          agent_id: "coordinator",
          project_id: moveProject.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error("Error sending group chat message:", error);
      return [];
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isConnected) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      senderName: "You",
      content: inputMessage,
      timestamp: new Date(),
      type: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      if (chatMode === "group") {
        // Add coordination header message
        const coordinationMessage = {
          id: Date.now() + 1,
          sender: "system",
          senderName: "System",
          content: "Coordinating with all agents...",
          timestamp: new Date(),
          type: "coordination",
        };
        setMessages((prev) => [...prev, coordinationMessage]);

        // Use group chat coordination
        const responses = await sendGroupChatMessage(inputMessage);

        // Remove coordination message and add actual responses
        setMessages((prev) =>
          prev.filter((msg) => msg.type !== "coordination")
        );

        // Add all agent responses to messages
        const agentMessages = responses.map((response, index) => ({
          id: Date.now() + index + 2,
          sender: response.sender,
          senderName: response.sender_name,
          content: response.content,
          timestamp: new Date(response.timestamp),
          type: "agent",
          isGroupResponse: true,
        }));

        setMessages((prev) => [...prev, ...agentMessages]);
      } else {
        // Single agent communication (existing WebSocket logic)
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const wsMessage = {
            type: "chat",
            content: inputMessage,
            agent_id: activeAgent,
            project_id: moveProject.id,
          };
          wsRef.current.send(JSON.stringify(wsMessage));
        } else {
          // Fallback to REST API
          const response = await sendChatMessage(inputMessage, activeAgent);
          if (response) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now() + 2,
                sender: activeAgent,
                senderName: agents.find((a) => a.id === activeAgent)?.name,
                content: response,
                timestamp: new Date(),
                type: "agent",
              },
            ]);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 999,
          sender: "system",
          senderName: "System",
          content: "Failed to get response. Please check your connection.",
          timestamp: new Date(),
          type: "error",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize with sample messages on connection
  useEffect(() => {
    if (isConnected && messages.length === 0) {
      setMessages([
        {
          id: 1,
          sender: "coordinator",
          senderName: "Move Coordinator",
          content:
            "Welcome to your global relocation project! I've analyzed your requirements for the NYC to London move and I'm ready to coordinate with our specialized agents.",
          timestamp: new Date(Date.now() - 300000),
          type: "agent",
        },
        {
          id: 2,
          sender: "legal",
          senderName: "Legal Agent",
          content:
            "I've identified the key visa requirements for your UK relocation. The Skilled Worker visa appears to be the best option based on your profile.",
          timestamp: new Date(Date.now() - 240000),
          type: "agent",
        },
        {
          id: 3,
          sender: "housing",
          senderName: "Housing Agent",
          content:
            "I've found 15 potential properties in your preferred areas of London. Would you like to review the shortlist?",
          timestamp: new Date(Date.now() - 180000),
          type: "agent",
        },
      ]);
    }
  }, [isConnected, messages.length]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-300";
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Project Header */}
        <div className="project-header">
          <div className="project-title-section">
            <Globe className="project-icon" />
            <div>
              <h1 className="project-title">Global Move AG2</h1>
              <p className="project-subtitle">Multi-Agent System</p>
            </div>
          </div>
          <div className="chat-mode-selector">
            <button
              className={`mode-button ${chatMode === "single" ? "active" : ""}`}
              onClick={() => setChatMode("single")}
            >
              <User className="mode-icon" />
              <span>Single Agent</span>
            </button>
            <button
              className={`mode-button ${chatMode === "group" ? "active" : ""}`}
              onClick={() => setChatMode("group")}
            >
              <Users className="mode-icon" />
              <span>Group Coordination</span>
            </button>
          </div>

          <div className="project-info-box">
            <div className="project-info-header">
              <span className="project-id">Project: {moveProject.id}</span>
              <span className="project-progress-text">
                {moveProject.progress}% Complete
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${moveProject.progress}%` }}
              ></div>
            </div>
            <div className="project-details">
              <div className="location-info">
                <MapPin className="location-icon" />
                <span>
                  {moveProject.from} → {moveProject.to}
                </span>
              </div>
              <div>Client: {moveProject.client}</div>
            </div>
          </div>
        </div>

        {/* Agents */}
        <div className="agents-section">
          <h3 className="section-title">Active Agents</h3>
          <div className="agents-list">
            {agents.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <div
                  key={agent.id}
                  className={`agent-item ${
                    activeAgent === agent.id ? "active" : ""
                  }`}
                  onClick={() => setActiveAgent(agent.id)}
                >
                  <div className={`agent-icon-container ${agent.color}`}>
                    <IconComponent className="agent-icon" />
                  </div>
                  <div className="agent-info">
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-status-container">
                      <div className={`status-indicator ${agent.status}`}></div>
                      <span className="status-text">{agent.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipelines */}
        <div className="pipelines-section">
          <h3 className="section-title">Pipelines</h3>
          <div className="pipelines-list">
            {pipelines.map((pipeline) => (
              <div key={pipeline.id} className="pipeline-item">
                <div className="pipeline-header">
                  <span className="pipeline-name">{pipeline.name}</span>
                  <span className="pipeline-progress">
                    {pipeline.progress}%
                  </span>
                </div>
                <div className="pipeline-progress-bar">
                  <div
                    className={`pipeline-progress-fill ${pipeline.status}`}
                    style={{ width: `${pipeline.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="tasks-section">
          <h3 className="section-title">Active Tasks</h3>
          <div className="tasks-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-item ${task.priority}-priority`}
              >
                <div className="task-header">
                  {getStatusIcon(task.status)}
                  <span className="task-title">{task.title}</span>
                </div>
                <div className="task-assignment">
                  Assigned to: {agents.find((a) => a.id === task.agent)?.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="main-header">
          <div className="header-content">
            <div className="header-left">
              <div className="agent-header-info">
                {React.createElement(
                  agents.find((a) => a.id === activeAgent)?.icon || Bot,
                  { className: "header-agent-icon" }
                )}
                <h2 className="header-agent-name">
                  {agents.find((a) => a.id === activeAgent)?.name ||
                    "Agent Chat"}
                </h2>
              </div>
              <div className="online-status">
                <div className="online-indicator"></div>
                <span className="online-text">Online</span>
              </div>
            </div>
            <div className="header-actions">
              <button className="settings-button">
                <Settings className="settings-icon" />
              </button>
            </div>
          </div>
        </div>
        {/* Messages */}
        <div className="messages-container">
          {/* Add group coordination indicator */}
          {chatMode === "group" && (
            <div className="group-coordination-header">
              <Users className="mode-icon" />
              <span className="group-coordination-text">
                Group Coordination Mode - All agents will collaborate on your
                requests
              </span>
            </div>
          )}

          {messages.map((message, index) => {
            const isLastInGroup =
              !messages[index + 1]?.isGroupResponse && message.isGroupResponse;

            return (
              <div key={message.id}>
                <div className={`message-wrapper ${message.type}`}>
                  <div className={`message ${message.type}`}>
                    <div className={`message-avatar ${message.type}`}>
                      {message.type === "user" ? (
                        <User className="avatar-icon" />
                      ) : message.type === "error" ? (
                        <AlertCircle className="avatar-icon" />
                      ) : message.type === "coordination" ? (
                        <Users className="avatar-icon" />
                      ) : (
                        <div className="agent-avatar-container">
                          {React.createElement(
                            agents.find((a) => a.id === message.sender)?.icon ||
                              Bot,
                            { className: "avatar-icon" }
                          )}
                          {/* Add group coordination badge */}
                          {message.isGroupResponse && (
                            <div className="coordination-badge">
                              <Users className="coordination-icon" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`message-content ${message.type}`}>
                      <div className="message-header">
                        <span className={`sender-name ${message.type}`}>
                          {message.senderName}
                          {message.isGroupResponse && (
                            <span className="group-badge">
                              {" "}
                              • Group Response
                            </span>
                          )}
                        </span>
                        <span className={`message-timestamp ${message.type}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className={`message-text ${message.type}`}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add separator between group responses */}
                {message.isGroupResponse && !isLastInGroup && (
                  <div className="response-separator"></div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="loading-container">
              <div className="loading-message">
                <div
                  className={`message-avatar ${
                    chatMode === "group"
                      ? "bg-blue-500"
                      : agents.find((a) => a.id === activeAgent)?.color ||
                        "bg-gray-500"
                  }`}
                >
                  {chatMode === "group" ? (
                    <Users className="avatar-icon animate-pulse" />
                  ) : (
                    React.createElement(
                      agents.find((a) => a.id === activeAgent)?.icon || Bot,
                      { className: "avatar-icon animate-pulse" }
                    )
                  )}
                </div>
                <div className="loading-content">
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <span className="loading-text">
                      {chatMode === "group"
                        ? "Agents are coordinating..."
                        : "Agent is thinking..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="input-section">
          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSendMessage()
                }
                placeholder={
                  chatMode === "group"
                    ? "Ask all agents to coordinate on your request..."
                    : `Message ${
                        agents.find((a) => a.id === activeAgent)?.name
                      }...`
                }
                disabled={!isConnected || isLoading}
                className="message-input"
              />
              {!isConnected && <div className="connection-spinner"></div>}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !isConnected || isLoading}
              className="send-button"
            >
              {chatMode === "group" ? (
                <Users className="send-icon" />
              ) : (
                <Send className="send-icon" />
              )}
              <span>{chatMode === "group" ? "Coordinate" : "Send"}</span>
            </button>
          </div>

          <div className="input-footer">
            <div className="input-actions">
              <button className="action-button" disabled={!isConnected}>
                <Plus className="action-icon" />
                <span>Add Context</span>
              </button>
              <button className="action-button" disabled={!isConnected}>
                <FileText className="action-icon" />
                <span>Attach File</span>
              </button>
            </div>
            <div className="connection-status">
              {isConnected ? (
                <>
                  <div className="connection-dot connected"></div>
                  <span>Connected to AG2 Backend</span>
                </>
              ) : (
                <>
                  <div className="connection-dot disconnected"></div>
                  <span>Connecting to AG2 Backend...</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalMoveAG2Framework;
