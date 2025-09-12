import ProjectHeader from "./ProjectHeader";
import AgentsList from "./AgentsList";
import PipelinesList from "./PipelinesList";
import TasksList from "./TasksList";

const Sidebar = ({ 
  moveProject, 
  chatMode, 
  setChatMode, 
  agents, 
  activeAgent, 
  setActiveAgent, 
  pipelines, 
  tasks 
}) => {
  return (
    <div className="sidebar">
      <ProjectHeader 
        moveProject={moveProject} 
        chatMode={chatMode} 
        setChatMode={setChatMode} 
      />
      <AgentsList 
        agents={agents} 
        activeAgent={activeAgent} 
        setActiveAgent={setActiveAgent} 
      />
      <PipelinesList pipelines={pipelines} />
      <TasksList tasks={tasks} agents={agents} />
    </div>
  );
};

export default Sidebar;