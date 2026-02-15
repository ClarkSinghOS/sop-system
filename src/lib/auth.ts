/**
 * API Key Authentication
 * 
 * Handles API key validation for webhook endpoints
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface ApiKeyValidation {
  valid: boolean;
  keyId?: string;
  permissions?: string[];
  error?: string;
}

/**
 * Hash an API key using SHA-256
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a new API key
 */
export function generateApiKey(): string {
  const prefix = 'pk_';
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const key = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}${key}`;
}

/**
 * Extract API key from request headers
 */
export function extractApiKey(request: Request): string | null {
  // Check X-API-Key header first
  const apiKeyHeader = request.headers.get('X-API-Key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * Validate an API key against the database
 */
export async function validateApiKey(key: string): Promise<ApiKeyValidation> {
  if (!key) {
    return { valid: false, error: 'API key is required' };
  }

  if (!supabaseUrl || !supabaseKey) {
    // Development mode - accept any key starting with pk_dev_
    if (key.startsWith('pk_dev_')) {
      return {
        valid: true,
        keyId: 'dev',
        permissions: ['webhooks:trigger', 'webhooks:callback', 'webhooks:events'],
      };
    }
    return { valid: false, error: 'Supabase not configured' };
  }

  try {
    const keyHash = await hashApiKey(key);
    const keyPrefix = key.slice(0, 11); // pk_ + first 8 chars

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, permissions, is_active, expires_at')
      .eq('key_hash', keyHash)
      .eq('key_prefix', keyPrefix)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Invalid API key' };
    }

    if (!data.is_active) {
      return { valid: false, error: 'API key is inactive' };
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'API key has expired' };
    }

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);

    return {
      valid: true,
      keyId: data.id,
      permissions: data.permissions,
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Check if a key has a specific permission
 */
export function hasPermission(permissions: string[], required: string): boolean {
  return permissions.includes(required) || permissions.includes('*');
}

/**
 * Middleware helper to require authentication
 */
export async function requireAuth(
  request: Request,
  requiredPermission?: string
): Promise<{ valid: true; keyId: string; permissions: string[] } | { valid: false; error: string; status: number }> {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return {
      valid: false,
      error: 'Missing API key. Include X-API-Key header or Bearer token.',
      status: 401,
    };
  }

  const validation = await validateApiKey(apiKey);

  if (!validation.valid) {
    return {
      valid: false,
      error: validation.error || 'Invalid API key',
      status: 401,
    };
  }

  if (requiredPermission && validation.permissions && !hasPermission(validation.permissions, requiredPermission)) {
    return {
      valid: false,
      error: `Missing required permission: ${requiredPermission}`,
      status: 403,
    };
  }

  return {
    valid: true,
    keyId: validation.keyId!,
    permissions: validation.permissions!,
  };
}

export { supabase };
