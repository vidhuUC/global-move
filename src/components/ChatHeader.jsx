import React from "react";
import { Bot, Settings } from "lucide-react";

const ChatHeader = ({ agents, activeAgent }) => {
  return (
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
  );
};

export default ChatHeader;