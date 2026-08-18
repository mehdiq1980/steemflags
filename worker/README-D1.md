# Steem Flags — Cloudflare Worker + D1

This directory contains the Cloudflare Worker foundation for the global Steem Flags leaderboard.

## Current files

- `index.js` — Worker API. It reads the leaderboard from the D1 binding `DB`.
- `schema.sql` — standalone schema for manual initialization/testing.
- `migrations/0001_initial.sql` — versioned D1 migration for the leaderboard table.
- `wrangler.toml.example` — existing TOML configuration example.
- `wrangler.jsonc.example` — recommended JSONC configuration example.

## Create the production D1 database

From the `worker/` directory:

```bash
npx wrangler d1 create steem-flags
```

Copy the returned database ID into a local `wrangler.jsonc` file based on `wrangler.jsonc.example`.

## Apply migrations

For local development:

```bash
npx wrangler d1 migrations apply steem-flags --local
```

For the real Cloudflare database:

```bash
npx wrangler d1 migrations apply steem-flags --remote
```

## Deploy the Worker

```bash
npx wrangler deploy
```

## API

`GET /health`

`GET /api/leaderboard?limit=100`

`GET /api/leaderboard?limit=100&username=example`

The current POST leaderboard endpoint remains a compatibility layer and must not be treated as the final secure score-write API. The next phase will make game results server-authoritative and authenticated before accepting score mutations.
