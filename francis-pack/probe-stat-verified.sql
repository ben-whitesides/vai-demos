-- VAI Profile — "stat.verified" source probe
--
-- Open question: "What's the authoritative source for stat.verified?
--   Measured-in-app event log? Flag on stat record? User-attested field?"
--
-- Run these against your vai-api PostgreSQL database (staging preferred).
-- Results tell us which of the three common patterns VAI uses so the template
-- only shows the ✓ Verified badge on legitimately measured stats.
--
-- Usage:
--   psql $VAI_API_DATABASE_URL -f probe-stat-verified.sql
--
-- Report back to Ben: which query returned the most rows — that's our source.

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'VAI stat.verified probe'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

\echo
\echo '[1/4] Columns that look like a verification flag on stat/PR tables:'
SELECT table_schema, table_name, column_name, data_type
FROM information_schema.columns
WHERE (column_name ILIKE '%verified%'
       OR column_name ILIKE '%is_measured%'
       OR column_name ILIKE '%measured_in%'
       OR column_name ILIKE '%source%'
       OR column_name ILIKE '%is_official%'
       OR column_name ILIKE '%confirmed%')
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_name, column_name;

\echo
\echo '[2/4] Tables that look like stat/PR/measurement records:'
SELECT table_schema, table_name
FROM information_schema.tables
WHERE (table_name ILIKE '%stat%'
       OR table_name ILIKE '%measurement%'
       OR table_name ILIKE '%pr_%'
       OR table_name ILIKE '%personal_record%'
       OR table_name ILIKE '%performance%')
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_name;

\echo
\echo '[3/4] Event log tables (measured-in-app audit trail pattern):'
SELECT table_schema, table_name
FROM information_schema.tables
WHERE (table_name ILIKE '%event%'
       OR table_name ILIKE '%audit%'
       OR table_name ILIKE '%log%'
       OR table_name ILIKE '%activity%')
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_name;

\echo
\echo '[4/4] Sample 5 rows from the most likely stat table (adjust table name if needed):'
-- Adjust this SELECT once query [2/4] shows the actual table name.
-- Common candidates: user_stats, performance_records, athlete_metrics, prs, measurements
DO $$
DECLARE
  tbl text;
BEGIN
  SELECT table_name INTO tbl
  FROM information_schema.tables
  WHERE (table_name ILIKE '%stat%' OR table_name ILIKE '%measurement%' OR table_name ILIKE '%pr_%' OR table_name ILIKE '%personal_record%')
    AND table_schema = 'public'
  ORDER BY
    CASE
      WHEN table_name = 'user_stats' THEN 1
      WHEN table_name = 'prs' THEN 2
      WHEN table_name = 'performance_records' THEN 3
      ELSE 99
    END
  LIMIT 1;

  IF tbl IS NOT NULL THEN
    RAISE NOTICE 'Sampling from table: %', tbl;
    EXECUTE format('SELECT * FROM %I LIMIT 5', tbl);
  ELSE
    RAISE NOTICE 'No obvious stat table found in public schema. Check query [2/4] above.';
  END IF;
END $$;

\echo
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'Interpretation:'
\echo '  • If [1/4] returned a `verified BOOLEAN` on a stats table → use that column'
\echo '  • If [1/4] returned a `source VARCHAR` (values: "app"/"self"/"coach") →'
\echo '    derive verified = (source = "app") in the API response shaper'
\echo '  • If no flag exists but [3/4] shows an event log with "stat_created"'
\echo '    events from the app → derive verified by joining event log on stat_id'
\echo '  • If none of the above — we need to add a column (migration attached)'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
