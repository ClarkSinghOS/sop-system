'use client';

import { useState, useEffect } from 'react';

interface RecentItem {
  id: string;
  type: 'process' | 'step';
  processId: string;
  processName: string;
  stepId?: string;
  stepName?: string;
  viewedAt: number;
}

interface RecentlyViewedProps {
  onSelectProcess: (processId: string) => void;
  onSelectStep: (processId: string, stepId: string) => void;
  currentProcessId?: string;
  currentStepId?: string;
  maxItems?: number;
}

const STORAGE_KEY = 'sop-recent-viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed(maxItems: number = MAX_ITEMS) {
  const [recent, setRecent] = useState<RecentItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRecent(JSON.parse(stored));
    }
  }, []);

  const saveRecent = (items: RecentItem[]) => {
    setRecent(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const addRecent = (item: Omit<RecentItem, 'viewedAt'>) => {
    const newItem: RecentItem = { ...item, viewedAt: Date.now() };
    const filtered = recent.filter(r => r.id !== item.id);
    const updated = [newItem, ...filtered].slice(0, maxItems);
    saveRecent(updated);
  };

  const clearRecent = () => {
    saveRecent([]);
  };

  return { recent, addRecent, clearRecent };
}

export default function RecentlyViewed({
  onSelectProcess,
  onSelectStep,
  currentProcessId,
  currentStepId,
  maxItems = 5,
}: RecentlyViewedProps) {
  const { recent, clearRecent } = useRecentlyViewed();
  const displayItems = recent.slice(0, maxItems);

  if (displayItems.length === 0) {
    return (
      <div className="p-3 text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
          <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">No recent activity</p>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="py-2">
      <div className="px-3 mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent
        </h3>
        {displayItems.length > 0 && (
          <button
            onClick={clearRecent}
            className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-0.5">
        {displayItems.map((item) => {
          const isActive = 
            (item.type === 'process' && item.processId === currentProcessId && !currentStepId) ||
            (item.type === 'step' && item.stepId === currentStepId);

          return (
            <div
              key={item.id}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-[var(--accent-cyan)]/10 border-l-2 border-[var(--accent-cyan)]'
                  : 'hover:bg-[var(--bg-tertiary)] border-l-2 border-transparent'
              }`}
              onClick={() => {
                if (item.type === 'step' && item.stepId) {
                  onSelectStep(item.processId, item.stepId);
                } else {
                  onSelectProcess(item.processId);
                }
              }}
            >
              {/* Icon */}
              <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-[var(--accent-cyan)]/20' : 'bg-[var(--bg-tertiary)]'
              }`}>
                {item.type === 'process' ? (
                  <svg className="w-3.5 h-3.5 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-[var(--accent-lime)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                }`}>
                  {item.type === 'step' ? item.stepName : item.processName}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  {formatTime(item.viewedAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
