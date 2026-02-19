-- ─────────────────────────────────────────────────────────────────
--  Migration: 001_initial_schema.sql
--  Creates all tables as defined in PRD Sections 2.4, 6.1, 7.1, 8.4
--  Run via: supabase db push
-- ─────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────────
CREATE TYPE plan_type AS ENUM ('free', 'spark', 'glow', 'pro');
CREATE TYPE generation_status AS ENUM ('pending', 'processing', 'complete', 'failed');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE gallery_source AS ENUM ('generation', 'editing', 'video', 'template');
CREATE TYPE credit_tx_type AS ENUM (
  'generation', 'editing', 'video', 'refund',
  'monthly_grant', 'topup', 'rollover'
);
CREATE TYPE template_category AS ENUM (
  'social_post', 'thumbnail', 'wallpaper', 'avatar', 'artistic', 'seasonal'
);
CREATE TYPE style_preset AS ENUM (
  'photorealistic', 'anime', 'digital_art', 'oil_painting',
  'cinematic', 'watercolor', 'pixel_art', '3d_render'
);
CREATE TYPE aspect_ratio AS ENUM ('1:1', '2:3', '3:2', '16:9', '9:16');

-- ── users (extends auth.users) ───────────────────────────────────
-- PRD Section 2.4 — User Profile Data Model
CREATE TABLE public.users (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    TEXT NOT NULL,
  display_name             TEXT,
  avatar_url               TEXT,
  plan                     plan_type NOT NULL DEFAULT 'free',
  credits_remaining        INTEGER NOT NULL DEFAULT 25 CHECK (credits_remaining >= 0),
  credits_monthly_allowance INTEGER NOT NULL DEFAULT 25,
  credits_rollover_balance  INTEGER NOT NULL DEFAULT 0,
  billing_cycle_start      TIMESTAMPTZ,
  stripe_customer_id       TEXT UNIQUE,
  stripe_subscription_id   TEXT UNIQUE,
  preferred_style          style_preset,
  onboarding_complete      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── collections ──────────────────────────────────────────────────
CREATE TABLE public.collections (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (char_length(name) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── gallery_items ────────────────────────────────────────────────
-- PRD Section 7.1 — Gallery Data Model
CREATE TABLE public.gallery_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type            media_type NOT NULL,
  output_url      TEXT NOT NULL,
  thumbnail_url   TEXT NOT NULL,
  prompt          TEXT NOT NULL,
  negative_prompt TEXT,
  style_preset    style_preset,
  aspect_ratio    aspect_ratio,
  model_used      TEXT NOT NULL,
  seed            INTEGER,
  source          gallery_source NOT NULL,
  is_favorite     BOOLEAN NOT NULL DEFAULT FALSE,
  collection_id   UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── credit_transactions ──────────────────────────────────────────
-- PRD Section 8.4 — Credit Transaction Ledger
CREATE TABLE public.credit_transactions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount       INTEGER NOT NULL,  -- negative = deducted, positive = added
  balance_after INTEGER NOT NULL,
  type         credit_tx_type NOT NULL,
  reference_id UUID,
  description  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── templates ────────────────────────────────────────────────────
-- PRD Section 6.1 — Template Data Model
CREATE TABLE public.templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL CHECK (char_length(title) <= 40),
  category        template_category NOT NULL,
  thumbnail_url   TEXT NOT NULL,
  prompt          TEXT NOT NULL,
  negative_prompt TEXT,
  style_preset    style_preset NOT NULL,
  aspect_ratio    aspect_ratio NOT NULL,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_free         BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── generation_jobs ──────────────────────────────────────────────
-- PRD Section 10.4 — Async Generation Job Flow
CREATE TABLE public.generation_jobs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type                  media_type NOT NULL,
  status                generation_status NOT NULL DEFAULT 'pending',
  prompt                TEXT,
  style_preset          style_preset,
  aspect_ratio          aspect_ratio,
  motion_prompt         TEXT,
  duration_seconds      INTEGER,
  credits_cost          INTEGER NOT NULL,
  output_url            TEXT,
  thumbnail_url         TEXT,
  gallery_item_id       UUID REFERENCES public.gallery_items(id) ON DELETE SET NULL,
  error_message         TEXT,
  replicate_prediction_id TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes for performance ──────────────────────────────────────
CREATE INDEX idx_gallery_items_user_id       ON public.gallery_items(user_id, created_at DESC);
CREATE INDEX idx_gallery_items_collection    ON public.gallery_items(collection_id);
CREATE INDEX idx_gallery_items_favorites     ON public.gallery_items(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_credit_tx_user_id          ON public.credit_transactions(user_id, created_at DESC);
CREATE INDEX idx_generation_jobs_user_id    ON public.generation_jobs(user_id, created_at DESC);
CREATE INDEX idx_generation_jobs_status     ON public.generation_jobs(status);
CREATE INDEX idx_generation_jobs_prediction ON public.generation_jobs(replicate_prediction_id);
CREATE INDEX idx_templates_category        ON public.templates(category, sort_order);
CREATE INDEX idx_templates_featured        ON public.templates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_collections_user_id       ON public.collections(user_id);

-- ── updated_at trigger for generation_jobs ───────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_generation_jobs_updated_at
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Auto-create user profile on auth signup ──────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row-Level Security ───────────────────────────────────────────
-- PRD Section 10.3: RLS enabled on all tables

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs   ENABLE ROW LEVEL SECURITY;

-- users: can only access own row
CREATE POLICY "users_own_row" ON public.users
  FOR ALL USING (auth.uid() = id);

-- gallery_items: own rows only
CREATE POLICY "gallery_own_rows" ON public.gallery_items
  FOR ALL USING (auth.uid() = user_id);

-- credit_transactions: read own, no direct writes (service role only)
CREATE POLICY "credit_tx_read_own" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- templates: all authenticated users can read
CREATE POLICY "templates_read_all" ON public.templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- collections: own rows only
CREATE POLICY "collections_own_rows" ON public.collections
  FOR ALL USING (auth.uid() = user_id);

-- generation_jobs: own rows only
CREATE POLICY "jobs_own_rows" ON public.generation_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- ── Enable Realtime on generation_jobs ───────────────────────────
-- Required for PRD Section 10.4 async job status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.generation_jobs;
