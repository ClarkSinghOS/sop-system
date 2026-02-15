'use client';

import { useState, useEffect } from 'react';
import { Process, ProcessStep } from '@/types/process';

interface FavoriteItem {
  id: string;
  type: 'process' | 'step';
  processId: string;
  processName: string;
  stepId?: string;
  stepName?: string;
  addedAt: number;
}

interface FavoritesProps {
  processes: Process[];
  onSelectProcess: (processId: string) => void;
  onSelectStep: (processId: string, stepId: string) => void;
  currentProcessId?: string;
  currentStepId?: string;
}

const STORAGE_KEY = 'sop-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const saveFavorites = (items: FavoriteItem[]) => {
    setFavorites(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const addFavorite = (item: Omit<FavoriteItem, 'addedAt'>) => {
    const newItem: FavoriteItem = { ...item, addedAt: Date.now() };
    const filtered = favorites.filter(f => f.id !== item.id);
    saveFavorites([newItem, ...filtered]);
  };

  const removeFavorite = (id: string) => {
    saveFavorites(favorites.filter(f => f.id !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.some(f => f.id === id);
  };

  const toggleFavorite = (item: Omit<FavoriteItem, 'addedAt'>) => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite };
}

export default function Favorites({
  processes,
  onSelectProcess,
  onSelectStep,
  currentProcessId,
  currentStepId,
}: FavoritesProps) {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="p-3 text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
          <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">No favorites yet</p>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Star processes or steps to quick access</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="px-3 mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[var(--accent-orange)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Favorites
        </h3>
        <span className="text-[10px] text-[var(--text-tertiary)]">{favorites.length}</span>
      </div>

      <div className="space-y-0.5">
        {favorites.map((fav) => {
          const isActive = 
            (fav.type === 'process' && fav.processId === currentProcessId && !currentStepId) ||
            (fav.type === 'step' && fav.stepId === currentStepId);

          return (
            <div
              key={fav.id}
              className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-[var(--accent-cyan)]/10 border-l-2 border-[var(--accent-cyan)]'
                  : 'hover:bg-[var(--bg-tertiary)] border-l-2 border-transparent'
              }`}
              onClick={() => {
                if (fav.type === 'step' && fav.stepId) {
                  onSelectStep(fav.processId, fav.stepId);
                } else {
                  onSelectProcess(fav.processId);
                }
              }}
            >
              {/* Icon */}
              <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-[var(--accent-cyan)]/20' : 'bg-[var(--bg-tertiary)]'
              }`}>
                {fav.type === 'process' ? (
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
                  {fav.type === 'step' ? fav.stepName : fav.processName}
                </p>
                {fav.type === 'step' && (
                  <p className="text-[10px] text-[var(--text-tertiary)] truncate">
                    {fav.processName}
                  </p>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(fav.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--accent-red)] transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Star button component for use in other components
export function FavoriteButton({
  item,
  size = 'md',
}: {
  item: Omit<FavoriteItem, 'addedAt'>;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const starred = isFavorite(item.id);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(item);
      }}
      className={`${sizeClasses[size]} rounded flex items-center justify-center transition-all ${
        starred
          ? 'text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/20'
          : 'text-[var(--text-tertiary)] hover:text-[var(--accent-orange)] hover:bg-[var(--bg-tertiary)]'
      }`}
      title={starred ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={iconSizes[size]}
        fill={starred ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  );
}
