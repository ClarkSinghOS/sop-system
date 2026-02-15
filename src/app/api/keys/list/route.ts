/**
 * GET /api/keys/list
 * 
 * List all active API keys
 * 
 * Headers:
 *   X-API-Key: pk_xxx... (requires keys:manage permission)
 * 
 * Response:
 *   {
 *     "success": true,
 *     "keys": [
 *       {
 *         "id": "uuid",
 *         "name": "string",
 *         "keyPrefix": "pk_xxxxxxxx",
 *         "permissions": ["string"],
 *         "createdAt": "ISO8601",
 *         "lastUsedAt": "ISO8601" | null,
 *         "expiresAt": "ISO8601" | null,
 *         "isActive": true
 *       }
 *     ]
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, supabase } from '@/lib/auth';

interface ApiKeyListItem {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  rateLimit: number;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  metadata?: Record<string, string>;
}

export async function GET(request: NextRequest) {
  // Authenticate request
  const auth = await requireAuth(request, 'keys:manage');
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    // Check if Supabase is configured
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!supabaseConfigured) {
      // Development mode - return mock data
      return NextResponse.json({
        success: true,
        keys: [
          {
            id: 'dev-key-1',
            name: 'Development Key',
            keyPrefix: 'pk_dev_xxxx',
            permissions: ['webhooks:trigger', 'webhooks:callback', 'webhooks:events'],
            rateLimit: 1000,
            createdAt: new Date().toISOString(),
            lastUsedAt: null,
            expiresAt: null,
            isActive: true,
          },
        ],
        note: 'Supabase not configured - showing mock data',
      });
    }

    // Fetch keys from Supabase
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, permissions, rate_limit, created_at, last_used_at, expires_at, is_active, metadata')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch API keys:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch API keys' },
        { status: 500 }
      );
    }

    // Transform to API format
    const formattedKeys: ApiKeyListItem[] = (keys || []).map(key => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.key_prefix,
      permissions: key.permissions,
      rateLimit: key.rate_limit,
      createdAt: key.created_at,
      lastUsedAt: key.last_used_at,
      expiresAt: key.expires_at,
      isActive: key.is_active,
      metadata: key.metadata,
    }));

    return NextResponse.json({
      success: true,
      keys: formattedKeys,
      total: formattedKeys.length,
    });

  } catch (error) {
    console.error('API keys list error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
