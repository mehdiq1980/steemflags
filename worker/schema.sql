CREATE TABLE IF NOT EXISTS leaderboard (
  username TEXT PRIMARY KEY NOT NULL,
  sf INTEGER NOT NULL DEFAULT 0 CHECK (sf >= 0),
  avatar TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS leaderboard_sf_idx
ON leaderboard (sf DESC, updated_at ASC, username ASC);
