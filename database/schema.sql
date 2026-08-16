-- Steem Flags v2 database foundation
-- PostgreSQL

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  steem_username VARCHAR(32) NOT NULL UNIQUE,
  sf_balance INTEGER NOT NULL DEFAULT 0 CHECK (sf_balance >= 0),
  energy SMALLINT NOT NULL DEFAULT 3 CHECK (energy BETWEEN 0 AND 3),
  last_energy_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  country_code CHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  flag_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(country_code)
);

CREATE TABLE IF NOT EXISTS sf_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  type VARCHAR(40) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS energy_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount SMALLINT NOT NULL,
  energy_after SMALLINT NOT NULL CHECK (energy_after BETWEEN 0 AND 3),
  type VARCHAR(40) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_question_id BIGINT REFERENCES questions(id),
  questions_answered SMALLINT NOT NULL DEFAULT 0 CHECK (questions_answered BETWEEN 0 AND 20),
  correct_answers SMALLINT NOT NULL DEFAULT 0 CHECK (correct_answers BETWEEN 0 AND 20),
  points INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS referrals (
  id BIGSERIAL PRIMARY KEY,
  inviter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  reward_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (inviter_id <> invitee_id)
);

CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(active);
CREATE INDEX IF NOT EXISTS idx_sf_transactions_user_created ON sf_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_energy_transactions_user_created ON energy_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_created ON game_sessions(user_id, started_at DESC);
