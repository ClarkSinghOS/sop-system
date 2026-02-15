'use client';

import React, { useState } from 'react';
import type { ProcessVersion } from '@/types/versioning';
import { VersionManager } from '@/lib/versioning/VersionManager';

interface RestoreButtonProps {
  version: ProcessVersion;
  onRestore?: (newVersion: ProcessVersion) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function RestoreButton({
  version,
  onRestore,
  disabled = false,
  compact = false,
}: RestoreButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    setIsRestoring(true);
    try {
      const newVersion = VersionManager.restoreVersion(version.id);
      if (newVersion) {
        onRestore?.(newVersion);
      }
    } finally {
      setIsRestoring(false);
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    setIsConfirming(false);
  };

  if (version.isLatest) {
    return null;
  }

  if (isConfirming) {
    return (
      <div className={`flex items-center gap-2 ${compact ? '' : 'p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'}`}>
        {!compact && (
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            Restore to v{version.version}?
          </span>
        )}
        <button
          onClick={handleRestore}
          disabled={isRestoring}
          className={`
            px-3 py-1 rounded-lg font-medium transition-all
            ${isRestoring
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
            }
            ${compact ? 'text-xs' : 'text-sm'}
          `}
        >
          {isRestoring ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⟳</span>
              Restoring...
            </span>
          ) : (
            'Confirm'
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isRestoring}
          className={`
            px-3 py-1 rounded-lg font-medium transition-all
            bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300
            hover:bg-gray-300 dark:hover:bg-gray-600
            ${compact ? 'text-xs' : 'text-sm'}
          `}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleRestore}
      disabled={disabled}
      className={`
        flex items-center gap-2 rounded-lg font-medium transition-all
        ${disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50'
        }
        ${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'}
      `}
    >
      <span>🔄</span>
      <span>Restore {compact ? '' : `to v${version.version}`}</span>
    </button>
  );
}
