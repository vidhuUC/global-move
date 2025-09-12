import React from "react";
import { Globe, User, Users, MapPin } from "lucide-react";

const ProjectHeader = ({ moveProject, chatMode, setChatMode }) => {
  return (
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
  );
};

export default ProjectHeader;