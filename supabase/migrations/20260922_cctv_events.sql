-- =============================================================
-- Smart Farm CCTV Alert System
-- Migration: 20260922_cctv_events
-- Description: Create cctv_events table for event logging,
--              idempotency, and notification tracking.
-- Run this manually in: Supabase → SQL Editor → Run
-- =============================================================

-- ─── Enum ────────────────────────────────────────────────────
CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent',
  'failed',
  'skipped'
);

-- ─── Table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cctv_events (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Camera
  camera_id            INTEGER       NOT NULL CHECK (camera_id IN (2, 3)),

  -- Event metadata
  event_type           TEXT,
  event_time           TIMESTAMPTZ,

  -- Batch window (5-minute window this event belongs to)
  batch_start          TIMESTAMPTZ   NOT NULL,
  batch_end            TIMESTAMPTZ   NOT NULL,

  -- Supabase Storage
  snapshot_path        TEXT,         -- e.g. 2026/09/22/CCTV2/20260922_220000.jpg
  snapshot_url         TEXT,         -- full public HTTPS URL

  -- Idempotency key: the Gmail message ID
  -- UNIQUE constraint prevents duplicate processing
  email_message_id     TEXT          UNIQUE NOT NULL,

  -- Processing metadata
  processed_at         TIMESTAMPTZ,
  notification_status  notification_status NOT NULL DEFAULT 'pending',
  notification_error   TEXT,         -- stores error message if notification_status = 'failed'

  -- Audit
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────
-- Fast lookup by batch window (used by batch deduplication logic)
CREATE INDEX IF NOT EXISTS idx_cctv_events_batch
  ON public.cctv_events (batch_start, batch_end);

-- Fast lookup by camera
CREATE INDEX IF NOT EXISTS idx_cctv_events_camera
  ON public.cctv_events (camera_id);

-- Fast lookup by notification status (pending/failed retry)
CREATE INDEX IF NOT EXISTS idx_cctv_events_notification_status
  ON public.cctv_events (notification_status);

-- Fast lookup by event time
CREATE INDEX IF NOT EXISTS idx_cctv_events_event_time
  ON public.cctv_events (event_time DESC);

-- ─── Row Level Security ──────────────────────────────────────
-- RLS is ENABLED. No public write policies are created.
-- Only service_role (used by Apps Script server-side) can INSERT/UPDATE.
ALTER TABLE public.cctv_events ENABLE ROW LEVEL SECURITY;

-- Allow service_role to do everything (bypasses RLS by default).
-- No additional policy needed for service_role.

-- READ-ONLY policy for authenticated users (dashboard/monitoring use)
-- Remove or restrict this if you don't need dashboard access.
CREATE POLICY "Allow authenticated read"
  ON public.cctv_events
  FOR SELECT
  TO authenticated
  USING (true);

-- ─── Comments ────────────────────────────────────────────────
COMMENT ON TABLE  public.cctv_events                    IS 'Smart Farm CCTV: one row per NVR email processed by Apps Script';
COMMENT ON COLUMN public.cctv_events.camera_id          IS 'Camera number: 2 = CCTV2, 3 = CCTV3';
COMMENT ON COLUMN public.cctv_events.email_message_id   IS 'Gmail message ID — unique constraint prevents duplicate processing (idempotency key)';
COMMENT ON COLUMN public.cctv_events.batch_start        IS 'Start of the 5-minute batch window this event was assigned to';
COMMENT ON COLUMN public.cctv_events.batch_end          IS 'End of the 5-minute batch window this event was assigned to';
COMMENT ON COLUMN public.cctv_events.snapshot_path      IS 'Supabase Storage object path inside cctv-snapshots bucket';
COMMENT ON COLUMN public.cctv_events.snapshot_url       IS 'Public HTTPS URL of the snapshot (Supabase or GitHub fallback)';
COMMENT ON COLUMN public.cctv_events.notification_status IS 'sent = LINE push succeeded; failed = LINE push errored; skipped = no snapshot; pending = not yet processed';
