import React from "react";

const PipelinesList = ({ pipelines }) => {
  return (
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
  );
};

export default PipelinesList;