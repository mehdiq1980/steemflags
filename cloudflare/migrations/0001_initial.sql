-- Steem Flags / Cloudflare D1 initial schema
-- This migration creates the server-authoritative leaderboard foundation.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS players (
  username TEXT PRIMARY KEY COLLATE NOCASE,
  total_points INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  sf_balance INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL COLLATE NOCASE,
  question_number INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (username) REFERENCES players(username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  answer TEXT NOT NULL,
  correct INTEGER NOT NULL CHECK (correct IN (0, 1)),
  points INTEGER NOT NULL CHECK (points IN (-1, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (session_id, question_number),
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_players_points
  ON players(total_points DESC, username ASC);

CREATE INDEX IF NOT EXISTS idx_game_sessions_username
  ON game_sessions(username);

CREATE INDEX IF NOT EXISTS idx_game_answers_session
  ON game_answers(session_id, question_number);
