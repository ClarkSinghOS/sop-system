/**
 * VariableResolver - Replace template variables with actual values
 * 
 * Supports:
 * - {{process.id}}, {{process.name}}, {{process.status}}
 * - {{instance.id}}, {{instance.status}}, {{instance.startedAt}}
 * - {{step.id}}, {{step.name}}, {{step.owner}}, {{step.status}}
 * - {{input.fieldName}} - Data from webhook trigger
 * - {{output.fieldName}} - Data from previous steps
 * - {{user.id}}, {{user.name}}, {{user.email}}
 * - {{env.baseUrl}}, {{env.timestamp}}, {{env.timezone}}
 * - {{vars.customVar}} - Custom variables
 * 
 * Also supports filters:
 * - {{value|upper}} - Uppercase
 * - {{value|lower}} - Lowercase
 * - {{value|default:fallback}} - Default value
 * - {{value|json}} - JSON stringify
 * - {{value|truncate:50}} - Truncate to length
 */

import { VariableContext } from '@/types/integrations';

type FilterFunction = (value: string, arg?: string) => string;

const FILTERS: Record<string, FilterFunction> = {
  upper: (value) => value.toUpperCase(),
  lower: (value) => value.toLowerCase(),
  capitalize: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  title: (value) => value.replace(/\b\w/g, (l) => l.toUpperCase()),
  trim: (value) => value.trim(),
  default: (value, arg) => value || arg || '',
  json: (value) => {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  },
  truncate: (value, arg) => {
    const length = parseInt(arg || '50', 10);
    return value.length > length ? value.slice(0, length) + '...' : value;
  },
  escape_html: (value) => 
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;'),
  url_encode: (value) => encodeURIComponent(value),
  date: (value, arg) => {
    try {
      const date = new Date(value);
      const format = arg || 'iso';
      switch (format) {
        case 'iso':
          return date.toISOString();
        case 'date':
          return date.toLocaleDateString();
        case 'time':
          return date.toLocaleTimeString();
        case 'datetime':
          return date.toLocaleString();
        case 'relative':
          return getRelativeTime(date);
        default:
          return date.toISOString();
      }
    } catch {
      return value;
    }
  },
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Convert any value to a string representation
 */
function valueToString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Parse a variable expression and extract the path and filters
 * e.g., "input.name|upper|truncate:20" -> { path: "input.name", filters: [["upper"], ["truncate", "20"]] }
 */
function parseExpression(expression: string): { path: string; filters: [string, string?][] } {
  const parts = expression.split('|');
  const path = parts[0].trim();
  const filters: [string, string?][] = [];

  for (let i = 1; i < parts.length; i++) {
    const filterPart = parts[i].trim();
    const colonIndex = filterPart.indexOf(':');
    if (colonIndex > -1) {
      filters.push([filterPart.slice(0, colonIndex), filterPart.slice(colonIndex + 1)]);
    } else {
      filters.push([filterPart]);
    }
  }

  return { path, filters };
}

/**
 * Apply filters to a value
 */
function applyFilters(value: string, filters: [string, string?][]): string {
  let result = value;
  for (const [filterName, filterArg] of filters) {
    const filterFn = FILTERS[filterName];
    if (filterFn) {
      result = filterFn(result, filterArg);
    }
  }
  return result;
}

/**
 * Resolve a single variable expression
 */
export function resolveVariable(expression: string, context: VariableContext): string {
  const { path, filters } = parseExpression(expression);
  
  // Handle special cases
  if (path === 'now' || path === 'timestamp') {
    return applyFilters(new Date().toISOString(), filters);
  }

  // Get the value from context
  const value = getNestedValue(context as unknown as Record<string, unknown>, path);
  const stringValue = valueToString(value);

  return applyFilters(stringValue, filters);
}

/**
 * Resolve all variables in a template string
 * Variables are in the format {{variable.path}} or {{variable.path|filter}}
 */
export function resolveTemplate(template: string, context: VariableContext): string {
  // Match {{...}} patterns, including nested content
  const variablePattern = /\{\{([^{}]+)\}\}/g;

  return template.replace(variablePattern, (match, expression) => {
    try {
      return resolveVariable(expression.trim(), context);
    } catch (error) {
      console.warn(`Failed to resolve variable: ${expression}`, error);
      return match; // Keep original if resolution fails
    }
  });
}

/**
 * Resolve variables in a JSON object (recursively)
 */
export function resolveObject<T extends Record<string, unknown>>(
  obj: T,
  context: VariableContext
): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = resolveTemplate(value, context);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'string') {
          return resolveTemplate(item, context);
        } else if (typeof item === 'object' && item !== null) {
          return resolveObject(item as Record<string, unknown>, context);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      result[key] = resolveObject(value as Record<string, unknown>, context);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Extract all variable references from a template
 */
export function extractVariables(template: string): string[] {
  const variablePattern = /\{\{([^{}|]+)(?:\|[^{}]+)?\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = variablePattern.exec(template)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }

  return variables;
}

/**
 * Validate that all required variables are present in context
 */
export function validateVariables(
  template: string,
  context: VariableContext
): { valid: boolean; missing: string[] } {
  const variables = extractVariables(template);
  const missing: string[] = [];

  for (const variable of variables) {
    const value = getNestedValue(context as unknown as Record<string, unknown>, variable);
    if (value === undefined || value === null) {
      missing.push(variable);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Create a default context with environment variables
 */
export function createDefaultContext(overrides?: Partial<VariableContext>): VariableContext {
  return {
    env: {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    ...overrides,
  };
}

// Export a convenience object
export const VariableResolver = {
  resolve: resolveVariable,
  resolveTemplate,
  resolveObject,
  extractVariables,
  validateVariables,
  createDefaultContext,
};

export default VariableResolver;
