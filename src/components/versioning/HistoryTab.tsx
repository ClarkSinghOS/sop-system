'use client';

import React, { useState } from 'react';
import type { ProcessVersion } from '@/types/versioning';
import type { Process } from '@/types/process';
import { VersionHistory } from './VersionHistory';
import { VersionTimeline } from './VersionTimeline';
import { VersionDiff } from './VersionDiff';
import { AuditLog } from '../audit/AuditLog';

interface HistoryTabProps {
  process: Process;
  onRestore?: (version: ProcessVersion) => void;
}

type SubTab = 'versions' | 'timeline' | 'audit';

export function HistoryTab({ process, onRestore }: HistoryTabProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('versions');
  const [selectedVersion, setSelectedVersion] = useState<ProcessVersion | null>(null);
  const [compareVersions, setCompareVersions] = useState<[ProcessVersion, ProcessVersion] | null>(null);

  const handleVersionSelect = (version: ProcessVersion) => {
    setSelectedVersion(version);
  };

  const handleCompare = (versionA: ProcessVersion, versionB: ProcessVersion) => {
    // Ensure older version is first
    if (versionA.versionNumber > versionB.versionNumber) {
      setCompareVersions([versionB, versionA]);
    } else {
      setCompareVersions([versionA, versionB]);
    }
  };

  const handleRestore = (version: ProcessVersion) => {
    onRestore?.(version);
  };

  const tabs: { id: SubTab; label: string; icon: string }[] = [
    { id: 'versions', label: 'Versions', icon: '📋' },
    { id: 'timeline', label: 'Timeline', icon: '⏱️' },
    { id: 'audit', label: 'Audit Log', icon: '📝' },
  ];

  // Show diff modal if comparing
  if (compareVersions) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
          <VersionDiff
            versionA={compareVersions[0]}
            versionB={compareVersions[1]}
            onClose={() => setCompareVersions(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab navigation */}
      <div className="flex items-center gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              text-sm font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'versions' && (
          <VersionHistory
            processId={process.id}
            onVersionSelect={handleVersionSelect}
            onCompare={handleCompare}
            onRestore={handleRestore}
          />
        )}

        {activeTab === 'timeline' && (
          <VersionTimeline
            processId={process.id}
            onVersionSelect={handleVersionSelect}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLog processId={process.id} />
        )}
      </div>

      {/* Version detail sidebar */}
      {selectedVersion && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-900 
                       shadow-2xl border-l border-gray-200 dark:border-gray-700
                       overflow-auto z-40">
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Version Details
              </h3>
              <button
                onClick={() => setSelectedVersion(null)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Version info */}
            <div>
              <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                v{selectedVersion.version}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Version #{selectedVersion.versionNumber}
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Created
                </label>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(selectedVersion.createdAt).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Author
                </label>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedVersion.createdBy}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Change Type
                </label>
                <div className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {selectedVersion.changeType}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Notes
                </label>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedVersion.changeNotes}
                </div>
              </div>
            </div>

            {/* Diff summary */}
            {selectedVersion.diffFromPrevious && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                  Changes from previous
                </label>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">
                    +{selectedVersion.diffFromPrevious.summary.additions}
                  </span>
                  <span className="text-red-600">
                    -{selectedVersion.diffFromPrevious.summary.deletions}
                  </span>
                  <span className="text-yellow-600">
                    ~{selectedVersion.diffFromPrevious.summary.modifications}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            {!selectedVersion.isLatest && (
              <button
                onClick={() => handleRestore(selectedVersion)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg
                         font-medium hover:bg-purple-700 transition-colors
                         flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                Restore This Version
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
