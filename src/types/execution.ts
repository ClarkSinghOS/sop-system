// Process Execution Engine Types

import { Process, ProcessStep } from './process';

// ============================================================
// STATUS ENUMS
// ============================================================

export type InstanceStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed';
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed';
export type AssignmentStatus = 'active' | 'completed' | 'reassigned' | 'cancelled';

export type EventType = 
  | 'instance_started'
  | 'instance_completed'
  | 'instance_failed'
  | 'instance_blocked'
  | 'step_started'
  | 'step_completed'
  | 'step_failed'
  | 'step_blocked'
  | 'step_assigned'
  | 'step_reassigned'
  | 'comment_added'
  | 'variable_updated';

// ============================================================
// CORE TYPES
// ============================================================

export interface ProcessInstance {
  id: string;
  process_id: string | null;
  process_snapshot: Process;
  status: InstanceStatus;
  variables: Record<string, unknown>;
  current_step_id: string | null;
  started_at: string;
  completed_at: string | null;
  started_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstanceStep {
  id: string;
  instance_id: string;
  step_id: string;
  sequence: number;
  status: StepStatus;
  started_at: string | null;
  completed_at: string | null;
  completed_by: string | null;
  duration_seconds: number | null;
  output: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstanceAssignment {
  id: string;
  instance_id: string;
  step_id: string;
  assigned_to: string;
  assigned_by: string | null;
  assigned_at: string;
  status: AssignmentStatus;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface InstanceEvent {
  id: string;
  instance_id: string;
  event_type: EventType;
  step_id: string | null;
  actor: string | null;
  metadata: Record<string, unknown>;
  message: string | null;
  created_at: string;
}

// ============================================================
// API REQUEST/RESPONSE TYPES
// ============================================================

export interface StartProcessRequest {
  process_id: string;
  variables?: Record<string, unknown>;
  started_by?: string;
  notes?: string;
}

export interface StartProcessResponse {
  instance: ProcessInstance;
  steps: InstanceStep[];
}

export interface CompleteStepRequest {
  step_id: string;
  completed_by?: string;
  output?: Record<string, unknown>;
  notes?: string;
}

export interface AssignStepRequest {
  step_id: string;
  assigned_to: string;
  assigned_by?: string;
  notes?: string;
}

export interface InstanceWithDetails extends ProcessInstance {
  steps: InstanceStep[];
  assignments: InstanceAssignment[];
  current_step?: ProcessStep | null;
}

export interface TimelineEntry {
  id: string;
  type: EventType;
  step_id: string | null;
  step_name?: string;
  actor: string | null;
  message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================================
// VIEW TYPES
// ============================================================

export interface InstanceProgress {
  id: string;
  process_id: string | null;
  status: InstanceStatus;
  started_at: string;
  started_by: string | null;
  current_step_id: string | null;
  process_name: string;
  process_code: string;
  completed_steps: number;
  total_steps: number;
  current_assignees: string[];
}

// ============================================================
// UTILITY TYPES
// ============================================================

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const STATUS_CONFIG: Record<InstanceStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    color: 'var(--text-tertiary)',
    bgColor: 'var(--bg-tertiary)',
    icon: 'clock',
  },
  in_progress: {
    label: 'In Progress',
    color: 'var(--accent-cyan)',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    icon: 'play',
  },
  completed: {
    label: 'Completed',
    color: 'var(--status-success)',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: 'check',
  },
  blocked: {
    label: 'Blocked',
    color: 'var(--status-warning)',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: 'pause',
  },
  failed: {
    label: 'Failed',
    color: 'var(--status-error)',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: 'x',
  },
};
