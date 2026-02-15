import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CompleteStepRequest } from '@/types/execution';
import { ProcessStep } from '@/types/process';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    const body: CompleteStepRequest = await request.json();
    const { step_id, completed_by = 'system', output, notes } = body;

    // Fetch instance
    const { data: instance, error: instanceError } = await supabase
      .from('process_instances')
      .select('*')
      .eq('id', id)
      .single();

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Process instance not found' },
        { status: 404 }
      );
    }

    // Fetch the step
    const { data: instanceStep, error: stepError } = await supabase
      .from('instance_steps')
      .select('*')
      .eq('instance_id', id)
      .eq('step_id', step_id)
      .single();

    if (stepError || !instanceStep) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const startedAt = instanceStep.started_at ? new Date(instanceStep.started_at) : new Date();
    const durationSeconds = Math.floor((new Date().getTime() - startedAt.getTime()) / 1000);

    // Update the step
    const { data: updatedStep, error: updateError } = await supabase
      .from('instance_steps')
      .update({
        status: 'completed',
        completed_at: now,
        completed_by,
        duration_seconds: durationSeconds,
        output,
        notes,
      })
      .eq('id', instanceStep.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to complete step', details: updateError.message },
        { status: 500 }
      );
    }

    // Create step completed event
    await supabase.from('instance_events').insert({
      instance_id: id,
      event_type: 'step_completed',
      step_id,
      actor: completed_by,
      message: `Step completed`,
      metadata: { output, duration_seconds: durationSeconds },
    });

    // Complete any active assignments for this step
    await supabase
      .from('instance_assignments')
      .update({ status: 'completed', completed_at: now })
      .eq('instance_id', id)
      .eq('step_id', step_id)
      .eq('status', 'active');

    // Find next step
    const processSnapshot = instance.process_snapshot as { steps: ProcessStep[]; name: string };
    const currentStepIndex = processSnapshot.steps.findIndex((s: ProcessStep) => s.stepId === step_id);
    const nextStep = processSnapshot.steps[currentStepIndex + 1];

    if (nextStep) {
      // Update instance to point to next step
      await supabase
        .from('process_instances')
        .update({ current_step_id: nextStep.stepId })
        .eq('id', id);

      // Start next step
      await supabase
        .from('instance_steps')
        .update({ status: 'in_progress', started_at: now })
        .eq('instance_id', id)
        .eq('step_id', nextStep.stepId);

      // Create step started event
      await supabase.from('instance_events').insert({
        instance_id: id,
        event_type: 'step_started',
        step_id: nextStep.stepId,
        actor: 'system',
        message: `Step "${nextStep.name}" started`,
      });
    } else {
      // All steps completed - complete the instance
      await supabase
        .from('process_instances')
        .update({
          status: 'completed',
          completed_at: now,
          current_step_id: null,
        })
        .eq('id', id);

      // Create instance completed event
      await supabase.from('instance_events').insert({
        instance_id: id,
        event_type: 'instance_completed',
        actor: 'system',
        message: `Process "${processSnapshot.name}" completed successfully`,
      });
    }

    // Fetch updated instance
    const { data: finalInstance } = await supabase
      .from('process_instances')
      .select('*')
      .eq('id', id)
      .single();

    const { data: allSteps } = await supabase
      .from('instance_steps')
      .select('*')
      .eq('instance_id', id)
      .order('sequence', { ascending: true });

    return NextResponse.json({
      instance: finalInstance,
      steps: allSteps,
      completedStep: updatedStep,
      nextStep: nextStep || null,
    });
  } catch (error) {
    console.error('Complete step error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
