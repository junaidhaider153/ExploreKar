-- Phase 0 fix: DB-backed rate limiting for /api/analyze-room (and any future
-- rate-limited route). Run this in your Supabase SQL editor.
--
-- Why a table instead of an in-memory counter: this app runs on Vercel's
-- serverless functions, which don't share memory between invocations or
-- instances. An in-memory Map-based limiter looks like it works locally and
-- then does effectively nothing in production — the exact trap FikarNot's
-- own rate limiter (server/lib/rateLimit.js) already avoids by being
-- DB-backed. This mirrors that approach.

CREATE TABLE IF NOT EXISTS public.api_rate_limit_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier  TEXT NOT NULL,       -- a user_id (uuid) or a client IP for guests
  action      TEXT NOT NULL,       -- e.g. 'analyze-room'
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- The hot path is "count rows for this identifier+action in the last N
-- minutes", so index exactly that.
CREATE INDEX IF NOT EXISTS api_rate_limit_events_lookup_idx
  ON public.api_rate_limit_events (identifier, action, created_at DESC);

-- All access goes through the service-role client (src/lib/rate-limit.ts) on
-- the server, so RLS stays enabled with no public policies — same pattern as
-- the `products`/`categories` write access.
ALTER TABLE public.api_rate_limit_events ENABLE ROW LEVEL SECURITY;

-- Optional but recommended: periodically prune old rows so this table
-- doesn't grow unbounded. Run manually or on a schedule (e.g. a Supabase
-- cron job / pg_cron) — safe to run anytime:
--   DELETE FROM public.api_rate_limit_events WHERE created_at < NOW() - INTERVAL '7 days';
