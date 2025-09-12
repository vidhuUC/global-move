const useApiService = (BACKEND_URL) => {
  const sendChatMessage = async (message, agentId, projectId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          agent_id: agentId,
          project_id: projectId,
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

  const sendGroupChatMessage = async (message, projectId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/group-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          agent_id: "coordinator",
          project_id: projectId,
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

  return { sendChatMessage, sendGroupChatMessage };
};

export default useApiService;