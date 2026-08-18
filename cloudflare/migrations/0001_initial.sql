PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS players (
  username TEXT PRIMARY KEY,
  sf INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  energy INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS players_points_idx ON players (total_points DESC, updated_at ASC, username ASC);

CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  question_number INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (username) REFERENCES players(username) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS game_sessions_user_idx ON game_sessions (username, created_at DESC);

CREATE TABLE IF NOT EXISTS game_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  answer TEXT NOT NULL,
  correct INTEGER NOT NULL CHECK (correct IN (0, 1)),
  points INTEGER NOT NULL CHECK (points IN (-1, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS game_answers_question_idx ON game_answers (session_id, question_number);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reference TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (username) REFERENCES players(username) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions (username, created_at DESC);
