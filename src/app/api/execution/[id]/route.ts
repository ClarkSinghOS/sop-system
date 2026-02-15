import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { InstanceWithDetails, ProcessInstance, InstanceStep, InstanceAssignment } from '@/types/execution';
import { ProcessStep } from '@/types/process';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;

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

    // Fetch steps
    const { data: steps } = await supabase
      .from('instance_steps')
      .select('*')
      .eq('instance_id', id)
      .order('sequence', { ascending: true });

    // Fetch active assignments
    const { data: assignments } = await supabase
      .from('instance_assignments')
      .select('*')
      .eq('instance_id', id)
      .eq('status', 'active');

    // Get current step from snapshot
    const processSnapshot = instance.process_snapshot as { steps: ProcessStep[] };
    const currentStep = instance.current_step_id
      ? processSnapshot.steps.find((s: ProcessStep) => s.stepId === instance.current_step_id)
      : null;

    const result: InstanceWithDetails = {
      ...(instance as ProcessInstance),
      steps: (steps || []) as InstanceStep[],
      assignments: (assignments || []) as InstanceAssignment[],
      current_step: currentStep || null,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get instance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
