/**
 * GET /api/webhooks/events
 * 
 * Stream of process events via Server-Sent Events (SSE)
 * 
 * Connect to this endpoint to receive real-time updates about
 * process instances, step completions, and other events.
 * 
 * Headers:
 *   X-API-Key: pk_xxx... (required)
 * 
 * Query Parameters:
 *   processId: string     - Filter events for a specific process
 *   instanceId: string    - Filter events for a specific instance
 *   events: string        - Comma-separated list of event types
 * 
 * Event Types:
 *   - process.started
 *   - process.completed
 *   - process.failed
 *   - step.started
 *   - step.completed
 *   - step.failed
 *   - step.skipped
 *   - decision.made
 * 
 * Response: Server-Sent Events stream
 *   event: process.started
 *   data: {"processId":"...","instanceId":"...","timestamp":"..."}
 */

import { NextRequest } from 'next/server';
import { requireAuth, supabase } from '@/lib/auth';
import { TriggerEvent, WebhookEvent } from '@/types/integrations';

// Store active connections for broadcasting
const connections = new Map<string, {
  controller: ReadableStreamDefaultController;
  filters: {
    processId?: string;
    instanceId?: string;
    events?: TriggerEvent[];
  };
}>();

/**
 * Broadcast an event to all connected clients
 */
function broadcastEvent(event: WebhookEvent) {
  for (const [connectionId, connection] of connections) {
    const { controller, filters } = connection;

    // Apply filters
    if (filters.processId && event.processId !== filters.processId) {
      continue;
    }
    if (filters.instanceId && event.instanceId !== filters.instanceId) {
      continue;
    }
    if (filters.events && !filters.events.includes(event.event)) {
      continue;
    }

    try {
      const message = `event: ${event.event}\ndata: ${JSON.stringify(event)}\n\n`;
      controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      // Connection closed, remove it
      connections.delete(connectionId);
    }
  }
}

export async function GET(request: NextRequest) {
  // Authenticate request
  const auth = await requireAuth(request, 'webhooks:events');
  if (!auth.valid) {
    return new Response(
      JSON.stringify({ success: false, error: auth.error }),
      { status: auth.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse query parameters
  const url = new URL(request.url);
  const processId = url.searchParams.get('processId') || undefined;
  const instanceId = url.searchParams.get('instanceId') || undefined;
  const eventsParam = url.searchParams.get('events');
  const events = eventsParam 
    ? eventsParam.split(',').map(e => e.trim()) as TriggerEvent[]
    : undefined;

  // Connection ID for this client
  const connectionId = crypto.randomUUID();

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const connectMessage = `event: connected\ndata: ${JSON.stringify({ 
        connectionId,
        filters: { processId, instanceId, events },
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectMessage));

      // Store connection for broadcasting
      connections.set(connectionId, {
        controller,
        filters: { processId, instanceId, events },
      });

      // Set up heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `: heartbeat ${Date.now()}\n\n`;
          controller.enqueue(new TextEncoder().encode(heartbeat));
        } catch {
          // Connection closed
          clearInterval(heartbeatInterval);
          connections.delete(connectionId);
        }
      }, 30000); // Every 30 seconds

      // If Supabase is configured, set up real-time subscription
      const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
        (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      if (supabaseConfigured) {
        // Subscribe to webhook_events table
        const subscription = supabase
          .channel(`webhook_events_${connectionId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'webhook_events',
            },
            (payload) => {
              const event = payload.new as WebhookEvent;
              
              // Apply filters
              if (processId && event.processId !== processId) return;
              if (instanceId && event.instanceId !== instanceId) return;
              if (events && !events.includes(event.event)) return;

              try {
                const message = `event: ${event.event}\ndata: ${JSON.stringify(event)}\n\n`;
                controller.enqueue(new TextEncoder().encode(message));
              } catch {
                // Connection closed
                subscription.unsubscribe();
              }
            }
          )
          .subscribe();

        // Cleanup on close
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
          connections.delete(connectionId);
          subscription.unsubscribe();
        });
      } else {
        // Without Supabase, just keep the connection for manual broadcasts
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
          connections.delete(connectionId);
        });
      }
    },
    cancel() {
      connections.delete(connectionId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Connection-Id': connectionId,
    },
  });
}

// Return API documentation for non-SSE requests
export async function POST(request: NextRequest) {
  // This endpoint is for emitting events manually (internal use)
  const auth = await requireAuth(request, 'webhooks:events');
  if (!auth.valid) {
    return new Response(
      JSON.stringify({ success: false, error: auth.error }),
      { status: auth.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const event: WebhookEvent = await request.json();
    
    // Validate event
    if (!event.event || !event.id || !event.timestamp) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid event format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store in Supabase if configured
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (supabaseConfigured) {
      await supabase.from('webhook_events').insert({
        id: event.id,
        event: event.event,
        process_id: event.processId,
        instance_id: event.instanceId,
        step_id: event.stepId,
        data: event.data,
        source: event.source,
        timestamp: event.timestamp,
      });
    }

    // Broadcast to connected clients
    broadcastEvent(event);

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventId: event.id,
        broadcastTo: connections.size,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
