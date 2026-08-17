# Steem Flags global leaderboard API

The backend is the authoritative boundary for the global SF leaderboard. All backend code stays in this GitHub repository; deployment is separate from source control.

## Environment

- `DATABASE_URL` — PostgreSQL connection string
- `DATABASE_SSL` — optional; set to `false` only for local PostgreSQL
- `PORT` — optional, defaults to `3000`

## Endpoints

- `GET /health`
- `GET /api/leaderboard?limit=10`
- `POST /api/leaderboard` with `{ "username": "alice", "sf": 12 }`

The database is the shared source of truth. Browser `localStorage` is not used as the global leaderboard database.
