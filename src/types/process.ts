// ProcessCore - Complete Process Documentation Types

// ============================================================
// CORE PROCESS TYPES
// ============================================================

export type StepType = 'task' | 'decision' | 'parallel' | 'subprocess' | 'human_task' | 'automated' | 'milestone';
export type AutomationLevel = 'none' | 'partial' | 'full';
export type ProcessStatus = 'draft' | 'active' | 'deprecated' | 'under_review';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ConnectionType = 'triggers' | 'blocks' | 'informs' | 'parallel';

// ============================================================
// MEDIA & CONTENT TYPES
// ============================================================

export interface VideoContent {
  id: string;
  type: 'loom' | 'youtube' | 'vimeo' | 'custom' | 'scribe';
  url: string;
  embedUrl: string;
  title: string;
  duration: number; // seconds
  thumbnail?: string;
  chapters?: VideoChapter[];
  transcript?: string;
}

export interface VideoChapter {
  time: number;
  title: string;
  description?: string;
}

export interface Screenshot {
  id: string;
  url: string;
  caption: string;
  annotations?: Annotation[];
  order: number;
}

export interface Annotation {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'highlight' | 'arrow' | 'text' | 'number';
  content: string;
  color?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  fileType: 'doc' | 'sheet' | 'pdf' | 'image' | 'other';
  previewUrl?: string;
}

export interface Infographic {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  generatedBy?: 'ai' | 'manual';
}

// ============================================================
// CHECKLIST & TASKS
// ============================================================

export interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  order: number;
  helpText?: string;
  linkUrl?: string;
  completedAt?: string;
  completedBy?: string;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  completionCriteria?: string;
}

// ============================================================
// DECISION & BRANCHING
// ============================================================

export interface DecisionBranch {
  id: string;
  condition: string;
  conditionReadable: string; // Human readable
  targetStepId: string;
  probability?: number; // % of times this path is taken
  notes?: string;
}

export interface Decision {
  question: string;
  evaluateField?: string;
  branches: DecisionBranch[];
  defaultBranch?: string;
}

// ============================================================
// TOOLS & INTEGRATIONS
// ============================================================

export interface Tool {
  id: string;
  name: string;
  icon?: string;
  url?: string;
  category: 'software' | 'hardware' | 'service' | 'document';
  accessLevel?: string;
  notes?: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'manual' | 'zapier' | 'native';
  endpoint?: string;
  authentication?: string;
  dataFlow: 'inbound' | 'outbound' | 'bidirectional';
}

// ============================================================
// PEOPLE & ROLES
// ============================================================

export interface Role {
  id: string;
  name: string;
  department: string;
  responsibilities?: string[];
}

export interface Person {
  id: string;
  name: string;
  email?: string;
  role: Role;
  avatar?: string;
}

export interface StepOwnership {
  owner: Role;
  involved: Role[];
  escalateTo?: Role;
  notifyOnComplete?: Role[];
}

// ============================================================
// TIMING & SCHEDULING
// ============================================================

export interface Timing {
  estimatedDuration: string; // "2 hours", "1-2 days"
  estimatedMinutes?: number;
  deadline?: string;
  slaHours?: number;
  bestTimeToStart?: string;
  dependencies?: string[]; // Step IDs that must complete first
}

// ============================================================
// ERRORS & TROUBLESHOOTING
// ============================================================

export interface CommonMistake {
  id: string;
  title: string;
  description: string;
  howToFix: string;
  warningSignals?: string[];
  preventionTips?: string[];
}

export interface ErrorHandler {
  onFailure: 'retry' | 'escalate' | 'skip' | 'abort';
  retryPolicy?: 'immediate' | 'exponential_backoff' | 'fixed_delay';
  maxRetries?: number;
  escalateTo?: string;
  fallbackStepId?: string;
}

// ============================================================
// AUTOMATION & AI
// ============================================================

export interface AutomationAnalysis {
  currentState: 'manual' | 'semi_automated' | 'automated';
  targetState: 'manual' | 'semi_automated' | 'automated';
  automationType?: 'trigger_based' | 'scheduled' | 'event_driven' | 'ai_assisted';
  blockers?: string[];
  effortToAutomate: 'trivial' | 'low' | 'medium' | 'high' | 'extreme';
  toolsRequired?: string[];
  estimatedSavingsPerMonth?: string;
}

export interface AIAction {
  action: string;
  template?: string;
  params?: Record<string, string>;
  waitForResponse?: boolean;
  timeout?: number;
}

export interface AIStepDefinition {
  inputs: string[];
  outputs: string[];
  actions: AIAction[];
  conditions: {
    requiredBefore: string[];
    timeout?: string;
    onTimeout?: string;
  };
  next: Array<{
    condition: string;
    goto: string;
    retryCount?: number;
  }>;
}

// ============================================================
// EXAMPLES & SCENARIOS
// ============================================================

export interface Example {
  id: string;
  title: string;
  scenario: string;
  outcome: string;
  isPositive: boolean; // Good example vs cautionary tale
  relatedMistake?: string;
}

// ============================================================
// COMPLETE STEP DEFINITION
// ============================================================

export interface ProcessStep {
  // Identity
  id: string;
  stepId: string; // HR-ONB-001-A format
  name: string;
  type: StepType;
  
  // Descriptions
  shortDescription: string;
  longDescription: string;
  whyItMatters?: string;
  
  // Media
  videos?: VideoContent[];
  screenshots?: Screenshot[];
  templates?: Template[];
  infographics?: Infographic[];
  
  // Tasks
  checklist?: Checklist;
  
  // Decisions
  decision?: Decision;
  
  // Tools
  toolsUsed?: Tool[];
  integrations?: Integration[];
  
  // People
  ownership: StepOwnership;
  
  // Timing
  timing: Timing;
  
  // Problems
  commonMistakes?: CommonMistake[];
  errorHandling?: ErrorHandler;
  
  // Automation
  automationLevel: AutomationLevel;
  automationAnalysis?: AutomationAnalysis;
  aiDefinition?: AIStepDefinition;
  
  // Examples
  examples?: Example[];
  
  // Connections
  triggersProcesses?: string[];
  triggeredByProcesses?: string[];
  parallelWith?: string[];
  
  // UI State
  position?: { x: number; y: number };
  expanded?: boolean;
}

// ============================================================
// COMPLETE PROCESS DEFINITION
// ============================================================

export interface Process {
  // Identity
  id: string;
  processId: string; // MKT-FLOW-001 format
  name: string;
  department: string;
  
  // Status
  status: ProcessStatus;
  version: string;
  priority: Priority;
  
  // Overview
  description: string;
  shortVersion: string[]; // 3-line summary
  purpose: string;
  outcomes: string[];
  
  // People
  owner: Role;
  involved: Role[];
  targetAudience?: string;
  
  // Timing
  frequency: string;
  estimatedDuration: string;
  
  // Steps
  steps: ProcessStep[];
  
  // Connections
  triggers?: string[];
  triggeredBy?: string[];
  relatedProcesses?: string[];
  
  // Metrics
  kpis?: Array<{
    name: string;
    target: string;
    current?: string;
  }>;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  
  // Comments
  comments?: Array<{
    id: string;
    stepId?: string;
    author: string;
    text: string;
    createdAt: string;
  }>;
}

// ============================================================
// VIEW MODES
// ============================================================

export type ViewMode = 'flow' | 'timeline' | 'cards' | 'list' | 'checklist' | 'ai' | 'map';

export interface ViewConfig {
  mode: ViewMode;
  expandedSteps: Set<string>;
  selectedStep?: string;
  showAutomation: boolean;
  showTiming: boolean;
  roleFilter?: string;
  searchQuery?: string;
}
