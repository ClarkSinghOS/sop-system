/**
 * POST /api/keys/generate
 * 
 * Generate a new API key
 * 
 * Headers:
 *   Authorization: Bearer <admin_token> (or existing API key with keys:manage permission)
 * 
 * Body:
 *   {
 *     "name": "string",                    // Required: Name/description for the key
 *     "permissions": ["string"],           // Required: Array of permissions
 *     "expiresInDays": number,            // Optional: Days until expiration
 *     "rateLimit": number,                // Optional: Requests per minute (default: 60)
 *     "metadata": { ... }                  // Optional: Custom metadata
 *   }
 * 
 * Response:
 *   {
 *     "id": "uuid",
 *     "name": "string",
 *     "key": "pk_xxx...",                  // Full key - shown only once!
 *     "keyPrefix": "pk_xxxxxxxx",
 *     "permissions": ["string"],
 *     "createdAt": "ISO8601",
 *     "expiresAt": "ISO8601" | null
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, generateApiKey, hashApiKey, supabase } from '@/lib/auth';
import { ApiKeyCreateRequest, ApiKeyResponse, ApiKeyPermission } from '@/types/integrations';

const VALID_PERMISSIONS: ApiKeyPermission[] = [
  'webhooks:trigger',
  'webhooks:callback',
  'webhooks:events',
  'processes:read',
  'processes:write',
  'instances:read',
  'instances:write',
  'keys:manage',
];

export async function POST(request: NextRequest) {
  // Authenticate request - require keys:manage permission
  const auth = await requireAuth(request, 'keys:manage');
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body: ApiKeyCreateRequest = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.permissions || !Array.isArray(body.permissions) || body.permissions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'permissions is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate permissions
    const invalidPermissions = body.permissions.filter(p => !VALID_PERMISSIONS.includes(p as ApiKeyPermission));
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid permissions: ${invalidPermissions.join(', ')}`,
          validPermissions: VALID_PERMISSIONS,
        },
        { status: 400 }
      );
    }

    // Generate the key
    const key = generateApiKey();
    const keyHash = await hashApiKey(key);
    const keyPrefix = key.slice(0, 11); // pk_ + first 8 chars
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Calculate expiration
    let expiresAt: string | null = null;
    if (body.expiresInDays && body.expiresInDays > 0) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + body.expiresInDays);
      expiresAt = expDate.toISOString();
    }

    // Rate limit (default 60 requests per minute)
    const rateLimit = body.rateLimit || 60;

    // Check if Supabase is configured
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (supabaseConfigured) {
      // Store in Supabase (hash only, never the actual key)
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({
          id,
          name: body.name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          permissions: body.permissions,
          rate_limit: rateLimit,
          expires_at: expiresAt,
          is_active: true,
          created_by: auth.keyId,
          created_at: createdAt,
          metadata: body.metadata || {},
        });

      if (insertError) {
        console.error('Failed to store API key:', insertError);
        return NextResponse.json(
          { success: false, error: 'Failed to create API key' },
          { status: 500 }
        );
      }
    }

    const response: ApiKeyResponse = {
      id,
      name: body.name,
      key, // Full key - shown only this once!
      keyPrefix,
      permissions: body.permissions as ApiKeyPermission[],
      createdAt,
      expiresAt: expiresAt || undefined,
    };

    return NextResponse.json({
      success: true,
      ...response,
      warning: 'Store this key securely. It will not be shown again.',
    }, { status: 201 });

  } catch (error) {
    console.error('API key generation error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Return documentation
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/keys/generate',
    description: 'Generate a new API key',
    authentication: 'API key with keys:manage permission',
    body: {
      name: {
        type: 'string',
        required: true,
        description: 'Name/description for the key',
      },
      permissions: {
        type: 'array',
        required: true,
        description: 'Array of permissions',
        validValues: VALID_PERMISSIONS,
      },
      expiresInDays: {
        type: 'number',
        required: false,
        description: 'Days until the key expires (null = never)',
      },
      rateLimit: {
        type: 'number',
        required: false,
        default: 60,
        description: 'Maximum requests per minute',
      },
      metadata: {
        type: 'object',
        required: false,
        description: 'Custom metadata to attach to the key',
      },
    },
    example: {
      name: 'Zapier Integration',
      permissions: ['webhooks:trigger', 'webhooks:callback'],
      expiresInDays: 365,
      rateLimit: 100,
      metadata: {
        environment: 'production',
        owner: 'integrations-team',
      },
    },
  });
}
