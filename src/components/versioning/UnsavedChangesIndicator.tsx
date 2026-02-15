'use client';

import React from 'react';

interface UnsavedChangesIndicatorProps {
  hasChanges: boolean;
  changedFields?: string[];
  lastSavedAt?: string;
  onSave?: () => void;
  onDiscard?: () => void;
}

export function UnsavedChangesIndicator({
  hasChanges,
  changedFields = [],
  lastSavedAt,
  onSave,
  onDiscard,
}: UnsavedChangesIndicatorProps) {
  if (!hasChanges) return null;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 animate-in slide-in-from-bottom-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-yellow-300 dark:border-yellow-700 
                      overflow-hidden max-w-sm">
        {/* Header */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 px-4 py-3 flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
          </div>
          <span className="font-medium text-yellow-800 dark:text-yellow-200">
            Unsaved Changes
          </span>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          {changedFields.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Modified fields:
              </div>
              <div className="flex flex-wrap gap-1">
                {changedFields.slice(0, 5).map(field => (
                  <span
                    key={field}
                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 
                             text-gray-600 dark:text-gray-300 rounded"
                  >
                    {field}
                  </span>
                ))}
                {changedFields.length > 5 && (
                  <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                    +{changedFields.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {lastSavedAt && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Last saved at {formatTime(lastSavedAt)}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium 
                       rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>💾</span>
              Save Changes
            </button>
            {onDiscard && (
              <button
                onClick={onDiscard}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Discard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
