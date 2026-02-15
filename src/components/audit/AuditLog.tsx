'use client';

import React, { useState, useEffect } from 'react';
import type { AuditEntry as AuditEntryType, AuditFilters } from '@/types/versioning';
import { VersionManager } from '@/lib/versioning/VersionManager';
import { AuditEntry } from './AuditEntry';
import { FilterBar } from './FilterBar';

interface AuditLogProps {
  processId: string;
  onEntryClick?: (entry: AuditEntryType) => void;
}

export function AuditLog({ processId, onEntryClick }: AuditLogProps) {
  const [entries, setEntries] = useState<AuditEntryType[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    loadEntries();
  }, [processId, filters, page]);

  const loadEntries = () => {
    setIsLoading(true);
    const result = VersionManager.getAuditEntries(processId, {
      ...filters,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    setEntries(result.entries);
    setTotal(result.total);
    setIsLoading(false);
  };

  const handleExport = () => {
    const csv = VersionManager.exportAuditAsCSV(processId);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${processId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onExport={handleExport}
      />

      {/* Stats */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {total} {total === 1 ? 'entry' : 'entries'}
          {filters.actionTypes?.length || filters.dateFrom ? ' (filtered)' : ''}
        </div>
      </div>

      {/* Entries list */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center p-12 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium">No audit entries found</p>
          <p className="text-sm mt-1">
            {filters.actionTypes?.length || filters.dateFrom
              ? 'Try adjusting your filters'
              : 'Actions will be logged here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <AuditEntry
              key={entry.id}
              entry={entry}
              onClick={() => onEntryClick?.(entry)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
          >
            ← Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                    ${page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${page === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
