import { useState, useEffect, useRef } from "react";

const useWebSocket = (WS_URL, agents, setMessages, setIsLoading) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const clientId = useRef(`client_${Date.now()}`);

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

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { isConnected, wsRef, clientId };
};

export default useWebSocket;