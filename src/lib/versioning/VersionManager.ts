// VersionManager - Save and retrieve versions
// Uses localStorage for now, structured for easy Supabase migration

import type { Process } from '@/types/process';
import type {
  ProcessVersion,
  VersionChangeType,
  AuditEntry,
  AuditActionType,
  ChangeLog,
  ChangeLogEntry,
} from '@/types/versioning';
import { DiffGenerator } from './DiffGenerator';

const STORAGE_KEYS = {
  VERSIONS: 'processcore_versions',
  AUDIT: 'processcore_audit',
  CURRENT_USER: 'processcore_current_user',
};

// Mock user for now - replace with real auth later
const getCurrentUser = () => ({
  id: 'user_001',
  name: 'Current User',
  email: 'user@example.com',
  role: 'Editor',
});

export class VersionManager {
  // ============================================================
  // VERSION OPERATIONS
  // ============================================================

  /**
   * Get all versions for a process
   */
  static getVersions(processId: string): ProcessVersion[] {
    const allVersions = this.getAllVersions();
    return allVersions
      .filter(v => v.processId === processId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  /**
   * Get a specific version
   */
  static getVersion(versionId: string): ProcessVersion | null {
    const allVersions = this.getAllVersions();
    return allVersions.find(v => v.id === versionId) || null;
  }

  /**
   * Get the latest version for a process
   */
  static getLatestVersion(processId: string): ProcessVersion | null {
    const versions = this.getVersions(processId);
    return versions.find(v => v.isLatest) || versions[0] || null;
  }

  /**
   * Save a new version
   */
  static saveVersion(
    process: Process,
    changeNotes: string,
    changeType: VersionChangeType = 'patch'
  ): ProcessVersion {
    const user = getCurrentUser();
    const existingVersions = this.getVersions(process.id);
    const previousVersion = existingVersions[0];
    
    // Calculate new version number
    const versionNumber = (previousVersion?.versionNumber || 0) + 1;
    const version = this.calculateSemanticVersion(
      previousVersion?.version || '0.0.0',
      changeType
    );

    // Mark all previous versions as not latest
    const allVersions = this.getAllVersions();
    const updatedVersions = allVersions.map(v => 
      v.processId === process.id ? { ...v, isLatest: false } : v
    );

    // Generate diff if there's a previous version
    let diffFromPrevious;
    if (previousVersion) {
      diffFromPrevious = DiffGenerator.generateDiff(
        previousVersion.snapshot,
        process,
        previousVersion.id,
        'new'
      );
    }

    // Create new version
    const newVersion: ProcessVersion = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processId: process.id,
      version,
      versionNumber,
      snapshot: JSON.parse(JSON.stringify(process)), // Deep clone
      changeNotes,
      changeSummary: this.generateChangeSummary(diffFromPrevious),
      changeType,
      createdBy: user.name,
      createdByEmail: user.email,
      createdAt: new Date().toISOString(),
      isLatest: true,
      isDraft: changeType === 'draft',
      diffFromPrevious,
    };

    // Save to storage
    this.saveAllVersions([...updatedVersions, newVersion]);

    // Log audit entry
    this.logAudit({
      action: 'version_create',
      resourceType: 'version',
      resourceId: newVersion.id,
      resourceName: `Version ${version}`,
      processId: process.id,
      processName: process.name,
      versionId: newVersion.id,
      version,
      description: `Created version ${version}: ${changeNotes}`,
    });

    return newVersion;
  }

  /**
   * Restore a previous version
   */
  static restoreVersion(versionId: string): ProcessVersion | null {
    const versionToRestore = this.getVersion(versionId);
    if (!versionToRestore) return null;

    // Save as a new version with type 'restore'
    const restoredProcess = {
      ...versionToRestore.snapshot,
      updatedAt: new Date().toISOString(),
    };

    const newVersion = this.saveVersion(
      restoredProcess,
      `Restored from version ${versionToRestore.version}`,
      'restore'
    );

    return newVersion;
  }

  /**
   * Delete a version (soft delete by default)
   */
  static deleteVersion(versionId: string): boolean {
    const allVersions = this.getAllVersions();
    const version = allVersions.find(v => v.id === versionId);
    
    if (!version) return false;
    if (version.isLatest) {
      console.error('Cannot delete the latest version');
      return false;
    }

    const updatedVersions = allVersions.filter(v => v.id !== versionId);
    this.saveAllVersions(updatedVersions);

    this.logAudit({
      action: 'delete',
      resourceType: 'version',
      resourceId: versionId,
      resourceName: `Version ${version.version}`,
      processId: version.processId,
      description: `Deleted version ${version.version}`,
    });

    return true;
  }

  // ============================================================
  // CHANGELOG OPERATIONS
  // ============================================================

  /**
   * Generate a changelog for a process
   */
  static generateChangeLog(processId: string): ChangeLog {
    const versions = this.getVersions(processId);
    
    const entries: ChangeLogEntry[] = versions.map(v => ({
      versionId: v.id,
      version: v.version,
      versionNumber: v.versionNumber,
      changeType: v.changeType,
      changeNotes: v.changeNotes,
      changeSummary: v.changeSummary,
      createdBy: v.createdBy,
      createdAt: v.createdAt,
      highlights: this.extractHighlights(v),
      stepsAdded: v.diffFromPrevious?.summary.stepsAdded || 0,
      stepsRemoved: v.diffFromPrevious?.summary.stepsRemoved || 0,
      stepsModified: v.diffFromPrevious?.summary.stepsModified || 0,
    }));

    return {
      id: `changelog_${processId}`,
      processId,
      entries,
      totalVersions: versions.length,
      firstVersion: versions[versions.length - 1]?.version || '1.0.0',
      latestVersion: versions[0]?.version || '1.0.0',
      generatedAt: new Date().toISOString(),
    };
  }

  // ============================================================
  // AUDIT OPERATIONS
  // ============================================================

  /**
   * Log an audit entry
   */
  static logAudit(params: {
    action: AuditActionType;
    resourceType: AuditEntry['resourceType'];
    resourceId: string;
    resourceName: string;
    processId?: string;
    processName?: string;
    stepId?: string;
    stepName?: string;
    versionId?: string;
    version?: string;
    description: string;
    metadata?: Record<string, unknown>;
    success?: boolean;
    errorMessage?: string;
  }): AuditEntry {
    const user = getCurrentUser();
    
    const entry: AuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action: params.action,
      actionLabel: this.getActionLabel(params.action),
      description: params.description,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      processId: params.processId,
      processName: params.processName,
      stepId: params.stepId,
      stepName: params.stepName,
      versionId: params.versionId,
      version: params.version,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      timestamp: new Date().toISOString(),
      metadata: params.metadata,
      success: params.success ?? true,
      errorMessage: params.errorMessage,
    };

    const allAudit = this.getAllAuditEntries();
    this.saveAllAuditEntries([entry, ...allAudit]);

    return entry;
  }

  /**
   * Get audit entries for a process
   */
  static getAuditEntries(
    processId: string,
    options?: {
      limit?: number;
      offset?: number;
      actionTypes?: AuditActionType[];
      dateFrom?: string;
      dateTo?: string;
      userIds?: string[];
    }
  ): { entries: AuditEntry[]; total: number } {
    let entries = this.getAllAuditEntries().filter(
      e => e.processId === processId
    );

    // Apply filters
    if (options?.actionTypes?.length) {
      entries = entries.filter(e => options.actionTypes!.includes(e.action));
    }
    if (options?.dateFrom) {
      entries = entries.filter(e => e.timestamp >= options.dateFrom!);
    }
    if (options?.dateTo) {
      entries = entries.filter(e => e.timestamp <= options.dateTo!);
    }
    if (options?.userIds?.length) {
      entries = entries.filter(e => options.userIds!.includes(e.userId));
    }

    const total = entries.length;

    // Apply pagination
    if (options?.offset) {
      entries = entries.slice(options.offset);
    }
    if (options?.limit) {
      entries = entries.slice(0, options.limit);
    }

    return { entries, total };
  }

  /**
   * Export audit entries as CSV
   */
  static exportAuditAsCSV(processId: string): string {
    const { entries } = this.getAuditEntries(processId);
    
    const headers = [
      'Timestamp',
      'Action',
      'Description',
      'Resource Type',
      'Resource Name',
      'User',
      'User Email',
      'Version',
      'Success',
    ];

    const rows = entries.map(e => [
      new Date(e.timestamp).toLocaleString(),
      e.actionLabel,
      `"${e.description.replace(/"/g, '""')}"`,
      e.resourceType,
      `"${e.resourceName.replace(/"/g, '""')}"`,
      e.userName,
      e.userEmail || '',
      e.version || '',
      e.success ? 'Yes' : 'No',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private static getAllVersions(): ProcessVersion[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.VERSIONS);
    return data ? JSON.parse(data) : [];
  }

  private static saveAllVersions(versions: ProcessVersion[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(versions));
  }

  private static getAllAuditEntries(): AuditEntry[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return data ? JSON.parse(data) : [];
  }

  private static saveAllAuditEntries(entries: AuditEntry[]): void {
    if (typeof window === 'undefined') return;
    // Keep only last 1000 entries to prevent storage bloat
    const trimmed = entries.slice(0, 1000);
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(trimmed));
  }

  private static calculateSemanticVersion(
    currentVersion: string,
    changeType: VersionChangeType
  ): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    switch (changeType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      case 'draft':
      case 'restore':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  private static generateChangeSummary(diff?: {
    summary: { additions: number; deletions: number; modifications: number };
  }): string {
    if (!diff) return 'Initial version';
    
    const parts: string[] = [];
    if (diff.summary.additions > 0) {
      parts.push(`${diff.summary.additions} addition${diff.summary.additions > 1 ? 's' : ''}`);
    }
    if (diff.summary.deletions > 0) {
      parts.push(`${diff.summary.deletions} deletion${diff.summary.deletions > 1 ? 's' : ''}`);
    }
    if (diff.summary.modifications > 0) {
      parts.push(`${diff.summary.modifications} modification${diff.summary.modifications > 1 ? 's' : ''}`);
    }
    
    return parts.join(', ') || 'No changes';
  }

  private static extractHighlights(version: ProcessVersion): string[] {
    const highlights: string[] = [];
    const diff = version.diffFromPrevious;
    
    if (!diff) {
      highlights.push('Initial version created');
      return highlights;
    }

    if (diff.stepsAdded.length > 0) {
      highlights.push(`Added ${diff.stepsAdded.length} new step(s)`);
    }
    if (diff.stepsRemoved.length > 0) {
      highlights.push(`Removed ${diff.stepsRemoved.length} step(s)`);
    }
    if (diff.stepsModified.length > 0) {
      highlights.push(`Modified ${diff.stepsModified.length} step(s)`);
    }

    return highlights;
  }

  private static getActionLabel(action: AuditActionType): string {
    const labels: Record<AuditActionType, string> = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted',
      view: 'Viewed',
      export: 'Exported',
      import: 'Imported',
      publish: 'Published',
      archive: 'Archived',
      restore: 'Restored',
      duplicate: 'Duplicated',
      share: 'Shared',
      comment: 'Commented',
      assign: 'Assigned',
      complete_training: 'Completed Training',
      start_training: 'Started Training',
      version_create: 'Created Version',
      version_restore: 'Restored Version',
    };
    return labels[action] || action;
  }
}
