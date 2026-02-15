'use client';

import React from 'react';
import type { ProcessVersion } from '@/types/versioning';

interface VersionBadgeProps {
  version?: ProcessVersion | string;
  hasUnsavedChanges?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function VersionBadge({
  version,
  hasUnsavedChanges = false,
  onClick,
  size = 'md',
}: VersionBadgeProps) {
  const versionString = typeof version === 'string' 
    ? version 
    : version?.version || '1.0.0';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 rounded-full font-mono font-medium
        transition-all
        ${sizeClasses[size]}
        ${hasUnsavedChanges
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ring-2 ring-yellow-400'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }
        ${onClick ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700' : ''}
      `}
    >
      <span>v{versionString}</span>
      {hasUnsavedChanges && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
        </span>
      )}
    </button>
  );
}
