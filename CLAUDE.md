# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo with a Node.js/Express backend and React frontend for tracking currency exchange rates. The backend fetches live rates from the ExchangeRates API and stores them in PostgreSQL via Prisma. The frontend provides auth (register/login) and a dashboard showing rates and a personal watchlist.

## Commands

### Full stack (Docker — recommended)
```bash
# Requires EXCHANGE_API_KEY in a root .env file
docker-compose up --build
# Backend runs on :3000, Postgres on :5432
```

### Backend (local dev)
```bash
cd backend
npm run dev        # ts-node + nodemon hot reload
npm run build      # tsc → dist/
npm start          # run compiled dist/index.js

# Prisma
npx prisma generate          # regenerate client after schema changes
npx prisma migrate dev       # apply migrations (needs DATABASE_URL)
npx prisma studio            # GUI browser for the DB
```

### Frontend (local dev)
```bash
cd frontend
npm run dev        # Vite dev server (default :5173)
npm run build      # tsc + vite build → dist/
npm run lint       # eslint
```

### Environment variables
| Variable | Where | Purpose |
|---|---|---|
| `EXCHANGE_API_KEY` | root `.env` (docker) or `backend/.env` (local) | exchangeratesapi.io key |
| `DATABASE_URL` | backend env | Postgres connection string |
| `JWT_SECRET` | backend env | Signs JWTs (falls back to `"secret"` if unset) |

## Architecture

### Backend (`backend/src/`)
```
index.ts              Express app setup, mounts /api/currencies and /api/auth
routes/
  currencyRoutes.ts   CRUD for rates, history, and watchlist; uses Prisma directly
  authRoutes.ts       register/login; delegates to authService
services/
  currencyService.ts  fetchAndSaveRates() — calls ExchangeRates API, upserts Currency, appends CurrencyHistory
  authService.ts      bcrypt hashing, JWT generation
middleware/
  authMiddleware.ts   Validates Bearer token, attaches userId to req
```

**Important behavior:** `GET /api/currencies/rates` calls the external API on every request — it is not cached. Each call also writes a new `CurrencyHistory` row (used to power the chart).

### Database schema (Prisma)
- `User` — email/password (bcrypt), no relation to Watchlist
- `Currency` — latest rate per currency code (upserted on each fetch)
- `CurrencyHistory` — append-only log of rates; chart queries last 10 rows desc
- `Watchlist` — **not scoped to a user** (no `userId` FK); all watchlist entries are shared globally

### Frontend (`frontend/src/`)
```
main.tsx            React 19 entry point
App.tsx             Manual page routing via useState ("login" | "register" | dashboard)
pages/
  LoginPage.tsx     Auth form → calls authService → sets token in localStorage
  RegisterPage.tsx
  DashboardPage.tsx Fetches rates + watchlist on mount; add/remove watchlist items
components/
  CurrencyChart.tsx Recharts LineChart for rate history of a single currency code
services/
  api.ts            Axios instance (baseURL: http://localhost:3000/api) with JWT interceptor
  authService.ts    login/register/logout/isAuthenticated — reads/writes localStorage "token"
  currencyService.ts Thin wrappers around api.ts for all currency endpoints
```

The frontend uses **no router library** — navigation is handled by `useState` in `App.tsx`. Auth state is determined by checking `localStorage` for a JWT token.

### API response shape
All endpoints return `{ success: boolean, data?: ..., message?: string }`.
