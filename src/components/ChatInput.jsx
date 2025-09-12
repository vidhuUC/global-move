import React from "react";
import { Send, Users, Plus, FileText } from "lucide-react";

const ChatInput = ({ 
  inputMessage, 
  setInputMessage, 
  handleSendMessage, 
  chatMode, 
  agents, 
  activeAgent, 
  isConnected, 
  isLoading 
}) => {
  return (
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
  );
};

export default ChatInput;