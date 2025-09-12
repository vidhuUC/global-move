import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessagesList from "./components/MessagesList";
import ChatInput from "./components/ChatInput";
import useWebSocket from "./hooks/useWebSocket";
import useApiService from "./hooks/useApiService";
import { agents, pipelines, tasks, initialMessages, defaultProject, API_CONFIG, CHAT_MODES } from "./mock";

const GlobalMoveAG2Framework = () => {
  const [activeAgent, setActiveAgent] = useState("coordinator");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [moveProject] = useState(defaultProject);
  const [chatMode, setChatMode] = useState(CHAT_MODES.SINGLE);
  const messagesEndRef = useRef(null);

  // Backend configuration
  const { BACKEND_URL, WS_URL } = API_CONFIG;


  // Custom hooks
  const { isConnected, wsRef } = useWebSocket(WS_URL, agents, setMessages, setIsLoading);
  const { sendChatMessage, sendGroupChatMessage } = useApiService(BACKEND_URL);

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
      if (chatMode === CHAT_MODES.GROUP) {
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
        const responses = await sendGroupChatMessage(inputMessage, moveProject.id);

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
          const response = await sendChatMessage(inputMessage, activeAgent, moveProject.id);
          if (response) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now() + 2,
                sender: activeAgent,
                senderName: agents.find((a) => a.id === activeAgent)?.name,
                content: response.content,
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
  // Initialize with sample messages on connection
  useEffect(() => {
    if (isConnected && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [isConnected, messages.length]);


  return (
    <div className="app-container">
      <Sidebar 
        moveProject={moveProject} 
        chatMode={chatMode} 
        setChatMode={setChatMode} 
        agents={agents} 
        activeAgent={activeAgent} 
        setActiveAgent={setActiveAgent} 
        pipelines={pipelines} 
        tasks={tasks} 
      />
      
      <div className="main-content">
        <ChatHeader agents={agents} activeAgent={activeAgent} />
        
        <MessagesList 
          messages={messages} 
          agents={agents} 
          chatMode={chatMode} 
          isLoading={isLoading} 
          messagesEndRef={messagesEndRef} 
          activeAgent={activeAgent}
        />
        
        <ChatInput 
          inputMessage={inputMessage} 
          setInputMessage={setInputMessage} 
          handleSendMessage={handleSendMessage} 
          chatMode={chatMode} 
          agents={agents} 
          activeAgent={activeAgent} 
          isConnected={isConnected} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};

export default GlobalMoveAG2Framework;
