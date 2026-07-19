# ArenaMind AI — Operations Brain Backend

This is the enterprise-grade agentic AI backend for **ArenaMind AI**, a multi-agent smart stadium decision system. It is built using FastAPI (Python 3.12), LangGraph orchestrating 14 specialized agents, a Redis event bus, Celery background workers, and PostgreSQL/SQLite.

## Key Features

- **Multi-Agent Decision System**: Orchestrated via LangGraph Supervisor patterns routing queries to specialists (Crowd, Security, Medical, Vendors, etc.).
- **Decision Engine with Explainability**: All decisions provide `reason`, `confidence`, `evidence`, `recommended_actions`, and `estimated_impact`.
- **Enterprise Security**: Argon2 password hashing, RS256/HS256 JWT tokens, role-based access control (RBAC), Redis rate limiting, and prompt injection guards.
- **Event-Driven Architecture**: Redis Pub/Sub event bus communicating live state metrics with Celery workers for async predictions.
- **Vector Memory**: Qdrant vector database caching operational SOPs and previous decision parameters.

---

## Technical Stack

- **Core**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0
- **AI**: LangGraph, LangChain, OpenAI, Google Gemini
- **Databases**: PostgreSQL (asyncpg), SQLite (aiosqlite), Qdrant
- **Messaging**: Redis (Pub/Sub & rate limiting), Celery

---

## Directory Layout

```
backend/
├── app/
│   ├── api/             # API v1 feature routes (Auth, Crowd, Parking, Security, etc.)
│   ├── core/            # Database engine, Redis pool, config, structured logging
│   ├── langgraph/       # State graphs, supervisor, prompts, tools, vector memory
│   ├── middleware/      # Correlation ID, security headers, global error handlers
│   ├── models/          # SQLAlchemy ORM entities
│   ├── repositories/    # Data access layer (Repository Pattern)
│   ├── schemas/         # Pydantic validation schemas
│   ├── security/        # JWT helper, RBAC decorators, prompt firewall
│   ├── services/        # Service logic and Decision Engine orchestrations
│   └── workers/         # Celery task definitions
├── alembic/             # Database migration versions
├── tests/               # Pytest suite
└── docker-compose.yml   # Multi-container local orchestration
```

---

## Installation & Setup

1. **Clone the Repository and Navigate to Backend**:
   ```bash
   cd backend
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your OpenAI/Gemini credentials. The platform will automatically run in local mock mode if no keys are provided.
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies**:
   Using `make` command:
   ```bash
   make install
   ```
   Or manually using pip:
   ```bash
   pip install -e ".[dev]"
   ```

---

## Running the Application

### Running Locally (SQLite mode)
To run the FastAPI server locally without Docker:
```bash
make dev
```
The server starts at [http://localhost:8000](http://localhost:8000). You can explore the interactive Swagger documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

### Running with Docker Compose (PostgreSQL, Redis, Qdrant)
To build and start the entire production-grade stack including database clusters:
```bash
make docker-up
```
To stop the services:
```bash
make docker-down
```

---

## Running the Test Suite

Run the full pytest suite:
```bash
make test
```
The test suite utilizes in-memory SQLite and local Qdrant connections to run fully isolated tests with code coverage metrics.
