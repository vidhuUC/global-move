import React from "react";
import { User, Users, AlertCircle, Bot } from "lucide-react";

const MessagesList = ({ messages, agents, chatMode, isLoading, messagesEndRef, activeAgent }) => {
  return (
    <div className="messages-container">
      {/* Group coordination header */}
      {chatMode === "group" && (
        <div className="group-coordination-header">
          <Users className="mode-icon" />
          <span className="group-coordination-text">
            Group Coordination Mode - All agents will collaborate on your requests
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
                        agents.find((a) => a.id === message.sender)?.icon || Bot,
                        { className: "avatar-icon" }
                      )}
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
                        <span className="group-badge"> • Group Response</span>
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

            {/* Separator between group responses */}
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
  );
};

export default MessagesList;