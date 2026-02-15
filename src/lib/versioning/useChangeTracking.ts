'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Process } from '@/types/process';
import type { ProcessVersion, VersionChangeType, UnsavedChangesState } from '@/types/versioning';
import { VersionManager } from './VersionManager';

interface UseChangeTrackingOptions {
  autoSaveInterval?: number; // ms, 0 to disable
  onAutoSave?: (version: ProcessVersion) => void;
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

interface UseChangeTrackingReturn {
  // State
  hasUnsavedChanges: boolean;
  changedFields: string[];
  lastSavedAt: string | null;
  isSaving: boolean;
  currentVersion: ProcessVersion | null;
  
  // Actions
  trackChanges: (currentProcess: Process) => void;
  saveVersion: (notes: string, changeType?: VersionChangeType) => Promise<ProcessVersion | null>;
  discardChanges: () => void;
  
  // Dialog state
  showSaveDialog: boolean;
  setShowSaveDialog: (show: boolean) => void;
}

export function useChangeTracking(
  process: Process,
  options: UseChangeTrackingOptions = {}
): UseChangeTrackingReturn {
  const { autoSaveInterval = 0, onAutoSave, onUnsavedChangesChange } = options;

  const [state, setState] = useState<UnsavedChangesState>({
    hasChanges: false,
    changedFields: [],
    lastSavedAt: undefined,
    autoSaveEnabled: autoSaveInterval > 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<ProcessVersion | null>(null);

  // Refs for tracking
  const originalProcessRef = useRef<string>(JSON.stringify(process));
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load current version on mount
  useEffect(() => {
    const latestVersion = VersionManager.getLatestVersion(process.id);
    setCurrentVersion(latestVersion);
    if (latestVersion) {
      originalProcessRef.current = JSON.stringify(latestVersion.snapshot);
      setState(prev => ({
        ...prev,
        lastSavedAt: latestVersion.createdAt,
      }));
    }
  }, [process.id]);

  // Track changes
  const trackChanges = useCallback((currentProcess: Process) => {
    const original = JSON.parse(originalProcessRef.current);
    const changedFields: string[] = [];

    // Compare top-level fields
    const fieldsToTrack: (keyof Process)[] = [
      'name', 'description', 'status', 'priority', 'department',
      'frequency', 'estimatedDuration',
    ];

    for (const field of fieldsToTrack) {
      if (JSON.stringify(original[field]) !== JSON.stringify(currentProcess[field])) {
        changedFields.push(field);
      }
    }

    // Compare steps
    if (JSON.stringify(original.steps) !== JSON.stringify(currentProcess.steps)) {
      // Determine which steps changed
      const originalSteps = new Map<string, { id: string; name: string }>(original.steps.map((s: { id: string; name: string }) => [s.id, s]));
      const currentSteps = new Map<string, { id: string; name: string }>(currentProcess.steps.map(s => [s.id, s]));

      for (const [id, step] of currentSteps) {
        const originalStep = originalSteps.get(id);
        if (!originalStep) {
          changedFields.push(`Step added: ${step.name}`);
        } else if (JSON.stringify(originalStep) !== JSON.stringify(step)) {
          changedFields.push(`Step: ${step.name}`);
        }
      }

      for (const [id, step] of originalSteps) {
        if (!currentSteps.has(id)) {
          const stepWithName = step as { name: string };
          changedFields.push(`Step removed: ${stepWithName.name}`);
        }
      }
    }

    const hasChanges = changedFields.length > 0;

    setState(prev => ({
      ...prev,
      hasChanges,
      changedFields,
    }));

    onUnsavedChangesChange?.(hasChanges);

    // Setup auto-save if enabled
    if (hasChanges && autoSaveInterval > 0) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        // Auto-save as draft
        const version = VersionManager.saveVersion(
          currentProcess,
          'Auto-saved draft',
          'draft'
        );
        onAutoSave?.(version);
        originalProcessRef.current = JSON.stringify(currentProcess);
        setState(prev => ({
          ...prev,
          hasChanges: false,
          changedFields: [],
          lastSavedAt: version.createdAt,
        }));
        setCurrentVersion(version);
      }, autoSaveInterval);
    }
  }, [autoSaveInterval, onAutoSave, onUnsavedChangesChange]);

  // Save version
  const saveVersion = useCallback(async (
    notes: string,
    changeType: VersionChangeType = 'patch'
  ): Promise<ProcessVersion | null> => {
    setIsSaving(true);
    try {
      const version = VersionManager.saveVersion(process, notes, changeType);
      originalProcessRef.current = JSON.stringify(process);
      setState(prev => ({
        ...prev,
        hasChanges: false,
        changedFields: [],
        lastSavedAt: version.createdAt,
      }));
      setCurrentVersion(version);
      setShowSaveDialog(false);
      return version;
    } finally {
      setIsSaving(false);
    }
  }, [process]);

  // Discard changes
  const discardChanges = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasChanges: false,
      changedFields: [],
    }));
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
  }, []);

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Warn on page unload if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasChanges]);

  return {
    hasUnsavedChanges: state.hasChanges,
    changedFields: state.changedFields,
    lastSavedAt: state.lastSavedAt || null,
    isSaving,
    currentVersion,
    trackChanges,
    saveVersion,
    discardChanges,
    showSaveDialog,
    setShowSaveDialog,
  };
}
