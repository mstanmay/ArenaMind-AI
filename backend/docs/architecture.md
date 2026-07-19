# ArenaMind AI — System Architecture & Design

This document details the architectural choices, patterns, and security guardrails implemented in the ArenaMind operations brain backend.

## Architectural Patterns

### 1. Clean Architecture & Feature Separation
We follow a strict clean architecture implementation:
- **Presentation Layer (`app/api/`)**: Handled by FastAPI routers using Pydantic validation schemas. No business logic is performed here.
- **Service Layer (`app/services/`)**: Orchestrates business rules, interacts with repositories, dispatches Redis Pub/Sub events, and manages the LangGraph agent state.
- **Data Access Layer (`app/repositories/`)**: Implements the Repository Pattern using SQLAlchemy 2.0 async sessions, isolating ORM queries and enabling clean mocking.
- **Domain Layer (`app/models/` & `app/core/constants.py`)**: Pure business models with UUID key generation and soft-delete capabilities.

### 2. supervisor multi-agent flow
All operator queries route through the compiled `StateGraph` in `app/langgraph/graph.py`:
1. **Firewall Guard**: Scans incoming queries for injection strings.
2. **Supervisor Node**: Classifies intent and delegates query to one of the 14 specialized nodes.
3. **Specialist Node**: Interacts with database tools, constructs domain analysis in JSON format, and returns updates to the shared `AgentState`.
4. **Decision Engine**: Processes the state changes, checks confidence ratings, saves the audit log, embeds data for Qdrant storage, and alerts Redis subscribers.

```
Incoming Query ──> [Prompt Firewall] ──> [Supervisor Classifier]
                                                  │
                            ┌─────────────────────┼─────────────────────┐
                            ▼                     ▼                     ▼
                     [Crowd Agent]         [Security Agent]      [Medical Agent] ...
                            │                     │                     │
                            └─────────────────────┼─────────────────────┘
                                                  ▼
                                          [Decision Engine] ──> DB & Qdrant Upsert
                                                  │
                                                  ▼
                                         [Redis Pub/Sub Bus]
```

## Security Profiles

### 1. Rate Limiting
API endpoints are rate-limited using a sliding window implementation on Redis. Limit records track either active access token subjects or client IPs.

### 2. Prompt Injection Firewall
Prior to invoking the LLM, the firewall scans queries for instruction overrides (e.g. jailbreaks) using regex signature matchers and returns `400 Bad Request` immediately.

### 3. PII & Output Validation
AI outputs are parsed and scrubbed for sensitive numbers (credit cards, routing numbers, etc.) to ensure no data leakage occurs through LLM generations.
