import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { TimelineEntry } from '@/types/execution';
import { ProcessStep } from '@/types/process';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;

    // Get query params for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch instance for step names
    const { data: instance, error: instanceError } = await supabase
      .from('process_instances')
      .select('process_snapshot')
      .eq('id', id)
      .single();

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Process instance not found' },
        { status: 404 }
      );
    }

    // Fetch events
    const { data: events, error: eventsError } = await supabase
      .from('instance_events')
      .select('*')
      .eq('instance_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventsError) {
      return NextResponse.json(
        { error: 'Failed to fetch timeline', details: eventsError.message },
        { status: 500 }
      );
    }

    // Build step name lookup
    const processSnapshot = instance.process_snapshot as { steps: ProcessStep[] };
    const stepNames: Record<string, string> = {};
    processSnapshot.steps.forEach((step: ProcessStep) => {
      stepNames[step.stepId] = step.name;
    });

    // Transform events into timeline entries
    const timeline: TimelineEntry[] = (events || []).map(event => ({
      id: event.id,
      type: event.event_type,
      step_id: event.step_id,
      step_name: event.step_id ? stepNames[event.step_id] : undefined,
      actor: event.actor,
      message: event.message,
      metadata: event.metadata || {},
      created_at: event.created_at,
    }));

    // Get total count for pagination
    const { count } = await supabase
      .from('instance_events')
      .select('*', { count: 'exact', head: true })
      .eq('instance_id', id);

    return NextResponse.json({
      timeline,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: offset + limit < (count || 0),
      },
    });
  } catch (error) {
    console.error('Timeline error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
