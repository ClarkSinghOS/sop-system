import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { AssignStepRequest } from '@/types/execution';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    const body: AssignStepRequest = await request.json();
    const { step_id, assigned_to, assigned_by = 'system', notes } = body;

    // Verify instance exists
    const { data: instance, error: instanceError } = await supabase
      .from('process_instances')
      .select('id')
      .eq('id', id)
      .single();

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Process instance not found' },
        { status: 404 }
      );
    }

    // Verify step exists
    const { data: instanceStep, error: stepError } = await supabase
      .from('instance_steps')
      .select('id, step_id')
      .eq('instance_id', id)
      .eq('step_id', step_id)
      .single();

    if (stepError || !instanceStep) {
      return NextResponse.json(
        { error: 'Step not found in this instance' },
        { status: 404 }
      );
    }

    // Mark any existing active assignments as reassigned
    const { data: existingAssignments } = await supabase
      .from('instance_assignments')
      .select('*')
      .eq('instance_id', id)
      .eq('step_id', step_id)
      .eq('status', 'active');

    if (existingAssignments && existingAssignments.length > 0) {
      await supabase
        .from('instance_assignments')
        .update({ status: 'reassigned' })
        .eq('instance_id', id)
        .eq('step_id', step_id)
        .eq('status', 'active');

      // Create reassignment event
      await supabase.from('instance_events').insert({
        instance_id: id,
        event_type: 'step_reassigned',
        step_id,
        actor: assigned_by,
        message: `Step reassigned from ${existingAssignments.map(a => a.assigned_to).join(', ')} to ${assigned_to}`,
        metadata: {
          previous_assignees: existingAssignments.map(a => a.assigned_to),
          new_assignee: assigned_to,
        },
      });
    }

    // Create new assignment
    const { data: assignment, error: assignError } = await supabase
      .from('instance_assignments')
      .insert({
        instance_id: id,
        step_id,
        assigned_to,
        assigned_by,
        notes,
      })
      .select()
      .single();

    if (assignError) {
      return NextResponse.json(
        { error: 'Failed to create assignment', details: assignError.message },
        { status: 500 }
      );
    }

    // Create assignment event (if not a reassignment)
    if (!existingAssignments || existingAssignments.length === 0) {
      await supabase.from('instance_events').insert({
        instance_id: id,
        event_type: 'step_assigned',
        step_id,
        actor: assigned_by,
        message: `Step assigned to ${assigned_to}`,
        metadata: { assigned_to },
      });
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Assign step error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
