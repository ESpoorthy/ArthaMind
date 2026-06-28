# ArthaMind — Agentic AI Banking Simulator

> Built for SBI Hackathon 2026 · Powered by Gemini 2.5 Flash · LangGraph Multi-Agent Architecture

ArthaMind is a production-quality AI banking simulator that demonstrates agentic AI capabilities across a full banking platform — without connecting to real banking APIs.

## Architecture

| Layer | Technology |
|-------|-----------|
| Backend API | FastAPI (Python 3.11), SQLAlchemy, Alembic |
| Database | PostgreSQL 16, Redis 7 |
| Vector DB | ChromaDB (RAG) |
| AI / LLM | Gemini 2.5 Flash, LangGraph, LangChain |
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Auth | JWT (access + refresh tokens) |
| Deployment | Docker, Docker Compose |

## Portals

- **Customer Portal** — dashboard, accounts, cards, loans, FDs, AI chat, voice banking
- **Human Agent Portal** — live support, escalated cases, AI-suggested replies
- **Manager Dashboard** — analytics, fraud alerts, AI performance metrics

## Quick Start

```bash
# 1. Copy environment config
cp .env.example .env
# Fill in GEMINI_API_KEY and SECRET_KEY in .env

# 2. Start all services
docker-compose up -d

# 3. Run database migrations (Phase 2+)
docker-compose exec backend alembic upgrade head

# 4. Open the app
open http://localhost:5173
```

## Development

```bash
# Backend (Python)
cd backend
pip install -r requirements-dev.txt
uvicorn src.main:app --reload

# Frontend (Node)
cd frontend
npm install
npm run dev

# Run tests
cd backend && python -m pytest tests/ -v
cd frontend && npx vitest run
```

## Project Structure

```
ArthaMind/
├── backend/          # FastAPI application
│   ├── src/
│   │   ├── agents/   # LangGraph AI agents
│   │   ├── config/   # Settings & environment
│   │   ├── middleware/
│   │   ├── models/   # SQLAlchemy models (Phase 2)
│   │   ├── routes/   # API endpoints
│   │   └── services/ # Business logic
│   └── tests/
├── frontend/         # React + Vite application
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── shared/           # Shared TypeScript types & utilities
├── docker/           # Docker configs & init scripts
├── .github/workflows/ # CI/CD pipelines
└── .kiro/specs/      # Project specification
```

## CI / CD

- **CI** — runs on every push/PR: lint → type-check → tests → build → security scan → Docker build
- **Deploy** — pushes Docker images to GHCR on merge to `main`

## Implementation Status

- [x] Phase 1 — Project Foundation
- [ ] Phase 2 — Authentication & Database
- [ ] Phase 3 — Banking Simulator
- [ ] Phase 4 — Backend APIs
- [ ] Phase 5 — AI Framework
- [ ] Phase 6 — Specialized AI Agents
- [ ] Phase 7 — RAG System
- [ ] Phase 8 — Customer Portal
- [ ] Phase 9 — Human Agent Dashboard
- [ ] Phase 10 — Manager Dashboard
- [ ] Phase 11 — OCR & Voice Banking
- [ ] Phase 12 — Analytics & Monitoring
- [ ] Phase 13 — Testing
- [ ] Phase 14 — Docker & Deployment
