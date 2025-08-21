# backend/agents/global_move_agents.py
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any

# AutoGen imports with new syntax
from autogen import ConversableAgent, LLMConfig, GroupChat, GroupChatManager
from config.settings import settings

logger = logging.getLogger(__name__)


class GlobalMoveAgentSystem:
    def __init__(self):
        self.agents = {}
        self.group_chat = None
        self.manager = None
        self.llm_config = None
        self.initialize_llm_config()
        self.initialize_agents()

    def initialize_llm_config(self):
        """Initialize LLM configuration using the new LLMConfig class"""
        self.llm_config = LLMConfig(
            api_type="openai",
            model="gpt-3.5-turbo",
            # The OPENAI_API_KEY environment variable will be used automatically
        )

    def initialize_agents(self):
        """Initialize specialized agents for global move coordination"""

        with self.llm_config:
            # Move Coordinator Agent
            self.agents["coordinator"] = ConversableAgent(
                name="MoveCoordinator",
                system_message="""You are a Global Move Coordinator specializing in international relocations.
                Your role is to:
                - Orchestrate the entire relocation process
                - Coordinate between all specialized agents
                - Provide timeline updates and progress tracking
                - Handle client communications and expectations
                - Ensure all aspects of the move are properly managed
                
                Always be professional, empathetic, and solution-oriented.""",
            )

            # Logistics Agent
            self.agents["logistics"] = ConversableAgent(
                name="LogisticsAgent",
                system_message="""You are a Logistics Specialist for international moves.
                Your expertise includes:
                - Shipping and freight coordination
                - Customs clearance procedures
                - Packing and inventory management
                - Insurance and damage protection
                - Delivery scheduling and tracking
                - Pet and vehicle transportation
                
                Provide detailed logistics plans with timelines and cost estimates.""",
            )

            # Housing Agent
            self.agents["housing"] = ConversableAgent(
                name="HousingAgent",
                system_message="""You are a Housing Specialist for international relocations.
                Your services include:
                - Property search and evaluation
                - Rental agreements and lease negotiations
                - Temporary accommodation arrangements
                - Neighborhood research and recommendations
                - School district information
                - Utility setup coordination
                
                Focus on finding suitable housing that matches client preferences and budget.""",
            )

            # Legal Agent
            self.agents["legal"] = ConversableAgent(
                name="LegalAgent",
                system_message="""You are a Legal Specialist for international relocations.
                Your expertise covers:
                - Visa and immigration requirements
                - Work permit applications
                - Tax implications and obligations
                - Legal document preparation and notarization
                - Compliance with destination country laws
                - Family member immigration processes
                
                Ensure all legal requirements are met for a smooth relocation.""",
            )

            # Finance Agent
            self.agents["finance"] = ConversableAgent(
                name="FinanceAgent",
                system_message="""You are a Finance Specialist for international moves.
                Your services include:
                - Cost estimation and budgeting
                - Currency exchange and banking setup
                - Tax planning and implications
                - Insurance coverage coordination
                - Expense tracking and reporting
                - Payment scheduling and management
                
                Provide accurate financial planning and cost-effective solutions.""",
            )

        # Create group chat with all agents
        agent_list = list(self.agents.values())
        self.group_chat = GroupChat(
            agents=agent_list,
            messages=[],
            max_round=20,
        )

        # Create group chat manager with the same LLM config
        with self.llm_config:
            self.manager = GroupChatManager(
                groupchat=self.group_chat,
            )

    async def send_message(self, message: str, agent_id: str) -> str:
        """Send message to specific agent and get response"""
        try:
            if agent_id not in self.agents:
                raise ValueError(f"Agent {agent_id} not found")

            agent = self.agents[agent_id]

            # Use the new AutoGen API for direct communication
            with self.llm_config:
                # Create a temporary recipient agent for the conversation
                temp_user = ConversableAgent(
                    name="User",
                    system_message="You represent the user asking questions.",
                    human_input_mode="NEVER",
                )

                # Get response using the new initiate_chat method
                chat_result = await asyncio.to_thread(
                    agent.initiate_chat,
                    recipient=temp_user,
                    message=message,
                    max_turns=5,
                )

            # Extract the response from the chat result
            if hasattr(chat_result, "chat_history") and chat_result.chat_history:
                return chat_result.chat_history[-1]["content"]
            else:
                return "I received your message but couldn't generate a response."

        except Exception as e:
            logger.error(f"Error sending message to agent {agent_id}: {e}")
            return f"Sorry, I encountered an error processing your request: {str(e)}"

    async def group_chat_response(self, message: str) -> List[Dict[str, str]]:
        """Get sequential responses from each agent to avoid repetition"""
        try:
            agent_responses = []

            # Define the order agents should respond
            agent_order = ["coordinator", "logistics", "housing", "legal", "finance"]

            with self.llm_config:
                for agent_id in agent_order:
                    if agent_id not in self.agents:
                        continue

                    agent = self.agents[agent_id]

                    # Create context-aware message for each agent
                    context_message = f"""
{message}

Previous responses from other agents:
{self._format_previous_responses(agent_responses)}

Please provide your specific expertise without repeating what others have said.
Focus only on your domain: {self._get_agent_domain(agent_id)}
"""

                    # Get individual response
                    temp_user = ConversableAgent(
                        name="User",
                        system_message="You represent the user asking questions.",
                        human_input_mode="NEVER",
                    )

                    chat_result = await asyncio.to_thread(
                        agent.initiate_chat,
                        recipient=temp_user,
                        message=context_message,
                        max_turns=5,
                    )

                    if (
                        hasattr(chat_result, "chat_history")
                        and chat_result.chat_history
                    ):
                        response_content = chat_result.chat_history[-1]["content"]
                        agent_responses.append(
                            {
                                "agent": agent.name,
                                "content": response_content,
                                "timestamp": datetime.now().isoformat(),
                            }
                        )

            return agent_responses

        except Exception as e:
            logger.error(f"Error in group chat: {e}")
            return [
                {
                    "agent": "System",
                    "content": f"Error: {str(e)}",
                    "timestamp": datetime.now().isoformat(),
                }
            ]

    def _format_previous_responses(self, responses: List[Dict]) -> str:
        """Format previous responses for context"""
        if not responses:
            return "No previous responses yet."

        formatted = []
        for resp in responses:
            formatted.append(f"- {resp['agent']}: {resp['content'][:100]}...")

        return "\n".join(formatted)

    def _get_agent_domain(self, agent_id: str) -> str:
        """Get specific domain for each agent"""
        domains = {
            "coordinator": "Timeline coordination and overall planning",
            "logistics": "Shipping, customs, and physical relocation",
            "housing": "Property search and accommodation in Delhi",
            "legal": "Visas, documentation, and legal requirements",
            "finance": "Budgeting, banking, and financial planning",
        }
        return domains.get(agent_id, "General assistance")
