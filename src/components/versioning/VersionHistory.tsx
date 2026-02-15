'use client';

import React, { useState, useEffect } from 'react';
import type { ProcessVersion, VersionChangeType } from '@/types/versioning';
import { VersionManager } from '@/lib/versioning/VersionManager';

interface VersionHistoryProps {
  processId: string;
  onVersionSelect?: (version: ProcessVersion) => void;
  onCompare?: (versionA: ProcessVersion, versionB: ProcessVersion) => void;
  onRestore?: (version: ProcessVersion) => void;
}

export function VersionHistory({
  processId,
  onVersionSelect,
  onCompare,
  onRestore,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<ProcessVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [processId]);

  const loadVersions = () => {
    setIsLoading(true);
    const loadedVersions = VersionManager.getVersions(processId);
    setVersions(loadedVersions);
    setIsLoading(false);
  };

  const toggleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  const handleCompare = () => {
    if (selectedVersions.length !== 2 || !onCompare) return;
    const versionA = versions.find(v => v.id === selectedVersions[0]);
    const versionB = versions.find(v => v.id === selectedVersions[1]);
    if (versionA && versionB) {
      onCompare(versionA, versionB);
    }
  };

  const getChangeTypeColor = (type: VersionChangeType): string => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'minor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'patch': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'restore': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeTypeIcon = (type: VersionChangeType): string => {
    switch (type) {
      case 'major': return '🔴';
      case 'minor': return '🔵';
      case 'patch': return '🟢';
      case 'draft': return '📝';
      case 'restore': return '🔄';
      default: return '📋';
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-2">📋</div>
        <p className="font-medium">No version history yet</p>
        <p className="text-sm mt-1">Save changes to start tracking versions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with compare button */}
      {selectedVersions.length === 2 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            2 versions selected for comparison
          </span>
          <button
            onClick={handleCompare}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium
                       hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>⚡</span>
            Compare Versions
          </button>
        </div>
      )}

      {/* Version list */}
      <div className="space-y-3">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className={`
              border rounded-lg transition-all cursor-pointer
              ${selectedVersions.includes(version.id)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
              ${version.isLatest ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
            `}
          >
            <div className="p-4">
              {/* Version header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Selection checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedVersions.includes(version.id)}
                    onChange={() => toggleVersionSelect(version.id)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 
                             focus:ring-blue-500 dark:border-gray-600"
                  />

                  {/* Version badge */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                      v{version.version}
                    </span>
                    {version.isLatest && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 
                                       dark:bg-green-900/30 dark:text-green-300 rounded-full">
                        Latest
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getChangeTypeColor(version.changeType)}`}>
                      {getChangeTypeIcon(version.changeType)} {version.changeType}
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getRelativeTime(version.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(version.createdAt)}
                  </div>
                </div>
              </div>

              {/* Change notes */}
              <div className="mt-3 pl-7">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {version.changeNotes}
                </p>
                {version.changeSummary && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {version.changeSummary}
                  </p>
                )}
              </div>

              {/* Author and actions */}
              <div className="mt-3 pl-7 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 
                                   flex items-center justify-center text-xs">
                    {version.createdBy.charAt(0).toUpperCase()}
                  </span>
                  <span>{version.createdBy}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onVersionSelect?.(version)}
                    className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300
                             hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    View
                  </button>
                  {!version.isLatest && (
                    <button
                      onClick={() => onRestore?.(version)}
                      className="px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400
                               hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded transition-colors"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Diff summary if available */}
            {version.diffFromPrevious && index < versions.length - 1 && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t 
                              border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs">
                {version.diffFromPrevious.summary.additions > 0 && (
                  <span className="text-green-600 dark:text-green-400">
                    +{version.diffFromPrevious.summary.additions} additions
                  </span>
                )}
                {version.diffFromPrevious.summary.deletions > 0 && (
                  <span className="text-red-600 dark:text-red-400">
                    -{version.diffFromPrevious.summary.deletions} deletions
                  </span>
                )}
                {version.diffFromPrevious.summary.modifications > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    ~{version.diffFromPrevious.summary.modifications} modifications
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
