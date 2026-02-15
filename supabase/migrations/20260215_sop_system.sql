-- SOP System Database Schema
-- Based on the sop-creation skill specification

-- Core processes table
CREATE TABLE IF NOT EXISTS processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id TEXT UNIQUE NOT NULL,  -- e.g., HR-ONB-001
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  owner_id UUID,
  version TEXT DEFAULT '1.0',
  status TEXT CHECK (status IN ('draft', 'active', 'deprecated')) DEFAULT 'draft',
  human_content JSONB,  -- Rich visual content for human view
  ai_content JSONB,     -- Executable JSON for AI
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Process steps table
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,  -- e.g., HR-ONB-001-A
  sequence INT NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  owner_role TEXT,
  duration_estimate INTERVAL,
  automatable TEXT CHECK (automatable IN ('none', 'partial', 'full')) DEFAULT 'none',
  video_url TEXT,
  media JSONB,
  ai_definition JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Process connections table (cross-references between processes)
CREATE TABLE IF NOT EXISTS process_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  to_process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  connection_type TEXT CHECK (connection_type IN ('triggers', 'blocks', 'informs')) NOT NULL,
  condition TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_processes_department ON processes(department);
CREATE INDEX IF NOT EXISTS idx_processes_status ON processes(status);
CREATE INDEX IF NOT EXISTS idx_process_steps_process ON process_steps(process_id);
CREATE INDEX IF NOT EXISTS idx_process_connections_from ON process_connections(from_process_id);
CREATE INDEX IF NOT EXISTS idx_process_connections_to ON process_connections(to_process_id);

-- View for process tree navigation
CREATE OR REPLACE VIEW process_tree AS
SELECT 
  p.id,
  p.process_id,
  p.name,
  p.department,
  p.status,
  p.version,
  COALESCE(
    (SELECT array_agg(pc.to_process_id) 
     FROM process_connections pc 
     WHERE pc.from_process_id = p.id AND pc.connection_type = 'triggers'),
    ARRAY[]::UUID[]
  ) as triggers,
  COALESCE(
    (SELECT array_agg(pc.from_process_id) 
     FROM process_connections pc 
     WHERE pc.to_process_id = p.id AND pc.connection_type = 'triggers'),
    ARRAY[]::UUID[]
  ) as triggered_by,
  (SELECT COUNT(*) FROM process_steps ps WHERE ps.process_id = p.id) as step_count
FROM processes p;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS processes_updated_at ON processes;
CREATE TRIGGER processes_updated_at
  BEFORE UPDATE ON processes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS process_steps_updated_at ON process_steps;
CREATE TRIGGER process_steps_updated_at
  BEFORE UPDATE ON process_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS policies (enable if using authentication)
-- ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE process_connections ENABLE ROW LEVEL SECURITY;

-- Insert sample data: HR-ONB-001
INSERT INTO processes (process_id, name, department, version, status, human_content, ai_content)
VALUES (
  'HR-ONB-001',
  'New Employee Onboarding',
  'HR',
  '2.3',
  'active',
  '{
    "shortVersion": ["1. Collect docs", "2. Setup accounts", "3. First day orientation"],
    "owner": "HR Manager",
    "involved": ["IT", "Finance", "Department Head"],
    "frequency": "Per new hire",
    "estimatedDuration": "5 business days"
  }'::JSONB,
  '{
    "triggers": ["new_hire_created"],
    "inputs": {"employee_id": "string", "start_date": "date", "department": "string", "role": "string"},
    "error_handling": {"on_failure": "notify_owner", "retry_policy": "exponential_backoff", "max_retries": 3}
  }'::JSONB
)
ON CONFLICT (process_id) DO NOTHING;

-- Get the process ID for steps
DO $$
DECLARE
  proc_id UUID;
BEGIN
  SELECT id INTO proc_id FROM processes WHERE process_id = 'HR-ONB-001';
  
  IF proc_id IS NOT NULL THEN
    -- Insert steps
    INSERT INTO process_steps (process_id, step_id, sequence, name, short_description, long_description, owner_role, duration_estimate, automatable, video_url)
    VALUES
    (proc_id, 'HR-ONB-001-A', 1, 'Collect Documents', 'Get ID, tax forms, bank details', 'Complete document collection checklist including ID, tax forms, bank details, emergency contacts, and signed agreements.', 'HR Coordinator', '2 days', 'partial', 'https://www.loom.com/embed/example-collect-docs'),
    (proc_id, 'HR-ONB-001-B', 2, 'Setup System Accounts', 'Create email, Slack, tool access', 'Parallel account setup for Google Workspace, Slack, role-specific tools, time tracking, and payroll.', 'IT Administrator', '1 day', 'full', 'https://www.loom.com/embed/example-setup-accounts'),
    (proc_id, 'HR-ONB-001-C', 3, 'Equipment Assignment', 'Laptop, monitors, peripherals', 'Assign and configure equipment based on role requirements.', 'IT Support', '2 days', 'partial', NULL),
    (proc_id, 'HR-ONB-001-D', 4, 'First Day Orientation', 'Welcome meeting, tour, team intros', 'Full day orientation including welcome, company overview, office tour, team introductions, and IT setup.', 'HR Coordinator', '1 day', 'none', 'https://www.loom.com/embed/example-orientation'),
    (proc_id, 'HR-ONB-001-E', 5, 'Training & Compliance', 'Required training and policy acknowledgments', 'Mandatory training modules for policies, security, privacy, WHS, and conduct. Must complete within 7 days.', 'HR Coordinator', '3 days', 'full', NULL),
    (proc_id, 'HR-ONB-001-F', 6, 'Probation Check-ins', '30/60/90 day reviews', 'Structured check-ins at 30, 60, and 90 days to assess performance, integration, and confirm permanent employment.', 'Department Head', '90 days', 'partial', NULL)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
