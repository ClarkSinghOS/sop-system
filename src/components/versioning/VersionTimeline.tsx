'use client';

import React, { useState, useEffect } from 'react';
import type { ProcessVersion, VersionChangeType } from '@/types/versioning';
import { VersionManager } from '@/lib/versioning/VersionManager';

interface VersionTimelineProps {
  processId: string;
  onVersionSelect?: (version: ProcessVersion) => void;
  compact?: boolean;
}

export function VersionTimeline({
  processId,
  onVersionSelect,
  compact = false,
}: VersionTimelineProps) {
  const [versions, setVersions] = useState<ProcessVersion[]>([]);
  const [hoveredVersion, setHoveredVersion] = useState<string | null>(null);

  useEffect(() => {
    const loadedVersions = VersionManager.getVersions(processId);
    setVersions(loadedVersions);
  }, [processId]);

  const getChangeTypeConfig = (type: VersionChangeType) => {
    switch (type) {
      case 'major':
        return {
          color: 'bg-red-500',
          ringColor: 'ring-red-200 dark:ring-red-800',
          label: 'Major Release',
          size: 'w-5 h-5',
        };
      case 'minor':
        return {
          color: 'bg-blue-500',
          ringColor: 'ring-blue-200 dark:ring-blue-800',
          label: 'Minor Update',
          size: 'w-4 h-4',
        };
      case 'patch':
        return {
          color: 'bg-green-500',
          ringColor: 'ring-green-200 dark:ring-green-800',
          label: 'Patch',
          size: 'w-3 h-3',
        };
      case 'draft':
        return {
          color: 'bg-gray-400',
          ringColor: 'ring-gray-200 dark:ring-gray-700',
          label: 'Draft',
          size: 'w-3 h-3',
        };
      case 'restore':
        return {
          color: 'bg-purple-500',
          ringColor: 'ring-purple-200 dark:ring-purple-800',
          label: 'Restored',
          size: 'w-4 h-4',
        };
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group versions by date
  const groupedVersions = versions.reduce((acc, version) => {
    const dateKey = new Date(version.createdAt).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(version);
    return acc;
  }, {} as Record<string, ProcessVersion[]>);

  if (versions.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500 dark:text-gray-400">
        <p className="text-sm">No version history yet</p>
      </div>
    );
  }

  if (compact) {
    // Compact horizontal timeline
    return (
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Version dots */}
        <div className="relative flex justify-between items-start">
          {versions.slice(0, 8).reverse().map((version, index) => {
            const config = getChangeTypeConfig(version.changeType);
            const isHovered = hoveredVersion === version.id;

            return (
              <div
                key={version.id}
                className="relative flex flex-col items-center cursor-pointer group"
                onMouseEnter={() => setHoveredVersion(version.id)}
                onMouseLeave={() => setHoveredVersion(null)}
                onClick={() => onVersionSelect?.(version)}
              >
                {/* Dot */}
                <div
                  className={`
                    ${config.size} ${config.color} rounded-full
                    ring-2 ${config.ringColor}
                    transition-transform group-hover:scale-125
                    ${version.isLatest ? 'ring-4' : ''}
                  `}
                />

                {/* Version label */}
                <span className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-mono">
                  {version.version}
                </span>

                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute top-8 z-10 w-48 p-3 bg-white dark:bg-gray-800 
                                  rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
                                  transform -translate-x-1/2 left-1/2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      v{version.version}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {formatDate(version.createdAt)} at {formatTime(version.createdAt)}
                    </div>
                    <div className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                      {version.changeNotes}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {versions.length > 8 && (
          <div className="text-center mt-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{versions.length - 8} more versions
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full vertical timeline
  return (
    <div className="relative">
      {Object.entries(groupedVersions).map(([dateKey, dayVersions], groupIndex) => (
        <div key={dateKey} className="relative">
          {/* Date header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 py-2">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {new Date(dateKey).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          {/* Versions for this day */}
          <div className="relative pl-6 pb-6">
            {/* Vertical line */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {dayVersions.map((version, index) => {
              const config = getChangeTypeConfig(version.changeType);

              return (
                <div
                  key={version.id}
                  className="relative mb-4 cursor-pointer group"
                  onClick={() => onVersionSelect?.(version)}
                >
                  {/* Timeline dot */}
                  <div
                    className={`
                      absolute -left-4 top-1 ${config.size} ${config.color} rounded-full
                      ring-2 ${config.ringColor} ring-offset-2 ring-offset-white dark:ring-offset-gray-900
                      transition-all group-hover:scale-125
                      ${version.isLatest ? 'ring-4' : ''}
                    `}
                  />

                  {/* Content card */}
                  <div className={`
                    ml-4 p-4 rounded-lg border transition-all
                    ${version.isLatest
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }
                    group-hover:shadow-md group-hover:border-blue-300 dark:group-hover:border-blue-700
                  `}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          v{version.version}
                        </span>
                        {version.isLatest && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 
                                         dark:bg-green-900/30 dark:text-green-300 rounded-full">
                            Current
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          version.changeType === 'major'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : version.changeType === 'minor'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : version.changeType === 'restore'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {config.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(version.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {version.changeNotes}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 
                                       flex items-center justify-center text-xs">
                          {version.createdBy.charAt(0).toUpperCase()}
                        </span>
                        <span>{version.createdBy}</span>
                      </div>

                      {version.diffFromPrevious && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">+{version.diffFromPrevious.summary.additions}</span>
                          <span className="text-red-600">-{version.diffFromPrevious.summary.deletions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
