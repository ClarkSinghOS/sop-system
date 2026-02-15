/**
 * DELETE /api/keys/[id]
 * 
 * Revoke an API key
 * 
 * Headers:
 *   X-API-Key: pk_xxx... (requires keys:manage permission)
 * 
 * Response:
 *   {
 *     "success": true,
 *     "id": "uuid",
 *     "revoked": true,
 *     "message": "API key revoked successfully"
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, supabase } from '@/lib/auth';

// GET - Get details of a specific key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
      return NextResponse.json({
        success: true,
        key: {
          id,
          name: 'Development Key',
          keyPrefix: 'pk_dev_xxxx',
          permissions: ['webhooks:trigger', 'webhooks:callback', 'webhooks:events'],
          rateLimit: 1000,
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
          expiresAt: null,
          isActive: true,
        },
        note: 'Supabase not configured - showing mock data',
      });
    }

    const { data: key, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, permissions, rate_limit, created_at, last_used_at, expires_at, is_active, metadata')
      .eq('id', id)
      .single();

    if (error || !key) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      key: {
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
      },
    });

  } catch (error) {
    console.error('Get API key error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Authenticate request
  const auth = await requireAuth(request, 'keys:manage');
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  // Prevent revoking your own key
  if (auth.keyId === id) {
    return NextResponse.json(
      { success: false, error: 'Cannot revoke your own API key' },
      { status: 400 }
    );
  }

  try {
    // Check if Supabase is configured
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!supabaseConfigured) {
      return NextResponse.json({
        success: true,
        id,
        revoked: true,
        message: 'API key revoked successfully (development mode)',
      });
    }

    // Check if key exists
    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, name, is_active')
      .eq('id', id)
      .single();

    if (fetchError || !existingKey) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      );
    }

    if (!existingKey.is_active) {
      return NextResponse.json(
        { success: false, error: 'API key is already revoked' },
        { status: 400 }
      );
    }

    // Revoke the key (soft delete - mark as inactive)
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ 
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: auth.keyId,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to revoke API key:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to revoke API key' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
      name: existingKey.name,
      revoked: true,
      message: 'API key revoked successfully',
    });

  } catch (error) {
    console.error('Revoke API key error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update API key (permissions, rate limit, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Authenticate request
  const auth = await requireAuth(request, 'keys:manage');
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();

    // Check if Supabase is configured
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!supabaseConfigured) {
      return NextResponse.json({
        success: true,
        id,
        updated: true,
        message: 'API key updated successfully (development mode)',
      });
    }

    // Build update object
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updates.name = body.name;
    }

    if (body.permissions !== undefined) {
      if (!Array.isArray(body.permissions)) {
        return NextResponse.json(
          { success: false, error: 'permissions must be an array' },
          { status: 400 }
        );
      }
      updates.permissions = body.permissions;
    }

    if (body.rateLimit !== undefined) {
      if (typeof body.rateLimit !== 'number' || body.rateLimit < 1) {
        return NextResponse.json(
          { success: false, error: 'rateLimit must be a positive number' },
          { status: 400 }
        );
      }
      updates.rate_limit = body.rateLimit;
    }

    if (body.metadata !== undefined) {
      updates.metadata = body.metadata;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update API key:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update API key' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
      updated: true,
      message: 'API key updated successfully',
    });

  } catch (error) {
    console.error('Update API key error:', error);

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
