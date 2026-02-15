'use client';

import React from 'react';
import type { AuditEntry as AuditEntryType, AuditActionType } from '@/types/versioning';

interface AuditEntryProps {
  entry: AuditEntryType;
  compact?: boolean;
  onClick?: () => void;
}

export function AuditEntry({ entry, compact = false, onClick }: AuditEntryProps) {
  const getActionConfig = (action: AuditActionType) => {
    const configs: Record<AuditActionType, { icon: string; color: string; bg: string }> = {
      create: { icon: '✨', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
      update: { icon: '✏️', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      delete: { icon: '🗑️', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
      view: { icon: '👁️', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
      export: { icon: '📤', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      import: { icon: '📥', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      publish: { icon: '🚀', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
      archive: { icon: '📦', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
      restore: { icon: '🔄', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      duplicate: { icon: '📋', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      share: { icon: '🔗', color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
      comment: { icon: '💬', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
      assign: { icon: '👤', color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
      complete_training: { icon: '🎓', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
      start_training: { icon: '📚', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      version_create: { icon: '📝', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      version_restore: { icon: '🔄', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    };
    return configs[action] || { icon: '📋', color: 'text-gray-600', bg: 'bg-gray-100' };
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

  const config = getActionConfig(entry.action);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors
                   ${onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''}`}
        onClick={onClick}
      >
        <span className={`${config.color}`}>{config.icon}</span>
        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
          {entry.actionLabel} {entry.resourceName}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getRelativeTime(entry.timestamp)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden
                 ${onClick ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600' : ''}
                 ${!entry.success ? 'border-red-200 dark:border-red-800' : ''}`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
              <span className="text-xl">{config.icon}</span>
            </div>

            {/* Action info */}
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${config.color}`}>
                  {entry.actionLabel}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {entry.resourceName}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {entry.resourceType}
                {entry.version && ` • v${entry.version}`}
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getRelativeTime(entry.timestamp)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(entry.timestamp)}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
          {entry.description}
        </div>

        {/* Error message if failed */}
        {!entry.success && entry.errorMessage && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 
                         rounded px-3 py-2">
            ⚠️ {entry.errorMessage}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 
                           flex items-center justify-center text-xs font-medium">
              {entry.userName.charAt(0).toUpperCase()}
            </span>
            <span>{entry.userName}</span>
            {entry.userRole && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                {entry.userRole}
              </span>
            )}
          </div>

          {!entry.success && (
            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded">
              Failed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
