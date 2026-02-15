'use client';

/**
 * ActionLog - Show history of integration executions
 * 
 * Displays a timeline of action executions with:
 * - Status indicators (success/failed/pending)
 * - Execution duration
 * - Input/output data
 * - Error details
 * - Retry information
 */

import React, { useState } from 'react';
import { ActionExecution, SUPPORTED_ACTIONS } from '@/types/integrations';

interface ActionLogProps {
  executions: ActionExecution[];
  onRetry?: (executionId: string) => void;
  maxItems?: number;
  showDetails?: boolean;
}

const STATUS_STYLES = {
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
    icon: '⏳',
  },
  running: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500 animate-pulse',
    icon: '🔄',
  },
  success: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
    icon: '✓',
  },
  failed: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
    icon: '✗',
  },
  retrying: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    dot: 'bg-orange-500 animate-pulse',
    icon: '↻',
  },
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (diffMs < 60000) return 'Just now';
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ExecutionCard({
  execution,
  onRetry,
  showDetails = true,
}: {
  execution: ActionExecution;
  onRetry?: (executionId: string) => void;
  showDetails?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const actionInfo = SUPPORTED_ACTIONS[execution.actionType];
  const status = STATUS_STYLES[execution.status];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
          expanded ? 'border-b border-gray-200' : ''
        }`}
        onClick={() => showDetails && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {/* Status Dot */}
          <span className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
          
          {/* Action Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{actionInfo?.icon || '🔗'}</span>
              <span className="font-medium text-gray-900 text-sm">
                {actionInfo?.name || execution.actionType}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.text}`}>
                {execution.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {formatTimestamp(execution.startedAt)}
              {execution.durationMs && ` • ${formatDuration(execution.durationMs)}`}
              {execution.retryCount > 0 && ` • Retry ${execution.retryCount}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {execution.status === 'failed' && onRetry && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetry(execution.id);
              }}
              className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
            >
              Retry
            </button>
          )}
          {showDetails && (
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && showDetails && (
        <div className="px-4 py-3 bg-gray-50 space-y-3 text-sm">
          {/* Input */}
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Input
            </div>
            <pre className="p-2 bg-white rounded border border-gray-200 text-xs font-mono overflow-x-auto max-h-32">
              {JSON.stringify(execution.input, null, 2)}
            </pre>
          </div>

          {/* Output */}
          {execution.output && (
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Output
              </div>
              <pre className="p-2 bg-white rounded border border-gray-200 text-xs font-mono overflow-x-auto max-h-32">
                {JSON.stringify(execution.output, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {execution.error && (
            <div>
              <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">
                Error
              </div>
              <div className="p-2 bg-red-50 rounded border border-red-200 text-xs text-red-800">
                <div className="font-medium">{execution.error.message}</div>
                {execution.error.code && (
                  <div className="text-red-600 mt-1">Code: {execution.error.code}</div>
                )}
                {execution.error.stack && (
                  <pre className="mt-2 text-red-700 whitespace-pre-wrap font-mono text-[10px]">
                    {execution.error.stack}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          {execution.metadata && Object.keys(execution.metadata).length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Metadata
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(execution.metadata).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-1 bg-gray-200 rounded text-xs"
                  >
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ActionLog({
  executions,
  onRetry,
  maxItems = 20,
  showDetails = true,
}: ActionLogProps) {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  const filteredExecutions = executions
    .filter((e) => {
      if (filter === 'success') return e.status === 'success';
      if (filter === 'failed') return e.status === 'failed';
      return true;
    })
    .slice(0, maxItems);

  const stats = {
    total: executions.length,
    success: executions.filter((e) => e.status === 'success').length,
    failed: executions.filter((e) => e.status === 'failed').length,
    pending: executions.filter((e) => e.status === 'pending' || e.status === 'running').length,
  };

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-900">Execution Log</h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500">{stats.total} total</span>
            <span className="text-green-600">{stats.success} success</span>
            <span className="text-red-600">{stats.failed} failed</span>
            {stats.pending > 0 && (
              <span className="text-blue-600">{stats.pending} pending</span>
            )}
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-1">
          {(['all', 'success', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Execution List */}
      {filteredExecutions.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">No executions yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Executions will appear here when actions are triggered
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredExecutions.map((execution) => (
            <ExecutionCard
              key={execution.id}
              execution={execution}
              onRetry={onRetry}
              showDetails={showDetails}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {executions.length > maxItems && (
        <div className="text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Load more ({executions.length - maxItems} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

export default ActionLog;
