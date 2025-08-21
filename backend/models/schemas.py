# backend/models/schemas.py
from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel


class Message(BaseModel):
    id: str
    sender: str
    sender_name: str
    content: str
    timestamp: datetime
    type: str
    agent_id: Optional[str] = None


class AgentConfig(BaseModel):
    name: str
    system_message: str
    llm_config: Dict[str, Any]
    tools: Optional[List[str]] = []


class MoveProject(BaseModel):
    id: str
    client_name: str
    origin: str
    destination: str
    status: str
    progress: float
    created_at: datetime


class ChatRequest(BaseModel):
    message: str
    agent_id: str
    project_id: str


class AgentInfo(BaseModel):
    id: str
    name: str
    description: str
    status: str
