# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo with a Node.js/Express backend and React frontend for tracking currency exchange rates. The backend fetches live rates from the **Frankfurter API** (free, no key needed) and stores them in PostgreSQL via Prisma. The frontend provides auth (register/login) and a dashboard showing rates, weekly % change, a 30-day chart, and a personal watchlist scoped to each user.

## Commands

### Full stack (Docker — recommended)
```bash
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
| `DATABASE_URL` | backend env | Postgres connection string |
| `JWT_SECRET` | backend env | Signs JWTs (falls back to `"secret"` if unset) — tokens expire in 1h |
| `FRANKFURTER_API_URL` | backend env (optional) | Override Frankfurter base URL (default: `https://api.frankfurter.app`) |

`EXCHANGE_API_KEY` is no longer used — the project switched to Frankfurter (free, no key).

## Architecture

### Backend (`backend/src/`)
```
index.ts              Express app setup, mounts /api/currencies and /api/auth; runs seedHistoricalRates() on boot
routes/
  currencyRoutes.ts   CRUD for rates, history, watchlist, and weekly % changes; uses Prisma directly
  authRoutes.ts       register/login with rate limiting (5 req/min login, 3 req/min register)
services/
  currencyService.ts  fetchAndSaveRates() — calls Frankfurter API, upserts Currency, deduplicates CurrencyHistory per day
                      seedHistoricalRates() — seeds 30 days of history from Frankfurter on first boot (no-op if data exists)
  authService.ts      bcrypt hashing, JWT generation (1h expiry)
middleware/
  authMiddleware.ts   Validates Bearer token, attaches userId to req
```

**Important behavior:**
- `GET /api/currencies/rates` calls Frankfurter on every request — not cached. Deduplicates history: only one row per currency per day is written.
- `GET /api/currencies/changes` returns weekly % change for all 8 currencies in two batched DB queries.
- `GET /api/currencies/history/:code` returns last 30 rows ascending (used by the chart).
- Helmet is applied globally for security headers.

### Database schema (Prisma)
- `User` — email/password (bcrypt); has a `watchlist` relation
- `Currency` — latest rate per currency code (upserted on each fetch)
- `CurrencyHistory` — append-only log of rates, one row per currency per day; chart queries last 30 rows asc
- `Watchlist` — **scoped to a user** via `userId` FK; each user has their own watchlist

### Frontend (`frontend/src/`)
```
main.tsx            React 19 entry point
App.tsx             Manual page routing via useState ("login" | "register" | dashboard)
pages/
  LoginPage.tsx     Auth form → calls authService → sets token in localStorage
  RegisterPage.tsx  Includes repeat-password field and strong password validation (8+ chars, upper, lower, digit, symbol)
  DashboardPage.tsx Fetches rates + weekly changes + watchlist on mount; search filter; chart on row click
components/
  CurrencyChart.tsx Recharts LineChart for 30-day rate history; custom tooltip; auto Y-axis scaling
  CurrencyConverter.tsx  Simple amount converter between any two currencies from live rates
  CurrencyFilter.tsx     Toggle which currencies are shown; persists selection to localStorage
services/
  api.ts            Axios instance (baseURL: http://localhost:3000/api) with JWT interceptor
  authService.ts    login/register/logout/isAuthenticated — reads/writes localStorage "token"
  currencyService.ts Thin wrappers: getRates, getChanges, getHistory, getWatchlist, addToWatchlist, removeFromWatchlist
```

The frontend uses **no router library** — navigation is handled by `useState` in `App.tsx`. Auth state is determined by checking `localStorage` for a JWT token.

### API response shape
All endpoints return `{ success: boolean, data?: ..., message?: string }`.
