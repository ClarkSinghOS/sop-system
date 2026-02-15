// SOP Types - Dual format for human and AI consumption

export interface SOPStep {
  id: string;
  stepId: string; // e.g., HR-ONB-001-A
  name: string;
  shortDescription: string;
  longDescription: string;
  owner: string;
  duration: string;
  videoUrl?: string;
  automatable: 'none' | 'partial' | 'full';
  linkedProcesses?: string[];
  actions?: SOPAction[];
  conditions?: SOPConditions;
  next?: SOPNextStep[];
}

export interface SOPAction {
  action: string;
  template?: string;
  to?: string;
  items?: string[];
}

export interface SOPConditions {
  requiredBefore: string[];
  timeout?: string;
  onTimeout?: string;
}

export interface SOPNextStep {
  condition: string;
  goto: string;
  retryCount?: number;
}

export interface SOPProcess {
  processId: string;
  name: string;
  version: string;
  department: string;
  owner: string;
  involved: string[];
  frequency: string;
  estimatedDuration: string;
  lastUpdated: string;
  shortVersion: string[];
  triggers?: string[];
  inputs?: Record<string, string>;
  steps: SOPStep[];
  errorHandling?: {
    onFailure: string;
    retryPolicy: string;
    maxRetries: number;
  };
  metadata?: {
    created: string;
    updated: string;
    author: string;
    tags: string[];
  };
}

// AI-executable format (JSON schema)
export interface SOPAIFormat {
  process_id: string;
  name: string;
  version: string;
  owner: string;
  triggers: string[];
  inputs: Record<string, string>;
  steps: SOPAIStep[];
  error_handling: {
    on_failure: string;
    retry_policy: string;
    max_retries: number;
  };
  metadata: {
    created: string;
    updated: string;
    author: string;
    tags: string[];
  };
}

export interface SOPAIStep {
  step_id: string;
  name: string;
  type: 'task' | 'decision' | 'parallel' | 'subprocess' | 'human_task' | 'automated';
  executor: string;
  automatable: 'none' | 'partial' | 'full';
  inputs: string[];
  outputs: string[];
  actions: Array<{
    action: string;
    template?: string;
    to?: string;
    items?: string[];
  }>;
  conditions: {
    required_before: string[];
    timeout?: string;
    on_timeout?: string;
  };
  next: Array<{
    condition: string;
    goto: string;
    retry_count?: number;
  }>;
}

// React Flow node data
export interface SOPNodeData {
  label: string;
  stepId: string;
  shortDesc: string;
  longDesc: string;
  owner: string;
  duration: string;
  videoUrl?: string;
  automatable: 'none' | 'partial' | 'full';
  linkedProcesses?: string[];
  isExpanded?: boolean;
}
