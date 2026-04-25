-- ============================================================
-- Migration 061 — AVANTI OS Brain + Home Screen Grid
-- Sequencing: runs after 060_programs (if present) or as first
--             AVANTI OS migration. Camp+Tryout is 062.
-- Francis: apply to DEV first, verify row counts, then prod.
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- 1. USER PREFERENCES
--    Stores home tile order, pinned tiles, dismissed strip,
--    and a generic JSONB bag for future preference expansion.
--    One row per user — upsert pattern.
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_preferences (
    user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    home_tile_order         JSONB NOT NULL DEFAULT '[]'::jsonb,
    home_pinned_tile_ids    JSONB NOT NULL DEFAULT '[]'::jsonb,
    dismissed_avanti_strip  JSONB NOT NULL DEFAULT '{}'::jsonb,
    home_last_touched_tile  TEXT,
    home_layout_mode        TEXT NOT NULL DEFAULT 'auto',
    preferences             JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_user_preferences_tile_order_array
        CHECK (jsonb_typeof(home_tile_order) = 'array'),
    CONSTRAINT chk_user_preferences_pinned_array
        CHECK (jsonb_typeof(home_pinned_tile_ids) = 'array'),
    CONSTRAINT chk_user_preferences_dismissed_object
        CHECK (jsonb_typeof(dismissed_avanti_strip) = 'object'),
    CONSTRAINT chk_user_preferences_layout_mode
        CHECK (home_layout_mode IN ('auto','manual'))
);

CREATE INDEX idx_user_preferences_updated_at
    ON user_preferences(updated_at DESC);
CREATE INDEX idx_user_preferences_home_tile_order_gin
    ON user_preferences USING GIN (home_tile_order);

-- ────────────────────────────────────────────────────────────
-- 2. AVANTI ACTION RUNS
--    Every AVANTI-prepared or AVANTI-executed action writes
--    one row. Append-only audit trail. Green actions complete
--    at prepare time. Yellow stop at confirmation_required.
--    Red actions are stored as blocked — never executing.
--    chk_avanti_action_red_not_executable enforces this at DB.
-- ────────────────────────────────────────────────────────────
CREATE TABLE avanti_action_runs (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_role                  TEXT NOT NULL,
    actor_tier                  TEXT NOT NULL,
    tile_id                     TEXT,
    feature_key                 TEXT NOT NULL,
    action_type                 TEXT NOT NULL,
    risk_level                  TEXT NOT NULL,
    status                      TEXT NOT NULL DEFAULT 'prepared',
    context_entity_type         TEXT,
    context_entity_id           UUID,
    target_entity_type          TEXT,
    target_entity_id            UUID,
    idempotency_key             TEXT NOT NULL,
    requires_confirmation       BOOLEAN NOT NULL DEFAULT FALSE,
    confirmed_by_user_id        UUID REFERENCES users(id),
    confirmed_at                TIMESTAMPTZ,
    confirmation_payload        JSONB NOT NULL DEFAULT '{}'::jsonb,
    prepared_payload            JSONB NOT NULL DEFAULT '{}'::jsonb,
    execution_payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
    execution_result            JSONB NOT NULL DEFAULT '{}'::jsonb,
    failure_code                TEXT,
    failure_message             TEXT,
    model_route                 TEXT,
    model_trace_id              TEXT,
    expires_at                  TIMESTAMPTZ,
    prepared_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    executed_at                 TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_avanti_action_runs_idempotency
        UNIQUE (actor_user_id, idempotency_key),
    CONSTRAINT chk_avanti_action_actor_tier
        CHECK (actor_tier IN ('free','plus','mentor')),
    CONSTRAINT chk_avanti_action_risk
        CHECK (risk_level IN ('green','yellow','red')),
    CONSTRAINT chk_avanti_action_status
        CHECK (status IN (
            'prepared','confirmation_required','confirmed',
            'executing','succeeded','failed',
            'expired','cancelled','blocked'
        )),
    CONSTRAINT chk_avanti_action_confirmation
        CHECK (
            (requires_confirmation = FALSE
                AND confirmed_by_user_id IS NULL
                AND confirmed_at IS NULL)
            OR (requires_confirmation = TRUE)
        ),
    -- Red actions may never reach executing or succeeded at DB level.
    CONSTRAINT chk_avanti_action_red_not_executable
        CHECK (
            risk_level <> 'red'
            OR status IN ('prepared','blocked','cancelled','expired','failed')
        )
);

CREATE INDEX idx_avanti_action_runs_actor_time
    ON avanti_action_runs(actor_user_id, created_at DESC);
CREATE INDEX idx_avanti_action_runs_feature_status
    ON avanti_action_runs(feature_key, status, created_at DESC);
CREATE INDEX idx_avanti_action_runs_context
    ON avanti_action_runs(context_entity_type, context_entity_id)
    WHERE context_entity_id IS NOT NULL;
CREATE INDEX idx_avanti_action_runs_target
    ON avanti_action_runs(target_entity_type, target_entity_id)
    WHERE target_entity_id IS NOT NULL;
CREATE INDEX idx_avanti_action_runs_pending_confirmation
    ON avanti_action_runs(actor_user_id, status, expires_at)
    WHERE status = 'confirmation_required';
CREATE INDEX idx_avanti_action_runs_payload_gin
    ON avanti_action_runs USING GIN (prepared_payload);

-- ────────────────────────────────────────────────────────────
-- 3. AVANTI PROACTIVE SCAN RUNS
--    Background scans create these rows. Scans may prepare
--    action_runs but may NEVER execute Yellow actions.
--    Retain for 90 days — purge via pg_cron after that.
--    (avanti_action_runs are permanent audit trail.)
-- ────────────────────────────────────────────────────────────
CREATE TABLE avanti_proactive_scan_runs (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role                        TEXT NOT NULL,
    scan_scope                  TEXT NOT NULL,
    trigger_type                TEXT NOT NULL,
    status                      TEXT NOT NULL DEFAULT 'queued',
    started_at                  TIMESTAMPTZ,
    finished_at                 TIMESTAMPTZ,
    highest_risk_level          TEXT,
    strip_context               JSONB NOT NULL DEFAULT '{}'::jsonb,
    prepared_action_run_ids     UUID[] NOT NULL DEFAULT '{}',
    error_code                  TEXT,
    error_message               TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_avanti_scan_trigger
        CHECK (trigger_type IN (
            'home_load','scheduled','outbox_event',
            'manual_refresh','tile_tap'
        )),
    CONSTRAINT chk_avanti_scan_status
        CHECK (status IN ('queued','running','succeeded','failed','cancelled')),
    CONSTRAINT chk_avanti_scan_risk
        CHECK (highest_risk_level IS NULL
            OR highest_risk_level IN ('green','yellow','red'))
);

CREATE INDEX idx_avanti_scan_runs_user_time
    ON avanti_proactive_scan_runs(user_id, created_at DESC);
CREATE INDEX idx_avanti_scan_runs_scope_status
    ON avanti_proactive_scan_runs(scan_scope, status, created_at DESC);

-- 90-day retention: run via pg_cron (register after migration applies)
-- SELECT cron.schedule('purge-avanti-scans','0 3 * * *',
--   $$DELETE FROM avanti_proactive_scan_runs WHERE created_at < NOW() - INTERVAL '90 days'$$);

COMMIT;
