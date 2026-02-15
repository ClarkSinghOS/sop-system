/**
 * POST /api/webhooks/callback
 * 
 * Receive callbacks from external services
 * 
 * Use this endpoint when external services need to report back
 * (e.g., email sent confirmation, task completed, payment received)
 * 
 * Headers:
 *   X-API-Key: pk_xxx... (required)
 * 
 * Body:
 *   {
 *     "instanceId": "uuid",           // Required: Process instance ID
 *     "stepId": "string",             // Optional: Specific step ID
 *     "status": "success|failed|pending",
 *     "data": { ... },                // Optional: Callback data
 *     "error": "string"               // Optional: Error message if failed
 *   }
 * 
 * Response:
 *   {
 *     "success": true,
 *     "instanceId": "uuid",
 *     "updated": true,
 *     "message": "string"
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, supabase } from '@/lib/auth';
import { WebhookCallbackPayload, WebhookCallbackResponse } from '@/types/integrations';
import { executeTriggerActions, createDefaultContext } from '@/lib/integrations';

export async function POST(request: NextRequest) {
  // Authenticate request
  const auth = await requireAuth(request, 'webhooks:callback');
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    // Parse request body
    const body: WebhookCallbackPayload = await request.json();

    // Validate required fields
    if (!body.instanceId) {
      return NextResponse.json(
        { success: false, error: 'instanceId is required' },
        { status: 400 }
      );
    }

    if (!body.status || !['success', 'failed', 'pending'].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'status must be success, failed, or pending' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // Check if Supabase is configured
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    let updated = false;
    let processId: string | undefined;

    if (supabaseConfigured) {
      // Get the process instance
      const { data: instance, error: fetchError } = await supabase
        .from('process_instances')
        .select('id, process_id, status, input_data, current_step, started_at')
        .eq('id', body.instanceId)
        .single() as { data: { id: string; process_id: string; status: string; input_data: Record<string, unknown>; current_step: string; started_at: string } | null; error: any };

      if (fetchError || !instance) {
        return NextResponse.json(
          { success: false, error: 'Process instance not found' },
          { status: 404 }
        );
      }

      processId = instance.process_id;

      // Update the step or instance status
      if (body.stepId) {
        // Update specific step
        const { error: updateError } = await supabase
          .from('step_executions')
          .update({
            status: body.status,
            completed_at: body.status !== 'pending' ? timestamp : null,
            output_data: body.data || {},
            error_message: body.error,
          })
          .eq('instance_id', body.instanceId)
          .eq('step_id', body.stepId);

        if (!updateError) {
          updated = true;

          // Fire step event triggers
          const event = body.status === 'success' ? 'step.completed' : 
                       body.status === 'failed' ? 'step.failed' : null;

          if (event) {
            const { data: triggers } = await supabase
              .from('process_triggers')
              .select('*')
              .eq('process_id', instance.process_id)
              .eq('event', event)
              .eq('is_active', true);

            if (triggers && triggers.length > 0) {
              const context = createDefaultContext({
                process: {
                  id: instance.process_id,
                  name: instance.process_id,
                  status: instance.status,
                },
                instance: {
                  id: body.instanceId,
                  status: instance.status,
                  startedAt: instance.started_at,
                  currentStep: body.stepId,
                },
                step: {
                  id: body.stepId,
                  name: body.stepId,
                  owner: '',
                  status: body.status,
                  completedAt: timestamp,
                },
                input: instance.input_data || {},
                output: body.data || {},
              });

              for (const trigger of triggers) {
                if (!trigger.step_id || trigger.step_id === body.stepId) {
                  executeTriggerActions(trigger.actions, context).catch(err => {
                    console.error(`Trigger execution failed: ${trigger.id}`, err);
                  });
                }
              }
            }
          }
        }
      } else {
        // Update instance status if callback indicates completion/failure
        if (body.status !== 'pending') {
          const newStatus = body.status === 'success' ? 'completed' : 'failed';
          
          const { error: updateError } = await supabase
            .from('process_instances')
            .update({
              status: newStatus,
              completed_at: timestamp,
              output_data: body.data || {},
              error_message: body.error,
            })
            .eq('id', body.instanceId);

          if (!updateError) {
            updated = true;

            // Fire process event triggers
            const event = body.status === 'success' ? 'process.completed' : 'process.failed';

            const { data: triggers } = await supabase
              .from('process_triggers')
              .select('*')
              .eq('process_id', instance.process_id)
              .eq('event', event)
              .eq('is_active', true);

            if (triggers && triggers.length > 0) {
              const context = createDefaultContext({
                process: {
                  id: instance.process_id,
                  name: instance.process_id,
                  status: newStatus,
                  completedAt: timestamp,
                },
                instance: {
                  id: body.instanceId,
                  status: newStatus,
                  startedAt: instance.started_at,
                  completedAt: timestamp,
                },
                input: instance.input_data || {},
                output: body.data || {},
              });

              for (const trigger of triggers) {
                executeTriggerActions(trigger.actions, context).catch(err => {
                  console.error(`Trigger execution failed: ${trigger.id}`, err);
                });
              }
            }
          }
        }
      }

      // Log the callback event
      await supabase
        .from('webhook_events')
        .insert({
          id: crypto.randomUUID(),
          event: 'callback.received',
          process_id: instance.process_id,
          instance_id: body.instanceId,
          step_id: body.stepId,
          data: body,
          source: 'callback',
          timestamp,
        });
    } else {
      // Without Supabase, just acknowledge the callback
      updated = true;
    }

    const response: WebhookCallbackResponse = {
      success: true,
      instanceId: body.instanceId,
      updated,
      message: updated ? 'Callback processed successfully' : 'Callback received (no update made)',
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Webhook callback error:', error);

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
    endpoint: 'POST /api/webhooks/callback',
    description: 'Receive callbacks from external services',
    authentication: 'X-API-Key header or Bearer token',
    requiredPermission: 'webhooks:callback',
    body: {
      instanceId: {
        type: 'string',
        required: true,
        description: 'UUID of the process instance',
      },
      stepId: {
        type: 'string',
        required: false,
        description: 'ID of the specific step being updated',
      },
      status: {
        type: 'string',
        required: true,
        enum: ['success', 'failed', 'pending'],
        description: 'Status of the external operation',
      },
      data: {
        type: 'object',
        required: false,
        description: 'Data returned from the external service',
      },
      error: {
        type: 'string',
        required: false,
        description: 'Error message if status is failed',
      },
    },
    example: {
      instanceId: '550e8400-e29b-41d4-a716-446655440000',
      stepId: 'send-welcome-email',
      status: 'success',
      data: {
        messageId: 'msg_12345',
        deliveredAt: '2024-01-15T10:30:00Z',
      },
    },
  });
}
