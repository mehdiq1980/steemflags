-- Initial schema migration for Steem Flags v2.
-- Apply once to a fresh PostgreSQL database.

BEGIN;

\i database/schema.sql

COMMIT;
