BEGIN;

-- Seed the authoritative question bank from the normalized country dataset.
-- Deployment tooling should transform data/questions.js into parameterized
-- INSERT statements. This migration intentionally documents the contract
-- without embedding generated country data twice in the repository.

CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(active);

COMMIT;
