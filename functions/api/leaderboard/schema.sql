CREATE TABLE IF NOT EXISTS leaderboard (
  username TEXT PRIMARY KEY,
  sf INTEGER NOT NULL DEFAULT 0 CHECK (sf >= 0),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_sf ON leaderboard (sf DESC, updated_at ASC, username ASC);
