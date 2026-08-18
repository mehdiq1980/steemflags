-- Steem Flags D1 initial schema.
-- This migration is intentionally limited to the leaderboard foundation.
-- Game mutations will be moved here after authentication is wired in.

CREATE TABLE IF NOT EXISTS leaderboard (
  username TEXT PRIMARY KEY NOT NULL,
  sf INTEGER NOT NULL DEFAULT 0 CHECK (sf >= 0),
  avatar TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS leaderboard_sf_idx
ON leaderboard (sf DESC, updated_at ASC, username ASC);
