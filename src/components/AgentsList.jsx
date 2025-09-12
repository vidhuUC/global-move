import React from "react";

const AgentsList = ({ agents, activeAgent, setActiveAgent }) => {
  return (
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
  );
};

export default AgentsList;