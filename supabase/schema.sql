-- ProcessCore Database Schema
-- Run this in Supabase SQL Editor to set up the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- API KEYS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 11 chars (pk_ + 8 chars)
  key_hash TEXT NOT NULL,   -- SHA256 hash of full key
  permissions TEXT[] NOT NULL DEFAULT '{}',
  rate_limit INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- ============================================================
-- PROCESS INSTANCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS process_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'started', -- started, running, completed, failed, cancelled
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  current_step TEXT,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexes for process instances
CREATE INDEX IF NOT EXISTS idx_process_instances_process ON process_instances(process_id);
CREATE INDEX IF NOT EXISTS idx_process_instances_status ON process_instances(status);
CREATE INDEX IF NOT EXISTS idx_process_instances_started ON process_instances(started_at DESC);

-- ============================================================
-- STEP EXECUTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS step_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id UUID NOT NULL REFERENCES process_instances(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, success, failed, skipped
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  assigned_to TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for step executions
CREATE INDEX IF NOT EXISTS idx_step_executions_instance ON step_executions(instance_id);
CREATE INDEX IF NOT EXISTS idx_step_executions_step ON step_executions(step_id);
CREATE INDEX IF NOT EXISTS idx_step_executions_status ON step_executions(status);

-- ============================================================
-- PROCESS TRIGGERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS process_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  process_id TEXT NOT NULL,
  step_id TEXT, -- Optional: specific step
  event TEXT NOT NULL, -- process.started, step.completed, etc.
  conditions JSONB DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexes for triggers
CREATE INDEX IF NOT EXISTS idx_triggers_process ON process_triggers(process_id);
CREATE INDEX IF NOT EXISTS idx_triggers_event ON process_triggers(event);
CREATE INDEX IF NOT EXISTS idx_triggers_active ON process_triggers(is_active);

-- ============================================================
-- ACTION EXECUTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS action_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trigger_id UUID REFERENCES process_triggers(id) ON DELETE SET NULL,
  action_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  instance_id UUID REFERENCES process_instances(id) ON DELETE SET NULL,
  step_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, success, failed, retrying
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  input JSONB DEFAULT '{}'::jsonb,
  output JSONB DEFAULT '{}'::jsonb,
  error JSONB,
  retry_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for action executions
CREATE INDEX IF NOT EXISTS idx_action_executions_trigger ON action_executions(trigger_id);
CREATE INDEX IF NOT EXISTS idx_action_executions_instance ON action_executions(instance_id);
CREATE INDEX IF NOT EXISTS idx_action_executions_status ON action_executions(status);
CREATE INDEX IF NOT EXISTS idx_action_executions_started ON action_executions(started_at DESC);

-- ============================================================
-- WEBHOOK EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  process_id TEXT,
  instance_id UUID REFERENCES process_instances(id) ON DELETE SET NULL,
  step_id TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'internal', -- internal, webhook, callback, api
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for webhook events
CREATE INDEX IF NOT EXISTS idx_webhook_events_event ON webhook_events(event);
CREATE INDEX IF NOT EXISTS idx_webhook_events_process ON webhook_events(process_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_instance ON webhook_events(instance_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_timestamp ON webhook_events(timestamp DESC);

-- ============================================================
-- CONNECTIONS TABLE (for external service integrations)
-- ============================================================
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- slack, email_resend, clickup, etc.
  status TEXT NOT NULL DEFAULT 'pending', -- connected, disconnected, error, pending
  credentials_encrypted TEXT, -- Encrypted credentials
  credentials_iv TEXT,
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Index for connections
CREATE INDEX IF NOT EXISTS idx_connections_type ON connections(type);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Optional but recommended
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Service role can access all data
CREATE POLICY "Service role full access" ON api_keys FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON process_instances FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON step_executions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON process_triggers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON action_executions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON webhook_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON connections FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================

-- Enable realtime for webhook_events (for SSE streaming)
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_events;
ALTER PUBLICATION supabase_realtime ADD TABLE process_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE action_executions;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_process_instances_updated_at
  BEFORE UPDATE ON process_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_process_triggers_updated_at
  BEFORE UPDATE ON process_triggers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
