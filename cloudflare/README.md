# Steem Flags — Cloudflare D1 API

This directory contains the first, non-breaking Cloudflare Worker + D1 foundation for the server-authoritative leaderboard.

## Files

- `src/index.js` — Worker API (`/health`, `/api/leaderboard`, `/api/leaderboard/me`)
- `migrations/0001_initial.sql` — D1 schema for players, game sessions, answers and transactions
- `wrangler.toml` — Worker/D1 binding configuration

## Setup

1. Create the D1 database:

```bash
npx wrangler d1 create steem-flags-db
```

2. Put the returned `database_id` into `wrangler.toml`.

3. Apply the migration locally while developing:

```bash
npx wrangler d1 migrations apply steem-flags-db --local
```

4. Apply it to production when ready:

```bash
npx wrangler d1 migrations apply steem-flags-db --remote
```

5. Run the Worker locally:

```bash
cd cloudflare
npx wrangler dev
```

6. Deploy when the database binding has been configured:

```bash
npx wrangler deploy
```

## Important security note

The current phase intentionally exposes only read-only leaderboard endpoints. We are not adding a client-controlled `POST /api/leaderboard` endpoint. The next phase will move game-session creation and answer validation into the Worker so points and SF are calculated server-side instead of accepting a score supplied by the browser.
