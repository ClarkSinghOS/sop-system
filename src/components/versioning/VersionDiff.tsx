'use client';

import React, { useState, useMemo } from 'react';
import type { ProcessVersion, VersionDiff as VersionDiffType, DiffChange, TextDiff } from '@/types/versioning';
import { DiffGenerator } from '@/lib/versioning/DiffGenerator';

interface VersionDiffProps {
  versionA: ProcessVersion;
  versionB: ProcessVersion;
  onClose?: () => void;
}

type ViewMode = 'side-by-side' | 'unified' | 'summary';

export function VersionDiff({ versionA, versionB, onClose }: VersionDiffProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());

  const diff = useMemo(() => {
    return DiffGenerator.generateDiff(
      versionA.snapshot,
      versionB.snapshot,
      versionA.id,
      versionB.id
    );
  }, [versionA, versionB]);

  const toggleExpanded = (changeId: string) => {
    setExpandedChanges(prev => {
      const next = new Set(prev);
      if (next.has(changeId)) {
        next.delete(changeId);
      } else {
        next.add(changeId);
      }
      return next;
    });
  };

  const renderTextDiff = (textDiff: TextDiff[]) => {
    return (
      <span className="font-mono text-sm">
        {textDiff.map((part, idx) => (
          <span
            key={idx}
            className={
              part.type === 'added'
                ? 'bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-100'
                : part.type === 'removed'
                ? 'bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-100 line-through'
                : ''
            }
          >
            {part.value}
          </span>
        ))}
      </span>
    );
  };

  const renderChangeIcon = (change: DiffChange) => {
    switch (change.type) {
      case 'added': return <span className="text-green-500">+</span>;
      case 'removed': return <span className="text-red-500">−</span>;
      case 'modified': return <span className="text-yellow-500">~</span>;
    }
  };

  const renderChangeRow = (change: DiffChange) => {
    const isExpanded = expandedChanges.has(change.id);

    return (
      <div
        key={change.id}
        className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
      >
        <div
          className="px-4 py-3 flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          onClick={() => toggleExpanded(change.id)}
        >
          {/* Change type indicator */}
          <div className="w-6 h-6 flex items-center justify-center font-mono text-lg">
            {renderChangeIcon(change)}
          </div>

          {/* Change info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {change.field}
              </span>
              {change.stepId && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                  Step
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded ${
                change.severity === 'breaking'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : change.severity === 'warning'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {change.severity}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate">
              {change.path}
            </div>
          </div>

          {/* Expand indicator */}
          <div className="text-gray-400">
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>

        {/* Expanded diff view */}
        {isExpanded && (
          <div className="px-4 pb-4">
            {viewMode === 'side-by-side' ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Old value */}
                <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-200 dark:border-red-800">
                  <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-2">
                    v{versionA.version} (Before)
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-words">
                    {change.textDiff
                      ? change.textDiff.filter(t => t.type !== 'added').map((t, i) => (
                          <span key={i} className={t.type === 'removed' ? 'bg-red-200 dark:bg-red-800' : ''}>
                            {t.value}
                          </span>
                        ))
                      : typeof change.oldValue === 'object'
                      ? JSON.stringify(change.oldValue, null, 2)
                      : String(change.oldValue ?? '(empty)')}
                  </div>
                </div>

                {/* New value */}
                <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">
                    v{versionB.version} (After)
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-words">
                    {change.textDiff
                      ? change.textDiff.filter(t => t.type !== 'removed').map((t, i) => (
                          <span key={i} className={t.type === 'added' ? 'bg-green-200 dark:bg-green-800' : ''}>
                            {t.value}
                          </span>
                        ))
                      : typeof change.newValue === 'object'
                      ? JSON.stringify(change.newValue, null, 2)
                      : String(change.newValue ?? '(empty)')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                {change.textDiff ? (
                  <div className="font-mono text-sm whitespace-pre-wrap break-words">
                    {renderTextDiff(change.textDiff)}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm font-mono">
                    <div className="text-red-600 dark:text-red-400">
                      - {typeof change.oldValue === 'object' ? JSON.stringify(change.oldValue) : change.oldValue}
                    </div>
                    <div className="text-green-600 dark:text-green-400">
                      + {typeof change.newValue === 'object' ? JSON.stringify(change.newValue) : change.newValue}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Version Comparison</h2>
            <p className="text-blue-100 text-sm mt-1">
              v{versionA.version} → v{versionB.version}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {diff.summary.totalChanges}
          </div>
          <div className="text-xs text-gray-500">Total Changes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            +{diff.summary.additions}
          </div>
          <div className="text-xs text-gray-500">Additions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            -{diff.summary.deletions}
          </div>
          <div className="text-xs text-gray-500">Deletions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            ~{diff.summary.modifications}
          </div>
          <div className="text-xs text-gray-500">Modifications</div>
        </div>
      </div>

      {/* View mode toggle */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">View:</span>
        {(['side-by-side', 'unified', 'summary'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              viewMode === mode
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Changes list */}
      <div className="max-h-[60vh] overflow-y-auto">
        {viewMode === 'summary' ? (
          <div className="p-6 space-y-6">
            {/* Steps added */}
            {diff.stepsAdded.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                  ✅ Steps Added ({diff.stepsAdded.length})
                </h3>
                <ul className="space-y-1">
                  {diff.stepsAdded.map(step => (
                    <li key={step.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="text-green-500">+</span>
                      {step.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps removed */}
            {diff.stepsRemoved.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                  ❌ Steps Removed ({diff.stepsRemoved.length})
                </h3>
                <ul className="space-y-1">
                  {diff.stepsRemoved.map(step => (
                    <li key={step.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="text-red-500">−</span>
                      {step.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps modified */}
            {diff.stepsModified.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                  ✏️ Steps Modified ({diff.stepsModified.length})
                </h3>
                <ul className="space-y-2">
                  {diff.stepsModified.map(stepDiff => (
                    <li key={stepDiff.stepId} className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-yellow-500">~</span>
                        {stepDiff.stepName}
                      </div>
                      <div className="pl-4 text-gray-500 dark:text-gray-400 text-xs mt-1">
                        {stepDiff.nameChanged && <span className="mr-2">• Name changed</span>}
                        {stepDiff.descriptionChanged && <span className="mr-2">• Description changed</span>}
                        {stepDiff.checklistChanged && <span className="mr-2">• Checklist changed</span>}
                        {stepDiff.mediaChanged && <span className="mr-2">• Media changed</span>}
                        {stepDiff.toolsChanged && <span className="mr-2">• Tools changed</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metadata changes */}
            {diff.metadataChanges.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                  📋 Metadata Changes ({diff.metadataChanges.length})
                </h3>
                <ul className="space-y-1">
                  {diff.metadataChanges.map((mc, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{mc.field}:</span>{' '}
                      <span className="text-red-600 line-through">{mc.oldValue}</span>{' '}
                      → <span className="text-green-600">{mc.newValue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div>
            {diff.changes.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">✨</div>
                <p>No changes detected between these versions</p>
              </div>
            ) : (
              diff.changes.map(renderChangeRow)
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Diff generated at {new Date(diff.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}
