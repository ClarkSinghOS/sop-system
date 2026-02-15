'use client';

import React, { useState } from 'react';
import type { AuditFilters, AuditActionType } from '@/types/versioning';

interface FilterBarProps {
  filters: AuditFilters;
  onFiltersChange: (filters: AuditFilters) => void;
  onExport?: () => void;
}

const ACTION_OPTIONS: { value: AuditActionType; label: string }[] = [
  { value: 'create', label: 'Created' },
  { value: 'update', label: 'Updated' },
  { value: 'delete', label: 'Deleted' },
  { value: 'view', label: 'Viewed' },
  { value: 'export', label: 'Exported' },
  { value: 'publish', label: 'Published' },
  { value: 'restore', label: 'Restored' },
  { value: 'version_create', label: 'Version Created' },
  { value: 'version_restore', label: 'Version Restored' },
  { value: 'start_training', label: 'Training Started' },
  { value: 'complete_training', label: 'Training Completed' },
];

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' },
];

export function FilterBar({ filters, onFiltersChange, onExport }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  const handleActionToggle = (action: AuditActionType) => {
    const currentActions = filters.actionTypes || [];
    const newActions = currentActions.includes(action)
      ? currentActions.filter(a => a !== action)
      : [...currentActions, action];
    
    onFiltersChange({
      ...filters,
      actionTypes: newActions.length > 0 ? newActions : undefined,
    });
  };

  const handleDatePreset = (preset: string) => {
    const now = new Date();
    let dateFrom: string | undefined;

    switch (preset) {
      case 'today':
        dateFrom = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        break;
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '90d':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'all':
        dateFrom = undefined;
        break;
    }

    onFiltersChange({
      ...filters,
      dateFrom,
      dateTo: undefined,
    });
  };

  const handleSearch = () => {
    onFiltersChange({
      ...filters,
      searchQuery: searchQuery || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    onFiltersChange({});
  };

  const hasActiveFilters = 
    (filters.actionTypes && filters.actionTypes.length > 0) ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.searchQuery;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Main filter bar */}
      <div className="p-4 flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search audit log..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>

        {/* Date presets */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
          {DATE_PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => handleDatePreset(preset.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors
                ${(!filters.dateFrom && preset.value === 'all') ||
                  (filters.dateFrom && preset.value !== 'all')
                  ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Toggle filters */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${hasActiveFilters
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }
            hover:bg-gray-200 dark:hover:bg-gray-600`}
        >
          <span>🎛️</span>
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs rounded-full">
              {(filters.actionTypes?.length || 0) + (filters.dateFrom ? 1 : 0) + (filters.searchQuery ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Export */}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 
                     text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium
                     hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span>📤</span>
            Export CSV
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          {/* Action type filters */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by action type
            </label>
            <div className="flex flex-wrap gap-2">
              {ACTION_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleActionToggle(option.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${filters.actionTypes?.includes(option.value)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }
                    hover:bg-blue-200 dark:hover:bg-blue-900/50`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom date range
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                })}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm
                         focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={filters.dateTo ? filters.dateTo.split('T')[0] : ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateTo: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                })}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm
                         focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
