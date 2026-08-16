# Steem Flags backend

The backend is the authoritative boundary for SF, Energy, game sessions, referrals and future reward distribution.

## Rules

- Never trust client-provided SF or Energy balances.
- A game consumes exactly one Energy when a valid session starts.
- A completed game contains exactly 20 questions.
- SF mutations must be recorded in `sf_transactions`.
- Energy mutations must be recorded in `energy_transactions`.
- PostgreSQL is the source of truth; browser `localStorage` is only a temporary/offline presentation cache.

The API implementation will be added incrementally without putting database credentials or private keys in the frontend.
