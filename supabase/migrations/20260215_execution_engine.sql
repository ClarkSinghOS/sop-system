-- Process Execution Engine - Database Schema
-- Running instances of processes with step tracking, assignments, and audit trail

-- Status enums as check constraints
-- pending: Not started
-- in_progress: Currently being worked on
-- completed: Successfully finished
-- blocked: Waiting on something
-- failed: Error occurred

-- ============================================================
-- PROCESS INSTANCES
-- ============================================================

CREATE TABLE IF NOT EXISTS process_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES processes(id) ON DELETE SET NULL,
  process_snapshot JSONB NOT NULL, -- Frozen copy of process at start time
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'failed')) DEFAULT 'pending',
  variables JSONB DEFAULT '{}', -- Runtime variables/inputs
  current_step_id TEXT, -- Which step we're on
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  started_by TEXT, -- User ID or name
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_process_instances_process ON process_instances(process_id);
CREATE INDEX IF NOT EXISTS idx_process_instances_status ON process_instances(status);
CREATE INDEX IF NOT EXISTS idx_process_instances_started_by ON process_instances(started_by);
CREATE INDEX IF NOT EXISTS idx_process_instances_started_at ON process_instances(started_at DESC);

-- ============================================================
-- INSTANCE STEPS
-- ============================================================

CREATE TABLE IF NOT EXISTS instance_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES process_instances(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL, -- Reference to step in process_snapshot
  sequence INT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'failed')) DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  duration_seconds INT, -- Actual time taken
  output JSONB, -- Any output/results from this step
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instance_id, step_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_instance_steps_instance ON instance_steps(instance_id);
CREATE INDEX IF NOT EXISTS idx_instance_steps_status ON instance_steps(status);
CREATE INDEX IF NOT EXISTS idx_instance_steps_step_id ON instance_steps(step_id);

-- ============================================================
-- INSTANCE ASSIGNMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS instance_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES process_instances(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  assigned_to TEXT NOT NULL, -- User ID or name
  assigned_by TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'completed', 'reassigned', 'cancelled')) DEFAULT 'active',
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_instance_assignments_instance ON instance_assignments(instance_id);
CREATE INDEX IF NOT EXISTS idx_instance_assignments_assigned_to ON instance_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_instance_assignments_status ON instance_assignments(status);

-- ============================================================
-- INSTANCE EVENTS (Audit Trail)
-- ============================================================

CREATE TABLE IF NOT EXISTS instance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES process_instances(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'instance_started',
    'instance_completed',
    'instance_failed',
    'instance_blocked',
    'step_started',
    'step_completed',
    'step_failed',
    'step_blocked',
    'step_assigned',
    'step_reassigned',
    'comment_added',
    'variable_updated'
  )),
  step_id TEXT, -- Optional, for step-specific events
  actor TEXT, -- Who triggered this event
  metadata JSONB DEFAULT '{}', -- Additional context
  message TEXT, -- Human-readable description
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_instance_events_instance ON instance_events(instance_id);
CREATE INDEX IF NOT EXISTS idx_instance_events_type ON instance_events(event_type);
CREATE INDEX IF NOT EXISTS idx_instance_events_step ON instance_events(step_id);
CREATE INDEX IF NOT EXISTS idx_instance_events_created ON instance_events(created_at DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Updated at trigger for process_instances
DROP TRIGGER IF EXISTS process_instances_updated_at ON process_instances;
CREATE TRIGGER process_instances_updated_at
  BEFORE UPDATE ON process_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Updated at trigger for instance_steps
DROP TRIGGER IF EXISTS instance_steps_updated_at ON instance_steps;
CREATE TRIGGER instance_steps_updated_at
  BEFORE UPDATE ON instance_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- VIEWS
-- ============================================================

-- Active instances with progress
CREATE OR REPLACE VIEW instance_progress AS
SELECT 
  pi.id,
  pi.process_id,
  pi.status,
  pi.started_at,
  pi.started_by,
  pi.current_step_id,
  (pi.process_snapshot->>'name')::TEXT as process_name,
  (pi.process_snapshot->>'processId')::TEXT as process_code,
  COALESCE(
    (SELECT COUNT(*)::INT FROM instance_steps ist WHERE ist.instance_id = pi.id AND ist.status = 'completed'),
    0
  ) as completed_steps,
  COALESCE(
    (SELECT COUNT(*)::INT FROM instance_steps ist WHERE ist.instance_id = pi.id),
    0
  ) as total_steps,
  COALESCE(
    (SELECT array_agg(ia.assigned_to) 
     FROM instance_assignments ia 
     WHERE ia.instance_id = pi.id AND ia.status = 'active'),
    ARRAY[]::TEXT[]
  ) as current_assignees
FROM process_instances pi;

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE process_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE instance_steps;
ALTER PUBLICATION supabase_realtime ADD TABLE instance_events;
ALTER PUBLICATION supabase_realtime ADD TABLE instance_assignments;
