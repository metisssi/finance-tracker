# Finance Tracker API

A RESTful API for tracking currency exchange rates with user authentication and watchlist functionality.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + bcryptjs
- **Containerization:** Docker + Docker Compose
- **External API:** ExchangeRates API

## Features

- Real-time currency exchange rates (USD, EUR, GBP, CZK)
- Currency rate history tracking
- User registration and login with JWT authentication
- Personal watchlist for favorite currencies
- Fully containerized with Docker

## Getting Started

### Prerequisites
- Docker
- Docker Compose

### Run the project

1. Clone the repository:
```bash
git clone https://github.com/metisssi/finance-tracker.git
cd finance-tracker
```

2. Create `.env` file in root:
EXCHANGE_API_KEY=your_api_key

3. Start the project:
```bash
docker-compose up --build
```

API will be available at `http://localhost:3000`

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login and get JWT token | No |

### Currencies
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/currencies/rates | Get all exchange rates | No |
| GET | /api/currencies/rates/:code | Get specific currency rate | No |
| GET | /api/currencies/history/:code | Get rate history | No |
| POST | /api/currencies/watchlist | Add to watchlist | Yes |
| GET | /api/currencies/watchlist | Get watchlist | No |
| DELETE | /api/currencies/watchlist/:id | Remove from watchlist | Yes |