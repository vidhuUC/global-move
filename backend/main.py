# backend/main.py
import asyncio
import json
import logging
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import uuid4

import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import Message, ChatRequest
from agents.global_move_agents import GlobalMoveAgentSystem
from services.websocket_manager import ConnectionManager
from services.project_service import ProjectService
from config.settings import settings

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize services
project_service = ProjectService()
connection_manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting AG2 Global Move Backend")

    # Initialize sample project
    await project_service.initialize_sample_data()

    yield

    # Shutdown
    logger.info("Shutting down AG2 Global Move Backend")


# Initialize FastAPI app
app = FastAPI(
    title="AG2 Global Move Backend",
    description="Multi-agent system for international relocation coordination",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AG2 system
ag2_system = GlobalMoveAgentSystem()


# REST API Endpoints
@app.get("/")
async def root():
    return {"message": "AG2 Global Move Backend is running"}


@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    """Send message to specific agent"""
    try:
        response = await ag2_system.send_message(request.message, request.agent_id)

        message = Message(
            id=str(uuid4()),
            sender=request.agent_id,
            sender_name=ag2_system.get_agent_name(request.agent_id),
            content=response,
            timestamp=datetime.now(),
            type="agent",
            agent_id=request.agent_id,
        )

        return {"message": message.dict()}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/group-chat")
async def group_chat(request: ChatRequest):
    """Send message to group chat for coordination"""
    try:
        responses = await ag2_system.group_chat_response(request.message)

        messages = []
        for resp in responses:
            message = Message(
                id=str(uuid4()),
                sender=resp["agent"].lower().replace(" ", "_"),
                sender_name=resp["agent"],
                content=resp["content"],
                timestamp=(
                    datetime.fromisoformat(resp["timestamp"].replace("Z", "+00:00"))
                    if "Z" in resp["timestamp"]
                    else datetime.now()
                ),
                type="agent",
            )
            messages.append(message.dict())

        return {"messages": messages}
    except Exception as e:
        logger.error(f"Group chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# WebSocket endpoint
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await connection_manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            # Process message with AG2
            if message_data.get("type") == "chat":
                response = await ag2_system.send_message(
                    message_data["content"], message_data.get("agent_id", "coordinator")
                )

                # Send response back through WebSocket
                response_message = {
                    "type": "agent_response",
                    "id": str(uuid4()),
                    "sender": message_data.get("agent_id", "coordinator"),
                    "content": response,
                    "timestamp": datetime.now().isoformat(),
                }

                await connection_manager.send_personal_message(
                    response_message, client_id
                )

    except WebSocketDisconnect:
        connection_manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        connection_manager.disconnect(client_id)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
