import { Process, ProcessStep } from '@/types/process';

export interface SearchableItem {
  id: string;
  type: 'process' | 'step' | 'keyword' | 'tool' | 'role';
  title: string;
  description: string;
  keywords: string[];
  processId?: string;
  processName?: string;
  stepId?: string;
  department?: string;
  icon?: string;
}

export interface SearchResult extends SearchableItem {
  score: number;
  matches: string[];
}

/**
 * Build a searchable index from process data
 */
export function buildSearchIndex(processes: Process[]): SearchableItem[] {
  const items: SearchableItem[] = [];

  for (const process of processes) {
    // Add process itself
    items.push({
      id: process.id,
      type: 'process',
      title: process.name,
      description: process.description,
      keywords: [
        process.processId,
        process.department.toLowerCase(),
        ...process.tags,
        process.owner.name.toLowerCase(),
        ...process.shortVersion,
      ],
      processId: process.processId,
      department: process.department,
      icon: 'process',
    });

    // Add each step
    for (const step of process.steps) {
      items.push({
        id: step.id,
        type: 'step',
        title: step.name,
        description: step.shortDescription,
        keywords: [
          step.stepId,
          step.type,
          step.ownership.owner.name.toLowerCase(),
          step.automationLevel,
          ...(step.toolsUsed?.map(t => t.name.toLowerCase()) || []),
          ...(step.checklist?.items.map(i => i.text.toLowerCase()) || []),
        ],
        processId: process.processId,
        processName: process.name,
        stepId: step.stepId,
        department: process.department,
        icon: getStepIcon(step.type),
      });

      // Add tools as searchable items
      if (step.toolsUsed) {
        for (const tool of step.toolsUsed) {
          // Check if tool already exists
          const existing = items.find(i => i.type === 'tool' && i.title === tool.name);
          if (!existing) {
            items.push({
              id: tool.id,
              type: 'tool',
              title: tool.name,
              description: `Used in: ${step.name}`,
              keywords: [tool.name.toLowerCase(), tool.category],
              processId: process.processId,
              stepId: step.stepId,
              icon: 'tool',
            });
          }
        }
      }
    }

    // Add roles
    items.push({
      id: process.owner.id,
      type: 'role',
      title: process.owner.name,
      description: `Owner of ${process.name}`,
      keywords: [
        process.owner.name.toLowerCase(),
        process.owner.department.toLowerCase(),
        ...(process.owner.responsibilities || []),
      ],
      department: process.owner.department,
      icon: 'role',
    });
  }

  return items;
}

/**
 * Fuzzy search implementation
 */
export function fuzzySearch(
  query: string,
  items: SearchableItem[],
  maxResults: number = 10
): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryParts = normalizedQuery.split(/\s+/);

  const results: SearchResult[] = [];

  for (const item of items) {
    let score = 0;
    const matches: string[] = [];

    // Check title match
    const titleLower = item.title.toLowerCase();
    if (titleLower.includes(normalizedQuery)) {
      score += 100;
      matches.push('title');
    } else if (titleLower.startsWith(normalizedQuery)) {
      score += 80;
      matches.push('title');
    } else {
      // Partial word matches in title
      for (const part of queryParts) {
        if (titleLower.includes(part)) {
          score += 30;
          matches.push('title');
        }
      }
    }

    // Check description match
    const descLower = item.description.toLowerCase();
    if (descLower.includes(normalizedQuery)) {
      score += 40;
      matches.push('description');
    } else {
      for (const part of queryParts) {
        if (descLower.includes(part)) {
          score += 15;
          matches.push('description');
        }
      }
    }

    // Check keywords match
    for (const keyword of item.keywords) {
      const keyLower = keyword.toLowerCase();
      if (keyLower === normalizedQuery) {
        score += 60;
        matches.push('keyword');
      } else if (keyLower.includes(normalizedQuery)) {
        score += 25;
        matches.push('keyword');
      } else {
        for (const part of queryParts) {
          if (keyLower.includes(part)) {
            score += 10;
            matches.push('keyword');
          }
        }
      }
    }

    // Check processId/stepId exact match
    if (item.processId?.toLowerCase() === normalizedQuery ||
        item.stepId?.toLowerCase() === normalizedQuery) {
      score += 150;
      matches.push('id');
    }

    // Fuzzy character matching for typos
    if (score === 0) {
      const fuzzyScore = getFuzzyScore(normalizedQuery, titleLower);
      if (fuzzyScore > 0.5) {
        score += fuzzyScore * 20;
        matches.push('fuzzy');
      }
    }

    if (score > 0) {
      results.push({
        ...item,
        score,
        matches: Array.from(new Set(matches)),
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults);
}

/**
 * Calculate fuzzy match score (0-1) using Levenshtein-like approach
 */
function getFuzzyScore(query: string, target: string): number {
  if (query.length === 0) return 0;
  if (target.length === 0) return 0;

  let matches = 0;
  let queryIndex = 0;

  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    if (target[i] === query[queryIndex]) {
      matches++;
      queryIndex++;
    }
  }

  return matches / query.length;
}

/**
 * Get icon type for step
 */
function getStepIcon(type: string): string {
  const icons: Record<string, string> = {
    task: 'task',
    decision: 'decision',
    parallel: 'parallel',
    subprocess: 'subprocess',
    human_task: 'human',
    automated: 'automated',
    milestone: 'milestone',
  };
  return icons[type] || 'task';
}

/**
 * Group search results by type
 */
export function groupResultsByType(results: SearchResult[]): Record<string, SearchResult[]> {
  return results.reduce((acc, result) => {
    const type = result.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);
}

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('sop-recent-searches');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save search to recent searches
 */
export function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined') return;
  const recent = getRecentSearches();
  const filtered = recent.filter(q => q !== query);
  const updated = [query, ...filtered].slice(0, 5);
  localStorage.setItem('sop-recent-searches', JSON.stringify(updated));
}

/**
 * Clear recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sop-recent-searches');
}
