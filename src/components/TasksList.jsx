import React from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

const TasksList = ({ tasks, agents }) => {
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

  return (
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
  );
};

export default TasksList;