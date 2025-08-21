# backend/services/project_service.py
from datetime import datetime
from typing import Dict, Optional, List
from models.schemas import MoveProject


class ProjectService:
    def __init__(self):
        self.projects: Dict[str, MoveProject] = {}

    async def initialize_sample_data(self):
        """Initialize sample project data"""
        sample_project = MoveProject(
            id="MV-2025-001",
            client_name="Sarah Johnson",
            origin="New York, USA",
            destination="London, UK",
            status="planning",
            progress=35.0,
            created_at=datetime.now(),
        )
        self.projects[sample_project.id] = sample_project
