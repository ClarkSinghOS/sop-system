/**
 * POST /api/webhooks/trigger
 * 
 * Start a process via webhook with JSON payload
 * 
 * Headers:
 *   X-API-Key: pk_xxx... (required)
 * 
 * Body:
 *   {
 *     "processId": "string",          // Required: ID of the process to start
 *     "input": { ... },               // Optional: Input data for the process
 *     "metadata": {                   // Optional: Additional metadata
 *       "source": "string",           // Where the trigger came from
 *       "correlationId": "string",    // External reference ID
 *       "priority": "low|normal|high" // Process priority
 *     }
 *   }
 * 
 * Response:
 *   {
 *     "success": true,
 *     "instanceId": "uuid",
 *     "processId": "string",
 *     "status": "started|queued",
 *     "message": "string"
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, supabase } from '@/lib/auth';
import { WebhookTriggerPayload, WebhookTriggerResponse } from '@/types/integrations';
import { executeTriggerActions, createDefaultContext } from '@/lib/integrations';

export async function POST(request: NextRequest) {
  // Authenticate request
  const auth = await requireAuth(request, 'webhooks:trigger');
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    // Parse request body
    const body: WebhookTriggerPayload = await request.json();

    // Validate required fields
    if (!body.processId) {
      return NextResponse.json(
        { success: false, error: 'processId is required' },
        { status: 400 }
      );
    }

    // Generate instance ID
    const instanceId = crypto.randomUUID();
    const startedAt = new Date().toISOString();

    // Check if Supabase is configured
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (supabaseConfigured) {
      // Store the process instance in Supabase
      const { error: insertError } = await supabase
        .from('process_instances')
        .insert({
          id: instanceId,
          process_id: body.processId,
          status: 'started',
          started_at: startedAt,
          input_data: body.input || {},
          metadata: {
            ...(body.metadata || {}),
            triggered_by: 'webhook',
            api_key_id: auth.keyId,
          },
        });

      if (insertError) {
        console.error('Failed to create process instance:', insertError);
        // Continue anyway - we can operate without persistence
      }

      // Get process triggers (if any)
      const { data: triggers } = await supabase
        .from('process_triggers')
        .select('*')
        .eq('process_id', body.processId)
        .eq('event', 'process.started')
        .eq('is_active', true);

      // Execute triggers if any exist
      if (triggers && triggers.length > 0) {
        const context = createDefaultContext({
          process: {
            id: body.processId,
            name: body.processId, // Would fetch actual name
            status: 'started',
            startedAt,
          },
          instance: {
            id: instanceId,
            status: 'started',
            startedAt,
          },
          input: body.input || {},
        });

        // Execute triggers asynchronously (don't wait)
        for (const trigger of triggers) {
          executeTriggerActions(trigger.actions, context).catch(err => {
            console.error(`Trigger execution failed: ${trigger.id}`, err);
          });
        }
      }

      // Log the webhook event
      await supabase
        .from('webhook_events')
        .insert({
          id: crypto.randomUUID(),
          event: 'process.started',
          process_id: body.processId,
          instance_id: instanceId,
          data: body,
          source: 'webhook',
          timestamp: startedAt,
        });
    }

    const response: WebhookTriggerResponse = {
      success: true,
      instanceId,
      processId: body.processId,
      status: 'started',
      message: 'Process instance created successfully',
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Webhook trigger error:', error);

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

// Return API documentation for GET requests
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/webhooks/trigger',
    description: 'Start a process instance via webhook',
    authentication: 'X-API-Key header or Bearer token',
    requiredPermission: 'webhooks:trigger',
    body: {
      processId: {
        type: 'string',
        required: true,
        description: 'ID of the process to start',
      },
      input: {
        type: 'object',
        required: false,
        description: 'Input data for the process (available as {{input.fieldName}})',
      },
      metadata: {
        type: 'object',
        required: false,
        properties: {
          source: 'string - Where the trigger came from',
          correlationId: 'string - External reference ID',
          priority: 'low|normal|high - Process priority',
        },
      },
    },
    example: {
      processId: 'MKT-FLOW-001',
      input: {
        client_name: 'Acme Corp',
        campaign_type: 'email',
        budget: 5000,
      },
      metadata: {
        source: 'zapier',
        correlationId: 'ext-12345',
      },
    },
  });
}
