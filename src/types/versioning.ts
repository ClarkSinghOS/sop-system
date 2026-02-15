// Version History & Audit Types for ProcessCore

import type { Process, ProcessStep } from './process';

// ============================================================
// VERSION TYPES
// ============================================================

export interface ProcessVersion {
  id: string;
  processId: string;
  version: string; // Semantic: "1.0.0", "1.1.0", etc.
  versionNumber: number; // Sequential: 1, 2, 3...
  
  // Snapshot of the process at this version
  snapshot: Process;
  
  // Change metadata
  changeNotes: string;
  changeSummary?: string; // AI-generated or brief summary
  changeType: VersionChangeType;
  
  // Author
  createdBy: string;
  createdByEmail?: string;
  createdAt: string;
  
  // Status
  isLatest: boolean;
  isDraft: boolean;
  
  // Diff from previous
  diffFromPrevious?: VersionDiff;
}

export type VersionChangeType = 
  | 'major'      // Breaking changes, restructure
  | 'minor'      // New steps, significant additions
  | 'patch'      // Small fixes, typos, clarifications
  | 'draft'      // Work in progress, not published
  | 'restore';   // Restored from previous version

// ============================================================
// DIFF TYPES
// ============================================================

export interface VersionDiff {
  versionA: string; // Version ID being compared from
  versionB: string; // Version ID being compared to
  processId: string;
  
  // High-level stats
  summary: DiffSummary;
  
  // Detailed changes
  changes: DiffChange[];
  
  // Step-level changes
  stepsAdded: ProcessStep[];
  stepsRemoved: ProcessStep[];
  stepsModified: StepDiff[];
  
  // Metadata changes
  metadataChanges: MetadataChange[];
  
  generatedAt: string;
}

export interface DiffSummary {
  totalChanges: number;
  additions: number;
  deletions: number;
  modifications: number;
  
  stepsAdded: number;
  stepsRemoved: number;
  stepsModified: number;
  
  hasBreakingChanges: boolean;
}

export interface DiffChange {
  id: string;
  type: 'added' | 'removed' | 'modified';
  path: string; // JSON path: "steps[0].name", "description", etc.
  field: string; // Human readable: "Step 1 Name", "Description"
  
  oldValue?: string | number | boolean | object;
  newValue?: string | number | boolean | object;
  
  // For text changes
  textDiff?: TextDiff[];
  
  severity: 'info' | 'warning' | 'breaking';
  stepId?: string; // If change is within a step
}

export interface TextDiff {
  type: 'unchanged' | 'added' | 'removed';
  value: string;
  lineNumber?: number;
}

export interface StepDiff {
  stepId: string;
  stepName: string;
  changes: DiffChange[];
  
  // Quick flags
  nameChanged: boolean;
  descriptionChanged: boolean;
  checklistChanged: boolean;
  mediaChanged: boolean;
  toolsChanged: boolean;
}

export interface MetadataChange {
  field: string;
  oldValue: string;
  newValue: string;
}

// ============================================================
// CHANGE LOG TYPES
// ============================================================

export interface ChangeLog {
  id: string;
  processId: string;
  
  // All versions with their changes
  entries: ChangeLogEntry[];
  
  // Stats
  totalVersions: number;
  firstVersion: string;
  latestVersion: string;
  
  generatedAt: string;
}

export interface ChangeLogEntry {
  versionId: string;
  version: string;
  versionNumber: number;
  
  changeType: VersionChangeType;
  changeNotes: string;
  changeSummary?: string;
  
  createdBy: string;
  createdAt: string;
  
  // Highlights from this version
  highlights: string[];
  
  // Quick stats
  stepsAdded: number;
  stepsRemoved: number;
  stepsModified: number;
}

// ============================================================
// AUDIT TYPES
// ============================================================

export type AuditActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'import'
  | 'publish'
  | 'archive'
  | 'restore'
  | 'duplicate'
  | 'share'
  | 'comment'
  | 'assign'
  | 'complete_training'
  | 'start_training'
  | 'version_create'
  | 'version_restore';

export interface AuditEntry {
  id: string;
  
  // What happened
  action: AuditActionType;
  actionLabel: string; // Human readable
  description: string;
  
  // What was affected
  resourceType: 'process' | 'step' | 'checklist' | 'media' | 'comment' | 'training' | 'version';
  resourceId: string;
  resourceName: string;
  
  // Context
  processId?: string;
  processName?: string;
  stepId?: string;
  stepName?: string;
  versionId?: string;
  version?: string;
  
  // Who did it
  userId: string;
  userName: string;
  userEmail?: string;
  userRole?: string;
  
  // When
  timestamp: string;
  
  // Additional context
  metadata?: Record<string, unknown>;
  
  // IP/Device (optional)
  ipAddress?: string;
  userAgent?: string;
  
  // Was it successful?
  success: boolean;
  errorMessage?: string;
}

export interface AuditLog {
  processId: string;
  entries: AuditEntry[];
  
  // Filter state
  filters: AuditFilters;
  
  // Pagination
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditFilters {
  actionTypes?: AuditActionType[];
  userIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  resourceTypes?: string[];
  searchQuery?: string;
}

// ============================================================
// UI STATE TYPES
// ============================================================

export interface VersionHistoryState {
  versions: ProcessVersion[];
  selectedVersionId?: string;
  compareVersionIds?: [string, string];
  isLoading: boolean;
  error?: string;
}

export interface UnsavedChangesState {
  hasChanges: boolean;
  changedFields: string[];
  lastSavedAt?: string;
  autoSaveEnabled: boolean;
}

export interface SaveVersionDialog {
  isOpen: boolean;
  changeNotes: string;
  changeType: VersionChangeType;
  isSubmitting: boolean;
}

// ============================================================
// EXPORT TYPES
// ============================================================

export interface AuditExport {
  format: 'csv' | 'json' | 'pdf';
  entries: AuditEntry[];
  filters: AuditFilters;
  generatedAt: string;
  generatedBy: string;
}
