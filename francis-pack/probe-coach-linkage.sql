-- VAI Profile — Coach linkage probe
--
-- Open question: "How is a coach 'linked' to an athlete in the user record?
--   Which field surfaces coach.id + coach.handle for the 'Coached by @handle' chip?"
--
-- VAI's differentiation moat (per Gold Standard recon): trusted coach authority.
-- Template renders a green "Coached by @handle ✓" chip — but only when coach data
-- is present. We need to know what column/table provides that data.
--
-- Usage:
--   psql $VAI_API_DATABASE_URL -f probe-coach-linkage.sql

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'VAI coach linkage probe'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

\echo
\echo '[1/4] Columns that look like a coach/trainer foreign key:'
SELECT table_schema, table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE (column_name ILIKE '%coach%'
       OR column_name ILIKE '%trainer%'
       OR column_name ILIKE '%mentor%'
       OR column_name = 'linked_to'
       OR column_name = 'parent_user_id')
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_name, column_name;

\echo
\echo '[2/4] Junction tables for user ↔ user relationships:'
SELECT table_schema, table_name
FROM information_schema.tables
WHERE (table_name ILIKE '%relationship%'
       OR table_name ILIKE '%follow%'
       OR table_name ILIKE '%roster%'
       OR table_name ILIKE '%team%'
       OR table_name ILIKE '%connection%'
       OR table_name ILIKE '%link%')
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_name;

\echo
\echo '[3/4] Users table columns (are coaches just users with a role flag?):'
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND table_schema = 'public'
ORDER BY ordinal_position;

\echo
\echo '[4/4] Sample: does a known athlete (bwhite) have a linked coach record anywhere?'
-- Replace the UUID below with a real athlete who has a coach in staging.
DO $$
DECLARE
  bwhite_id uuid := 'a812b6d8-b406-439b-9d6b-fc1d8a3313cd';
BEGIN
  RAISE NOTICE 'Scanning relationship-looking tables for any rows touching %', bwhite_id;
  -- This will noop if tables don''t exist; it''s a probe
END $$;

-- If there's a relationships table, uncomment and adjust:
-- SELECT * FROM user_relationships
-- WHERE athlete_user_id = 'a812b6d8-b406-439b-9d6b-fc1d8a3313cd'
--    OR user_id = 'a812b6d8-b406-439b-9d6b-fc1d8a3313cd'
-- LIMIT 5;

\echo
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'Interpretation:'
\echo '  • Pattern A — direct FK on users table: users.coach_user_id → users.id'
\echo '    → API returns coach: { id, handle } when coach_user_id IS NOT NULL'
\echo '  • Pattern B — junction table (user_relationships with type="coach"):'
\echo '    → join on relationship_type = "coach" and athlete_user_id = id'
\echo '  • Pattern C — no linkage exists yet:'
\echo '    → we hide the chip unconditionally for v1; plan a migration for v2'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
