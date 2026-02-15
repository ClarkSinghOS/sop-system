// DiffGenerator - Compare two versions, highlight changes

import type { Process, ProcessStep } from '@/types/process';
import type {
  VersionDiff,
  DiffSummary,
  DiffChange,
  StepDiff,
  MetadataChange,
  TextDiff,
} from '@/types/versioning';

export class DiffGenerator {
  /**
   * Generate a complete diff between two process versions
   */
  static generateDiff(
    processA: Process,
    processB: Process,
    versionAId: string,
    versionBId: string
  ): VersionDiff {
    const stepsA = new Map(processA.steps.map(s => [s.id, s]));
    const stepsB = new Map(processB.steps.map(s => [s.id, s]));

    // Find added, removed, and modified steps
    const stepsAdded: ProcessStep[] = [];
    const stepsRemoved: ProcessStep[] = [];
    const stepsModified: StepDiff[] = [];
    const changes: DiffChange[] = [];

    // Check for removed steps
    for (const [id, step] of stepsA) {
      if (!stepsB.has(id)) {
        stepsRemoved.push(step);
        changes.push({
          id: `change_${id}_removed`,
          type: 'removed',
          path: `steps[${id}]`,
          field: `Step: ${step.name}`,
          oldValue: step.name,
          severity: 'warning',
          stepId: id,
        });
      }
    }

    // Check for added and modified steps
    for (const [id, stepB] of stepsB) {
      const stepA = stepsA.get(id);
      if (!stepA) {
        stepsAdded.push(stepB);
        changes.push({
          id: `change_${id}_added`,
          type: 'added',
          path: `steps[${id}]`,
          field: `Step: ${stepB.name}`,
          newValue: stepB.name,
          severity: 'info',
          stepId: id,
        });
      } else {
        // Compare steps
        const stepDiff = this.compareSteps(stepA, stepB);
        if (stepDiff.changes.length > 0) {
          stepsModified.push(stepDiff);
          changes.push(...stepDiff.changes);
        }
      }
    }

    // Compare metadata
    const metadataChanges = this.compareMetadata(processA, processB);
    for (const mc of metadataChanges) {
      changes.push({
        id: `change_meta_${mc.field}`,
        type: 'modified',
        path: mc.field,
        field: this.humanizeFieldName(mc.field),
        oldValue: mc.oldValue,
        newValue: mc.newValue,
        severity: mc.field === 'status' ? 'warning' : 'info',
      });
    }

    // Build summary
    const summary: DiffSummary = {
      totalChanges: changes.length,
      additions: changes.filter(c => c.type === 'added').length,
      deletions: changes.filter(c => c.type === 'removed').length,
      modifications: changes.filter(c => c.type === 'modified').length,
      stepsAdded: stepsAdded.length,
      stepsRemoved: stepsRemoved.length,
      stepsModified: stepsModified.length,
      hasBreakingChanges: stepsRemoved.length > 0 || 
        changes.some(c => c.severity === 'breaking'),
    };

    return {
      versionA: versionAId,
      versionB: versionBId,
      processId: processA.id,
      summary,
      changes,
      stepsAdded,
      stepsRemoved,
      stepsModified,
      metadataChanges,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Compare two steps and return differences
   */
  static compareSteps(stepA: ProcessStep, stepB: ProcessStep): StepDiff {
    const changes: DiffChange[] = [];
    
    // Compare basic fields
    const fieldsToCompare: (keyof ProcessStep)[] = [
      'name',
      'shortDescription',
      'longDescription',
      'whyItMatters',
      'automationLevel',
    ];

    for (const field of fieldsToCompare) {
      const valueA = stepA[field];
      const valueB = stepB[field];
      
      if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
        const change: DiffChange = {
          id: `change_${stepA.id}_${field}`,
          type: 'modified',
          path: `steps[${stepA.id}].${field}`,
          field: this.humanizeFieldName(field),
          oldValue: valueA as string,
          newValue: valueB as string,
          severity: field === 'name' ? 'warning' : 'info',
          stepId: stepA.id,
        };

        // Generate text diff for string fields
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          change.textDiff = this.generateTextDiff(valueA, valueB);
        }

        changes.push(change);
      }
    }

    // Compare checklist
    if (this.checklistChanged(stepA.checklist, stepB.checklist)) {
      changes.push({
        id: `change_${stepA.id}_checklist`,
        type: 'modified',
        path: `steps[${stepA.id}].checklist`,
        field: 'Checklist',
        oldValue: stepA.checklist?.items.length || 0,
        newValue: stepB.checklist?.items.length || 0,
        severity: 'info',
        stepId: stepA.id,
      });
    }

    // Compare tools
    if (this.toolsChanged(stepA.toolsUsed, stepB.toolsUsed)) {
      changes.push({
        id: `change_${stepA.id}_tools`,
        type: 'modified',
        path: `steps[${stepA.id}].toolsUsed`,
        field: 'Tools Used',
        oldValue: (stepA.toolsUsed || []).map(t => t.name).join(', '),
        newValue: (stepB.toolsUsed || []).map(t => t.name).join(', '),
        severity: 'info',
        stepId: stepA.id,
      });
    }

    // Compare videos
    if (this.mediaChanged(stepA.videos, stepB.videos)) {
      changes.push({
        id: `change_${stepA.id}_videos`,
        type: 'modified',
        path: `steps[${stepA.id}].videos`,
        field: 'Videos',
        oldValue: (stepA.videos || []).length,
        newValue: (stepB.videos || []).length,
        severity: 'info',
        stepId: stepA.id,
      });
    }

    return {
      stepId: stepA.id,
      stepName: stepB.name,
      changes,
      nameChanged: stepA.name !== stepB.name,
      descriptionChanged: stepA.longDescription !== stepB.longDescription,
      checklistChanged: this.checklistChanged(stepA.checklist, stepB.checklist),
      mediaChanged: this.mediaChanged(stepA.videos, stepB.videos) || 
        this.mediaChanged(stepA.screenshots, stepB.screenshots),
      toolsChanged: this.toolsChanged(stepA.toolsUsed, stepB.toolsUsed),
    };
  }

  /**
   * Compare process metadata (non-step fields)
   */
  static compareMetadata(processA: Process, processB: Process): MetadataChange[] {
    const changes: MetadataChange[] = [];
    const fieldsToCompare: (keyof Process)[] = [
      'name',
      'description',
      'status',
      'priority',
      'frequency',
      'estimatedDuration',
      'department',
    ];

    for (const field of fieldsToCompare) {
      const valueA = processA[field];
      const valueB = processB[field];
      
      if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
        changes.push({
          field,
          oldValue: String(valueA),
          newValue: String(valueB),
        });
      }
    }

    return changes;
  }

  /**
   * Generate word-level text diff
   */
  static generateTextDiff(textA: string, textB: string): TextDiff[] {
    const wordsA = textA.split(/\s+/);
    const wordsB = textB.split(/\s+/);
    const result: TextDiff[] = [];

    // Simple LCS-based diff
    const lcs = this.longestCommonSubsequence(wordsA, wordsB);
    
    let aIdx = 0;
    let bIdx = 0;
    let lcsIdx = 0;

    while (aIdx < wordsA.length || bIdx < wordsB.length) {
      if (lcsIdx < lcs.length && wordsA[aIdx] === lcs[lcsIdx] && wordsB[bIdx] === lcs[lcsIdx]) {
        result.push({ type: 'unchanged', value: wordsA[aIdx] + ' ' });
        aIdx++;
        bIdx++;
        lcsIdx++;
      } else if (aIdx < wordsA.length && (lcsIdx >= lcs.length || wordsA[aIdx] !== lcs[lcsIdx])) {
        result.push({ type: 'removed', value: wordsA[aIdx] + ' ' });
        aIdx++;
      } else if (bIdx < wordsB.length) {
        result.push({ type: 'added', value: wordsB[bIdx] + ' ' });
        bIdx++;
      }
    }

    return result;
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private static checklistChanged(
    a?: { items: { id: string; text: string }[] },
    b?: { items: { id: string; text: string }[] }
  ): boolean {
    if (!a && !b) return false;
    if (!a || !b) return true;
    if (a.items.length !== b.items.length) return true;
    
    const aTexts = a.items.map(i => i.text).sort();
    const bTexts = b.items.map(i => i.text).sort();
    
    return JSON.stringify(aTexts) !== JSON.stringify(bTexts);
  }

  private static toolsChanged(
    a?: { id: string; name: string }[],
    b?: { id: string; name: string }[]
  ): boolean {
    if (!a && !b) return false;
    if (!a || !b) return true;
    if (a.length !== b.length) return true;
    
    const aNames = a.map(t => t.name).sort();
    const bNames = b.map(t => t.name).sort();
    
    return JSON.stringify(aNames) !== JSON.stringify(bNames);
  }

  private static mediaChanged(
    a?: { id: string }[],
    b?: { id: string }[]
  ): boolean {
    if (!a && !b) return false;
    if (!a || !b) return true;
    return a.length !== b.length;
  }

  private static humanizeFieldName(field: string): string {
    const map: Record<string, string> = {
      name: 'Name',
      shortDescription: 'Short Description',
      longDescription: 'Long Description',
      whyItMatters: 'Why It Matters',
      automationLevel: 'Automation Level',
      status: 'Status',
      priority: 'Priority',
      frequency: 'Frequency',
      estimatedDuration: 'Estimated Duration',
      department: 'Department',
      description: 'Description',
    };
    return map[field] || field.replace(/([A-Z])/g, ' $1').trim();
  }

  private static longestCommonSubsequence(a: string[], b: string[]): string[] {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find LCS
    const lcs: string[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        lcs.unshift(a[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return lcs;
  }
}
