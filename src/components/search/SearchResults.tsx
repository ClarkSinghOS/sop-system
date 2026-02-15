'use client';

import { SearchResult, groupResultsByType } from './SearchIndex';

interface SearchResultsProps {
  results: SearchResult[];
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
  query: string;
}

const typeLabels: Record<string, string> = {
  process: 'Processes',
  step: 'Steps',
  tool: 'Tools',
  role: 'Roles',
  keyword: 'Keywords',
};

const typeIcons: Record<string, JSX.Element> = {
  process: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
    </svg>
  ),
  step: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  tool: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  role: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

function highlightMatch(text: string, query: string): JSX.Element {
  if (!query.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="bg-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function SearchResults({
  results,
  selectedIndex,
  onSelect,
  query,
}: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)]">No results found for "{query}"</p>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Try a different search term</p>
      </div>
    );
  }

  const grouped = groupResultsByType(results);
  let flatIndex = 0;

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {Object.entries(grouped).map(([type, typeResults]) => (
        <div key={type} className="py-2">
          {/* Section Header */}
          <div className="px-4 py-1.5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-2">
            {typeIcons[type]}
            {typeLabels[type] || type}
            <span className="text-[var(--accent-cyan)]">({typeResults.length})</span>
          </div>

          {/* Results */}
          {typeResults.map((result) => {
            const currentIndex = flatIndex++;
            const isSelected = currentIndex === selectedIndex;

            return (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => onSelect(result)}
                className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-[var(--accent-cyan)]/10 border-l-2 border-[var(--accent-cyan)]'
                    : 'hover:bg-[var(--bg-tertiary)] border-l-2 border-transparent'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-[var(--accent-cyan)]/20' : 'bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <span className={isSelected ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-tertiary)]'}>
                    {typeIcons[result.type]}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium truncate ${
                      isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                    }`}>
                      {highlightMatch(result.title, query)}
                    </p>
                    {result.stepId && (
                      <span className="text-xs font-mono text-[var(--accent-cyan)] flex-shrink-0">
                        {result.stepId}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-tertiary)] truncate mt-0.5">
                    {highlightMatch(result.description, query)}
                  </p>
                  {result.processName && result.type === 'step' && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {result.processName}
                    </p>
                  )}
                </div>

                {/* Enter hint */}
                {isSelected && (
                  <div className="flex-shrink-0 text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-default)] font-mono">
                      ↵
                    </kbd>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
