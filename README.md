# Global Move Agent System

Multi-agent system powered by AG2 (AutoGen) for coordinating international relocations.

## Quick Start

### Prerequisites

- Python 3.9-3.13
- OpenAI API key


### Setup

1. **Clone and setup:**

```bash
cd global-move/backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Create .env file:**

```bash
OPENAI_API_KEY=your_openai_api_key_here
LOG_LEVEL=INFO
```

4. **Run:**

```bash
python main.py
```


Server runs at `http://localhost:8000`

## API Usage

### Group Chat (All Agents)

```bash
curl -X POST "http://localhost:8000/group-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me plan my move from USA to Delhi in 3 months. Budget: $15,000."
  }'
```


### Single Agent

```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are shipping costs to Delhi?",
    "agent_id": "logistics"
  }'
```


## Agents

- **coordinator** - Timeline and coordination
- **logistics** - Shipping and transportation
- **housing** - Property search and accommodation
- **legal** - Visas and documentation
- **finance** - Budgeting and banking