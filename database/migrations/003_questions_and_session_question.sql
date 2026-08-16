BEGIN;

CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  country_code CHAR(2) NOT NULL UNIQUE,
  country_name VARCHAR(100) NOT NULL,
  flag_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE game_sessions
  ADD COLUMN IF NOT EXISTS current_question_id BIGINT REFERENCES questions(id);

ALTER TABLE game_sessions
  ADD CONSTRAINT game_sessions_questions_answered_range
  CHECK (questions_answered BETWEEN 0 AND 20);

ALTER TABLE game_sessions
  ADD CONSTRAINT game_sessions_correct_answers_range
  CHECK (correct_answers BETWEEN 0 AND 20);

CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(active);

COMMIT;
