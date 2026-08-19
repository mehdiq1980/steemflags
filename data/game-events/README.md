# Steem Flags Game Events

This directory contains validated game-event records used by the GitHub-only SF ledger.

## Event format

Each event must be a JSON file with:

- `event_id`: unique identifier
- `username`: Steem username
- `type`: `correct_answer`, `wrong_answer`, or `reward`
- `sf_delta`: integer SF change
- `created_at`: ISO-8601 timestamp

The event processor validates the event before changing `data/leaderboard.json`.

Do not put passwords, posting keys, GitHub tokens, or other secrets in event files.
